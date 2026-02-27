import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Info, TrendingUp } from 'lucide-react';

const PremiumTable = ({
    title,
    subtitle,
    icon: Icon,
    stats,
    columns,
    data,
    loading,
    searchPlaceholder = "Search records...",
    onSearchChange,
    onRefresh
}) => {
    return (
        <div className="space-y-6 pb-20 max-w-[1800px] mx-auto animate-in fade-in duration-500 font-sans">
            {/* Header Section - Medium Depth */}
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between"
            >
                <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                                <Icon className="text-[#47C4B7]" size={28} />
                                {title}
                            </h1>
                            <p className="text-[13px] font-medium text-slate-500 border-l-2 border-[#47C4B7] pl-3 mt-2">
                                {subtitle}
                            </p>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="p-2.5 text-slate-400 hover:text-[#47C4B7] bg-white border border-slate-100 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className="hover:rotate-180 transition-transform duration-700" />
                        </button>
                    </div>

                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="w-full pl-6 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-[#47C4B7]/5 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Stats Card - Balanced Depth */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-slate-100 rounded-[28px] p-6 py-5 shadow-sm relative overflow-hidden group min-w-[320px]"
                    >
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[#47C4B7]/10 group-hover:scale-105 transition-transform duration-1000">
                            <TrendingUp size={100} strokeWidth={1.5} />
                        </div>

                        <div className="relative z-10 flex flex-col gap-1">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#47C4B7]">{stats.label}</h3>

                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-800 tracking-tighter">
                                    {stats.value}
                                </span>
                                <span className="text-sm font-bold text-slate-400 uppercase">{stats.unit || 'ENT'}</span>
                            </div>

                            <p className="text-[12px] font-medium text-slate-400 italic">
                                {stats.aggregateText || `Current active records`}
                            </p>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Table Section - Medium Definition */}
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-center border-r border-slate-100/50 w-20">No.</th>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-center border-r border-slate-100/50 last:border-r-0"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <AnimatePresence mode='popLayout'>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={columns.length + 1} className="px-5 py-8 text-center">
                                            <div className="h-5 bg-slate-50 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : data.length > 0 ? (
                                data.map((row, i) => (
                                    <motion.tr
                                        key={row._id || i}
                                        layout
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-5 text-center border-r border-slate-100/50">
                                            <span className="text-xs font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                                        </td>
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className={`px-6 py-5 border-r border-slate-100/50 last:border-r-0 whitespace-nowrap ${col.align === 'right' ? 'text-right' : 'text-center'}`}
                                            >
                                                {col.render ? col.render(row, i) : (
                                                    <span className="text-sm font-medium text-slate-600">{row[col.key]}</span>
                                                )}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} className="py-24 text-center">
                                        <p className="text-slate-400 font-medium italic text-sm">No registry entries found.</p>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
        </div>
    );
};

export default PremiumTable;
