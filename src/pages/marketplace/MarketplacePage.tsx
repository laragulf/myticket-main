import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { listTalents, listVendors } from '@/services/marketplaceService';
import type { MarketplaceTalent, MarketplaceVendor } from '@/types/domain';
import { cn } from '@/lib/utils';

export function MarketplacePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [tab, setTab] = useState<'talent' | 'vendor'>(typeParam === 'vendor' ? 'vendor' : 'talent');
  const [talents, setTalents] = useState<MarketplaceTalent[]>([]);
  const [vendors, setVendors] = useState<MarketplaceVendor[]>([]);

  useEffect(() => {
    if (typeParam === 'vendor') setTab('vendor');
    if (typeParam === 'talent') setTab('talent');
  }, [typeParam]);

  useEffect(() => {
    listTalents().then(setTalents);
    listVendors().then(setVendors);
  }, []);

  const list = useMemo(() => (tab === 'talent' ? talents : vendors), [tab, talents, vendors]);

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-40">Marketplace</span>
        <h1 className="mt-2 text-[36px] font-extrabold leading-tight tracking-[-0.02em] text-ink md:text-[44px]">
          Talents &amp; vendors
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-60">
          Discover verified performers and service providers. Financial arrangements happen outside the platform.
        </p>
        {user?.role === 'vendor' && (
          <p className="mt-4">
            <Link to="/engagements" className="text-[13px] font-bold text-coral underline-offset-2 hover:underline">
              Engagement inbox
            </Link>{' '}
            — chat with organizers about offers and bookings.
          </p>
        )}
        {user &&
          (user.vendorOnboarding?.status === 'draft' ||
            user.vendorOnboarding?.status === 'submitted' ||
            user.organizerOnboarding?.status === 'draft' ||
            user.organizerOnboarding?.status === 'submitted') && (
            <div className="mt-4 rounded-xl border border-ink-10 bg-ink-5/70 p-4 text-[13px] text-ink-60">
              <p className="font-semibold text-ink">Role onboarding in progress.</p>
              <p className="mt-1">
                You have pending Vendor/Organizer onboarding details. Continue from{' '}
                <Link to="/profile" className="font-semibold text-coral hover:underline">
                  Account
                </Link>{' '}
                to complete or monitor review status.
              </p>
            </div>
          )}

        <div className="mt-8 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('talent')}
            className={cn(
              'rounded-full px-5 py-2.5 text-[13px] font-bold transition-colors',
              tab === 'talent' ? 'bg-ink text-white' : 'bg-ink-5 text-ink-60 hover:bg-ink-10'
            )}
          >
            Talents
          </button>
          <button
            type="button"
            onClick={() => setTab('vendor')}
            className={cn(
              'rounded-full px-5 py-2.5 text-[13px] font-bold transition-colors',
              tab === 'vendor' ? 'bg-ink text-white' : 'bg-ink-5 text-ink-60 hover:bg-ink-10'
            )}
          >
            Vendors
          </button>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tab === 'talent'
            ? talents.map((t) => (
                <Link
                  key={t.id}
                  to={`/marketplace/talent/${t.id}`}
                  className="group overflow-hidden rounded-2xl border border-ink-10 bg-white shadow-sm transition-shadow hover:shadow-card-md"
                >
                  <div className="aspect-square overflow-hidden bg-ink-10">
                    <img
                      src={t.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-coral">
                      {t.categories.slice(0, 2).join(' · ')}
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold text-ink">{t.name}</h2>
                    <p className="mt-2 line-clamp-2 text-[13px] text-ink-60">{t.bio}</p>
                    <p className="mt-3 text-[12px] font-medium text-ink-40">
                      {t.city} · ★ {t.rating.toFixed(1)} · {t.availability}
                    </p>
                  </div>
                </Link>
              ))
            : vendors.map((v) => (
                <Link
                  key={v.id}
                  to={`/marketplace/vendor/${v.id}`}
                  className="group overflow-hidden rounded-2xl border border-ink-10 bg-white shadow-sm transition-shadow hover:shadow-card-md"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-ink-10">
                    <img
                      src={v.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-coral">
                      {v.serviceCategories.join(' · ')}
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold text-ink">{v.name}</h2>
                    <p className="mt-2 line-clamp-2 text-[13px] text-ink-60">{v.bio}</p>
                    <p className="mt-3 text-[12px] font-medium text-ink-40">
                      {v.city} · ★ {v.rating.toFixed(1)}
                    </p>
                  </div>
                </Link>
              ))}
        </div>

        {list.length === 0 && <p className="py-12 text-center text-ink-40">Nothing to show yet.</p>}
      </div>
    </div>
  );
}
