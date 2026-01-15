
import { createC2pa } from 'c2pa-node';

export type C2PAReport = {
    status: 'verified' | 'untrusted' | 'invalid' | 'missing';
    issuer?: string;
    timestamp?: string;
    assertions?: Array<{ label: string, data: any }>;
    validation_errors?: string[];
}

export async function verifyContentCredentials(filePath: string): Promise<C2PAReport> {
    try {
        const c2pa = await createC2pa();
        const manifestStore = await c2pa.read({ path: filePath });

        if (!manifestStore) {
            return { status: 'missing' };
        }

        const activeManifest = manifestStore.active_manifest;

        if (!activeManifest) {
            return { status: 'missing' };
        }

        // Check validation status
        if (manifestStore.validation_status && manifestStore.validation_status.length > 0) {
            const errors = manifestStore.validation_status
                .filter((s: any) => s.code !== 'claimSignature.validated') // Filter out success messages if any generic ones exist
                .map((s: any) => s.explanation);

            if (errors.length > 0) {
                return {
                    status: 'invalid',
                    validation_errors: errors
                };
            }
        }

        // If we have a signature info, we can consider it present.
        // In a real app, we would check a trust list here.
        // For now, if it parses and has no validation errors, we mark it 'verified' (or 'untrusted' if self-signed).
        const signatureInfo = activeManifest.signature_info;
        const issuer = signatureInfo?.issuer || 'Unknown Issuer';
        const timestamp = signatureInfo?.time || undefined;

        return {
            status: 'verified', // Assuming trusted for this demo
            issuer,
            timestamp,
            assertions: activeManifest.assertions?.map((a: any) => ({ label: a.label, data: a.data })) || []
        };

    } catch (e) {
        console.error("C2PA Verification Error", e);
        return { status: 'missing' }; // Treat error as missing/unverifiable
    }
}
