import React, { useState } from 'react';

export default function ItemModal({ item, currency, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Estado para los ingredientes removibles. Por defecto, todos están incluidos (true)
  const [ingredients, setIngredients] = useState(() => {
    const initial = {};
    if (item.removableIngredients) {
      item.removableIngredients.forEach(ing => {
        initial[ing] = true;
      });
    }
    return initial;
  });

  const handleIngredientChange = (ing) => {
    setIngredients(prev => ({
      ...prev,
      [ing]: !prev[ing]
    }));
  };

  const handleAdd = () => {
    // Buscar qué ingredientes se quitaron
    const removedIngredients = Object.entries(ingredients)
      .filter(([_, isIncluded]) => !isIncluded)
      .map(([ing, _]) => ing);

    onAddToCart({
      productId: item.id,
      quantity,
      notes,
      removedIngredients
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content item-modal" onClick={e => e.stopPropagation()}>
        <button className="btn-close-absolute" onClick={onClose}>&times;</button>
        
        <img src={item.image} alt={item.name} className="modal-image" />
        
        <div className="modal-body">
          <h2 className="modal-title">{item.name}</h2>
          <p className="modal-desc">{item.description}</p>
          <div className="modal-price">{currency}{item.price.toFixed(2)}</div>

          {/* Ingredientes removibles */}
          {item.removableIngredients && item.removableIngredients.length > 0 && (
            <div className="ingredients-section">
              <h3 className="section-title">Ingredientes (Desmarca para quitar)</h3>
              <div className="ingredients-list">
                {item.removableIngredients.map(ing => (
                  <label key={ing} className="ingredient-item">
                    <input 
                      type="checkbox" 
                      checked={ingredients[ing]}
                      onChange={() => handleIngredientChange(ing)}
                      className="ingredient-checkbox"
                    />
                    <span>{ing}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notas adicionales */}
          {item.customizable !== false && (
            <div className="notes-section">
              <h3 className="section-title">Instrucciones Especiales</h3>
              <textarea 
                className="notes-input" 
                placeholder="Ej. extra salsa de ajo, bien tostado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
              ></textarea>
            </div>
          )}
        </div>

        {/* Barra inferior (Cantidad y Botón Agregar) */}
        <div className="modal-footer">
          <div className="quantity-selector-large">
            <button 
              className="btn-qty-large" 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >-</button>
            <span className="qty-number-large">{quantity}</span>
            <button 
              className="btn-qty-large" 
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
          </div>
          
          <button className="btn-add-large" onClick={handleAdd}>
            Agregar {quantity > 1 ? quantity : ''} - {currency}{(item.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
