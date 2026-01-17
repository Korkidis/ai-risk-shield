'use client'

import React from 'react'

export default function DesignLabPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] p-12 font-sans">
      <header className="mb-16 border-b-2 border-[#1a1a1a] pb-8">
        <h1 className="text-6xl font-black tracking-tighter uppercase">Design Lab</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-[#d62828] mt-2">
          System: AI Risk Shield / DNA: Rams x Bass
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Colors Section */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest mb-6 border-l-4 border-[#1a1a1a] pl-3">Foundation / Palette</h2>
          <div className="grid grid-cols-2 gap-4">
            <ColorSwatch name="RS Black" hex="#1a1a1a" text="text-white" />
            <ColorSwatch name="RS White" hex="#faf9f7" border />
            <ColorSwatch name="RS Signal" hex="#d62828" text="text-white" />
            <ColorSwatch name="RS Safe" hex="#2d6a4f" text="text-white" />
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest mb-6 border-l-4 border-[#1a1a1a] pl-3">Foundation / Typography</h2>
          <div className="space-y-6">
            <div>
              <p className="text-6xl font-black tracking-tighter leading-none">0.85</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Display Numeric / Risk Coefficient</p>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">Systematic Restraint</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">H1 / Heading Alpha</p>
            </div>
            <div>
              <p className="text-sm leading-relaxed max-w-sm">Every element earns its place. Risk isn&apos;t decoration—it&apos;s drama rendered with precision. Motion is purposeful: reveals, not flourishes.</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Body / Functional Prose</p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-24 border-t border-[#1a1a1a]/10 pt-8">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">
          AI Risk Shield / Industrial Warning Systems / Visual DNA v1.0
        </p>
      </div>
    </div>
  )
}

function ColorSwatch({ name, hex, text = "text-black", border = false }: { name: string, hex: string, text?: string, border?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div 
        className={`h-24 w-full flex items-end p-3 ${text} ${border ? 'border border-[#1a1a1a]/10' : ''}`}
        style={{ backgroundColor: hex }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">{name}</span>
      </div>
      <span className="text-[10px] font-mono opacity-50">{hex}</span>
    </div>
  )
}
