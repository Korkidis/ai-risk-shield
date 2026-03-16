const FALLBACK_SITE_URL = 'http://localhost:3000'

export function getSiteUrl() {
    const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

    if (!rawUrl) return FALLBACK_SITE_URL

    const normalized = rawUrl.replace(/\/+$/, '')

    return normalized.startsWith('http://') || normalized.startsWith('https://')
        ? normalized
        : `https://${normalized}`
}

export function getAbsoluteUrl(path = '/') {
    return new URL(path, getSiteUrl()).toString()
}
