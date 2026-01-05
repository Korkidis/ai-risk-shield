/**
 * Anonymous Session Management
 *
 * Generates and manages session IDs for anonymous users
 * Stored in httpOnly cookies for security
 */

import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const SESSION_COOKIE_NAME = 'ars_session_id'
const SESSION_EXPIRY_DAYS = 30

/**
 * Get or create session ID
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(SESSION_COOKIE_NAME)

  if (existing?.value) {
    return existing.value
  }

  // Generate new session ID
  const sessionId = uuidv4()

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  })

  return sessionId
}

/**
 * Get existing session ID (returns null if doesn't exist)
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  return session?.value || null
}

/**
 * Clear session (logout)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
