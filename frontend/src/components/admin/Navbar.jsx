import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const Navbar = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search for invoices, lenders, or sellers..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">Sanket B.</p>
                        <p className="text-[10px] text-teal-600 font-bold uppercase">SuperAdmin</p>
                    </div>
                    <div className="w-9 h-9 border-2 border-teal-500 rounded-xl p-0.5 shadow-sm">
                        <img
                            src="https://ui-avatars.com/api/?name=Sanket+B&background=0d9488&color=fff"
                            className="rounded-lg w-full h-full object-cover"
                            alt="Admin"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
