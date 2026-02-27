import React, { useState, useEffect } from 'react';
import {
    Zap, Mail, Landmark, Building,
    Plus, Edit, Trash2, Lock, Unlock
} from 'lucide-react';
import { PremiumTable } from '../../components/admin/exports';
import { getLenders, toggleUser } from '../../api/adminApi';
import toast from 'react-hot-toast';

const AdminLenders = () => {
    const [lenders, setLenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchLenders = async () => {
        try {
            setLoading(true);
            const res = await getLenders();
            setLenders(res.data.lenders || []);
        } catch (error) {
            toast.error("Failed to fetch lender data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLenders();
    }, []);

    const handleToggle = async (id, currentStatus) => {
        try {
            await toggleUser('lender', id, { isActive: !currentStatus });
            toast.success(`Lender ${!currentStatus ? 'activated' : 'suspended'}`);
            fetchLenders();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const filteredData = lenders.filter(l =>
        l.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            header: "ENTITY NAME",
            render: (row) => (
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{row.companyName}</span>
            )
        },
        {
            header: "SECURE EMAIL",
            render: (row) => (
                <span className="text-sm font-medium text-slate-500">{row.email}</span>
            )
        },
        {
            header: "PROVIDER TYPE",
            render: (row) => (
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#47C4B7]">{row.lenderType}</span>
            )
        },
        {
            header: "LICENSE ID",
            render: (row) => (
                <span className="text-sm font-medium text-slate-500 font-mono tracking-tight">{row.lenderLicense || 'RBI-V-001'}</span>
            )
        },
        {
            header: "TOTAL DEPLOYED",
            render: (row) => (
                <span className="text-sm font-bold text-slate-700 italic">₹{row.totalCreditLimit?.toLocaleString()}</span>
            )
        },
        {
            header: "UTILIZATION",
            render: (row) => {
                const usage = (row.utilizedLimit / (row.totalCreditLimit || 1)) * 100;
                return (
                    <div className="flex flex-col items-center gap-1.5 min-w-[100px] px-2">
                        <div className="flex justify-between w-full mb-0.5">
                            <span className="text-[10px] font-bold text-slate-500">{Math.round(usage)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${usage > 90 ? 'bg-rose-400' : usage > 50 ? 'bg-indigo-400' : 'bg-[#47C4B7]'
                                    }`}
                                style={{ width: `${usage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "WALLET BALANCE",
            render: (row) => (
                <span className="text-sm font-bold text-slate-800">₹{row.walletBalance?.toLocaleString()}</span>
            )
        },
        {
            header: "KYC STATUS",
            render: (row) => (
                <span className={`text-[11px] font-bold uppercase tracking-widest ${row.kycStatus === 'verified' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>{row.kycStatus}</span>
            )
        },
        {
            header: "SYSTEM STATUS",
            render: (row) => (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${row.isActive ? 'text-indigo-600 border-indigo-100 bg-indigo-50/30' : 'text-rose-600 border-rose-100 bg-rose-50/30'
                    }`}>
                    {row.isActive ? 'Active' : 'Muted'}
                </span>
            )
        },
        {
            header: "ACTION HUB",
            align: "right",
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600">
                        <Plus size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-purple-600">
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleToggle(row._id, row.isActive)}
                        className="p-2 text-slate-400 hover:text-amber-600"
                    >
                        {row.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full pb-20">
            <PremiumTable
                title="Lender Registry"
                subtitle="Verification and management of institutional capital partners"
                icon={Zap}
                stats={{
                    label: "Active Pool",
                    value: lenders.length,
                    unit: "LENDERS",
                    aggregateText: `Institutional liquidity providers`
                }}
                columns={columns}
                data={filteredData}
                loading={loading}
                onSearchChange={setSearch}
                onRefresh={fetchLenders}
            />
        </div>
    );
};

export default AdminLenders;
