import { Outlet } from 'react-router-dom';
import { Navbar, Sidebar } from './../components/admin/exports';

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-gray-100">

      {/* 1. Sidebar Container: Ensure it matches the Sidebar's width */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* 2. Main Content: flex-1 takes up the remaining 100% - 64rem */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* If you have a Header, it goes here */}

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;