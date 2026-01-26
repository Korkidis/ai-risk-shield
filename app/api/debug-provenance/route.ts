import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // 1. Check if provenance_details table exists and is accessible
    const { data, error } = await supabase
        .from('provenance_details')
        .select('count')
        .limit(1)

    return NextResponse.json({
        status: error ? 'ERROR' : 'OK',
        message: error ? error.message : 'Table exists and is accessible',
        data
    })
}
