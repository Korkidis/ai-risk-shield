'use client'

import { Video, BookOpen, FileQuestion, MessageCircle, Activity, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
    const helpSections = [
        {
            icon: Video,
            title: 'Quick Start',
            description: 'Get up and running in minutes',
            items: [
                { label: 'Your First Scan', href: '#' },
                { label: 'Understanding Risk Scores', href: '#' },
                { label: 'Reading Forensic Reports', href: '#' },
            ]
        },
        {
            icon: BookOpen,
            title: 'How-To Guides',
            description: 'Step-by-step tutorials',
            items: [
                { label: 'Setting Up Brand Guidelines', href: '#' },
                { label: 'Managing Team Members', href: '#' },
                { label: 'Interpreting C2PA Credentials', href: '#' },
                { label: 'Exporting Reports', href: '#' },
            ]
        },
        {
            icon: FileQuestion,
            title: 'Methodology',
            description: 'How we analyze your content',
            content: (
                <div className="space-y-3 text-sm text-slate-300">
                    <p>
                        AI Risk Shield uses a multi-layered forensic approach to assess digital assets across three critical dimensions:
                    </p>
                    <ul className="space-y-2 ml-4">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span><strong className="text-white">Intellectual Property Risk:</strong> Analyzes visual elements, patterns, and metadata to identify potential copyright concerns</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span><strong className="text-white">Brand Safety:</strong> Evaluates content against industry standards and custom brand guidelines</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span><strong className="text-white">Provenance & Credentials:</strong> Verifies C2PA content credentials and analyzes creation metadata</span>
                        </li>
                    </ul>
                    <p className="text-slate-400 text-xs mt-4">
                        Our proprietary analysis pipeline combines multiple AI models with forensic techniques to provide comprehensive risk assessment.
                    </p>
                </div>
            )
        },
    ]

    const faqItems = [
        {
            question: 'What file types are supported?',
            answer: 'We support JPEG, PNG, WebP, MP4, and MOV files up to 100MB each.'
        },
        {
            question: 'How accurate are the risk scores?',
            answer: 'Our multi-model approach provides industry-leading accuracy. However, all scores should be reviewed by a human for final decision-making.'
        },
        {
            question: 'Can I customize the risk thresholds?',
            answer: 'Yes! Team and Enterprise plans allow you to set custom risk thresholds and brand guidelines.'
        },
        {
            question: 'How long are scans stored?',
            answer: 'Scans are stored for 90 days on Individual plans, 1 year on Team plans, and indefinitely on Enterprise plans.'
        },
        {
            question: 'What is C2PA verification?',
            answer: 'C2PA (Coalition for Content Provenance and Authenticity) is an industry standard for verifying the origin and history of digital content.'
        },
    ]

    return (
        <div className="p-8 max-w-5xl">
            <h1 className="text-3xl font-black text-white mb-2">Help & Documentation</h1>
            <p className="text-slate-400 mb-8">Everything you need to get the most out of AI Risk Shield</p>

            {/* Help Sections */}
            <div className="grid gap-6 mb-8">
                {helpSections.map((section) => (
                    <div key={section.title} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                                <section.icon className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">{section.title}</h2>
                                <p className="text-xs text-slate-400">{section.description}</p>
                            </div>
                        </div>

                        {section.items ? (
                            <div className="grid sm:grid-cols-2 gap-2">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="flex items-center justify-between px-4 py-2.5 bg-slate-800/30 hover:bg-slate-800 rounded-lg transition-colors group"
                                    >
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                                            {item.label}
                                        </span>
                                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-800/30 rounded-lg p-4">
                                {section.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <FileQuestion className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
                        <p className="text-xs text-slate-400">Common questions and answers</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <details key={index} className="group">
                            <summary className="flex items-center justify-between cursor-pointer px-4 py-3 bg-slate-800/30 hover:bg-slate-800 rounded-lg transition-colors">
                                <span className="text-sm font-medium text-white">{item.question}</span>
                                <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <div className="px-4 py-3 text-sm text-slate-300">
                                {item.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Contact Support</h2>
                        <p className="text-xs text-slate-400">We're here to help</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 rounded-lg p-4">
                        <p className="text-sm font-bold text-white mb-2">Email Support</p>
                        <p className="text-xs text-slate-400 mb-3">Response within 24 hours</p>
                        <a
                            href="mailto:support@airiskshield.com"
                            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            support@airiskshield.com
                        </a>
                    </div>
                    <div className="bg-slate-800/30 rounded-lg p-4">
                        <p className="text-sm font-bold text-white mb-2">Live Chat</p>
                        <p className="text-xs text-slate-400 mb-3">Available on Team+ plans</p>
                        <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            Start Chat →
                        </button>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">System Status</h2>
                        <p className="text-xs text-slate-400">All systems operational</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/30 rounded-lg">
                        <span className="text-sm font-medium text-slate-300">API Services</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-400">Operational</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/30 rounded-lg">
                        <span className="text-sm font-medium text-slate-300">Analysis Engine</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-400">Operational</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/30 rounded-lg">
                        <span className="text-sm font-medium text-slate-300">Storage & Reports</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-400">Operational</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <a
                        href="https://status.airiskshield.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                    >
                        View detailed status page
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    )
}
