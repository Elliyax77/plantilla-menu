export function generateWhatsAppLink(cart, items, formData, restaurant, totalPrice) {
  const { exchangeRate } = restaurant;
  const orderId = Math.floor(100000 + Math.random() * 900000);

  // Decodificamos los emojis desde su código hexadecimal seguro de URL.
  // Esto es 1000% a prueba de fallas contra cualquier servidor Windows o bug de Vite.
  const eCross = decodeURIComponent('%E2%9D%8C'); // ❌
  const eNote = decodeURIComponent('%F0%9F%93%9D');  // 📝
  const eTruck = decodeURIComponent('%F0%9F%9A%9A'); // 🚚
  const eMoney = decodeURIComponent('%F0%9F%92%B0'); // 💰
  const ePhone = decodeURIComponent('%F0%9F%93%9E'); // 📞
  const eScooter = decodeURIComponent('%F0%9F%9B%B5'); // 🛵
  const eStore = decodeURIComponent('%F0%9F%8F%AC'); // 🏬
  const eCash = decodeURIComponent('%F0%9F%92%B5');  // 💵
  const ePoint = decodeURIComponent('%E2%98%9D%EF%B8%8F'); // ☝️

  // Usamos ascii básico y decodeURIComponent para acentos
  const hola = decodeURIComponent('%C2%A1Hola!');
  const envio = decodeURIComponent('Env%C3%ADo');
  const ubicacion = decodeURIComponent('Ubicaci%C3%B3n');
  const enviare = decodeURIComponent('enviar%C3%A9');
  const envia = decodeURIComponent('env%C3%ADa');

  let message = `*Pedido #${orderId} en ${restaurant.name.toUpperCase()}*\n\n`;
  message += `${hola} Acabo de realizar el siguiente pedido en su tienda:\n\n`;
  
  message += `---------\n\n`;
  message += `*Resumen del pedido:*\n\n`;

  cart.forEach((cartItem) => {
    const item = items.find(i => i.id === cartItem.productId);
    if (item) {
      const itemTotal = item.price * cartItem.quantity;
      message += `*_${cartItem.quantity}x - ${item.name.toUpperCase()}_* (${restaurant.currency}${itemTotal.toFixed(2)})\n`;
      
      if (cartItem.removedIngredients && cartItem.removedIngredients.length > 0) {
        message += `   ${eCross} Sin: ${cartItem.removedIngredients.join(', ')}\n`;
      }
      
      if (cartItem.notes) {
        message += `   ${eNote} Nota: ${cartItem.notes}\n`;
      }
    }
  });

  message += `\n${eTruck} *${envio}:* A confirmar\n`;
  message += `${eMoney} *Total:* ${restaurant.currency}${totalPrice.toFixed(2)}`;
  if (exchangeRate) {
    message += ` (Bs. ${(totalPrice * exchangeRate).toFixed(2)})\n`;
    message += `   Tasa BCV: Bs. ${exchangeRate} / USD\n`;
  } else {
    message += `\n`;
  }
  message += `---------\n\n`;

  message += `*${formData.name}*\n`;
  
  if (formData.phone) {
    message += `${ePhone} ${formData.phone}\n`;
  }
  
  if (formData.deliveryType === 'Delivery (A domicilio)') {
    message += `${eScooter} Delivery\n`;
  } else {
    message += `${eStore} Retiro en tienda\n`;
  }
  
  message += `${eCash} ${formData.payment}\n\n`;

  if (formData.deliveryType === 'Delivery (A domicilio)') {
    message += `*${ubicacion} en Google Maps:*\n(Te ${enviare} mi ${ubicacion.toLowerCase()} actual por WhatsApp al enviar este mensaje)\n\n`;
  }

  message += `${ePoint} Por favor ${envia} este mensaje y te atenderemos lo antes posible`;

  const phone = restaurant.phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
