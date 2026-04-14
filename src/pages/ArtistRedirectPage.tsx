import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { findTalentByArtistParam } from '@/services/marketplaceService';

/** Resolves landing-page `/artists/:slug` links to marketplace talent profiles. */
export function ArtistRedirectPage() {
  const { slug } = useParams();
  const [to, setTo] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setTo('/marketplace');
      return;
    }
    findTalentByArtistParam(slug).then((t) => {
      setTo(t ? `/marketplace/talent/${t.id}` : '/marketplace');
    });
  }, [slug]);

  if (!to) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }

  return <Navigate to={to} replace />;
}
