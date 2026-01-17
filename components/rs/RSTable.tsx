"use client";

import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';

interface Column {
    key: string;
    header: string;
    width?: string;
    sortable?: boolean;
}

interface RSTableProps {
    columns: Column[];
    data: any[];
    className?: string;
}

export function RSTable({
    columns,
    data,
    className,
}: RSTableProps) {
    return (
        <div className={cn("w-full overflow-hidden border border-rs-gray-200 rounded-[4px] bg-rs-white shadow-sm", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-rs-gray-50 border-b border-rs-gray-200">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-6 py-3 font-mono text-xs font-semibold text-rs-gray-500 uppercase tracking-wider select-none hover:bg-rs-gray-100 cursor-pointer transition-colors"
                                    style={{ width: col.width }}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.header}
                                        {col.sortable && <ArrowUpDown className="w-3 h-3 text-rs-gray-400" />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-rs-gray-100">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="group hover:bg-rs-gray-50/50 transition-colors duration-150"
                            >
                                {columns.map((col) => (
                                    <td
                                        key={`${rowIndex}-${col.key}`}
                                        className="px-6 py-4 text-sm text-rs-black whitespace-nowrap group-hover:text-rs-black/90"
                                    >
                                        {row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Optional Footer/Pagination area could go here */}
        </div>
    );
}
