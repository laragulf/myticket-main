import { Carousel } from '@/components/ui/Carousel';
import { HotArtistCard } from '@/components/cards/HotArtistCard';
import { HOT_ARTISTS } from '@/lib/images';

export function ArtistSection() {
  return (
    <section className="bg-[#0c0c0c] px-6 py-16 lg:px-8 lg:py-24">
      <div className="relative z-10 mx-auto max-w-[1280px]">
        <Carousel
          overline="Performing Soon"
          title="Hot Artists"
          viewAllHref="/marketplace?type=talent"
          variant="dark"
        >
          {HOT_ARTISTS.map((artist) => (
            <div key={artist.title} className="flex-shrink-0">
              <HotArtistCard {...artist} href={`/artists/${encodeURIComponent(artist.title)}`} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
