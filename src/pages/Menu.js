import React, { useContext, useState } from "react";
import { CartContext } from "../CartContext";

function Menu() {
  const { addToCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [activeCategory, setActiveCategory] = useState("Veg");
  const [popupMessage, setPopupMessage] = useState("");

  const categories = {
    Veg: [
      { id: 1, name: "Paneer Burger", price: 80, image: "/images/paneerburger.png" },
      { id: 2, name: "Veg Biriyani", price: 90, image: "/images/vegbiriyani.jpeg" },
      { id: 3, name: "Veg Sandwich", price: 80, image: "/images/vegsandwitch.jpg" },
      { id: 4, name: "Veg Pizza", price: 120, image: "/images/vegpizza.jpg" },
    ],
    "Non-Veg": [
      { id: 5, name: "Chicken Burger", price: 100, image: "/images/burger.jpeg" },
      { id: 6, name: "Chicken Biriyani", price: 150, image: "/images/Chickenbiriyani.jpeg" },
    ],
    Snacks: [
      { id: 7, name: "French Fries", price: 50, image: "/images/frenchfries.jpeg" },
      { id: 8, name: "Meat roll", price: 20, image: "/images/meatroll.jpeg" },
    ],
    "Cold Drinks": [
      { id: 9, name: "Coke", price: 30, image: "/images/coke.png" },
      { id: 10, name: "Pepsi", price: 30, image: "/images/pepsi.jpeg" },
    ],
    "Hot Drinks": [
      { id: 11, name: "Tea", price: 10, image: "/images/tea.png" },
      { id: 12, name: "Coffee", price: 20, image: "/images/coffe.jpeg" },
    ],
  };

  const handleQuantityChange = (id, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({
      ...prev,
      [id]: quantity,
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = quantities[item.id] || 1;
    addToCart({ ...item, quantity });

    setPopupMessage(`${quantity} x ${item.name} added to cart!`);
    setTimeout(() => setPopupMessage(""), 2000);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
      <h2 style={{ textAlign: "center", color: "#185a9d", marginBottom: "30px" }}>Menu</h2>

      {popupMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "green",
            color: "white",
            padding: "15px 25px",
            borderRadius: "5px",
            boxShadow: "2px 2px 10px #aaa",
            zIndex: 1000,
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          ✅ {popupMessage}
        </div>
      )}

      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        {Object.keys(categories).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              margin: "0 10px",
              padding: "12px 20px",
              background: activeCategory === cat ? "#185a9d" : "#f0f0f0",
              color: activeCategory === cat ? "white" : "#333",
              border: "none",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "all 0.3s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "25px",
          justifyContent: "center",
        }}
      >
        {categories[activeCategory].map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "15px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              background: "white",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          >
            <div style={{
              width: "120px",
              height: "120px",
              background: "#f5f5f5",
              borderRadius: "10px",
              margin: "0 auto 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px"
            }}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <span style={{ display: 'none' }}>🍽️</span>
            </div>
            <h4 style={{ margin: "10px 0", color: "#185a9d" }}>{item.name}</h4>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: "#43cea2", margin: "10px 0" }}>
              ₹{item.price}
            </p>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "15px" }}>
              <input
                type="number"
                min="1"
                value={quantities[item.id] || 1}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                style={{ 
                  width: "60px", 
                  textAlign: "center", 
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "5px"
                }}
              />
              <button
                onClick={() => handleAddToCart(item)}
                style={{
                  padding: "10px 15px",
                  background: "#185a9d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "background 0.3s"
                }}
                onMouseEnter={(e) => e.target.background = "#43cea2"}
                onMouseLeave={(e) => e.target.background = "#185a9d"}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;