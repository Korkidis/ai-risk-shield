"use client";

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
    Plus,
    Search,
    Shield,
    Download,
    AlertOctagon,
    Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RSButton } from '@/components/rs/RSButton'
import { RSInput } from '@/components/rs/RSInput'
import { RSSelect } from '@/components/rs/RSSelect'
import { RSModal } from '@/components/rs/RSModal'
import { RSTextarea } from '@/components/rs/RSTextarea'
import { BrandGuideline as DBGuideline } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

export default function BrandGuidelinesPage() {
    const [guidelines, setGuidelines] = useState<DBGuideline[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        industry: 'General',
        is_default: false,
        prohibitions: '',
        requirements: ''
    })

    const fetchGuidelines = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/guidelines')
            if (!response.ok) throw new Error('Failed to access protocol database')
            const data = await response.json()
            setGuidelines(data.guidelines)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchGuidelines()
    }, [])

    const handleCreate = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/guidelines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    prohibitions: formData.prohibitions.split('\n').filter(Boolean),
                    requirements: formData.requirements.split('\n').filter(Boolean)
                })
            })
            if (!response.ok) throw new Error('Protocol initialization failed')

            await fetchGuidelines()
            setIsCreateOpen(false)
            setFormData({ name: '', industry: 'General', is_default: false, prohibitions: '', requirements: '' })
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredGuidelines = guidelines.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === 'all' || g.industry?.toLowerCase() === filterCategory.toLowerCase()
        return matchesSearch && matchesCategory
    })

    return (
        <>
            {/* Rigid Schematic Header - Locked to [120, 120] */}
            <div className="absolute top-[120px] left-[120px] w-[840px] z-20">
                <div className="flex items-center justify-between border-b border-[var(--rs-border-primary)] pb-6 relative bg-[var(--rs-bg-surface)]">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-rs-signal" />
                    <div>
                        <h1 className="text-[var(--rs-text-primary)] text-xl font-black tracking-tighter uppercase rs-type-section">POLICY_CONTROL_MODULE</h1>
                        <p className="text-[9px] font-mono text-rs-text-tertiary mt-2 uppercase tracking-[0.3em] pl-6 rs-type-micro">// ACTIVE_PROTOCOLS: {guidelines.length.toString().padStart(3, '0')} // STATUS: NOMINAL</p>
                    </div>
                    <RSButton variant="primary" icon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)} className="h-[42px] px-8 text-xs font-black shadow-[var(--rs-shadow-l2)]">
                        INITIALIZE_PROTOCOL
                    </RSButton>
                </div>

                {/* Filter Bay - Locked below header */}
                <div className="mt-8 flex gap-6 items-end bg-[var(--rs-gray-50)]/50 p-6 border border-[var(--rs-border-primary)] border-dashed relative">
                    <div className="flex-1 relative group">
                        <label className="absolute -top-3 left-3 bg-[var(--rs-bg-surface)] px-2 text-[8px] font-black text-rs-text-tertiary uppercase tracking-widest">Registry_Query</label>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rs-text-tertiary" />
                        <RSInput
                            placeholder="SEARCH_POLICIES..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 h-11 bg-rs-white border-[var(--rs-border-primary)] text-[11px] font-mono uppercase focus:ring-1 focus:ring-rs-signal shadow-[var(--rs-shadow-l1)]"
                        />
                    </div>

                    <div className="w-64 relative group">
                        <label className="absolute -top-3 left-3 bg-[var(--rs-bg-surface)] px-2 text-[8px] font-black text-rs-text-tertiary uppercase tracking-widest">Category_Filter</label>
                        <RSSelect
                            value={filterCategory}
                            onChange={(value) => setFilterCategory(value)}
                            options={[
                                { value: 'all', label: 'CAT: ALL_LEVELS' },
                                { value: 'voice', label: 'CAT: VOICE' },
                                { value: 'visual', label: 'CAT: VISUAL' },
                                { value: 'legal', label: 'CAT: LEGAL' },
                                { value: 'safety', label: 'CAT: SAFETY' }
                            ]}
                            className="h-11 bg-rs-white border-[var(--rs-border-primary)] text-[9px] shadow-[var(--rs-shadow-l1)]"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Module Field - Locked to grid [120, 384] */}
            <div className="absolute top-[408px] left-[120px] right-[120px] bottom-0 pb-20 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="w-[840px] h-96 flex flex-col items-center justify-center border border-[var(--rs-border-primary)] border-dashed bg-[var(--rs-gray-50)]/30">
                        <Loader2 className="w-8 h-8 text-rs-signal animate-spin mb-4" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-rs-text-tertiary">Accessing_Protocol_Stream...</span>
                    </div>
                ) : error ? (
                    <div className="w-[840px] h-96 flex flex-col items-center justify-center border border-rs-destruct/20 bg-rs-destruct/5">
                        <AlertOctagon className="w-10 h-10 text-rs-destruct mb-4" />
                        <span className="text-[10px] uppercase font-mono tracking-widest text-rs-destruct font-bold">{error}</span>
                        <RSButton variant="ghost" onClick={fetchGuidelines} className="mt-8">RE_INITIALIZE</RSButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1">
                        <AnimatePresence mode="popLayout">
                            {filteredGuidelines.map(g => (
                                <GuidelineCard
                                    key={g.id}
                                    guideline={g}
                                    onClick={() => { }}
                                />
                            ))}
                        </AnimatePresence>

                        {filteredGuidelines.length === 0 && (
                            <div className="col-span-full h-48 flex flex-col items-center justify-center border border-dashed border-[var(--rs-border-primary)] rounded-[4px] bg-[var(--rs-gray-50)]/30 text-rs-text-disabled">
                                <Shield size={32} className="opacity-10 mb-3" />
                                <span className="text-[10px] uppercase tracking-[0.4em] font-mono font-bold">No_Protocols_In_Active_Buffer</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <RSModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="INITIALIZE_NEW_PROTOCOL">
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary mb-1 block">Protocol_Name</label>
                        <RSInput
                            placeholder="ENTER_NAME..."
                            autoFocus
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary mb-1 block">Industry_Context</label>
                            <RSSelect
                                value={formData.industry}
                                onChange={val => setFormData(prev => ({ ...prev, industry: val }))}
                                options={[
                                    { value: 'General', label: 'GENERAL' },
                                    { value: 'E-commerce', label: 'E-COMMERCE' },
                                    { value: 'Healthcare', label: 'HEALTHCARE' },
                                    { value: 'Finance', label: 'FINANCE' }
                                ]}
                            />
                        </div>
                        <div className="flex flex-col justify-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_default}
                                    onChange={e => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                                    className="accent-rs-signal"
                                />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary">Set as Global Default</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary mb-1 block">Prohibitions (One per line)</label>
                        <RSTextarea
                            placeholder="// DEFINE_STRICT_PROHIBITIONS..."
                            value={formData.prohibitions}
                            onChange={e => setFormData(prev => ({ ...prev, prohibitions: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary mb-1 block">Requirements (One per line)</label>
                        <RSTextarea
                            placeholder="// DEFINE_STRICT_REQUIREMENTS..."
                            value={formData.requirements}
                            onChange={e => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-rs-border-primary">
                        <RSButton variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>CANCEL</RSButton>
                        <RSButton variant="primary" onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'INITIALIZE'}
                        </RSButton>
                    </div>
                </div>
            </RSModal>
        </>
    )
}

function GuidelineCard({ guideline, onClick }: { guideline: DBGuideline, onClick: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClick}
            className={cn(
                "w-full bg-rs-white border border-[var(--rs-border-primary)] relative group cursor-pointer transition-all p-6 overflow-hidden",
                "hover:bg-[var(--rs-gray-50)]"
            )}
        >
            {/* Module Anchor Datums */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--rs-border-primary)] opacity-40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--rs-border-primary)] opacity-40" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rs-black text-rs-white rounded-[2px] shadow-[var(--rs-shadow-socket)]">
                        <Shield size={16} />
                    </div>
                    {guideline.is_default && (
                        <div className="text-[7px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-[2px] border bg-rs-signal/5 text-rs-signal border-rs-signal/30">
                            GLOBAL_DEFAULT
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-6 min-h-[60px]">
                <h3 className="text-[11px] font-black text-rs-text-primary uppercase tracking-tight group-hover:text-rs-signal transition-colors leading-tight">{guideline.name}</h3>
                <p className="text-[8px] font-mono text-rs-text-tertiary flex items-center gap-2">
                    <span className="opacity-50">REF:</span>
                    <span className="font-bold">{guideline.id.slice(0, 12).toUpperCase()}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[7px] px-1.5 py-0.5 bg-[var(--rs-gray-100)] text-rs-text-secondary font-bold uppercase tracking-widest">{guideline.industry || 'GENERAL'}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--rs-border-primary)] border-dashed">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-mono text-rs-text-tertiary uppercase tracking-widest leading-none">Status: NOMINAL</span>
                    <span className="text-[7px] font-bold text-rs-text-tertiary uppercase italic">
                        ENFORCED: {formatDistanceToNow(new Date(guideline.created_at)).toUpperCase()}
                    </span>
                </div>
                <div className="p-1.5 border border-[var(--rs-border-primary)] bg-[var(--rs-gray-50)] group-hover:bg-rs-black group-hover:text-rs-white transition-all">
                    <Download size={12} />
                </div>
            </div>
        </motion.div>
    )
}
