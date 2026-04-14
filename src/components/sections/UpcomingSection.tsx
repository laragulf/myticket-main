import { useState } from 'react';
import { EventCard } from '@/components/cards/EventCard';
import { cn } from '@/lib/utils';
import { UPCOMING_EVENTS } from '@/lib/images';

const dateFilters = ['All', 'Today', 'This Week', 'This Month', 'Weekend'];

export function UpcomingSection() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <section className="bg-surface-tint px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[11px] text-ink-40 uppercase tracking-[0.14em] block mb-1.5 font-medium">
              Coming up next
            </span>
            <h2 className="font-extrabold text-[36px] md:text-[48px] leading-[1.1] tracking-[-0.02em] text-ink">
              Upcoming Events
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {dateFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'px-4 py-2 rounded-full text-[13px] font-semibold transition-colors cursor-pointer',
                  activeFilter === filter
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink-60 hover:bg-ink-10 border border-ink-10'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {UPCOMING_EVENTS.map((event) => (
            <EventCard key={event.eventId} {...event} className="w-full" />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button className="px-8 py-3 rounded-full text-[14px] font-semibold bg-white text-ink border-2 border-ink hover:bg-ink hover:text-white transition-colors cursor-pointer">
            View All Events
          </button>
        </div>
      </div>
    </section>
  );
}
