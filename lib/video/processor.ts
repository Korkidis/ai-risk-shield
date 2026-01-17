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
 * Strategy: Save to temp, extract 1 frame every 2 seconds (0.5 fps) to save cost/time.
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
                // Find generated files
                try {
                    // In a real generic impl, we'd list dir. 
                    // But here we know the pattern.
                    // Note: fluent-ffmpeg screenshot filenames are a bit tricky.
                    // Using strict screenshot/thumbnails method.

                    // Cleanup video
                    await fs.unlink(videoPath).catch(() => { })

                    // Return list of frames found (we need to scan directory or use known timestamps)
                    // Simplified: resolving empty for now if not using exact filenames
                    // Let's use screenshots method instead, it gives predictable filenames
                } catch (e) {
                    // ignore cleanup errors
                }
                resolve(frames)
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

export async function cleanupFrames(frames: FrameResult[]) {
    for (const f of frames) {
        await fs.unlink(f.filePath).catch(() => { })
    }
}
