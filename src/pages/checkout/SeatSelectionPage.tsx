import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SeatGridRaw } from '@/components/seats/SeatGridRaw';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { SeatScene3D } from '@/components/seats/SeatScene3D';
import { getSeatInventoryStats, isSeatSelectable, toSelectedSeat } from '@/lib/seating';
import { getEventById } from '@/services/eventsService';
import { getSeatInventoryForEvent } from '@/services/seatingService';
import type { MockEvent } from '@/types/domain';
import type { SeatRecord, SeatViewMode } from '@/types/seating';

type CheckoutSeatNavigationState = {
  selectedSeats?: {
    seatId: string;
    label: string;
    section: string;
    ticketTypeId: string;
  }[];
  selectedTicketTypeId?: string;
};

export function SeatSelectionPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = (location.state as CheckoutSeatNavigationState | null) ?? {};
  const [event, setEvent] = useState<MockEvent | null | undefined>(undefined);
  const [inventory, setInventory] = useState<SeatRecord[]>([]);
  const [viewMode, setViewMode] = useState<SeatViewMode>('blueprint');
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState('');
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [holdInfoOpen, setHoldInfoOpen] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }
    getEventById(eventId).then(async (loaded) => {
      setEvent(loaded);
      if (!loaded) return;
      setSelectedTicketTypeId(incomingState.selectedTicketTypeId ?? loaded.ticketTypes[0]?.id ?? '');
      setSelectedSeatIds(incomingState.selectedSeats?.map((seat) => seat.seatId) ?? []);
      const seatInventory = await getSeatInventoryForEvent(loaded);
      setInventory(seatInventory.seats);
    });
  }, [eventId, incomingState.selectedSeats, incomingState.selectedTicketTypeId]);

  const currentTicketType = useMemo(
    () => event?.ticketTypes.find((tt) => tt.id === selectedTicketTypeId) ?? null,
    [event, selectedTicketTypeId]
  );

  const seatsForType = useMemo(
    () => inventory.filter((seat) => seat.ticketTypeId === selectedTicketTypeId),
    [inventory, selectedTicketTypeId]
  );

  const selectedSeats = useMemo(
    () => seatsForType.filter((seat) => selectedSeatIds.includes(seat.id)),
    [seatsForType, selectedSeatIds]
  );

  const seatStats = useMemo(() => getSeatInventoryStats(seatsForType), [seatsForType]);

  function toggleSeat(seat: SeatRecord) {
    if (!isSeatSelectable(seat)) return;
    setSelectedSeatIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  }

  function selectSectionSeats(seatIds: string[]) {
    if (seatIds.length < 1) return;
    setSelectedSeatIds((prev) => {
      const merged = new Set(prev);
      for (const seatId of seatIds) {
        merged.add(seatId);
      }
      return Array.from(merged);
    });
  }

  function continueToCheckout() {
    const state: CheckoutSeatNavigationState = {
      selectedTicketTypeId,
      selectedSeats: selectedSeats.map(toSelectedSeat),
    };
    navigate(`/checkout/${eventId}`, { state });
  }

  if (event === undefined) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }
  if (!event) {
    return <Navigate to="/events" replace />;
  }
  if (event.layoutType !== 'seated') {
    return <Navigate to={`/checkout/${event.id}`} replace />;
  }
  if (event.ticketsLeft <= 0) {
    return <Navigate to={`/events/${event.id}`} replace />;
  }

  return (
    <div className="bg-ink-5/40 pb-20 pt-10">
      <div className="mx-auto max-w-[1140px] px-6">
        <Link to={`/events/${event.id}`} className="text-[13px] font-semibold text-coral hover:underline">
          ← Back to event
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">Select your seats</h1>
        <p className="mt-1 text-[14px] text-ink-60">
          {event.title} · Choose one or more seats, then continue to checkout.
        </p>

        <div className="mt-4 rounded-xl border border-ink-10 bg-white/90 px-4 py-3 text-[13px] text-ink-60 shadow-sm">
          <button
            type="button"
            onClick={() => setHoldInfoOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 text-left font-semibold text-ink"
          >
            <span>Seat hold &amp; checkout (demo)</span>
            <span className="text-ink-40">{holdInfoOpen ? '−' : '+'}</span>
          </button>
          {holdInfoOpen && (
            <div className="mt-2 space-y-2 border-t border-ink-10 pt-2 text-[12px] leading-relaxed text-ink-60">
              <p>
                In this demo, seats you pick stay reserved while you complete payment. In production, holds can time
                out if someone else pays first — overlapping bookings are handled per our{' '}
                <Link to="/terms" className="font-semibold text-coral hover:underline">
                  Terms
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-ink-10 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="block min-w-[240px]">
                <span className="text-[12px] font-semibold text-ink-60">Ticket type / section</span>
                <select
                  value={selectedTicketTypeId}
                  onChange={(e) => {
                    setSelectedTicketTypeId(e.target.value);
                    setSelectedSeatIds([]);
                  }}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-2.5 text-[14px]"
                >
                  {event.ticketTypes.map((ticketType) => (
                    <option key={ticketType.id} value={ticketType.id}>
                      {ticketType.name} — {ticketType.price} SAR ({ticketType.remaining} left)
                    </option>
                  ))}
                </select>
              </label>
              <div className="inline-flex rounded-full border border-ink-10 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('blueprint')}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-semibold ${viewMode === 'blueprint' ? 'bg-ink text-white' : 'text-ink-60'}`}
                >
                  Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-semibold ${viewMode === 'raw' ? 'bg-ink text-white' : 'text-ink-60'}`}
                >
                  Raw
                </button>
              </div>
            </div>

            <SeatLegend className="mt-4" />

            <div className="mt-4">
              {viewMode === 'blueprint' ? (
                <SeatScene3D
                  seats={seatsForType}
                  selectedSeatIds={selectedSeatIds}
                  onToggleSeat={toggleSeat}
                  onSelectSectionSeats={selectSectionSeats}
                />
              ) : (
                <SeatGridRaw seats={seatsForType} selectedSeatIds={selectedSeatIds} onToggleSeat={toggleSeat} />
              )}
            </div>
          </section>

          <aside className="rounded-2xl border border-ink-10 bg-white p-5 shadow-sm">
            <h2 className="text-[15px] font-extrabold text-ink">Selection</h2>
            <p className="mt-1 text-[12px] text-ink-40">Section {currentTicketType?.name ?? '—'}</p>

            <div className="mt-4 space-y-2 rounded-xl bg-ink-5/70 p-3 text-[12px] text-ink-60">
              <div className="flex items-center justify-between">
                <span>Available</span>
                <span className="font-semibold text-ink">{seatStats.available}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Held</span>
                <span className="font-semibold text-ink">{seatStats.held}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Booked</span>
                <span className="font-semibold text-ink">{seatStats.booked}</span>
              </div>
            </div>

            <p className="mt-4 text-[12px] font-semibold text-ink">
              {selectedSeats.length} seat{selectedSeats.length === 1 ? '' : 's'} selected
            </p>
            {selectedSeats.length > 0 ? (
              <ul className="mt-2 max-h-[220px] space-y-1 overflow-auto text-[12px] text-ink-60">
                {selectedSeats.map((seat) => (
                  <li key={seat.id} className="rounded-lg border border-ink-10 px-2 py-1.5">
                    {seat.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12px] text-ink-40">Choose seats from the map to continue.</p>
            )}

            <button
              type="button"
              onClick={() => setSelectedSeatIds([])}
              className="mt-3 text-[12px] font-semibold text-coral hover:underline"
            >
              Clear selection
            </button>

            <Button
              variant="dark"
              size="md"
              className="mt-4 w-full"
              disabled={selectedSeats.length < 1}
              onClick={continueToCheckout}
            >
              Continue to checkout
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
