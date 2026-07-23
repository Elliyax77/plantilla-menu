import React from 'react';

export default function ProductCard({ item, currency, cartQty, onClick, exchangeRate }) {
  return (
    <div 
      className={`product-card ${item.agotado ? 'agotado' : ''}`} 
      onClick={item.agotado ? undefined : onClick} 
      style={{ cursor: item.agotado ? 'not-allowed' : 'pointer', opacity: item.agotado ? 0.6 : 1 }}
    >
      <div style={{ position: 'relative' }}>
        <img src={item.image} alt={item.name} className="product-image" loading="lazy" style={{ filter: item.agotado ? 'grayscale(100%)' : 'none' }} />
        {item.agotado && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>
            AGOTADO
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-desc">{item.description}</p>
        <div className="product-footer">
          <span className="product-price">
            {currency}{item.price.toFixed(2)}
            {exchangeRate && <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginLeft: '4px' }}>| Bs {(item.price * exchangeRate).toFixed(2)}</span>}
          </span>
          
          {item.agotado ? (
            <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>Agotado</span>
          ) : cartQty > 0 ? (
            <div className="quantity-badge">
              <span className="qty-number-badge">{cartQty}</span>
            </div>
          ) : (
            <button className="btn-add">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', transform: 'translateY(-1px)' }}>
                <span style={{ fontWeight: '900', fontSize: '16px' }}>+</span>
                <span>Agregar</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
