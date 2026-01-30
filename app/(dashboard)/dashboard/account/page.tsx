'use client'

import { useState } from 'react'
import { Lock, Users, Mail, Shield, Plus, Trash2, Crown } from 'lucide-react'
import { RSButton } from '@/components/rs/RSButton'

export default function AccountSettingsPage() {
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [name, setName] = useState('John Korkidis')
    const [email, setEmail] = useState('john@korkidis.com')

    // Mock data - replace with real data
    const userPlan = 'individual' // 'individual' | 'team' | 'enterprise'
    const has2FA = false

    const teamMembers = [
        { id: '1', name: 'John Korkidis', email: 'john@korkidis.com', role: 'owner', avatar: 'JK' },
        { id: '2', name: 'Sarah Chen', email: 'sarah@korkidis.com', role: 'admin', avatar: 'SC' },
        { id: '3', name: 'Mike Rodriguez', email: 'mike@korkidis.com', role: 'member', avatar: 'MR' },
    ]

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-3xl font-black text-white mb-2">Account Settings</h1>
            <p className="text-rs-text-secondary mb-8">Manage your profile, security, and team</p>

            {/* Profile Section */}
            <div className="bg-rs-bg-surface-2 border border-rs-border-primary rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black text-rs-text-secondary uppercase tracking-widest">Profile</h2>
                    <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="text-sm font-bold text-rs-action-primary hover:text-rs-action-hover transition-colors"
                    >
                        {isEditingProfile ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                {isEditingProfile ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-rs-bg-surface-3 border border-rs-border-secondary rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rs-action-primary/50 transition-all"
                            />
                        </div>
                        <RSButton>Save Changes</RSButton>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                {name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white">{name}</p>
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Security Section */}
            <div className="bg-rs-bg-surface-2 border border-rs-border-primary rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-black text-rs-text-secondary uppercase tracking-widest mb-6">Security</h2>

                <div className="space-y-4">
                    {/* Change Password */}
                    <div className="flex items-center justify-between p-4 bg-rs-bg-surface-3 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rs-bg-surface-4 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-rs-text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Password</p>
                                <p className="text-xs text-rs-text-secondary">Last changed 3 months ago</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-rs-bg-surface-3 hover:bg-rs-bg-surface-4 text-white rounded-lg text-sm font-medium transition-colors">
                            Change Password
                        </button>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between p-4 bg-rs-bg-surface-3 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rs-bg-surface-4 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-rs-text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                                <p className="text-xs text-rs-text-secondary">
                                    {has2FA ? 'Enabled' : 'Add an extra layer of security'}
                                </p>
                            </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${has2FA
                            ? 'bg-rs-signal/10 text-rs-signal hover:bg-rs-signal/20'
                            : 'bg-rs-safe/10 text-rs-safe hover:bg-rs-safe/20'
                            }`}>
                            {has2FA ? 'Disable 2FA' : 'Enable 2FA'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Team Members Section */}
            <div className="bg-rs-bg-surface-2 border border-rs-border-primary rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-sm font-black text-rs-text-secondary uppercase tracking-widest">Team Members</h2>
                        {userPlan === 'individual' && (
                            <p className="text-xs text-rs-text-secondary mt-1">Available on Team plan+</p>
                        )}
                    </div>
                    {userPlan !== 'individual' && (
                        <RSButton className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Invite Member
                        </RSButton>
                    )}
                </div>

                {userPlan === 'individual' ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-rs-bg-surface-3 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-rs-text-tertiary" />
                        </div>
                        <p className="text-sm font-medium text-rs-text-secondary mb-4">
                            Upgrade to Team plan to collaborate with your team
                        </p>
                        <RSButton>
                            Upgrade to Team
                        </RSButton>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-rs-bg-surface-3 rounded-xl hover:bg-rs-bg-surface-4 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-rs-primary to-rs-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {member.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white">{member.name}</p>
                                            {member.role === 'owner' && (
                                                <Crown className="w-4 h-4 text-rs-risk-caution" />
                                            )}
                                        </div>
                                        <p className="text-xs text-rs-text-secondary">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        className="bg-rs-bg-surface-4 border border-rs-border-secondary rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rs-action-primary/50"
                                        defaultValue={member.role}
                                        disabled={member.role === 'owner'}
                                    >
                                        <option value="owner">Owner</option>
                                        <option value="admin">Admin</option>
                                        <option value="member">Member</option>
                                    </select>
                                    {member.role !== 'owner' && (
                                        <button className="p-2 text-rs-text-secondary hover:text-rs-signal hover:bg-rs-signal/10 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
