import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Calculator,
    History,
    BarChart3,
    LogOut,
    ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        toast.success("Logged out successfully");
        window.location.href = "/";
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Sellers', icon: Users, path: '/admin/sellers' },
        { name: 'Lenders', icon: Users, path: '/admin/lenders' },
        { name: 'NOA Review', icon: FileCheck, path: '/admin/noa-review' },
        { name: 'Settlements', icon: Calculator, path: '/admin/settlements' },
        { name: 'Master Ledger', icon: History, path: '/admin/ledger' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
                    <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">PayNidhi</h1>
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 mt-4 px-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-teal-50 text-teal-700 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                            AD
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Administrator</p>
                            <p className="text-xs text-gray-500">admin@paynidhi.com</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
