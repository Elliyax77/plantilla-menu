import React, { useState } from 'react';
import { generateWhatsAppLink } from '../utils/whatsapp.js';

export default function Cart({ cart, items, currency, restaurant, onUpdateQty, onRemoveItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrefixOpen, setIsPrefixOpen] = useState(false);
  const prefixes = ['0414', '0424', '0412', '0416', '0426'];
  const [formData, setFormData] = useState({
    name: '',
    phonePrefix: '0424',
    phone: '',
    deliveryType: 'Delivery (A domicilio)',
    payment: 'Efectivo'
  });

  // El carrito ahora es un array
  const totalItems = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  
  const totalPrice = cart.reduce((sum, cartItem) => {
    const item = items.find(i => i.id === cartItem.productId);
    return sum + (item ? item.price * cartItem.quantity : 0);
  }, 0);

  if (totalItems === 0) return null;

  const handleCheckout = () => {
    if (!formData.name) return alert("Por favor ingresa tu nombre");
    
    const finalFormData = {
      ...formData,
      phone: formData.phone ? `${formData.phonePrefix} ${formData.phone}` : ''
    };

    const link = generateWhatsAppLink(cart, items, finalFormData, restaurant, totalPrice);
    window.open(link, '_blank');
  };

  return (
    <>
      {/* Barra Inferior */}
      <div className="cart-bar" onClick={() => setIsOpen(true)}>
        <div className="cart-info">
          <span className="cart-items">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</span>
          <span className="cart-total">{currency}{totalPrice.toFixed(2)}</span>
        </div>
        <button className="btn-checkout">Ver Pedido</button>
      </div>

      {/* Modal de Checkout */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tu Pedido</h2>
              <button className="btn-close" onClick={() => setIsOpen(false)}>&times;</button>
            </div>
            
            <div className="cart-items-list" style={{ marginBottom: '24px' }}>
              {cart.map((cartItem) => {
                const item = items.find(i => i.id === cartItem.productId);
                if (!item) return null;
                return (
                  <div key={cartItem.cartItemId} className="cart-item-row-container" style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px' }}>
                    <div className="cart-item-row" style={{ alignItems: 'center' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600' }}>{item.name}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {currency}{(item.price * cartItem.quantity).toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Controles de edición */}
                      <div className="cart-edit-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => onUpdateQty(cartItem.cartItemId, -1)}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontWeight: 'bold', color: 'var(--text-primary)' }}
                        >-</button>
                        <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{cartItem.quantity}</span>
                        <button 
                          onClick={() => onUpdateQty(cartItem.cartItemId, 1)}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontWeight: 'bold', color: 'var(--text-primary)' }}
                        >+</button>
                        <button 
                          onClick={() => onRemoveItem(cartItem.cartItemId)}
                          style={{ marginLeft: '8px', color: '#ef4444', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Eliminar producto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Mostrar ingredientes removidos y notas */}
                    {(cartItem.removedIngredients?.length > 0 || cartItem.notes) && (
                      <div className="cart-item-notes" style={{ marginTop: '8px' }}>
                        {cartItem.removedIngredients?.length > 0 && (
                          <div className="text-removed">❌ Sin: {cartItem.removedIngredients.join(', ')}</div>
                        )}
                        {cartItem.notes && (
                          <div className="text-notes">📝 Nota: {cartItem.notes}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="cart-item-row" style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '16px' }}>
                <span>Total a pagar</span>
                <span>{currency}{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tu Nombre</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej. Juan Pérez"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                <div 
                  className="form-input"
                  style={{ width: '96px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
                  onClick={() => setIsPrefixOpen(!isPrefixOpen)}
                >
                  <span style={{ fontWeight: '600' }}>{formData.phonePrefix}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>▼</span>
                </div>
                
                {isPrefixOpen && (
                  <div className="custom-select-dropdown">
                    {prefixes.map(prefix => (
                      <div 
                        key={prefix}
                        className="custom-select-option"
                        onClick={() => {
                          setFormData({...formData, phonePrefix: prefix});
                          setIsPrefixOpen(false);
                        }}
                      >
                        {prefix}
                      </div>
                    ))}
                  </div>
                )}
                
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="1234567"
                  value={formData.phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 7);
                    setFormData({...formData, phone: val});
                  }}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Tipo de Entrega</label>
              <div className="toggle-group">
                <button 
                  className={`toggle-btn ${formData.deliveryType === 'Delivery (A domicilio)' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, deliveryType: 'Delivery (A domicilio)'})}
                >
                  🛵 Delivery
                </button>
                <button 
                  className={`toggle-btn ${formData.deliveryType === 'Retiro en Tienda' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, deliveryType: 'Retiro en Tienda'})}
                >
                  🏬 Retiro
                </button>
              </div>
              {formData.deliveryType === 'Delivery (A domicilio)' && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  * Enviarás tu ubicación actual por WhatsApp al confirmar.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Método de Pago</label>
              <div className="payment-grid">
                {['Efectivo', 'Pago Móvil', 'Zelle', 'Punto de Venta'].map(method => (
                  <button 
                    key={method}
                    className={`payment-card ${formData.payment === method ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, payment: method})}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-whatsapp" onClick={handleCheckout}>
              Enviar por WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  );
}
