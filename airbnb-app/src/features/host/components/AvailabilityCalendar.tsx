import { useState, useMemo } from 'react';
import { useBlockedDates, useSetBlockedDates } from '../hooks/useBlockedDates';

interface Props {
  listingId: string;
}

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function AvailabilityCalendar({ listingId }: Props) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Local selection state — dates the host is toggling
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  const { data, isLoading, isError } = useBlockedDates(listingId);
  const setBlockedMutation = useSetBlockedDates(listingId);

  // Merge server manual blocked dates into local selection on first load
  const serverManual = useMemo(
    () => new Set((data?.manual ?? []).map((d) => d.date)),
    [data],
  );
  const bookingBlocked = useMemo(
    () => new Set(data?.bookings ?? []),
    [data],
  );

  // Use server state as base, overlay local toggles
  const effectiveBlocked = useMemo(() => {
    if (saved) return selected;
    // Before saving, show server state
    return serverManual;
  }, [saved, selected, serverManual]);

  // Initialise local selection from server when data arrives (only once)
  const [initialised, setInitialised] = useState(false);
  if (!initialised && data) {
    setSelected(new Set(serverManual));
    setInitialised(true);
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const toggleDate = (ymd: string) => {
    // Cannot toggle past dates or booking-blocked dates
    if (ymd < toYMD(today)) return;
    if (bookingBlocked.has(ymd)) return;
    setSaved(false);
    setSelected(prev => {
      const next = new Set(prev);
      next.has(ymd) ? next.delete(ymd) : next.add(ymd);
      return next;
    });
  };

  const handleSave = async () => {
    await setBlockedMutation.mutateAsync([...selected]);
    setSaved(true);
  };

  const handleReset = () => {
    setSelected(new Set(serverManual));
    setSaved(false);
  };

  const totalDays  = daysInMonth(viewYear, viewMonth);
  const firstDay   = firstDayOfMonth(viewYear, viewMonth);
  const todayYMD   = toYMD(today);

  // Build calendar grid cells
  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(viewYear, viewMonth, i + 1);
      return toYMD(d);
    }),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const hasChanges = !setsEqual(selected, serverManual);

  return (
    <div>
      {isLoading && <p style={{ color: '#888', fontSize: 13 }}>Loading calendar…</p>}
      {isError   && <p style={{ color: '#dc2626', fontSize: 13 }}>Failed to load availability.</p>}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap', fontSize: 12 }}>
        <LegendItem color="#f0fdf4" border="#86efac" label="Available" />
        <LegendItem color="#fee2e2" border="#fca5a5" label="Manually blocked" />
        <LegendItem color="#fef9c3" border="#fde047" label="Booked by guest" />
        <LegendItem color="#f3f4f6" border="#d1d5db" label="Past date" />
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button type="button" onClick={prevMonth} style={navBtn}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} style={navBtn}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 3 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((ymd, i) => {
          if (!ymd) return <div key={`empty-${i}`} />;

          const isPast      = ymd < todayYMD;
          const isToday     = ymd === todayYMD;
          const isBooking   = bookingBlocked.has(ymd);
          const isBlocked   = selected.has(ymd);

          let bg     = '#f0fdf4';
          let border = '#86efac';
          let color  = '#166534';

          if (isPast)    { bg = '#f9fafb'; border = '#e5e7eb'; color = '#d1d5db'; }
          if (isBlocked && !isPast) { bg = '#fee2e2'; border = '#fca5a5'; color = '#991b1b'; }
          if (isBooking) { bg = '#fef9c3'; border = '#fde047'; color = '#854d0e'; }
          if (isToday)   { border = '#ff5722'; }

          return (
            <button
              key={ymd}
              type="button"
              disabled={isPast || isBooking}
              onClick={() => toggleDate(ymd)}
              title={
                isBooking ? 'Booked by guest'
                : isBlocked ? 'Click to unblock'
                : isPast ? 'Past date'
                : 'Click to block'
              }
              style={{
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: 6,
                padding: '6px 2px',
                textAlign: 'center',
                fontSize: 12,
                fontWeight: isToday ? 800 : 500,
                color,
                cursor: isPast || isBooking ? 'default' : 'pointer',
                opacity: isPast ? 0.5 : 1,
              }}
            >
              {new Date(ymd + 'T00:00:00').getDate()}
            </button>
          );
        })}
      </div>

      {/* Save / Reset */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={!hasChanges || setBlockedMutation.isPending}
          onClick={handleSave}
          style={{
            ...saveBtn,
            opacity: !hasChanges || setBlockedMutation.isPending ? 0.5 : 1,
            cursor: !hasChanges || setBlockedMutation.isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {setBlockedMutation.isPending ? 'Saving…' : 'Save Availability'}
        </button>

        {hasChanges && (
          <button type="button" onClick={handleReset} style={resetBtn}>
            Reset
          </button>
        )}

        {setBlockedMutation.isSuccess && !hasChanges && (
          <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>✓ Saved</span>
        )}

        {setBlockedMutation.isError && (
          <span style={{ color: '#dc2626', fontSize: 13 }}>
            {(setBlockedMutation.error as Error).message}
          </span>
        )}

        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
          {selected.size} date{selected.size !== 1 ? 's' : ''} blocked
        </span>
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */
function setsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function LegendItem({ color, border, label }: { color: string; border: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 14, height: 14, borderRadius: 3, background: color, border: `1.5px solid ${border}` }} />
      <span style={{ color: '#555' }}>{label}</span>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const navBtn: React.CSSProperties = {
  background: 'white', border: '1px solid #e5e7eb', borderRadius: 6,
  width: 32, height: 32, cursor: 'pointer', fontSize: 18, fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const saveBtn: React.CSSProperties = {
  background: '#ff5722', color: 'white', border: 'none',
  borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 13,
};
const resetBtn: React.CSSProperties = {
  background: 'white', color: '#374151', border: '1px solid #d1d5db',
  borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
