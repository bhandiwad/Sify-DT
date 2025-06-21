import { Outlet, Link } from 'react-router-dom';
import { Package, Home, BarChart2, MessageSquarePlus, Network } from 'lucide-react';

const PortalLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="w-64 flex-shrink-0 border-r bg-gray-100/40 p-4 dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link to="/portal" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span>Customer Portal</span>
            </Link>
          </div>
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <Link
              to="/portal"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <Home className="h-4 w-4" />
              Inventory Dashboard
            </Link>
            <Link
              to="/portal/topology"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <Network className="h-4 w-4" />
              Resource Topology
            </Link>
            <Link
              to="/portal/costs"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <BarChart2 className="h-4 w-4" />
              Cost Management
            </Link>
            <Link
              to="/portal/request-service"
              className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Request New Service
            </Link>
          </nav>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">ACME Corporation Inventory</h1>
          </div>
          {/* We can add global search and user profile here later */}
        </header>
        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout; 