/**
 * Server-side file type validation via magic byte inspection.
 * Prevents client-side MIME type spoofing on upload routes.
 */

export interface DetectedFile {
  category: 'image' | 'video'
  mime: string
}

const SIGNATURES: { category: 'image' | 'video'; mime: string; check: (b: Buffer) => boolean }[] = [
  // Images
  { category: 'image', mime: 'image/jpeg', check: (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF },
  { category: 'image', mime: 'image/png',  check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 },
  { category: 'image', mime: 'image/gif',  check: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  { category: 'image', mime: 'image/webp', check: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
  { category: 'image', mime: 'image/bmp',  check: (b) => b[0] === 0x42 && b[1] === 0x4D },
  { category: 'image', mime: 'image/tiff', check: (b) => (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2A && b[3] === 0x00) || (b[0] === 0x4D && b[1] === 0x4D && b[2] === 0x00 && b[3] === 0x2A) },
  // Videos (ISO BMFF / ftyp box — covers MP4, MOV, M4V, 3GP)
  { category: 'video', mime: 'video/mp4',  check: (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 },
  // WebM / MKV (EBML header)
  { category: 'video', mime: 'video/webm', check: (b) => b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3 },
  // AVI (RIFF + AVI)
  { category: 'video', mime: 'video/x-msvideo', check: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x41 && b[9] === 0x56 && b[10] === 0x49 && b[11] === 0x20 },
]

/**
 * Detect file type from magic bytes in the buffer.
 * Returns category + detected MIME, or null if unrecognized.
 * Requires at least 12 bytes.
 */
export function detectFileType(buffer: Buffer): DetectedFile | null {
  if (buffer.length < 12) return null

  for (const sig of SIGNATURES) {
    if (sig.check(buffer)) return { category: sig.category, mime: sig.mime }
  }

  return null
}
