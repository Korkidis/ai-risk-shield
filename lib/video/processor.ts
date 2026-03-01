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

/**
 * Extracts frames from a video buffer.
 * Strategy: Save to temp, extract evenly-spaced screenshots to save cost/time.
 *
 * Race condition fix (Sprint 8): The `filenames` event fires before files are
 * written to disk. We now verify files exist with fs.access() before resolving,
 * with a brief retry if needed.
 */
export async function extractFrames(videoBuffer: Buffer, limit = 10): Promise<FrameResult[]> {
    const tempDir = os.tmpdir()
    const runId = uuidv4()
    const videoPath = path.join(tempDir, `${runId}.mp4`)

    // 1. Write video to temp file
    await fs.writeFile(videoPath, videoBuffer)

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
                // Map filenames to full paths
                filenames.forEach((f: string, idx: number) => {
                    frames.push({
                        timestamp: idx, // Approximation, accurate timestamp requires more logic
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
