'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// Dark mode is intentionally global (applies to both dashboard and marketing pages).
// The forensic instrument aesthetic works well in dark mode across all routes.
// If dashboard-scoped dark mode is needed later, wrap ThemeProvider conditional
// on usePathname().startsWith('/dashboard').
type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => {},
})

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    // On mount: read preference from localStorage, then system preference, then default light
    useEffect(() => {
        const stored = localStorage.getItem('rs-theme') as Theme | null
        if (stored === 'dark' || stored === 'light') {
            setTheme(stored)
            document.documentElement.setAttribute('data-theme', stored)
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark')
            document.documentElement.setAttribute('data-theme', 'dark')
        }
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        localStorage.setItem('rs-theme', next)
        document.documentElement.setAttribute('data-theme', next)
    }

    // Prevent flash: don't render children until theme is resolved
    // The inline script in layout handles the initial flash prevention
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
