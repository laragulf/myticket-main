import {
  MusicNote,
  Trophy,
  Palette,
  Smiley,
  Monitor,
  Users,
  ForkKnife,
  TShirt,
  Cpu,
  Microphone,
} from '@phosphor-icons/react';
import { CategoryTile } from '@/components/cards/CategoryTile';

const categories = [
  { label: 'Music',        icon: MusicNote,   color: 'bg-coral text-white',        count: 1240 },
  { label: 'Sports',       icon: Trophy,      color: 'bg-lime text-ink',           count: 890 },
  { label: 'Arts & Culture', icon: Palette,   color: 'bg-sky text-ink',            count: 456 },
  { label: 'Comedy',       icon: Smiley,      color: 'bg-lemon text-ink',          count: 328 },
  { label: 'Online',       icon: Monitor,     color: 'bg-mint text-ink',           count: 215 },
  { label: 'Family',       icon: Users,       color: 'bg-teal text-ink',           count: 540 },
  { label: 'Food & Drink', icon: ForkKnife,   color: 'bg-amber text-ink',          count: 378 },
  { label: 'Fashion',      icon: TShirt,      color: 'bg-blush text-ink',          count: 167 },
  { label: 'Tech',         icon: Cpu,         color: 'bg-indigo text-white',       count: 289 },
  { label: 'Theatre',      icon: Microphone,  color: 'bg-lavender text-ink',       count: 194 },
];

export function CategorySection() {
  return (
    <section className="bg-white px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-10">
          <span className="text-[11px] text-ink-40 uppercase tracking-[0.14em] block mb-1.5 font-medium">
            Explore by interest
          </span>
          <h2 className="font-extrabold text-[36px] md:text-[48px] leading-[1.1] tracking-[-0.02em] text-ink">
            What are you into?
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat) => (
            <CategoryTile key={cat.label} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
