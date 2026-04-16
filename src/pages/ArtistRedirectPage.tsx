import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canBrowseMarketplace } from '@/lib/marketplaceAccess';
import { findTalentByArtistParam } from '@/services/marketplaceService';

/** Resolves landing-page `/artists/:slug` links to marketplace talent profiles (Organizers/Vendors only). */
export function ArtistRedirectPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [to, setTo] = useState<string | null>(null);

  useEffect(() => {
    if (!canBrowseMarketplace(user)) {
      setTo('/events');
      return;
    }
    if (!slug) {
      setTo('/marketplace');
      return;
    }
    findTalentByArtistParam(slug).then((t) => {
      setTo(t ? `/marketplace/talent/${t.id}` : '/marketplace');
    });
  }, [slug, user]);

  if (!to) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }

  return <Navigate to={to} replace />;
}
