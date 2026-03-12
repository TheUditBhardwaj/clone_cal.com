import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import EventTypesPage from './pages/EventTypesPage';
import AvailabilityPage from './pages/AvailabilityPage';
import AvailabilityEditPage from './pages/AvailabilityEditPage';
import BookingsPage from './pages/BookingsPage';
import BookingPage from './pages/BookingPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Booking Page */}
        <Route path="/book/:slug" element={<BookingPage />} />

        {/* Admin Layout */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="event-types" element={<EventTypesPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="availability/edit/:id" element={<AvailabilityEditPage />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
