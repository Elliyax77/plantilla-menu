import React, { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ProductCard from './components/ProductCard.jsx'
import Cart from './components/Cart.jsx'
import ItemModal from './components/ItemModal.jsx'
import menuData from './data/menu.json'
import './index.css'

function App() {
  // Ahora el carrito es un array de objetos
  const [cart, setCart] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  
  // Extraer información del JSON
  const { restaurant, theme, categories } = menuData
  
  // Todos los productos planos para fácil búsqueda
  const allItems = categories.flatMap(c => c.items)

  // Aplicar el color primario al cargar
  useEffect(() => {
    if (theme && theme.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
      document.documentElement.style.setProperty('--primary-hover', theme.primaryColor + 'cc')
    }
    document.title = restaurant.name
  }, [theme, restaurant.name])

  const handleProductClick = (item) => {
    setSelectedItem(item)
  }

  const handleAddToCart = (details) => {
    setCart(prev => {
      // Intentar buscar si ya existe EXACTAMENTE el mismo pedido (mismas notas, mismos ingredientes quitados)
      const existingIndex = prev.findIndex(cartItem => 
        cartItem.productId === details.productId &&
        cartItem.notes === details.notes &&
        JSON.stringify(cartItem.removedIngredients) === JSON.stringify(details.removedIngredients)
      )

      if (existingIndex >= 0) {
        // Sumar cantidades si es idéntico
        const newCart = [...prev]
        newCart[existingIndex].quantity += details.quantity
        return newCart
      } else {
        // Crear nuevo item en el carrito con un ID único
        return [...prev, {
          cartItemId: Date.now().toString(),
          ...details
        }]
      }
    })
    setSelectedItem(null)
  }

  // Cuenta la cantidad total que hay en el carrito para un producto específico (sin importar sus notas)
  const getProductTotalQty = (productId) => {
    return cart.reduce((total, cartItem) => {
      if (cartItem.productId === productId) return total + cartItem.quantity
      return total
    }, 0)
  }

  const handleUpdateCartItemQty = (cartItemId, change) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          return { ...item, quantity: item.quantity + change }
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }

  const handleRemoveCartItem = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId))
  }

  return (
    <div className="app-container">
      <Hero />
      
      <div className="content-wrapper">
        <Header restaurant={restaurant} />
        
        <main>
          {categories.map(category => (
            <section key={category.id} className="category-section">
              <h2 className="category-title">{category.name}</h2>
              <div className="product-list">
                {category.items.map(item => (
                  <ProductCard 
                    key={item.id} 
                    item={item} 
                    currency={restaurant.currency}
                    cartQty={getProductTotalQty(item.id)}
                    onClick={() => handleProductClick(item)}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <Cart 
        cart={cart} 
        items={allItems} 
        currency={restaurant.currency} 
        restaurant={restaurant} 
        onUpdateQty={handleUpdateCartItemQty}
        onRemoveItem={handleRemoveCartItem}
      />

      {/* Modal interactivo para personalizar el producto */}
      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          currency={restaurant.currency}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}

export default App
