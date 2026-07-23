import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
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
  
  // Extraer información estática del JSON (restaurant y theme)
  const { restaurant, theme } = menuData

  // Estados para los datos dinámicos (Google Sheets)
  const [categories, setCategories] = useState(menuData.categories) // Fallback al JSON
  const [isLoading, setIsLoading] = useState(true)
  
  // Calcular automáticamente si está abierto (Temporalmente forzado a ABIERTO para pruebas)
  const checkIsOpen = () => {
    return true; // Forzado a abierto por petición del usuario
    
    /* Lógica original comentada:
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
    */
  };

  const [isRestaurantOpen, setIsRestaurantOpen] = useState(checkIsOpen());
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    // Update document title and favicon
    document.title = restaurant.name;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = restaurant.logo;

    // Fetch BCV rate
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then(response => response.json())
      .then(data => {
        if (data && data.promedio) {
          setExchangeRate(data.promedio);
        }
      })
      .catch(error => console.error('Error fetching BCV rate:', error));

    // Fetch Google Sheets Menu
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1MWV6Ipn84b4decQCy3cAiKLKpVXbYnArxxsq4ooKD9A/export?format=csv';
    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      complete: (results) => {
        const rows = results.data;
        const catMap = {};
        
        rows.forEach(row => {
          if (!row.Nombre || !row.Categoria) return; // Saltar filas vacías
          
          if (!catMap[row.Categoria]) {
            catMap[row.Categoria] = {
              id: 'c-' + row.Categoria.replace(/\s+/g, '-').toLowerCase(),
              name: row.Categoria,
              items: []
            };
          }
          
          const prevPriceKey = Object.keys(row).find(k => k.trim().toLowerCase() === 'precio anterior');
          const prevPriceVal = prevPriceKey ? parseFloat(row[prevPriceKey]) : null;
          const currentPrice = parseFloat(row.Precio) || 0;
          
          catMap[row.Categoria].items.push({
            id: row.ID,
            name: row.Nombre,
            description: row.Descripcion,
            price: currentPrice,
            previousPrice: (prevPriceVal && prevPriceVal > currentPrice) ? prevPriceVal : null,
            image: row.Imagen_URL,
            customizable: String(row.Personalizable).toUpperCase() !== 'FALSE',
            removableIngredients: row.Ingredientes_Removibles ? row.Ingredientes_Removibles.split(',').map(i => i.trim()).filter(Boolean) : [],
            agotado: String(row.Agotado).toUpperCase() === 'TRUE'
          });
        });
        
        const newCategories = Object.values(catMap);
        if (newCategories.length > 0) {
          setCategories(newCategories);
        }
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Error loading Google Sheets data:', error);
        setIsLoading(false); // Fallback to menu.json categories
      }
    });

    // Actualizar el estado cada minuto
    const interval = setInterval(() => {
      setIsRestaurantOpen(checkIsOpen());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const computedRestaurant = { ...restaurant, isOpen: isRestaurantOpen, exchangeRate };

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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'var(--text-secondary)' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2>Cargando menú...</h2>
      </div>
    );
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
                    exchangeRate={exchangeRate}
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
          exchangeRate={exchangeRate}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}

export default App
