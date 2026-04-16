import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Star } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { createOrganizerEngagementMock } from '@/services/engagementsService';
import { getVendorById } from '@/services/marketplaceService';
import type { MarketplaceVendor } from '@/types/domain';

export function VendorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<MarketplaceVendor | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setVendor(null);
      return;
    }
    getVendorById(id).then(setVendor);
  }, [id]);

  if (vendor === undefined) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }
  if (!vendor) {
    return <Navigate to="/marketplace" replace />;
  }

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[960px] px-6 lg:px-8">
        <Link to="/marketplace" className="text-[13px] font-semibold text-coral hover:underline">
          ← Marketplace
        </Link>

        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
          <img
            src={vendor.image}
            alt=""
            className="h-48 w-48 shrink-0 rounded-2xl object-cover md:h-56 md:w-56"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-coral">
              {vendor.serviceCategories.join(' · ')}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">{vendor.name}</h1>
            <p className="mt-2 text-[14px] text-ink-60">
              {vendor.city} · ★ {vendor.rating.toFixed(1)}
            </p>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-60">{vendor.bio}</p>
            {user?.role === 'organizer' && (
              <button
                type="button"
                className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-ink-80"
                onClick={() => {
                  const engagement = createOrganizerEngagementMock({
                    targetKind: 'vendor',
                    targetName: vendor.name,
                    organizerName: user.name,
                    organizerCity: user.city,
                  });
                  navigate(`/engagements${engagement ? `?focus=${encodeURIComponent(engagement.id)}` : ''}`);
                }}
              >
                Contact vendor
              </button>
            )}
          </div>
        </div>

        <section className="mt-12 rounded-2xl border border-ink-10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-ink">Verification &amp; coverage</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[14px] text-ink-60">
            <li>Commercial registration verified (mock)</li>
            <li>Service area: {vendor.city} and surrounding regions (demo)</li>
            <li>Insurance certificate on file for large events (simulated)</li>
          </ul>
        </section>

        {vendor.gallery.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-extrabold text-ink">Gallery</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {vendor.gallery.map((src) => (
                <img key={src} src={src} alt="" className="aspect-video rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        <section className="mt-12 rounded-2xl border border-ink-10 bg-ink-5/40 p-6">
          <h2 className="text-lg font-extrabold text-ink">Ratings</h2>
          <p className="mt-2 flex items-center gap-2 text-[15px] text-ink">
            <Star size={22} className="text-amber" weight="fill" />
            <span className="font-bold">{vendor.rating.toFixed(1)}</span>
            <span className="text-[13px] font-medium text-ink-60">from mock jobs</span>
          </p>
          <p className="mt-4 text-[13px] text-ink-60">
            Mutual ratings with organizers appear after a completed booking (full product).
          </p>
          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-full border border-dashed border-ink-20 bg-white px-5 py-3 text-[13px] font-semibold text-ink-40 sm:w-auto"
          >
            Mutual ratings after completed work
          </button>
        </section>
      </div>
    </div>
  );
}
