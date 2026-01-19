import React from 'react';
import { RSBackground } from './RSBackground';

interface RSDraftingBoardProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * @deprecated Use RSBackground with variant="technical" instead.
 * Kept for backward compatibility.
 */
export const RSDraftingBoard = ({ children, className = "" }: RSDraftingBoardProps) => {
    return (
        <RSBackground variant="technical" className={className}>
            {children}
        </RSBackground>
    );
};
