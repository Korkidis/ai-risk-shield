import { z } from 'zod';

export const AssetSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid().nullable().optional(), // Nullable for anonymous uploads
    file_name: z.string(),
    url: z.string().url(),
    size: z.number().optional(),
    file_type: z.enum(['image', 'video', 'document']).optional(),
    created_at: z.string().optional(),
    session_id: z.string().optional(), // For anonymous tracking
});

export type Asset = z.infer<typeof AssetSchema>;
