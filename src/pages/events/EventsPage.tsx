import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CaretDown, MagnifyingGlass, SlidersHorizontal } from '@phosphor-icons/react';
import { EventCard } from '@/components/cards/EventCard';
import { listEvents } from '@/services/eventsService';
import { EVENT_CATEGORIES, EVENT_CITIES } from '@/services/eventsService';
import type { EventFilters, MockEvent } from '@/types/domain';
import { cn } from '@/lib/utils';

const ACCENT_BY_CATEGORY: Record<string, string> = {
  Music: 'bg-coral',
  Comedy: 'bg-lemon',
  Sports: 'bg-lime',
  'Arts & Culture': 'bg-lavender',
};

function accentForCategory(category: string) {
  return ACCENT_BY_CATEGORY[category] ?? 'bg-coral';
}

function formatCardDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export function EventsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const featured = searchParams.get('featured') === 'true';

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [city, setCity] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [layoutType, setLayoutType] = useState<'all' | 'seated' | 'free'>('all');
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const filters: EventFilters = useMemo(() => {
    const f: EventFilters = {
      keyword: keyword.trim() || undefined,
      category: category === 'all' ? undefined : category,
      city: city === 'all' ? undefined : city,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      layoutType: layoutType === 'all' ? 'all' : layoutType,
      availabilityOnly: availabilityOnly || undefined,
      featured: featured || undefined,
    };
    return f;
  }, [keyword, category, city, dateFrom, dateTo, priceMin, priceMax, layoutType, availabilityOnly, featured]);

  useEffect(() => {
    setLoading(true);
    listEvents(filters).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [filters]);

  return (
    <div className="bg-white">
      <div className="border-b border-ink-10 bg-ink-5/50">
        <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-8">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-40">Discover</span>
          <h1 className="mt-2 text-[32px] font-extrabold leading-tight tracking-[-0.02em] text-ink md:text-[40px]">
            Events
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-60">
            {advancedOpen
              ? 'Combine search with category, dates, location, price, and layout.'
              : 'Search by name, description, or artist — or open advanced filters to go deeper.'}{' '}
            {featured && <span className="font-semibold text-ink">Showing featured picks.</span>}
          </p>

          {/* Design system: white-dominant card, large radius (28px), ink borders — no shadows */}
          <div className="mt-8 rounded-[28px] border border-ink-10 bg-surface-card p-5 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
              <div className="relative min-h-[48px] flex-1">
                <MagnifyingGlass
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-40"
                  size={18}
                  weight="bold"
                />
                <input
                  type="search"
                  placeholder="Search title, description, artist…"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className={cn(
                    'h-12 w-full rounded-full border-2 border-ink-10 bg-ink-5/70 pl-11 pr-4',
                    'text-[13px] font-medium text-ink placeholder:text-ink-40',
                    'transition-[border-color] duration-150',
                    'outline-none focus:border-coral'
                  )}
                />
              </div>
              <button
                type="button"
                aria-expanded={advancedOpen}
                onClick={() => setAdvancedOpen((o) => !o)}
                className={cn(
                  'inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-full border-2 px-5',
                  'text-[12px] font-semibold transition-colors duration-150',
                  advancedOpen
                    ? 'border-ink bg-ink text-white'
                    : 'border-ink-10 bg-white text-ink hover:border-ink/25 hover:bg-ink-5'
                )}
              >
                <SlidersHorizontal size={16} weight="bold" className="shrink-0" />
                <span className="whitespace-nowrap">Advanced filters</span>
                <CaretDown
                  size={14}
                  weight="bold"
                  className={cn('shrink-0 transition-transform duration-200', advancedOpen && 'rotate-180')}
                />
              </button>
            </div>

            {advancedOpen && (
              <>
                <div
                  className="my-6 h-px w-full border-t border-dashed border-ink-10"
                  aria-hidden
                />
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">
                      Refine results
                    </span>
                    <span className="rounded-full bg-lemon/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
                      Optional
                    </span>
                  </div>
                  {featured && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev);
                          next.delete('featured');
                          return next;
                        });
                      }}
                      className="text-[11px] font-semibold text-coral underline underline-offset-2 transition-colors hover:text-coral-dark"
                    >
                      Clear featured filter
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">
                      Category
                    </span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={cn(
                        'h-10 rounded-xl border-2 border-ink-10 bg-white px-3 text-[12px] font-medium text-ink',
                        'outline-none transition-colors focus:border-coral'
                      )}
                    >
                      <option value="all">All categories</option>
                      {EVENT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">City</span>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-10 rounded-xl border-2 border-ink-10 bg-white px-3 text-[12px] font-medium text-ink outline-none transition-colors focus:border-coral"
                    >
                      <option value="all">All cities</option>
                      {EVENT_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">From</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-10 rounded-xl border-2 border-ink-10 bg-white px-3 text-[12px] text-ink outline-none focus:border-coral"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">To</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-10 rounded-xl border-2 border-ink-10 bg-white px-3 text-[12px] text-ink outline-none focus:border-coral"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">
                      Min price (SAR)
                    </span>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="font-mono h-10 rounded-xl border-2 border-ink-10 bg-white px-3 text-[12px] text-ink outline-none focus:border-coral"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">
                      Max price (SAR)
                    </span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Any"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="font-mono h-10 rounded-xl border-2 border-ink-10 bg-white px-3 text-[12px] text-ink outline-none focus:border-coral"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">Layout</span>
                    <select
                      value={layoutType}
                      onChange={(e) => setLayoutType(e.target.value as typeof layoutType)}
                      className="h-10 rounded-xl border-2 border-ink-10 bg-white px-3 text-[12px] font-medium text-ink outline-none focus:border-coral"
                    >
                      <option value="all">Any</option>
                      <option value="free">Free layout</option>
                      <option value="seated">Seated</option>
                    </select>
                  </label>
                  <label className="flex flex-col justify-end gap-1.5 sm:col-span-2 lg:col-span-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-40">
                      Availability
                    </span>
                    <div className="flex h-10 items-center gap-2.5 rounded-xl border-2 border-ink-10 bg-ink-5/50 px-3">
                      <input
                        type="checkbox"
                        id="avail-only"
                        checked={availabilityOnly}
                        onChange={(e) => setAvailabilityOnly(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-ink-20 text-coral"
                      />
                      <label htmlFor="avail-only" className="cursor-pointer text-[11px] font-medium text-ink">
                        Only events with tickets left
                      </label>
                    </div>
                  </label>
                </div>
              </>
            )}

            {!advancedOpen && featured && (
              <div className="mt-5 flex justify-end border-t border-ink-10 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete('featured');
                      return next;
                    });
                  }}
                  className="text-[11px] font-semibold text-coral underline underline-offset-2 transition-colors hover:text-coral-dark"
                >
                  Clear featured filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-8">
        {loading ? (
          <p className="text-center text-[12px] text-ink-40">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="text-center text-[13px] text-ink-60">No events match your filters.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => {
              const { date, time } = formatCardDateTime(e.dateStart);
              return (
                <EventCard
                  key={e.id}
                  eventId={e.id}
                  title={e.title}
                  category={e.category}
                  accentColor={accentForCategory(e.category)}
                  image={e.coverImage}
                  date={date}
                  time={time}
                  venue={e.venue}
                  city={e.city}
                  priceFrom={e.priceMin}
                  rating={e.rating}
                  attendingCount={e.attendingCount}
                  attendeeAvatars={e.attendeeAvatars}
                  isFeatured={e.featured}
                  isSoldOut={e.ticketsLeft === 0}
                  onClick={() => navigate(`/events/${e.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
