import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Users, Briefcase, Clock,
    ArrowUpRight, ArrowDownRight, Search,
    RefreshCw, Wallet, Receipt, CheckCircle2,
    AlertCircle, ShieldCheck, History, Info,
    Zap, ChevronRight, Calculator, FileCheck,
    Banknote, Scale, ShieldAlert, Fingerprint,
    Cpu, Activity, Lock, BarChart3, Shield,
    UserCheck, CreditCard, DollarSign
} from 'lucide-react';
import { getStats, getPendingNOAs, verifyNOA, settleInvoice } from '../../api/adminApi';
import adminApi from '../../api/adminApi';
import toast from 'react-hot-toast';

// --- Premium UI Components ---

const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] ${className}`}>
        {children}
    </div>
);

const StatCard = ({ title, value, icon: Icon, trend, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/20 transition-all"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-[#47C4B7] group-hover:bg-[#47C4B7]/5 transition-all duration-300`}>
                <Icon size={20} />
            </div>
            {trend && (
                <div className="flex items-center text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                    <ArrowUpRight size={10} className="mr-0.5" />
                    {trend}
                </div>
            )}
        </div>
        <div className="space-y-1">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
            <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
            <p className="text-[9px] text-slate-300 font-medium leading-tight">{description}</p>
        </div>
    </motion.div>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
    <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#47C4B7]">
            <Icon size={20} />
        </div>
        <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">{title}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const config = {
        'Pending_NOA': { label: 'Pending NOA', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        'Under Review': { label: 'Under Review', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        'Verified': { label: 'Verified', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        'Repaid': { label: 'Repaid', color: 'bg-slate-100 text-slate-500 border-slate-200' },
        'default': { label: 'Active', color: 'bg-teal-50 text-teal-600 border-teal-100' }
    };
    const s = config[status] || config.default;
    return (
        <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${s.color}`}>
            {s.label}
        </span>
    );
};

// --- Main Page Component ---

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pendingNoa, setPendingNoa] = useState([]);
    const [activeLoans, setActiveLoans] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [settlementBreakdown, setSettlementBreakdown] = useState(null);

    const fetchData = async () => {
        try {
            // Fetch in background without blocking UI

            const [statsRes, noaRes, financesRes] = await Promise.all([
                getStats(),
                getPendingNOAs(),
                adminApi.get('/finances')
            ]);
            setStats(statsRes.data);
            setPendingNoa(noaRes.data.data || []);
            setActiveLoans(financesRes.data.finances || []);
        } catch (error) {
            console.error('Master Sync Error:', error);
            toast.error('Dashboard synchronization failed.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleApproveNOA = async (id) => {
        const tId = toast.loading('Reviewing Authentication...');
        try {
            await verifyNOA(id, { isApproved: true });
            toast.success('NOA Verified. Capital unlocked.', { id: tId });
            fetchData();
        } catch (error) {
            toast.error('Verification failed.', { id: tId });
        }
    };

    const runSettlementSimulation = (loan) => {
        const principal = loan.loanAmount;
        const interest = loan.bid?.repaymentAmount - principal;
        const fee = principal * 0.02; // 2% Admin Fee
        const sellerSettlement = loan.loanAmount - fee; // Simplified for demo breakdown

        setSettlementBreakdown({
            invoiceId: loan.invoice?.invoiceNumber,
            lenderPayout: loan.bid?.repaymentAmount,
            platformFee: fee,
            sellerSettlement: sellerSettlement,
            id: loan._id
        });
        toast.success("Settlement Breakdown Generated");
    };

    const executeSettle = async (id) => {
        const tId = toast.loading('Executing Money Split...');
        try {
            await settleInvoice(id);
            toast.success('Funds Disbursed. Wallets Updated.', { id: tId });
            setSettlementBreakdown(null);
            fetchData();
        } catch (error) {
            toast.error('Execution failed.', { id: tId });
        }
    };



    return (
        <div className="max-w-[1700px] mx-auto space-y-12 pb-24 pt-2 pl-2 pr-8">

            {/* --- PAGE IDENTITY --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <BarChart3 className="text-[#47C4B7]" size={36} />
                        Global Intelligence
                    </h1>
                    <p className="text-[13px] font-medium text-slate-500 border-l-2 border-[#47C4B7] pl-3">
                        Real-time platform financial health & operational audit
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#47C4B7] shadow-sm transition-all active:scale-95"
                >
                    <RefreshCw size={20} className={refreshing ? 'animate-spin' : 'hover:rotate-180 duration-700'} />
                </button>
            </div>

            {/* --- TOP ANALYTICS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard
                    title="Total GMV"
                    value={`₹${stats?.kpis?.totalGMV?.toLocaleString() || '0'}`}
                    trend="12.4%"
                    description="Total invoice value processed"
                    icon={TrendingUp}
                    delay={0.1}
                />
                <StatCard
                    title="Platform Revenue"
                    value={`₹${stats?.kpis?.totalRevenue?.toLocaleString() || '0'}`}
                    trend="8.1%"
                    description="2% platform fee earnings"
                    icon={DollarSign}
                    delay={0.2}
                />
                <StatCard
                    title="Active Loans"
                    value={stats?.kpis?.activeLoans || '0'}
                    description="Live financed invoices"
                    icon={Briefcase}
                    delay={0.3}
                />
                <StatCard
                    title="Verified Sellers"
                    value={stats?.kpis?.activeUsers?.sellers || '0'}
                    description="KYC approved trade partners"
                    icon={UserCheck}
                    delay={0.4}
                />
                <StatCard
                    title="Active Lenders"
                    value={stats?.kpis?.activeUsers?.lenders || '0'}
                    description="Verified capital providers"
                    icon={ShieldCheck}
                    delay={0.5}
                />
                <StatCard
                    title="Escrow Balance"
                    value={`₹${(stats?.kpis?.totalGMV * 0.4)?.toLocaleString() || '0'}`} // Mock/calculated
                    description="Total funds held in settlement"
                    icon={Lock}
                    delay={0.6}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* --- MAIN COLUMN (2/3) --- */}
                <div className="xl:col-span-2 space-y-10">

                    {/* LEGAL AUTHENTICATOR (Warning Section) */}
                    <GlassCard className="p-8 border-l-8 border-l-amber-400">
                        <SectionHeader title="Legal Authenticator" subtitle="Pending NOA Verification Queue" icon={Scale} />

                        <div className="mt-6">
                            {pendingNoa.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                                                <th className="px-4 py-4">Invoice ID</th>
                                                <th className="px-4 py-4">Seller</th>
                                                <th className="px-4 py-4 text-center">Amount</th>
                                                <th className="px-4 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {pendingNoa.map(noa => (
                                                <tr key={noa._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-6 text-xs font-mono font-bold text-slate-600">{noa.invoiceNumber}</td>
                                                    <td className="px-4 py-6">
                                                        <span className="text-xs font-black text-slate-800 uppercase">{noa.seller?.companyName}</span>
                                                    </td>
                                                    <td className="px-4 py-6 text-center text-sm font-bold text-slate-800">₹{noa.totalAmount?.toLocaleString()}</td>
                                                    <td className="px-4 py-6 text-right">
                                                        <button
                                                            onClick={() => handleApproveNOA(noa._id)}
                                                            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-amber-500/20"
                                                        >
                                                            Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-slate-50/50 rounded-2xl py-12 text-center border-2 border-dashed border-slate-100">
                                    <p className="text-slate-300 font-bold uppercase tracking-[0.2em] text-[11px]">No entries requiring attention</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* ESCROW SETTLEMENT ENGINE */}
                    <GlassCard className="p-8">
                        <SectionHeader title="Escrow Settlement Engine" subtitle="Programmatic Disbursal Queue" icon={Calculator} />

                        <div className="space-y-8">
                            {settlementBreakdown && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={80} /></div>
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                                        <div className="space-y-2">
                                            <p className="text-[#47C4B7] text-[10px] font-bold uppercase">Simulation Active: {settlementBreakdown.invoiceId}</p>
                                            <h3 className="text-2xl font-black">Mathematical Split</h3>
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="text-center">
                                                <p className="text-emerald-400 text-lg font-black">₹{settlementBreakdown.lenderPayout?.toLocaleString()}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">Lender Payout</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-blue-400 text-lg font-black">₹{settlementBreakdown.sellerSettlement?.toLocaleString()}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">Seller Credit</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-rose-400 text-lg font-black">₹{settlementBreakdown.platformFee?.toLocaleString()}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">Platform Fee</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => executeSettle(settlementBreakdown.id)}
                                            className="px-8 py-3 bg-[#47C4B7] text-white rounded-2xl text-xs font-black uppercase tracking-widest self-center"
                                        >
                                            Execute
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                                            <th className="px-4 py-4">Inovice ID</th>
                                            <th className="px-4 py-4">Seller</th>
                                            <th className="px-4 py-4">Lender</th>
                                            <th className="px-4 py-4 text-center">Amount</th>
                                            <th className="px-4 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {activeLoans.filter(l => !l.isSettled).slice(0, 3).map(loan => (
                                            <tr key={loan._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-6 text-xs font-bold text-slate-600">{loan.invoice?.invoiceNumber}</td>
                                                <td className="px-4 py-6 text-[10px] font-bold text-slate-500 uppercase">{loan.seller?.companyName}</td>
                                                <td className="px-4 py-6 text-[10px] font-bold text-slate-500 uppercase">{loan.lender?.companyName}</td>
                                                <td className="px-4 py-6 text-center text-sm font-bold text-slate-800 italic">₹{loan.loanAmount?.toLocaleString()}</td>
                                                <td className="px-4 py-6 text-right">
                                                    <button
                                                        onClick={() => runSettlementSimulation(loan)}
                                                        className="px-5 py-2.5 bg-slate-800 text-white text-[9px] font-black rounded-xl uppercase tracking-widest transition-all hover:bg-slate-700 active:scale-95"
                                                    >
                                                        Simulate Buyer Payment
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </GlassCard>

                    {/* ACTIVE LOANS SNAPSHOT */}
                    <GlassCard className="p-8">
                        <SectionHeader title="Active Loans Snapshot" subtitle="Capital Exposure Map" icon={Activity} />
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                                        <th className="px-4 py-4">Invoice</th>
                                        <th className="px-4 py-4">Seller</th>
                                        <th className="px-4 py-4">Amount</th>
                                        <th className="px-4 py-4">Due Date</th>
                                        <th className="px-4 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {activeLoans.slice(0, 5).map(loan => (
                                        <tr key={loan._id}>
                                            <td className="px-4 py-5 text-xs font-bold text-slate-600">{loan.invoice?.invoiceNumber}</td>
                                            <td className="px-4 py-5 text-[10px] font-medium text-slate-500 uppercase">{loan.seller?.companyName}</td>
                                            <td className="px-4 py-5 font-bold text-slate-800">₹{loan.loanAmount?.toLocaleString()}</td>
                                            <td className="px-4 py-5 text-[10px] text-slate-400 font-bold uppercase">
                                                {new Date(loan.invoice?.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-5 text-right">
                                                <StatusBadge status={loan.isSettled ? 'Repaid' : 'Verified'} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* --- SIDEBAR COLUMN (1/3) --- */}
                <div className="space-y-10">

                    {/* MASTER LEDGER PREVIEW (AUDIT STREAM) */}
                    <GlassCard className="p-8 bg-[#111827] text-white">
                        <div className="flex items-center gap-3 mb-8">
                            <History size={20} className="text-[#47C4B7]" />
                            <h2 className="text-lg font-black uppercase tracking-tight">Audit Stream</h2>
                        </div>
                        <div className="space-y-6">
                            {stats?.recentLedger?.map((tx, idx) => (
                                <div key={tx._id || idx} className="flex justify-between items-center group">
                                    <div className="flex gap-4">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[8px] font-black ${tx.type.includes('IN') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                            }`}>
                                            {tx.type.split('_')[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                                                {tx.type.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-[8px] text-slate-600 font-bold">ID: {tx.referenceId?.slice(-8)}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-black ${tx.type.includes('IN') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {tx.type.includes('IN') ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                            Full Chain View
                        </button>
                    </GlassCard>

                    {/* TRUST & SECURITY PANEL */}
                    <GlassCard className="p-8">
                        <SectionHeader title="Platform Integrity" subtitle="Real-time Network Security" icon={Shield} />
                        <div className="space-y-6 mt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">KYC Registry</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Clear</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Security Status</span>
                                <span className="text-[10px] font-black text-[#47C4B7] uppercase tracking-widest">99.9% Secure</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Fraud Detection</span>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active</span>
                            </div>

                            <div className="pt-4">
                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "99.9%" }}
                                        className="h-full bg-gradient-to-r from-[#47C4B7] to-emerald-400 shadow-[0_0_10px_rgba(71,196,183,0.3)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* WITHDRAWAL ALERT (Withdrawal Hub) */}
                    <GlassCard className="p-8 border-2 border-dashed border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-500"><Banknote size={20} /></div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Withdrawal Hub</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pending Disbursals</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-black text-slate-800 tracking-tighter">₹{stats?.actionRequired?.pendingWithdrawals?.reduce((acc, r) => acc + r.amount, 0)?.toLocaleString() || '0'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{stats?.actionRequired?.pendingWithdrawals?.length || 0} Request queued</p>
                            </div>
                            <button className="px-5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[9px] font-black rounded-xl uppercase tracking-widest transition-all">
                                Review Requests
                            </button>
                        </div>
                    </GlassCard>

                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
