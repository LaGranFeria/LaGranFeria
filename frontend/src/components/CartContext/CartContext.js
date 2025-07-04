import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    const existingItem = cartItems.find(
      (item) => item.idProducto === product.idProducto
    );

    if (existingItem) {
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
      };

      const updatedCart = cartItems.map((item) => {
        if (item.idProducto === product.idProducto) {
          return updatedItem;
        } else {
          return item;
        }
      });

      setCartItems(updatedCart);
    } else {
      const newItem = {
        idProducto: product.idProducto,
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        quantity: 1,
      };

      setCartItems([...cartItems, newItem]);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
