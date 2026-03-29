import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import ffmpeg from 'fluent-ffmpeg'
import { v4 as uuidv4 } from 'uuid'

// Note: ffmpeg must be installed on the system (e.g. `brew install ffmpeg`)
// fluent-ffmpeg assumes 'ffmpeg' is in PATH.

export type FrameResult = {
    timestamp: number // in seconds
    filePath: string
}

/** Map video MIME types to file extensions for correct temp file naming. */
function videoExtFromMime(mimeType?: string): string {
    if (!mimeType) return '.mp4'
    const map: Record<string, string> = {
        'video/mp4': '.mp4',
        'video/quicktime': '.mov',
        'video/x-msvideo': '.avi',
        'video/webm': '.webm',
        'video/x-matroska': '.mkv',
        'video/mpeg': '.mpeg',
    }
    return map[mimeType.toLowerCase()] || '.mp4'
}

/**
 * Extracts frames from a video buffer.
 * Strategy: Save to temp, extract evenly-spaced screenshots to save cost/time.
 *
 * Race condition fix (Sprint 8): The `filenames` event fires before files are
 * written to disk. We now verify files exist with fs.access() before resolving,
 * with a brief retry if needed.
 */
/**
 * Get the duration of a video in seconds.
 * Writes buffer to temp file, runs ffprobe, cleans up.
 */
export async function getVideoDuration(videoBuffer: Buffer, mimeType?: string): Promise<number> {
    const tempDir = os.tmpdir()
    const ext = videoExtFromMime(mimeType)
    const videoPath = path.join(tempDir, `${uuidv4()}_probe${ext}`)
    await fs.writeFile(videoPath, videoBuffer)

    try {
        const duration = await new Promise<number>((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) return reject(err)
                const dur = metadata?.format?.duration
                if (typeof dur !== 'number' || isNaN(dur)) {
                    return reject(new Error('Unable to determine video duration'))
                }
                resolve(Math.round(dur))
            })
        })
        return duration
    } finally {
        await fs.unlink(videoPath).catch(() => { })
    }
}

export async function extractFrames(videoBuffer: Buffer, limit = 10, mimeType?: string): Promise<FrameResult[]> {
    const tempDir = os.tmpdir()
    const runId = uuidv4()
    const ext = videoExtFromMime(mimeType)
    const videoPath = path.join(tempDir, `${runId}${ext}`)

    // 1. Write video to temp file
    await fs.writeFile(videoPath, videoBuffer)

    // 2. Probe video duration so we can assign accurate timestamps to frames.
    //    Falls back to null if ffprobe fails (timestamps will default to 0).
    let durationSecs: number | null = null
    try {
        durationSecs = await new Promise<number>((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) return reject(err)
                const dur = metadata?.format?.duration
                if (typeof dur !== 'number' || isNaN(dur) || dur <= 0) {
                    return reject(new Error('Unable to determine video duration'))
                }
                resolve(dur)
            })
        })
    } catch {
        // Duration unknown — timestamps will fall back to 0 for all frames
        durationSecs = null
    }

    return new Promise((resolve, reject) => {
        const frames: FrameResult[] = []

        ffmpeg(videoPath)
            .on('end', async () => {
                try {
                    // Cleanup video source
                    await fs.unlink(videoPath).catch(() => { })

                    // Verify frame files actually exist on disk before resolving.
                    // The 'filenames' event fires with expected names, but files
                    // may still be writing when 'end' fires.
                    const validFrames = await verifyFrames(frames)

                    if (validFrames.length === 0 && frames.length > 0) {
                        // filenames fired but files aren't on disk yet — wait and retry
                        await new Promise(r => setTimeout(r, 500))
                        const retryFrames = await verifyFrames(frames)
                        resolve(retryFrames.length > 0 ? retryFrames : frames)
                    } else {
                        resolve(validFrames.length > 0 ? validFrames : frames)
                    }
                } catch {
                    // Resolve with whatever we have rather than crashing
                    resolve(frames)
                }
            })
            .on('error', (err) => {
                reject(err)
            })
            .screenshots({
                count: limit, // Take N screenshots evenly spaced
                folder: tempDir,
                filename: `${runId}_frame_%i.jpg`, // %i is index
                size: '640x?' // Resize to save analysis tokens
            })
            .on('filenames', (filenames) => {
                // Map filenames to full paths with accurate timestamps.
                // ffmpeg .screenshots({ count: N }) extracts frames evenly spaced
                // across the video, so we calculate timestamp = idx / (N-1) * duration.
                const totalFrames = filenames.length
                filenames.forEach((f: string, idx: number) => {
                    let timestamp: number
                    if (durationSecs !== null && totalFrames > 1) {
                        timestamp = (idx / (totalFrames - 1)) * durationSecs
                    } else if (durationSecs !== null && totalFrames === 1) {
                        // Single frame — place at midpoint
                        timestamp = durationSecs / 2
                    } else {
                        // Duration unknown — preserve ordering via index
                        timestamp = idx
                    }

                    frames.push({
                        timestamp, // in seconds (actual video position)
                        filePath: path.join(tempDir, f)
                    })
                })
            })
    })
}

/**
 * Verify that frame files exist on disk.
 * Returns only frames whose files are accessible.
 */
async function verifyFrames(frames: FrameResult[]): Promise<FrameResult[]> {
    const valid: FrameResult[] = []
    for (const frame of frames) {
        try {
            await fs.access(frame.filePath)
            valid.push(frame)
        } catch {
            // File not written yet or missing
        }
    }
    return valid
}

export async function cleanupFrames(frames: FrameResult[]) {
    for (const f of frames) {
        await fs.unlink(f.filePath).catch(() => { })
    }
}
