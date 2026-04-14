import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ArtistRedirectPage } from '@/pages/ArtistRedirectPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { AuctionEventPage } from '@/pages/auction/AuctionEventPage';
import { AuctionPage } from '@/pages/auction/AuctionPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { EventDetailPage } from '@/pages/events/EventDetailPage';
import { EventsPage } from '@/pages/events/EventsPage';
import { CookiesPage } from '@/pages/legal/CookiesPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { EngagementsPage } from '@/pages/marketplace/EngagementsPage';
import { MarketplacePage } from '@/pages/marketplace/MarketplacePage';
import { TalentProfilePage } from '@/pages/marketplace/TalentProfilePage';
import { VendorProfilePage } from '@/pages/marketplace/VendorProfilePage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SupportPage } from '@/pages/support/SupportPage';
import { MyTicketsPage } from '@/pages/tickets/MyTicketsPage';
import { TicketDetailPage } from '@/pages/tickets/TicketDetailPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/talent/:id" element={<TalentProfilePage />} />
        <Route path="/marketplace/vendor/:id" element={<VendorProfilePage />} />
        <Route path="/artists/:slug" element={<ArtistRedirectPage />} />
        <Route path="/auction" element={<AuctionPage />} />
        <Route path="/auction/events/:eventId" element={<AuctionEventPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/checkout/:eventId" element={<CheckoutPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/my-tickets/:ticketId" element={<TicketDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/marketplace/engagements" element={<EngagementsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
