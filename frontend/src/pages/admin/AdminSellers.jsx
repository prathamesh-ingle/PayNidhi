import React, { useState, useEffect } from 'react';
import {
    Users, Mail, Wallet, ToggleRight, ToggleLeft,
    Plus, Edit, Trash2, Calendar
} from 'lucide-react';
import { PremiumTable } from '../../components/admin/exports';
import { getSellers, toggleUser } from '../../api/adminApi';
import toast from 'react-hot-toast';

const AdminSellers = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const res = await getSellers();
            setSellers(res.data.sellers || []);
        } catch (error) {
            toast.error("Failed to fetch seller data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleToggle = async (id, currentStatus) => {
        try {
            await toggleUser('seller', id, { isActive: !currentStatus });
            toast.success(`Seller ${!currentStatus ? 'activated' : 'suspended'}`);
            fetchSellers();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const filteredData = sellers.filter(s =>
        s.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.gstNumber?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            header: "ENTITY EMAIL",
            render: (row) => (
                <span className="text-sm font-medium text-slate-600">{row.email}</span>
            )
        },
        {
            header: "COMPANY NAME",
            render: (row) => (
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{row.companyName}</span>
            )
        },
        {
            header: "BUSINESS TYPE",
            render: (row) => (
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#47C4B7]">{row.businessType}</span>
            )
        },
        {
            header: "INDUSTRY",
            render: (row) => (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {row.industry}
                </span>
            )
        },
        {
            header: "ANNUAL TURNOVER",
            render: (row) => (
                <span className="text-sm font-bold text-slate-700 font-mono">₹{(row.annualTurnover / 100000).toFixed(1)}L</span>
            )
        },
        {
            header: "GST NUMBER",
            render: (row) => (
                <span className="text-sm font-medium text-slate-500 font-mono uppercase tracking-tight">{row.gstNumber}</span>
            )
        },
        {
            header: "KYC STATUS",
            render: (row) => (
                <span className={`text-[11px] font-bold uppercase tracking-widest ${row.kycStatus === 'verified' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                    {row.kycStatus}
                </span>
            )
        },
        {
            header: "WALLET BALANCE",
            render: (row) => (
                <span className="text-sm font-bold text-slate-800 italic">₹{row.walletBalance?.toLocaleString()}</span>
            )
        },
        {
            header: "STATUS",
            render: (row) => (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${row.isActive ? 'text-emerald-600 border-emerald-100 bg-emerald-50/30' : 'text-rose-600 border-rose-100 bg-rose-50/30'
                    }`}>
                    {row.isActive ? 'Active' : 'Muted'}
                </span>
            )
        },
        {
            header: "ACTIONS",
            align: "right",
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5 px-2">
                    <button className="p-2 text-slate-400 hover:text-[#47C4B7] transition-all">
                        <Plus size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-500 transition-all">
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleToggle(row._id, row.isActive)}
                        className={`p-2 transition-all ${row.isActive ? 'text-slate-400 hover:text-amber-600' : 'text-amber-600'
                            }`}
                    >
                        {row.isActive ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full pb-20">
            <PremiumTable
                title="Seller Registry"
                subtitle="Platform trade partner management and verification"
                icon={Users}
                stats={{
                    label: "Total Registered",
                    value: sellers.length,
                    unit: "SELLERS",
                    aggregateText: `Platform trade partners`
                }}
                columns={columns}
                data={filteredData}
                loading={loading}
                onSearchChange={setSearch}
                onRefresh={fetchSellers}
            />
        </div>
    );
};

export default AdminSellers;
