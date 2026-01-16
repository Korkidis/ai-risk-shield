'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    FileText,
    Trash2,
    CheckCircle2,
    Upload,
    Loader2,
    X,
    Globe,
    Monitor,
    Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandGuideline } from '@/types/database'
import { format } from 'date-fns'

export default function BrandGuidelinesPage() {
    const [guidelines, setGuidelines] = useState<BrandGuideline[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGuideline, setSelectedGuideline] = useState<BrandGuideline | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [editingGuideline, setEditingGuideline] = useState<BrandGuideline | null>(null)
    const [extracting, setExtracting] = useState(false)

    useEffect(() => {
        fetchGuidelines()
    }, [])

    const fetchGuidelines = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/guidelines')
            const data = await res.json()
            setGuidelines(data.guidelines || [])
        } catch (err) {
            console.error('Failed to fetch guidelines:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (formData: any) => {
        const method = editingGuideline ? 'PATCH' : 'POST'
        const url = editingGuideline ? `/api/guidelines/${editingGuideline.id}` : '/api/guidelines'

        try {
            await fetch(url, {
                method,
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            setIsCreating(false)
            setEditingGuideline(null)
            fetchGuidelines()
        } catch (err) {
            console.error('Save failed:', err)
        }
    }

    const handleSetDefault = async (id: string) => {
        try {
            await fetch(`/api/guidelines/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_default: true }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            fetchGuidelines()
        } catch (err) {
            console.error('Failed to set default:', err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this profile?')) return
        try {
            const res = await fetch(`/api/guidelines/${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.error) alert(data.error)
            else fetchGuidelines()
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setExtracting(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/guidelines/extract', {
                method: 'POST',
                body: formData
            })
            const extracted = await res.json()

            // Auto-create guideline from extraction
            await fetch('/api/guidelines', {
                method: 'POST',
                body: JSON.stringify({
                    name: extracted.name || file.name.replace(/\.[^/.]+$/, ""),
                    industry: extracted.industry,
                    prohibitions: extracted.prohibitions,
                    requirements: extracted.requirements,
                    context_modifiers: extracted.context_modifiers,
                    target_markets: extracted.target_markets,
                    target_platforms: extracted.target_platforms
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            fetchGuidelines()
        } catch (err) {
            console.error('Extraction failed:', err)
            alert('Failed to extract and create guideline.')
        } finally {
            setExtracting(false)
        }
    }

    return (
        <div className="flex h-full gap-6 relative overflow-hidden">
            <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white">Guidelines & Policies</h1>
                        <p className="text-slate-500 text-sm">Define custom rules to tailor AI analysis to your brand.</p>
                    </div>
                    <div className="flex gap-3">
                        <label className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
                            {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Auto-Extract PDF
                            <input type="file" className="hidden" onChange={onFileUpload} accept=".pdf,image/*" disabled={extracting} />
                        </label>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-slate-700"
                        >
                            <Plus className="w-4 h-4" />
                            New Profile
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-slate-500 text-sm font-medium animate-pulse">Loading profiles...</p>
                        </div>
                    ) : guidelines.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10 p-8 text-center">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                                <Zap className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-medium">No guidelines defined</p>
                            <p className="text-xs mt-1 max-w-xs mx-auto">Upload a brand PDF or create a manual profile to start evaluating scans against your standards.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                            {guidelines.map((g) => (
                                <GuidelineCard
                                    key={g.id}
                                    guideline={g}
                                    onClick={() => setSelectedGuideline(g)}
                                    onSetDefault={() => handleSetDefault(g.id)}
                                    onDelete={() => handleDelete(g.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedGuideline && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        className="fixed right-0 top-0 bottom-0 w-[450px] bg-[#020617] border-l border-slate-800 p-8 flex flex-col gap-8 shadow-2xl z-[60] overflow-y-auto custom-scrollbar"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedGuideline.name}</h2>
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">{selectedGuideline.industry || 'General Industry'}</p>
                            </div>
                            <button onClick={() => setSelectedGuideline(null)} className="p-2 text-slate-500 hover:text-white bg-slate-900 rounded-lg border border-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <Section title="Prohibitions" items={selectedGuideline.prohibitions} icon={<X className="text-red-500" />} />
                        <Section title="Requirements" items={selectedGuideline.requirements} icon={<CheckCircle2 className="text-emerald-500" />} />
                        <Section title="Context Modifiers" items={selectedGuideline.context_modifiers} icon={<Globe className="text-indigo-500" />} />

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Markets
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedGuideline.target_markets.map(m => <span key={m} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold text-slate-400">{m}</span>)}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Monitor className="w-3 h-3" /> Platforms
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedGuideline.target_platforms.map(p => <span key={p} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold text-slate-400">{p}</span>)}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => { setEditingGuideline(selectedGuideline); setIsCreating(true); setSelectedGuideline(null); }}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl text-xs font-black transition-all border border-slate-700 mt-auto"
                        >
                            EDIT PROFILE
                        </button>
                    </motion.div>
                )}

                {(isCreating) && (
                    <GuidelineModal
                        guideline={editingGuideline}
                        onClose={() => { setIsCreating(false); setEditingGuideline(null); }}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function GuidelineModal({ guideline, onClose, onSave }: { guideline: BrandGuideline | null, onClose: () => void, onSave: (data: any) => void }) {
    const [name, setName] = useState(guideline?.name || '')
    const [industry, setIndustry] = useState(guideline?.industry || '')
    const [prohibitions, setProhibitions] = useState(guideline?.prohibitions.join('\n') || '')
    const [requirements, setRequirements] = useState(guideline?.requirements.join('\n') || '')
    const [context, setContext] = useState(guideline?.context_modifiers.join('\n') || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            name,
            industry,
            prohibitions: prohibitions.split('\n').filter(l => l.trim()),
            requirements: requirements.split('\n').filter(l => l.trim()),
            context_modifiers: context.split('\n').filter(l => l.trim()),
            target_markets: guideline?.target_markets || ['Global'],
            target_platforms: guideline?.target_platforms || ['All']
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#020617] border border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white uppercase">{guideline ? 'Edit Profile' : 'New Brand Profile'}</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profile Name</label>
                            <input
                                value={name} onChange={e => setName(e.target.value)} required
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Holiday Campaign 2026"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Industry</label>
                            <input
                                value={industry} onChange={e => setIndustry(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Luxury Goods"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <X className="w-3 h-3 text-red-500" /> Prohibitions (One per line)
                        </label>
                        <textarea
                            value={prohibitions} onChange={e => setProhibitions(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 min-h-[100px] resize-none"
                            placeholder="No alcohol imagery&#10;No political content"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Requirements (One per line)
                        </label>
                        <textarea
                            value={requirements} onChange={e => setRequirements(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 min-h-[100px] resize-none"
                            placeholder="Logo must be clearly visible&#10;Diverse representation required"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 text-indigo-500" /> Context Modifiers
                        </label>
                        <textarea
                            value={context} onChange={e => setContext(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 min-h-[100px] resize-none"
                            placeholder="We are a swimwear brand (beach nudity context is safe)"
                        />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                        {guideline ? 'Update Profile' : 'Create Profile'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    )
}

function GuidelineCard({ guideline, onClick, onSetDefault, onDelete }: {
    guideline: BrandGuideline,
    onClick: () => void,
    onSetDefault: () => void,
    onDelete: () => void
}) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`group bg-slate-900/40 border-2 rounded-2xl p-6 transition-all border-slate-800 hover:border-slate-700`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <FileText className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="flex gap-2">
                    {guideline.is_default && (
                        <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase rounded-lg">Default</div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div onClick={onClick} className="cursor-pointer">
                <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{guideline.name}</h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-mono">
                    {guideline.industry || 'General'} • {guideline.prohibitions.length + guideline.requirements.length} Rules
                </p>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        Last Used: {guideline.last_used_at ? format(new Date(guideline.last_used_at), 'MMM dd') : 'Never'}
                    </span>
                    {!guideline.is_default && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
                            className="text-[10px] text-indigo-500 hover:text-indigo-400 font-black uppercase tracking-widest"
                        >
                            Set Default
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function Section({ title, items, icon }: { title: string, items: string[], icon: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                {icon} {title}
            </h4>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-3 text-xs text-slate-300 font-medium leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                        <span className="text-slate-700 pt-0.5">•</span>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    )
}
