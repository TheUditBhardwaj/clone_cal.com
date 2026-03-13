import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 border-b border-[var(--border)] px-4 flex items-center justify-between z-30 bg-[var(--bg-sidebar)]">
        <span className="text-lg font-bold tracking-tight">Cal.com</span>
        <button 
          className="p-2 -mr-2 text-[var(--text-secondary)]" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - Desktop and Mobile Drawer */}
      <div className={`
        fixed inset-0 z-40 lg:relative lg:z-0 lg:block
        ${isSidebarOpen ? 'block' : 'hidden'}
      `}>
        {/* Backdrop for mobile */}
        <div 
          className="absolute inset-0 bg-black/60 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
        
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0">
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
