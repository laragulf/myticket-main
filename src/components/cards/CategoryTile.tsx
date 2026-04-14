import type { Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface CategoryTileProps {
  label: string;
  icon: Icon;
  color: string;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const sizeMap = {
  sm: { tile: 'w-[140px] h-[140px] p-4', icon: 48 },
  md: { tile: 'w-full aspect-square p-5', icon: 56 },
  lg: { tile: 'w-[220px] h-[220px] p-6', icon: 80 },
};

export function CategoryTile({ label, icon: Icon, color, count, size = 'md', onClick }: CategoryTileProps) {
  const s = sizeMap[size];
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-3xl flex flex-col justify-between text-left cursor-pointer',
        'transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink',
        color,
        s.tile
      )}
    >
      <div>
        <span className="font-bold text-[14px] leading-tight block">{label}</span>
        {count !== undefined && (
          <span className="text-[11px] opacity-60 mt-0.5 block">{count.toLocaleString()} events</span>
        )}
      </div>
      <Icon size={s.icon} weight="fill" className="opacity-90 self-end" />
    </button>
  );
}
