import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiGlobe, FiHome, FiSearch, FiMapPin, FiStar, FiHeart,
  FiCheckCircle, FiXCircle, FiAward, FiMap,
} from 'react-icons/fi';
import { useListings } from '../hooks/useListings';
import { useFavorites } from '../hooks/useFavorites';
import { Navbar } from '../../../shared/components/Navbar';
import { Footer } from '../../../shared/components/Footer';
import { Spinner } from '../../../shared/components/Spinner';

const CATEGORIES = [
  { key: 'all',       label: 'All',        Icon: FiGlobe, color: '#ff5722' },
  { key: 'APARTMENT', label: 'Apartments', Icon: FiHome,  color: '#3b82f6' },
  { key: 'HOUSE',     label: 'Houses',     Icon: FiHome,  color: '#22c55e' },
  { key: 'VILLA',     label: 'Villas',     Icon: FiHome,  color: '#8b5cf6' },
  { key: 'CABIN',     label: 'Cabins',     Icon: FiHome,  color: '#f59e0b' },
  { key: 'CONDO',     label: 'Condos',     Icon: FiHome,  color: '#06b6d4' },
  { key: 'STUDIO',    label: 'Studios',    Icon: FiHome,  color: '#ec4899' },
];

const fmtCat = (cat: string) =>
  cat.replace('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export default function ExplorePage() {
  const navigate = useNavigate();
  const { toggle, isSaved } = useFavorites();
  const { data: allListings = [], isLoading } = useListings(50);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery,    setSearchQuery]     = useState('');
  const [sortBy,         setSortBy]          = useState('Top Rated');
  const [view,           setView]            = useState<'list' | 'map'>('list');
  const [activeId,       setActiveId]        = useState<string | null>(null);

  const filtered = allListings
    .filter((l) => {
      const matchCat = activeCategory === 'all' || l.category === activeCategory;
      const matchQ   = !searchQuery ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQ;
    })
    .sort((a, b) => {
      if (sortBy === 'Top Rated')       return b.rating - a.rating;
      if (sortBy === 'Price: Low→High') return a.price - b.price;
      if (sortBy === 'Price: High→Low') return b.price - a.price;
      if (sortBy === 'A-Z')             return a.title.localeCompare(b.title);
      return 0;
    });

  const totalAvailable = allListings.filter((l) => l.available).length;
  const topRated       = allListings.filter((l) => l.rating >= 4.8).length;
  const superhosts     = allListings.filter((l) => l.superhost).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '64px 24px 48px', textAlign: 'center', color: 'white' }}>
        <p style={{ margin: '0 0 8px', fontSize: 15, color: '#ff5722', fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: 600 }}>Discover</p>
        <h1 style={{ margin: '0 0 14px', fontSize: 44, fontWeight: 800, lineHeight: 1.2 }}>Explore Listings</h1>
        <p style={{ margin: '0 0 36px', fontSize: 16, color: '#94a3b8', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Browse through our curated collection of listings across all categories and locations.
        </p>
        {/* Search */}
        <div style={{ maxWidth: 680, margin: '0 auto', background: 'white', borderRadius: 50, display: 'flex', alignItems: 'center', padding: '6px 6px 6px 22px', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <FiSearch size={18} color="#999" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings, locations..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#333', background: 'transparent' }}
          />
          <button
            onClick={() => {}}
            style={{ background: '#ff5722', color: 'white', border: 'none', borderRadius: 40, padding: '12px 28px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '20px 48px', display: 'flex', justifyContent: 'center', gap: 64 }}>
        {[
          { label: 'Total Listings',   value: allListings.length, Icon: FiHome },
          { label: 'Available Now',    value: totalAvailable,     Icon: FiCheckCircle },
          { label: 'Top Rated (4.8+)', value: topRated,           Icon: FiStar },
          { label: 'Superhosts',       value: superhosts,         Icon: FiAward },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <s.Icon size={24} color="#ff5722" style={{ marginBottom: 4 }} />
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ff5722' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '10px 20px', borderRadius: 30, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                background: activeCategory === cat.key ? '#ff5722' : 'white',
                color: activeCategory === cat.key ? 'white' : '#444',
                boxShadow: activeCategory === cat.key ? '0 4px 14px rgba(255,87,34,0.35)' : '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
              }}
            >
              <cat.Icon size={15} /> {cat.label}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
              {filtered.length} listings found
            </h2>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
              {activeCategory === 'all' ? 'All categories' : fmtCat(activeCategory)}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'white', border: '1px solid #e8e8e8', borderRadius: 10, padding: 4 }}>
              {(['list', 'map'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ border: 'none', background: view === v ? '#ff5722' : 'transparent', color: view === v ? 'white' : '#444', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {v === 'list' ? <><FiHome size={14} /> List</> : <><FiMap size={14} /> Map</>}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white', cursor: 'pointer', color: '#333' }}>
              <option>Top Rated</option>
              <option>Price: Low→High</option>
              <option>Price: High→Low</option>
              <option>A-Z</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div style={{ display: 'grid', placeItems: 'center', padding: '60px 0' }}>
            <Spinner />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
            <FiSearch size={56} strokeWidth={1} color="#888" style={{ marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>No listings found</h3>
            <p style={{ margin: 0 }}>Try adjusting your search or category filter.</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: view === 'map' ? '1fr 480px' : '1fr', gap: 24, alignItems: 'start' }}>
            {/* Cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {filtered.map((listing) => {
                const saved = isSaved(listing.id);
                return (
                  <div
                    key={listing.id}
                    onClick={() => { setActiveId(listing.id); navigate(`/listings/${listing.id}`); }}
                    style={{
                      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      border: listing.superhost ? '2px solid #f59e0b' : '1px solid #f0f0f0',
                      background: 'white', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.13)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                      <img src={listing.img} alt={listing.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/400/210`; }} />
                      {listing.superhost && (
                        <div style={{ position: 'absolute', top: 12, left: 12, background: '#ff5722', color: 'white', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiAward size={11} /> SUPERHOST
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 12, left: 12, background: listing.available ? '#22c55e' : '#ef4444', color: 'white', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {listing.available ? <><FiCheckCircle size={11} /> Available</> : <><FiXCircle size={11} /> Booked</>}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggle(listing.id, listing.title, listing); }}
                        style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      >
                        <FiHeart size={16} fill={saved ? '#ff5722' : 'none'} color={saved ? '#ff5722' : '#666'} />
                      </button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FiStar size={14} fill="#f59e0b" color="#f59e0b" />
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{listing.rating}</span>
                        </div>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          {fmtCat(listing.category)}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px', lineHeight: 1.3 }}>
                        {listing.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#666', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiMapPin size={12} /> {listing.location}
                      </p>
                      {/* Host */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f8f9fa', borderRadius: 8, marginBottom: 14 }}>
                        <img src={listing.profileImg} alt={listing.hostName}
                          style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/30?u=${listing.id}`; }} />
                        <div>
                          <div style={{ fontSize: 10, color: '#888' }}>Hosted by</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{listing.hostName}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/listings/${listing.id}`); }}
                          style={{ background: 'none', border: '1.5px solid #ff5722', color: '#ff5722', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                        >
                          View Details
                        </button>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#ff5722' }}>${listing.price}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>per night</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map panel */}
            {view === 'map' && (
              <div style={{ position: 'sticky', top: 86 }}>
                <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 700, fontSize: 14 }}>
                    📍 {filtered.length} listings on map
                  </div>
                  {activeId && (
                    <div style={{ padding: '10px 16px', background: '#fff7f2', borderBottom: '1px solid #f0f0f0', fontSize: 13, color: '#ff5722', fontWeight: 600 }}>
                      Viewing: {filtered.find((l) => l.id === activeId)?.title ?? ''}
                    </div>
                  )}
                  <iframe
                    title="Explore map"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      activeId
                        ? (filtered.find((l) => l.id === activeId)?.location ?? 'World')
                        : (filtered[0]?.location ?? 'World')
                    )}&z=10&output=embed`}
                    style={{ border: 0, width: '100%', height: 600, display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
