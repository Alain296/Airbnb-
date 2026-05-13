import React from 'react';
import { Transition } from '@headlessui/react';
import { FiHeart, FiMapPin, FiX, FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { readSavedListingSnapshots, useSaved } from '../hooks/useToggleSaved';
import { useListings } from '../hooks/useListings';

interface Props {
  open: boolean;
  onClose: () => void;
  dark?: boolean;
}

export function SavedListings({ open, onClose, dark = false }: Props) {
  const navigate = useNavigate();
  const { data: savedIds = [], refetch: refetchSaved } = useSaved();
  const { data: allListings = [], refetch: refetchListings } = useListings(50);

  // Refetch data when panel opens
  React.useEffect(() => {
    if (open) {
      refetchSaved();
      refetchListings();
    }
  }, [open, refetchSaved, refetchListings]);

  const savedListings = React.useMemo(() => {
    const apiMatches = allListings.filter((listing) => savedIds.includes(listing.id));
    const apiIds = new Set(apiMatches.map((listing) => listing.id));
    const snapshots = readSavedListingSnapshots().filter(
      (listing) => savedIds.includes(listing.id) && !apiIds.has(listing.id),
    );

    return [...apiMatches, ...snapshots].sort(
      (a, b) => savedIds.indexOf(a.id) - savedIds.indexOf(b.id),
    );
  }, [allListings, savedIds]);

  const bg     = dark ? '#1e293b' : 'white';
  const border = dark ? '#334155' : '#f0f0f0';
  const text   = dark ? '#f1f5f9' : '#1a1a1a';
  const sub    = dark ? '#94a3b8' : '#666';

  return (
    <>
      <Transition show={open}
        enter="transition-opacity duration-200" enterFrom="opacity-0" enterTo="opacity-100"
        leave="transition-opacity duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
        <div onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
      </Transition>

      <Transition show={open}
        enter="transition-transform duration-300 ease-out"
        enterFrom="translate-x-full" enterTo="translate-x-0"
        leave="transition-transform duration-200 ease-in"
        leaveFrom="translate-x-0" leaveTo="translate-x-full">
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
          background: bg, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 201, display: 'flex', flexDirection: 'column',
          borderLeft: `1px solid ${border}`,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: `1px solid ${border}` }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: text,
              display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiHeart size={18} fill="#ff5722" color="#ff5722" />
              Saved Listings ({savedListings.length})
            </h2>
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: sub, display: 'flex', alignItems: 'center' }}
              aria-label="Close">
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            {savedListings.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 60, color: sub }}>
                <FiHeart size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: text }}>No saved listings yet</p>
                <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                  Click the heart icon on any listing to save it here.
                </p>
              </div>
            ) : (
              savedListings.map((listing) => (
                <div key={listing.id}
                  style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: `1px solid ${border}`, cursor: 'pointer' }}
                  onClick={() => { onClose(); navigate(`/listings/${listing.id}`); }}
                >
                  <img src={listing.img} alt={listing.title}
                    style={{ width: 88, height: 66, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/88/66`; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: text,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {listing.title}
                    </p>
                    <p style={{ margin: '0 0 6px', fontSize: 12, color: sub,
                      display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiMapPin size={11} /> {listing.location}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#ff5722' }}>
                        ${listing.price}
                        <span style={{ fontSize: 11, fontWeight: 400, color: sub }}> /night</span>
                      </p>
                      <FiExternalLink size={14} color={sub} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {savedListings.length > 0 && (
            <div style={{ padding: '14px 24px', borderTop: `1px solid ${border}` }}>
              <button
                onClick={() => { onClose(); navigate('/guest/wishlist'); }}
                style={{ width: '100%', background: '#ff5722', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                View All Saved Listings
              </button>
            </div>
          )}
        </div>
      </Transition>
    </>
  );
}
