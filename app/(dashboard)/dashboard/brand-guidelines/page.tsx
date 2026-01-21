"use client";

import { useState } from 'react'

import {
    Plus,
    Search,
    FileText,
    Shield,
    Globe,
    AlertTriangle,
    Download
} from 'lucide-react'
import { motion } from 'framer-motion'
import { RSButton } from '@/components/rs/RSButton'
import { RSInput } from '@/components/rs/RSInput'
import { RSSelect } from '@/components/rs/RSSelect'
import { RSModal } from '@/components/rs/RSModal'
import { RSTextarea } from '@/components/rs/RSTextarea'
import { RSDraftingBoard } from '@/components/rs/RSDraftingBoard'

// Mock Data
type BrandGuideline = {
    id: string
    title: string
    category: 'voice' | 'visual' | 'legal' | 'safety'
    status: 'active' | 'draft' | 'archived'
    last_updated: string
    version: string
}

const MOCK_GUIDELINES: BrandGuideline[] = [
    { id: 'BG-001', title: 'Core Voice & Tone', category: 'voice', status: 'active', last_updated: '2025-01-15', version: '2.1' },
    { id: 'BG-002', title: 'Logo Usage Restriction', category: 'visual', status: 'active', last_updated: '2025-01-10', version: '1.4' },
    { id: 'BG-003', title: 'Competitor Mention Policy', category: 'legal', status: 'draft', last_updated: '2025-01-20', version: '0.9' },
    { id: 'BG-004', title: 'NSFW Content Filtering', category: 'safety', status: 'active', last_updated: '2024-12-05', version: '3.0' },
]

export default function BrandGuidelinesPage() {
    const [guidelines, setGuidelines] = useState(MOCK_GUIDELINES)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')

    const filteredGuidelines = guidelines.filter(g => {
        const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || g.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === 'all' || g.category === filterCategory
        return matchesSearch && matchesCategory
    })

    return (
        <RSDraftingBoard className="flex h-full gap-6 p-6">
            <div className="flex-1 flex flex-col space-y-6 overflow-hidden relative z-10 w-full h-full">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div>
                        <h1 className="text-[var(--rs-text-primary)] text-lg font-medium tracking-tight">POLICY_CONTROL_MODULE</h1>
                        <p className="text-xs font-mono text-rs-text-tertiary mt-1 uppercase tracking-widest pl-5">// ACTIVE_POLICIES: {guidelines.length}</p>
                    </div>
                    <RSButton variant="primary" icon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)}>NEW_PROTOCOL</RSButton>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end bg-[#EBE7E0] p-4 border border-black/5 rounded-[4px] shadow-[var(--rs-shadow-socket)]">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rs-text-tertiary" />
                        <RSInput
                            placeholder="SEARCH_POLICIES..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-rs-white shadow-[var(--rs-shadow-socket)]"
                        />
                    </div>
                    <RSSelect
                        value={filterCategory}
                        onChange={(value) => setFilterCategory(value)}
                        options={[
                            { value: 'all', label: 'CAT: ALL' },
                            { value: 'voice', label: 'CAT: VOICE' },
                            { value: 'visual', label: 'CAT: VISUAL' },
                            { value: 'legal', label: 'CAT: LEGAL' },
                            { value: 'safety', label: 'CAT: SAFETY' }
                        ]}
                        className="w-48 bg-rs-white shadow-[var(--rs-shadow-socket)]"
                    />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
                        {filteredGuidelines.map(g => (
                            <GuidelineCard
                                key={g.id}
                                guideline={g}
                                onClick={() => { setGuidelines(guidelines) }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <RSModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="INITIALIZE_NEW_PROTOCOL">
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary mb-1 block">Protocol_Name</label>
                        <RSInput placeholder="ENTER_NAME..." autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary mb-1 block">Category</label>
                            <RSSelect options={[{ value: 'voice', label: 'VOICE' }, { value: 'legal', label: 'LEGAL' }]} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary mb-1 block">Priority</label>
                            <RSSelect options={[{ value: 'high', label: 'HIGH' }, { value: 'low', label: 'LOW' }]} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary mb-1 block">Description_Log</label>
                        <RSTextarea placeholder="// DESCRIBE_PROTOCOL_PARAMETERS..." />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-rs-border-primary">
                        <RSButton variant="ghost" onClick={() => setIsCreateOpen(false)}>CANCEL</RSButton>
                        <RSButton variant="primary">INITIALIZE</RSButton>
                    </div>
                </div>
            </RSModal>
        </RSDraftingBoard>
    )
}

function GuidelineCard({ guideline, onClick }: { guideline: BrandGuideline, onClick: () => void }) {
    return (
        <motion.div
            layout
            whileHover={{ y: -2 }}
            onClick={onClick}
            className={`group bg-rs-white border-2 border-rs-gray-200 rounded-[6px] p-6 transition-all relative overflow-hidden cursor-pointer shadow-[var(--rs-shadow-bevel)] hover:border-rs-black hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)]`}
        >
            {/* Corner Accents - Physical Feel */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-rs-gray-100 border-b border-l border-rs-gray-200 rounded-bl-[12px]" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 bg-rs-gray-50 rounded-[4px] border border-rs-gray-200 shadow-inner">
                    {guideline.category === 'voice' && <FileText size={20} className="text-rs-text-secondary" />}
                    {guideline.category === 'visual' && <Globe size={20} className="text-rs-text-secondary" />}
                    {guideline.category === 'legal' && <Shield size={20} className="text-rs-text-secondary" />}
                    {guideline.category === 'safety' && <AlertTriangle size={20} className="text-rs-text-secondary" />}
                </div>
                <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-[2px] border ${guideline.status === 'active' ? 'bg-rs-safe/10 text-rs-safe border-rs-safe' : 'bg-rs-gray-100 text-rs-text-tertiary border-rs-gray-200'
                    }`}>
                    {guideline.status}
                </div>
            </div>

            <h3 className="text-sm font-bold text-rs-text-primary mb-1 uppercase tracking-tight">{guideline.title}</h3>
            <p className="text-[10px] font-mono text-rs-text-tertiary mb-6">ID: {guideline.id} // V{guideline.version}</p>

            <div className="flex items-center justify-between pt-4 border-t border-rs-border-primary border-dashed">
                <span className="text-[10px] font-mono text-rs-text-tertiary">UPDATED: {guideline.last_updated}</span>
                <button className="text-rs-text-primary hover:text-rs-signal transition-colors">
                    <Download size={14} />
                </button>
            </div>
        </motion.div>
    )
}
