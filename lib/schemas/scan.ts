import { z } from 'zod';

export const ScanStatus = z.enum(['pending', 'processing', 'completed', 'failed']);

export const ScanSchema = z.object({
    id: z.string().uuid(),
    status: ScanStatus,
    tenant_id: z.string().uuid(),
    user_id: z.string().uuid().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    risk_score: z.number().min(0).max(100).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    // Additional strict fields can be added here as needed
});

export type Scan = z.infer<typeof ScanSchema>;
