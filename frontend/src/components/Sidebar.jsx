import { NavLink } from 'react-router-dom';
import { Clock, Calendar, BookOpen, LayoutDashboard, Users, AppWindow, GitBranch, Workflow, BarChart2, ChevronDown } from 'lucide-react';

const mainNav = [
  { to: '/admin/event-types', icon: Clock, label: 'Event Types' },
  { to: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
  { to: '/admin/availability', icon: Calendar, label: 'Availability' },
];

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none
        ${isActive
          ? 'bg-[#252525] text-white'
          : 'text-[#737373] hover:bg-[#1e1e1e] hover:text-[#d4d4d4]'
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onClose }) {
  return (
    <div className="w-[260px] lg:w-[220px] h-full flex flex-col flex-shrink-0 relative z-50 animate-in-slide-left"
      style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>

      {/* User Header */}
      <div className="px-3 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <button className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-[#1e1e1e] transition-colors group">
          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">U</div>
          <span className="text-sm font-semibold text-[#d4d4d4] flex-1 text-left truncate">Udit Bhardwaj</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#555] group-hover:text-[#737373] transition-colors" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {mainNav.map((item) => (
            <div key={item.to} onClick={onClose}>
              <NavItem {...item} />
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 space-y-0.5" style={{ borderTop: '1px solid var(--border)' }}>
        <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#555] hover:bg-[#1e1e1e] hover:text-[#d4d4d4] transition-colors no-underline">
          View public page
        </a>
        <p className="px-3 text-[10px] text-[#333] pt-1">© 2024 CloneCal, Inc.</p>
      </div>
    </div>
  );
}
