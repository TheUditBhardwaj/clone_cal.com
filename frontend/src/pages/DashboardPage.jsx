import { Clock, Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Event Types',
    description: 'Manage your event types and durations.',
    icon: Clock,
    to: '/admin/event-types',
  },
  {
    title: 'Availability',
    description: 'Set your weekly available hours.',
    icon: Calendar,
    to: '/admin/availability',
  },
  {
    title: 'Bookings',
    description: 'View and manage your bookings.',
    icon: BookOpen,
    to: '/admin/bookings',
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back 👋</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your scheduling from here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ title, description, icon: Icon, to }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl p-5 transition-colors group"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 bg-violet-600/20">
              <Icon className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
