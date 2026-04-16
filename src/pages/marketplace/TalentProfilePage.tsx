import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Star } from '@phosphor-icons/react';
import { getTalentById } from '@/services/marketplaceService';
import type { MarketplaceTalent } from '@/types/domain';

export function TalentProfilePage() {
  const { id } = useParams();
  const [talent, setTalent] = useState<MarketplaceTalent | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setTalent(null);
      return;
    }
    getTalentById(id).then(setTalent);
  }, [id]);

  if (talent === undefined) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }
  if (!talent) {
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
            src={talent.image}
            alt=""
            className="h-48 w-48 shrink-0 rounded-2xl object-cover md:h-56 md:w-56"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-coral">
              {talent.categories.join(' · ')}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">{talent.name}</h1>
            <p className="mt-2 text-[14px] text-ink-60">
              {talent.city} · ★ {talent.rating.toFixed(1)} · Availability: {talent.availability}
            </p>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-60">{talent.bio}</p>
          </div>
        </div>

        <section className="mt-12 rounded-2xl border border-ink-10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-ink">Verification &amp; credentials</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[14px] text-ink-60">
            <li>Identity verified (mock)</li>
            <li>Public liability coverage on file for festival-scale bookings (demo)</li>
            <li>Portfolio links reviewed by marketplace ops (simulated)</li>
          </ul>
        </section>

        {talent.gallery.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-extrabold text-ink">Gallery</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {talent.gallery.map((src) => (
                <img key={src} src={src} alt="" className="aspect-video rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        <section className="mt-12 rounded-2xl border border-ink-10 bg-ink-5/40 p-6">
          <h2 className="text-lg font-extrabold text-ink">Ratings</h2>
          <p className="mt-2 flex items-center gap-2 text-[15px] text-ink">
            <Star size={22} className="text-amber" weight="fill" />
            <span className="font-bold">{talent.rating.toFixed(1)}</span>
            <span className="text-[13px] font-medium text-ink-60">from mock engagements</span>
          </p>
          <p className="mt-4 text-[13px] text-ink-60">
            Mutual ratings between organizers and talent unlock after a completed engagement (full product).
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
