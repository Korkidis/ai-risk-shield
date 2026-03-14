/**
 * C2PA Types
 * 
 * Separated from implementation to allow safe imports without loading native c2pa-node module
 */

export type C2PAReport = {
    status: 'valid' | 'missing' | 'invalid' | 'error' | 'caution';
    creator?: string;
    tool?: string;
    tool_version?: string;
    timestamp?: string;
    issuer?: string;
    serial?: string;
    history?: Array<{ action: string, tool: string, date: string }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- c2pa-node manifest store has no public type definition
    raw_manifest?: any;
    validation_errors?: string[];
    manifest_source?: string;
}
