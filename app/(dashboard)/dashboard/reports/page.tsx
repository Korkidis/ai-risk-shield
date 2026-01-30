"use client";

import { RSBackground } from '@/components/rs/RSBackground'
import { FileBarChart } from 'lucide-react'

export default function ReportsPage() {
    return (
        <RSBackground className="flex items-center justify-center h-full p-6">
            <div className="text-center space-y-4 opacity-50">
                <div className="w-16 h-16 bg-rs-gray-200 rounded-full flex items-center justify-center mx-auto text-rs-text-tertiary">
                    <FileBarChart size={32} />
                </div>
                <div>
                    <h1 className="text-lg font-bold uppercase tracking-widest text-rs-text-secondary">Risk_Reports_Module</h1>
                    <p className="text-xs font-mono text-rs-text-tertiary mt-2">Status: Offline / Under Construction</p>
                </div>
            </div>
        </RSBackground>
    )
}
