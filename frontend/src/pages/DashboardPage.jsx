import { Clock, Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Event Types',
    description: 'Manage your event types and durations.',
    icon: Clock,
    to: '/admin/event-types',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Availability',
    description: 'Set your weekly available hours.',
    icon: Calendar,
    to: '/admin/availability',
    color: 'text-green-600 bg-green-50',
  },
  {
    title: 'Bookings',
    description: 'View and manage your bookings.',
    icon: BookOpen,
    to: '/admin/bookings',
    color: 'text-purple-600 bg-purple-50',
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
        <p className="text-gray-500 mt-1">Manage your scheduling from here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ title, description, icon: Icon, to, color }) => (
          <Link
            key={to}
            to={to}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
