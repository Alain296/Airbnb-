import { useState } from 'react';
import { listings } from '../../../data/listings';

export const ListingsPageSimple = () => {
  const [query, setQuery] = useState('');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>All {listings.length} listings found</h2>
      
      <input
        type="text"
        placeholder="Search listings..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {listings.map(listing => (
          <div key={listing.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            <img 
              src={listing.img} 
              alt={listing.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '16px' }}>
              <h3>{listing.title}</h3>
              <p>{listing.location}</p>
              <p><strong>${listing.price}</strong> per night</p>
              <p>Rating: {listing.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};