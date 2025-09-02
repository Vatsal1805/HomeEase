import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserBookings from './pages/UserBookings';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderBookings from './pages/ProviderBookings';
import ManageServices from './pages/ManageServices';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import AdminReviews from './pages/AdminReviews';
import PendingProviders from './pages/PendingProviders';
import ReviewsPage from './pages/ReviewsPage';
import NotFound from './pages/NotFound';
import AuthSuccess from './pages/AuthSuccess';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-bookings" element={<UserBookings />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/provider-bookings" element={<ProviderBookings />} />
          <Route path="/manage-services" element={<ManageServices />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/pending-providers" element={<PendingProviders />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
