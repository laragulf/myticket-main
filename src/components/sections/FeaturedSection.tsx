import { EventCard } from '@/components/cards/EventCard';
import { Carousel } from '@/components/ui/Carousel';
import { FEATURED_EVENTS } from '@/lib/images';

export function FeaturedSection() {
  return (
    <section className="bg-white px-6 lg:px-8 py-16 lg:py-24 border-t border-ink-10">
      <div className="max-w-[1280px] mx-auto">
        <Carousel
          overline="Don't miss out"
          title="Featured Events"
          viewAllHref="/events?featured=true"
        >
          {FEATURED_EVENTS.map((event) => (
            <div key={event.eventId} className="flex-shrink-0">
              <EventCard {...event} className="w-[280px]" />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
