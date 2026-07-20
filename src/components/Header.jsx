import React from 'react';

export default function Header({ restaurant }) {
  return (
    <header className="header">
      {restaurant.logoUrl && (
        <img src={restaurant.logoUrl} alt={`Logo de ${restaurant.name}`} className="header-logo" />
      )}
      <h1>{restaurant.name}</h1>
      {restaurant.description && <p className="header-desc">{restaurant.description}</p>}
      {restaurant.location && (
        <a 
          href={restaurant.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.location)}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="header-location"
        >
          <span>📍</span> {restaurant.location}
        </a>
      )}
    </header>
  );
}
