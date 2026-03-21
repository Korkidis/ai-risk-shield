'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSButton } from '@/components/rs/RSButton'
import { RSKey } from '@/components/rs/RSKey'
import { ShieldCheck, AlertTriangle, ChevronLeft, ChevronRight, Power } from 'lucide-react'
import Link from 'next/link'

interface Obstacle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

const PLAYER_SIZE = 24;
const OBSTACLE_SIZE = 24;
const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;

export default function NotFound() {
    // Game State
    const [isPlaying, setIsPlaying] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [score, setScore] = useState(0)
    
    const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2)
    const [obstacles, setObstacles] = useState<Obstacle[]>([])

    const requestRef = useRef<number>(0)
    const lastObstacleTime = useRef<number>(0)
    
    // Movement refs to avoid dependency staleness
    const playerXRef = useRef(playerX)
    const isPlayingRef = useRef(isPlaying)
    const gameOverRef = useRef(gameOver)

    useEffect(() => {
        playerXRef.current = playerX
        isPlayingRef.current = isPlaying
        gameOverRef.current = gameOver
    }, [playerX, isPlaying, gameOver])

    // Controls
    const moveLeft = useCallback(() => {
        if (!isPlayingRef.current || gameOverRef.current) return;
        setPlayerX(prev => Math.max(0, prev - 30))
    }, [])

    const moveRight = useCallback(() => {
        if (!isPlayingRef.current || gameOverRef.current) return;
        setPlayerX(prev => Math.min(GAME_WIDTH - PLAYER_SIZE, prev + 30))
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft()
            if (e.key === 'ArrowRight' || e.key === 'd') moveRight()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [moveLeft, moveRight])

    // Game Loop
    const gameLoop = useCallback((time: number) => {
        if (!isPlayingRef.current || gameOverRef.current) return;

        // Add new obstacles
        if (time - lastObstacleTime.current > 600) {
            setObstacles(prev => [
                ...prev,
                {
                    id: time,
                    x: Math.random() * (GAME_WIDTH - OBSTACLE_SIZE),
                    y: -OBSTACLE_SIZE,
                    width: OBSTACLE_SIZE,
                    height: OBSTACLE_SIZE,
                }
            ])
            lastObstacleTime.current = time
        }

        // Update positions & check collisions
        setObstacles(prev => {
            let hit = false;
            const nextObs = prev.map(ob => ({ ...ob, y: ob.y + 4 })) // fall speed

            // Collision check
            const pX = playerXRef.current;
            const pY = GAME_HEIGHT - PLAYER_SIZE - 20; // Player Y position
            
            for (const ob of nextObs) {
                if (
                    pX < ob.x + ob.width &&
                    pX + PLAYER_SIZE > ob.x &&
                    pY < ob.y + ob.height &&
                    pY + PLAYER_SIZE > ob.y
                ) {
                    hit = true;
                    break;
                }
            }

            if (hit) {
                setGameOver(true)
                setIsPlaying(false)
            }

            return nextObs.filter(ob => ob.y < GAME_HEIGHT) // remove off-screen
        })

        if (!gameOverRef.current) {
            setScore(prev => prev + 1)
            requestRef.current = requestAnimationFrame(gameLoop)
        }
    }, [])

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(gameLoop)
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [isPlaying, gameLoop])

    // Toggle Power Switch
    const handlePowerSwitch = (checked: boolean) => {
        if (checked) {
            setGameOver(false)
            setScore(0)
            setObstacles([])
            setPlayerX(GAME_WIDTH / 2 - PLAYER_SIZE / 2)
            setIsPlaying(true)
        } else {
            setIsPlaying(false)
            setGameOver(false)
        }
    }

    return (
        <RSBackground variant="technical" className="min-h-screen flex items-center justify-center p-6 bg-[var(--rs-bg-base)]">
            <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-center gap-12 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] p-12 shadow-[var(--rs-shadow-l2)] rounded-[var(--rs-radius-chassis)]">
                
                {/* 8-Bit Dieter Rams Game Console */}
                <div className="flex flex-col items-center gap-6 bg-[var(--rs-bg-well)] p-6 border border-[var(--rs-border-primary)] shadow-inner rounded-xl aspect-[3/5]">
                    
                    {/* The Screen */}
                    <div 
                        className="relative bg-[var(--rs-gray-300)] border-4 border-[var(--rs-border-primary)] shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] overflow-hidden"
                        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
                    >
                        {/* Score Display (LCD Style) */}
                        <div className="absolute top-2 left-0 right-0 text-center font-mono text-xl font-bold tracking-[0.2em] text-[var(--rs-gray-600)] mix-blend-multiply opacity-50 z-0">
                            SCORE: {String(score).padStart(4, '0')}
                        </div>

                        {/* Player (The Agent) - Stark Black Geometric */}
                        <div 
                            className="absolute bg-black shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-transform duration-75"
                            style={{
                                width: PLAYER_SIZE,
                                height: PLAYER_SIZE,
                                bottom: 20,
                                left: playerX
                            }}
                        />

                        {/* Obstacles (Content Risks) - Stark Orange/Red */}
                        {obstacles.map(ob => (
                            <div 
                                key={ob.id}
                                className="absolute bg-[var(--rs-signal)] border border-black/50 shadow-[2px_2px_0_rgba(0,0,0,0.2)]"
                                style={{
                                    width: ob.width,
                                    height: ob.height,
                                    top: ob.y,
                                    left: ob.x
                                }}
                            />
                        ))}

                        {/* Overlay States */}
                        {!isPlaying && !gameOver && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
                                <span className="font-mono text-sm tracking-widest font-black text-black">AWAITING POWER</span>
                            </div>
                        )}
                        {gameOver && (
                            <div className="absolute inset-0 bg-[var(--rs-signal)]/20 flex flex-col items-center justify-center backdrop-blur-[1px] border-[6px] border-[var(--rs-signal)] border-dashed">
                                <AlertTriangle className="w-12 h-12 text-[var(--rs-signal)] mb-2" />
                                <span className="font-black text-xl italic uppercase tracking-tighter text-[var(--rs-signal)]">RISK COLLISION</span>
                                <span className="font-mono text-xs font-bold mt-2">PRESS POWER TO RESTART</span>
                            </div>
                        )}
                    </div>

                    {/* Hardware Controls */}
                    <div className="w-full flex justify-between items-center px-4 pt-4 pb-2">
                        <RSKey 
                            icon={Power}
                            active={isPlaying}
                            onClick={() => handlePowerSwitch(!isPlaying)}
                            label="POWER"
                            color="var(--rs-signal)"
                        />
                        <div className="flex gap-4">
                            <RSKey 
                                icon={ChevronLeft} 
                                onClick={moveLeft} 
                                label="LEFT"
                            />
                            <RSKey 
                                icon={ChevronRight} 
                                onClick={moveRight} 
                                label="RIGHT"
                            />
                        </div>
                    </div>

                </div>

                {/* Rams/Bass Copy Panel */}
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl rs-header-bold-italic tracking-tighter text-[var(--rs-text-primary)] leading-[0.9]">
                            404: ROUTE <span className="text-[var(--rs-signal)]">INVALID.</span>
                        </h1>
                        <p className="rs-type-body text-[var(--rs-text-secondary)] text-pretty max-w-sm">
                            The requested address does not exist. While you're here, press the power button and help our agent dodge incoming content risks.
                        </p>
                    </div>
                    
                    <div className="pt-8">
                        <Link href="/">
                            <RSButton 
                                variant="primary" 
                                size="lg" 
                                icon={<ShieldCheck className="w-4 h-4" />}
                            >
                                Return to Safety
                            </RSButton>
                        </Link>
                    </div>
                </div>

            </div>
        </RSBackground>
    )
}
