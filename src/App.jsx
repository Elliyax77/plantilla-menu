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
  
  // Calcular automáticamente si está abierto (de 10am a 11pm hora Venezuela)
  const checkIsOpen = () => {
    try {
      const vzlaTime = new Date().toLocaleString("en-US", {timeZone: "America/Caracas"});
      const date = new Date(vzlaTime);
      const hours = date.getHours();
      // 10:00 AM a 11:00 PM (23:00)
      return hours >= 10 && hours < 23;
    } catch (e) {
      // Fallback local time
      const hours = new Date().getHours();
      return hours >= 10 && hours < 23;
    }
  };

  const [isRestaurantOpen, setIsRestaurantOpen] = useState(checkIsOpen());

  useEffect(() => {
    // Actualizar el estado cada minuto
    const interval = setInterval(() => {
      setIsRestaurantOpen(checkIsOpen());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const computedRestaurant = { ...restaurant, isOpen: isRestaurantOpen };

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
    if (!isRestaurantOpen) {
      alert("Lo sentimos, estamos cerrados por el momento. ¡Te esperamos mañana de 10:00 AM a 11:00 PM!");
      return;
    }
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
        <Header restaurant={computedRestaurant} />
        
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
        
        <footer className="app-footer">
          <p>Desarrollado por <strong>Elías Espinal</strong></p>
          <p className="footer-sub">Soluciones de software profesional para restaurantes</p>
        </footer>
      </div>

      <Cart 
        cart={cart} 
        items={allItems} 
        currency={restaurant.currency} 
        restaurant={computedRestaurant} 
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
