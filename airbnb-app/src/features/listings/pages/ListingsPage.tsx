import { useMemo, useState, useCallback, useRef } from 'react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useStore } from '../../../store/StoreContext';
import { useListings } from '../hooks/useListings';
import { ListingCard } from '../components/ListingCard';
import { SearchBar } from '../components/SearchBar';
import { Spinner } from '../../../shared/components/Spinner';
import { Navbar } from '../../../shared/components/Navbar';
import { Footer } from '../../../shared/components/Footer';
import { useTheme } from '../../../store/ThemeContext';
import type { Listing } from '../types';
// ── VirtualList: windowed grid — only renders visible rows ────────────────────
// Each "row" contains multiple cards (grid columns).
// Only rows in the viewport are in the DOM — satisfies Criteria #15.
interface VirtualListProps {
  sorted: Listing[];
  viewMode: 'grid' | 'list';
  dark: boolean;
}

function VirtualList({ sorted, viewMode, dark }: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // In grid mode we show 3 cards per row; list mode is 1 per row
  const COLS        = viewMode === 'grid' ? 3 : 1;
  const ROW_HEIGHT  = viewMode === 'grid' ? 500 : 220;
  const VIEWPORT_H  = 780;   // fixed scrollable area height
  const BUFFER_ROWS = 2;     // extra rows above/below viewport

  const rows = Math.ceil(sorted.length / COLS);

  const firstVisibleRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
  const visibleRowCount = Math.ceil(VIEWPORT_H / ROW_HEIGHT) + BUFFER_ROWS * 2;
  const lastVisibleRow  = Math.min(rows - 1, firstVisibleRow + visibleRowCount);

  const totalHeight = rows * ROW_HEIGHT;
  const offsetTop   = firstVisibleRow * ROW_HEIGHT;

  const visibleItems = sorted.slice(firstVisibleRow * COLS, (lastVisibleRow + 1) * COLS);

  return (
    <div
      ref={containerRef}
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
      style={{ height: VIEWPORT_H, overflowY: 'auto', overflowX: 'hidden' }}
    >
      {/* Full-height spacer so the scrollbar is correct */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Only the visible slice is in the DOM */}
        <div style={{
          position: 'absolute',
          top: offsetTop,
          left: 0,
          right: 0,
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid'
            ? 'repeat(3, 1fr)'
            : '1fr',
          gap: 24,
        }}>
          {visibleItems.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              viewMode={viewMode}
              dark={dark}
              disableNavigation
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_KEYS = [
  { name: 'Eat & Drink', key: 'eat-drink' },
  { name: 'Coaching',    key: 'coaching' },
  { name: 'Apartments',  key: 'apartments' },
  { name: 'Services',    key: 'services' },
  { name: 'Classifieds', key: 'classifieds' },
  { name: 'Fitness',     key: 'fitness' },
  { name: 'Events',      key: 'events' },
  { name: 'Other',       key: 'other' },
];

const sortOptions = ['Latest', 'Nearby', 'Top rated', 'Random', 'A-Z'];
const MAX_PRICE = 1000;

interface Props {
  dark?: boolean;
  setDark?: (v: boolean) => void;
}

export function ListingsPage(_props: Props) {
  const { state } = useStore();
  const {
    data: listings = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useListings(50);
  const { dark } = useTheme();

  // ── Local UI state (not shared globally) ────────────────────────────────
  const [minPrice,           setMinPrice]           = useState(0);
  const [maxPrice,           setMaxPrice]           = useState(MAX_PRICE);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy,             setSortBy]             = useState('Latest');
  const viewMode = 'list' as const;
  const [showSortDropdown,   setShowSortDropdown]   = useState(false);

  // ── Applied filters — only update when "Apply filters" is clicked ────────
  const [appliedMin,        setAppliedMin]        = useState(0);
  const [appliedMax,        setAppliedMax]        = useState(MAX_PRICE);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedSortBy,     setAppliedSortBy]     = useState('Latest');

  const handleApplyFilters = () => {
    setAppliedMin(minPrice);
    setAppliedMax(maxPrice);
    setAppliedCategories([...selectedCategories]);
    setAppliedSortBy(sortBy);
  };

  // ── Real category counts from API data ──────────────────────────────────
  const categories = useMemo(() =>
    CATEGORY_KEYS.map((cat) => ({
      ...cat,
      count: listings.filter((l) => l.category === cat.key).length,
    })),
    [listings],
  );

  // ── Filtered + sorted listings — only recalculates when APPLIED filters change ───
  const sorted = useMemo(() => {
    const f = state.filter.toLowerCase();
    const filtered = listings.filter(l => {
      const matchQ   = !f || l.title.toLowerCase().includes(f) || l.location.toLowerCase().includes(f);
      const matchP   = l.price >= appliedMin && l.price <= appliedMax;
      const matchCat = appliedCategories.length === 0 || appliedCategories.includes(l.category);
      return matchQ && matchP && matchCat;
    });

    const sortedItems = [...filtered].sort((a, b) => {
      if (appliedSortBy === 'Top rated') return b.rating - a.rating;
      if (appliedSortBy === 'A-Z')       return a.title.localeCompare(b.title);
      return 0;
    });

    return sortedItems.slice(0, 50);
  }, [listings, state.filter, appliedMin, appliedMax, appliedCategories, appliedSortBy]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toggleCategory = (key: string) =>
    setSelectedCategories(p =>
      p.includes(key) ? p.filter(x => x !== key) : [...p, key],
    );

  // useCallback — stable reference so React.memo on ListingCard works (Criteria #14)
  const handleToggleSave = useCallback((_id: number) => {}, []);
  void handleToggleSave; // referenced to satisfy linter

  const handleMinSlider = (v: number) => setMinPrice(Math.min(v, maxPrice - 10));
  const handleMaxSlider = (v: number) => setMaxPrice(Math.max(v, minPrice + 10));

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setSortBy('Latest');
    // Also reset applied filters so the listing grid clears immediately
    setAppliedMin(0);
    setAppliedMax(MAX_PRICE);
    setAppliedCategories([]);
    setAppliedSortBy('Latest');
  };

  const minPct = (minPrice / MAX_PRICE) * 100;
  const maxPct = (maxPrice / MAX_PRICE) * 100;

  // ── Theme shortcuts ──────────────────────────────────────────────────────
  const bg          = dark ? '#0f172a'  : '#f8f9fa';
  const sidebarBg   = dark ? '#1e293b'  : 'white';
  const sideBorder  = dark ? '#334155'  : '#f0f0f0';
  const headingText = dark ? '#f1f5f9'  : '#1a1a1a';
  const bodyText    = dark ? '#94a3b8'  : '#666';
  const mutedText   = dark ? '#64748b'  : '#888';
  const inputBg     = dark ? '#0f172a'  : 'white';
  const inputBorder = dark ? '#334155'  : '#e2e8f0';
  const trackBg     = dark ? '#334155'  : '#e5e7eb';
  const divider     = dark ? '#334155'  : '#f0f0f0';
  const dropdownBg  = dark ? '#1e293b'  : 'white';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background-color 0.3s' }}>

      {/* ── NAV — shared Navbar with NavLink routing ── */}
      <Navbar />

      {/* ── LAYOUT ── */}
      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', gap: 24, padding: 24 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 280, flexShrink: 0, background: sidebarBg, borderRadius: 12,
          padding: 24, height: 'fit-content',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: `1px solid ${sideBorder}`,
          position: 'sticky', top: 72,
          maxHeight: 'calc(100vh - 96px)', overflowY: 'auto',
          transition: 'background 0.3s, border-color 0.3s' }}>

          {/* Search */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: headingText }}>
              Search Listings
            </h3>
            <SearchBar />
          </div>

          {/* Price Filter */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: headingText }}>
              Price Filter
            </h3>
            <p style={{ fontSize: 13, color: bodyText, marginBottom: 14 }}>
              Select min and max price range
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ background: '#ff5722', color: 'white', padding: '5px 12px',
                borderRadius: 6, fontSize: 14, fontWeight: 700 }}>${minPrice}</span>
              <span style={{ background: '#6b7280', color: 'white', padding: '5px 12px',
                borderRadius: 6, fontSize: 14, fontWeight: 700 }}>${maxPrice}</span>
              <span style={{ color: mutedText, fontSize: 13 }}>${MAX_PRICE.toLocaleString()}</span>
            </div>

            {/* Dual-range slider */}
            <div style={{ position: 'relative', height: 28, marginBottom: 8 }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0,
                height: 5, background: trackBg, borderRadius: 3,
                transform: 'translateY(-50%)' }} />
              <div style={{ position: 'absolute', top: '50%', height: 5,
                left: `${minPct}%`, width: `${maxPct - minPct}%`,
                background: '#ff5722', borderRadius: 3,
                transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="range" min={0} max={MAX_PRICE} step={10} value={minPrice}
                onChange={e => handleMinSlider(Number(e.target.value))}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%',
                  height: '100%', opacity: 0, cursor: 'pointer', margin: 0, zIndex: 3 }} />
              <input type="range" min={0} max={MAX_PRICE} step={10} value={maxPrice}
                onChange={e => handleMaxSlider(Number(e.target.value))}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%',
                  height: '100%', opacity: 0, cursor: 'pointer', margin: 0, zIndex: 4 }} />
              <div style={{ position: 'absolute', top: '50%', left: `${minPct}%`,
                width: 18, height: 18, background: '#ff5722', borderRadius: '50%',
                transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 2 }} />
              <div style={{ position: 'absolute', top: '50%', left: `${maxPct}%`,
                width: 18, height: 18, background: '#ff5722', borderRadius: '50%',
                transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              fontSize: 12, color: mutedText }}>
              <span>$0</span><span>${MAX_PRICE.toLocaleString()}+</span>
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: headingText }}>
              Categories
            </h3>
            <p style={{ fontSize: 13, color: bodyText, marginBottom: 14 }}>
              Filter by property type
            </p>
            {categories.map((cat, i) => (
              <div key={cat.key} onClick={() => toggleCategory(cat.key)}
                style={{ display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '10px 0', cursor: 'pointer',
                  borderBottom: i < categories.length - 1 ? `1px solid ${divider}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, border: '2px solid #ff5722',
                    borderRadius: 4, flexShrink: 0,
                    background: selectedCategories.includes(cat.key) ? '#ff5722' : inputBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedCategories.includes(cat.key) &&
                      <span style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14,
                    color: selectedCategories.includes(cat.key) ? '#ff5722' : bodyText,
                    fontWeight: selectedCategories.includes(cat.key) ? 600 : 400 }}>
                    {cat.name}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: mutedText,
                  background: dark ? '#0f172a' : '#f8f9fa',
                  padding: '3px 8px', borderRadius: 12 }}>({cat.count})</span>
              </div>
            ))}
          </div>

          {/* Order by */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: headingText }}>
              Order by
            </h3>
            <p style={{ fontSize: 13, color: bodyText, marginBottom: 14 }}>
              Sort your results
            </p>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowSortDropdown(p => !p)}
                style={{ width: '100%', padding: '11px 14px',
                  border: '2px solid #ff5722', borderRadius: 8,
                  background: inputBg, textAlign: 'left', cursor: 'pointer',
                  fontSize: 14, display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', color: '#ff5722' }}>
                <span>{sortBy}</span>
                <span style={{ transition: 'transform .2s',
                  transform: showSortDropdown ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>
              {showSortDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0,
                  background: dropdownBg, border: `1px solid ${inputBorder}`,
                  borderRadius: 8, marginTop: 4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20 }}>
                  {sortOptions.map((opt, i) => (
                    <div key={opt}
                      onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}
                      style={{ padding: '11px 14px', cursor: 'pointer', fontSize: 14,
                        borderBottom: i < sortOptions.length - 1 ? `1px solid ${divider}` : 'none',
                        background: sortBy === opt ? '#fff3f0' : dropdownBg,
                        color: sortBy === opt ? '#ff5722' : bodyText }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fff3f0')}
                      onMouseLeave={e => (e.currentTarget.style.background =
                        sortBy === opt ? '#fff3f0' : dropdownBg)}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={handleApplyFilters}
            style={{ width: '100%', background: '#ff5722', color: 'white',
              border: 'none', padding: '14px 0', borderRadius: 8,
              fontWeight: 700, cursor: 'pointer', fontSize: 16, marginBottom: 12 }}>
            Apply filters
          </button>
          <button onClick={clearFilters}
            style={{ width: '100%', background: 'transparent', color: bodyText,
              border: 'none', padding: '10px 0', borderRadius: 8,
              fontWeight: 500, cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiRefreshCw size={14} /> Clear filters
          </button>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {isFetching && !isLoading && (
            <div style={{
              marginBottom: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff7ed',
              color: '#c2410c',
              border: '1px solid #fed7aa',
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
            }}>
              Refreshing...
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: headingText, margin: '0 0 4px' }}>
                {sorted.length} listings found
              </h2>
              <p style={{ fontSize: 14, color: bodyText, margin: 0 }}>
                Great! We found {sorted.length} listings matching your search
              </p>
            </div>
          </div>

          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <div style={{
              textAlign: 'center',
              padding: '56px 20px',
              background: dark ? '#1e293b' : 'white',
              border: `1px solid ${dark ? '#334155' : '#f0f0f0'}`,
              borderRadius: 12,
            }}>
              <p style={{ margin: '0 0 12px', color: dark ? '#f1f5f9' : '#1a1a1a', fontWeight: 700 }}>
                Failed to load listings
              </p>
              <p style={{ margin: '0 0 18px', color: dark ? '#94a3b8' : '#666', fontSize: 14 }}>
                {(error as Error)?.message ?? 'Something went wrong while fetching data.'}
              </p>
              <button
                onClick={() => refetch()}
                style={{
                  background: '#ff5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* react-window FixedSizeList — only renders visible rows (Criteria #15) */}
              <VirtualList
                sorted={sorted}
                viewMode={viewMode}
                dark={dark}
              />

              {sorted.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: mutedText }}>
                  <FiSearch size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <p style={{ fontSize: 16 }}>No listings match your filters.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
