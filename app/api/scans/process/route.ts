/**
 * Process Scan API Route
 *
 * POST /api/scans/process
 *
 * Triggers AI analysis for a specific scan or all pending scans
 * Can be called:
 * - Immediately after upload (from client)
 * - From background jobs
 * - Manually from admin panel
 */

import { NextRequest, NextResponse } from 'next/server'
import { processScan, processPendingScans } from '@/lib/ai/scan-processor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process specific scan
    if (body.scanId) {
      const result = await processScan(body.scanId)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Scan ${result.scanId} processed successfully`,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Processing failed',
          },
          { status: 500 }
        )
      }
    }

    // Process all pending scans
    if (body.processAll) {
      const results = await processPendingScans()

      return NextResponse.json({
        success: true,
        message: `Processed ${results.processed} scans`,
        results,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Missing scanId or processAll parameter',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Process scan API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
