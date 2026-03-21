import type { MetadataRoute } from 'next'
import { governanceGuides, riskIndexSnapshot } from '@/lib/marketing/ai-content-governance'
import { getAbsoluteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
    const governanceLastModified = new Date(`${riskIndexSnapshot.asOf}T00:00:00Z`)

    return [
        {
            url: getAbsoluteUrl('/'),
            lastModified: governanceLastModified,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: getAbsoluteUrl('/pricing'),
            lastModified: governanceLastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: getAbsoluteUrl('/ai-content-governance'),
            lastModified: governanceLastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...governanceGuides.map((guide) => ({
            url: getAbsoluteUrl(`/ai-content-governance/${guide.slug}`),
            lastModified: new Date(`${guide.updatedAt}T00:00:00Z`),
            changeFrequency: 'monthly' as const,
            priority: guide.slug === 'risk-methodology-101' ? 0.8 : 0.7,
        })),
    ]
}
