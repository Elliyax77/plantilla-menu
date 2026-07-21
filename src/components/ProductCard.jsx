import React from 'react';

export default function ProductCard({ item, currency, cartQty, onClick }) {
  return (
    <div className="product-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <img src={item.image} alt={item.name} className="product-image" loading="lazy" />
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-desc">{item.description}</p>
        <div className="product-footer">
          <span className="product-price">{currency}{item.price.toFixed(2)}</span>
          
          {cartQty > 0 ? (
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
