import React, { useState, useEffect } from 'react';
import {
    Calculator, Zap, Scale, Info,
    ArrowRightLeft, Landmark, History,
    CreditCard, Plus, Edit, Trash2, Banknote,
    Clock, Calendar
} from 'lucide-react';
import { PremiumTable } from '../../components/admin/exports';
import { getFinances, settleInvoice } from '../../api/adminApi';
import toast from 'react-hot-toast';

const AdminSettlements = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getFinances();
            // Show only active loans for settlement
            setData(res.data.finances?.filter(f => !f.isSettled) || []);
        } catch (error) {
            toast.error("Failed to fetch loan book");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSettle = async (invoiceId) => {
        const toastId = toast.loading('Executing Money Split Protocol...', {
            style: { borderRadius: '15px', background: '#333', color: '#fff' }
        });
        try {
            await settleInvoice(invoiceId);
            toast.success('Funds Disbursed. Wallets Updated.', { id: toastId });
            fetchData();
        } catch (error) {
            toast.error('Split execution failed.', { id: toastId });
        }
    };

    const filteredData = data.filter(d =>
        d.seller?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        d.lender?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        d.invoice?.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            header: "MARKET PARTICIPANTS",
            render: (row) => (
                <div className="flex flex-col gap-1.5 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{row.seller?.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{row.lender?.companyName}</span>
                    </div>
                </div>
            )
        },
        {
            header: "PRINCIPAL DEPLOYED",
            render: (row) => (
                <span className="text-sm font-bold text-slate-800">₹{row.loanAmount?.toLocaleString()}</span>
            )
        },
        {
            header: "REPAYMENT VALUE",
            render: (row) => (
                <span className="text-sm font-bold text-emerald-600 italic">₹{row.bid?.repaymentAmount?.toLocaleString()}</span>
            )
        },
        {
            header: "ASSET STATUS",
            render: (row) => (
                <span className="px-3 py-1 bg-[#47C4B7]/10 border border-[#47C4B7]/20 rounded-lg text-[10px] font-bold text-[#47C4B7] uppercase tracking-widest">
                    Escrow Live
                </span>
            )
        },
        {
            header: "TIMESTAMP",
            render: (row) => (
                <span className="text-xs font-medium text-slate-400">
                    {new Date(row.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            )
        },
        {
            header: "SPLIT EXECUTION",
            align: "right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2 px-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                        <History size={18} />
                    </button>
                    <button
                        onClick={() => handleSettle(row.invoice?._id)}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-[#47C4B7] text-white text-[10px] font-bold rounded-xl shadow-lg transition-all uppercase tracking-[0.2em] ml-2"
                    >
                        Execute Split
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full pb-20">
            <PremiumTable
                title="Settlement Hub"
                subtitle="Real-time fund reconciliation and escrow distribution protocols."
                icon={Calculator}
                stats={{
                    label: "Active Protocols",
                    value: data.length,
                    unit: "FILES",
                    aggregateText: `Live reconciliation in progress`
                }}
                columns={columns}
                data={filteredData}
                loading={loading}
                onSearchChange={setSearch}
                onRefresh={fetchData}
            />
        </div>
    );
};

export default AdminSettlements;
