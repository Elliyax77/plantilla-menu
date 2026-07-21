import React from 'react';

export default function Header({ restaurant }) {
  return (
    <header className="header">
      {restaurant.logoUrl && (
        <img src={restaurant.logoUrl} alt={`Logo de ${restaurant.name}`} className="header-logo" />
      )}
      <h1>{restaurant.name}</h1>
      {restaurant.description && <p className="header-desc">{restaurant.description}</p>}
      <div className="header-badges">
        {restaurant.isOpen !== undefined && (
          <div className={`status-badge ${restaurant.isOpen ? 'open' : 'closed'}`}>
            <span className="status-dot"></span>
            {restaurant.isOpen ? 'Abierto Ahora' : 'Cerrado por el momento'}
          </div>
        )}
        
        {restaurant.location && (
          <a 
            href={restaurant.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.location)}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="location-badge"
          >
            🗺️ Abrir Mapa: {restaurant.location}{restaurant.city ? `, ${restaurant.city}` : ''}{restaurant.state ? `, ${restaurant.state}` : ''}
          </a>
        )}
      </div>
    </header>
  );
}
