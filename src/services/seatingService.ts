import type { MockEvent } from '@/types/domain';
import type { SeatInventory, SeatRecord } from '@/types/seating';
import { getSeatInventoryStats } from '@/lib/seating';

function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function makeShuffledIndices(size: number, seed: number) {
  const out = Array.from({ length: size }, (_, idx) => idx);
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function getSeatInventoryForEvent(event: MockEvent): Promise<SeatInventory> {
  if (event.layoutType !== 'seated') {
    return delay({ seats: [], total: 0, available: 0, held: 0, booked: 0 });
  }

  const seats: SeatRecord[] = [];

  event.ticketTypes.forEach((ticketType, typeIdx) => {
    const section = String.fromCharCode(65 + typeIdx);
    const rows = 6;
    const seatsPerRow = 8;
    const totalForType = rows * seatsPerRow;
    const available = Math.min(ticketType.remaining, totalForType);
    const held = Math.min(Math.max(2, Math.round(totalForType * 0.12)), totalForType - available);
    const shuffled = makeShuffledIndices(totalForType, hashSeed(`${event.id}-${ticketType.id}`));

    for (let idx = 0; idx < totalForType; idx++) {
      const row = Math.floor(idx / seatsPerRow) + 1;
      const number = (idx % seatsPerRow) + 1;
      const rank = shuffled[idx];
      const status =
        rank < available ? 'available' : rank < available + held ? 'held' : ('booked' as const);
      const x = (number - (seatsPerRow + 1) / 2) * 1.1 + typeIdx * 10;
      const z = row * -1.15;

      seats.push({
        id: `${event.id}-${ticketType.id}-${section}-${row}-${number}`,
        label: `${section}-${row}-${number}`,
        section,
        row,
        number,
        ticketTypeId: ticketType.id,
        status,
        position: { x, y: 0.3, z },
      });
    }
  });

  const stats = getSeatInventoryStats(seats);
  return delay({ seats, ...stats });
}
