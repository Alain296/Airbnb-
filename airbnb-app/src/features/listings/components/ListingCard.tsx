import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  FiStar, FiMapPin, FiHeart, FiPhone, FiCompass, FiCheckCircle, FiXCircle, FiAward,
  FiArrowRight,
} from 'react-icons/fi';
import { useFavorites } from '../hooks/useFavorites';
import type { Listing } from '../types';
import styles from './ListingCard.module.css';

interface Props {
  listing: Listing;
  viewMode: 'grid' | 'list';
  dark?: boolean;
  disableNavigation?: boolean;
}

const fmtCat = (cat: string) =>
  cat.replace('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export const ListingCard = memo(function ListingCard({
  listing,
  viewMode,
  dark = false,
  disableNavigation = false,
}: Props) {
  const { toggle, isSaved } = useFavorites();
  const navigate = useNavigate();
  const saved = isSaved(listing.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={() => {
        if (!disableNavigation) navigate(`/listings/${listing.id}`);
      }}
      className={clsx(
        styles.card,
        listing.superhost && styles.cardSuperhost,
        viewMode === 'list' && styles.cardList,
      )}
      data-listing-card
      style={dark ? { background: '#1e293b', borderColor: listing.superhost ? '#f59e0b' : '#334155' } : undefined}
    >
      {/* Image area */}
      <div className={styles.imageWrap}
        data-listing-image
        style={{ width: viewMode === 'list' ? 240 : '100%', height: viewMode === 'list' ? 180 : 220 }}>
        <img src={listing.img} alt={listing.title} className={styles.image}
          data-listing-photo
          crossOrigin="anonymous"
          onError={e => ((e.target as HTMLImageElement).src = '/liston-v2.3/assets/images/header/lg-01.jpg')} />

        {listing.superhost && (
          <div className={styles.badgeSuperhost} data-listing-badge>
            <FiAward size={11} style={{ marginRight: 4 }} /> SUPERHOST
          </div>
        )}

        <div className={styles.badgeAvailable}
          data-listing-badge
          style={{ background: listing.available ? '#22c55e' : '#ef4444',
            display: 'flex', alignItems: 'center', gap: 4 }}>
          {listing.available
            ? <><FiCheckCircle size={11} /> Available</>
            : <><FiXCircle size={11} /> Booked</>}
        </div>

        <button className={styles.heartBtn}
          data-listing-control
          onClick={e => { e.stopPropagation(); toggle(listing.id, listing.title, listing); }}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}>
          <FiHeart size={16} fill={saved ? '#ff5722' : 'none'} color={saved ? '#ff5722' : '#666'} />
        </button>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        <div className={styles.metaRow}>
          <div className={styles.ratingGroup}>
            <FiStar size={15} fill="#f59e0b" color="#f59e0b" />
            <span className={styles.ratingValue} style={dark ? { color: '#f1f5f9' } : undefined}>
              {listing.rating}
            </span>
            <span className={styles.reviewCount} style={dark ? { color: '#94a3b8' } : undefined}>
              (128 reviews)
            </span>
          </div>
          <span className={styles.categoryBadge}
            style={dark ? { background: '#0c4a6e', color: '#7dd3fc' } : undefined}>
            {fmtCat(listing.category)}
          </span>
        </div>

        <h3 className={styles.title} style={dark ? { color: '#f1f5f9' } : undefined}>
          {listing.title}
          {listing.superhost && <span className={styles.verifiedIcon}>✓</span>}
        </h3>

        <p className={styles.location} style={dark ? { color: '#94a3b8' } : undefined}>
          <FiMapPin size={13} style={{ marginRight: 4, flexShrink: 0 }} />
          {listing.location}
        </p>

        <div className={styles.hostStrip} style={dark ? { background: '#0f172a' } : undefined}>
          <img src={listing.profileImg} alt={listing.hostName} className={styles.hostAvatar}
            data-listing-photo
            crossOrigin="anonymous"
            onError={e => ((e.target as HTMLImageElement).src = '/liston-v2.3/assets/images/avatar/01.jpg')} />
          <div>
            <div className={styles.hostLabel} style={dark ? { color: '#64748b' } : undefined}>
              Hosted by
            </div>
            <div className={styles.hostName} style={dark ? { color: '#f1f5f9' } : undefined}>
              {listing.hostName}
            </div>
          </div>
        </div>

        <div className={styles.footer} style={dark ? { borderTopColor: '#334155' } : undefined}>
          <div className={styles.footerActions}>
            <button className={styles.actionBtn} style={{ color: '#ff5722' }}>
              <FiPhone size={13} /> Contact
            </button>
            <button className={styles.actionBtn} style={dark ? { color: '#94a3b8' } : { color: '#666' }}>
              <FiCompass size={13} /> Directions
            </button>
            <button
              className={styles.detailsBtn}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/listings/${listing.id}`);
              }}
            >
              View Details <FiArrowRight size={14} />
            </button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={styles.price}>${listing.price}</div>
            <div className={styles.priceLabel} style={dark ? { color: '#64748b' } : undefined}>
              per night
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
