import { RSBackground } from '@/components/rs/RSBackground'
import { RSEmptyState } from '@/components/rs/RSEmptyState'
import { RSButton } from '@/components/rs/RSButton'
import { FileQuestion } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
    return (
        <RSBackground variant="technical" className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
                <RSEmptyState
                    icon={<FileQuestion className="w-8 h-8 text-[var(--rs-text-tertiary)]" />}
                    title="404 — Record Not Found"
                    description="The requested resource does not exist in our archive. It may have been purged or the URL is incorrect."
                    action={
                        <Link href="/">
                            <RSButton variant="primary">
                                RETURN_TO_BASE
                            </RSButton>
                        </Link>
                    }
                />
            </div>
        </RSBackground>
    )
}
