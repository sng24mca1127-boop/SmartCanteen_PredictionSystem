// src/pages/Cart.js
import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useContext(CartContext);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [paymentType, setPaymentType] = useState("Instant");

  const total = getCartTotal();

  const buttonStyle = {
    padding: "10px 20px",
    background: "#43cea2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px",
    fontWeight: "bold",
  };

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(index, newQuantity);
  };

  const proceedToCheckout = () => {
    const order = {
      user: user.name,
      role: user.role,
      cart: [...cart],
      total,
      paymentType,
      date: new Date().toLocaleString(),
    };

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    alert(
      `Order placed successfully!\nPayment Type: ${paymentType}\nTotal: ₹${total}`
    );
    clearCart();
    navigate("/menu");
  };

  // Restrict cart view to student and faculty only
  useEffect(() => {
    if (!user || (user.role !== "student" && user.role !== "faculty")) {
      alert("Access denied! Only students and faculty can view the cart.");
      navigate("/"); // redirect to home or admin dashboard
    }
  }, [user, navigate]);

  if (!user || (user.role !== "student" && user.role !== "faculty")) {
    return null; // Do not render anything for admin/kitchen
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ color: "#185a9d", marginBottom: "30px", textAlign: "center" }}>
        Your Cart
      </h2>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
          <p style={{ fontSize: "18px", marginBottom: "30px" }}>Your cart is empty</p>
          <button onClick={() => navigate("/menu")} style={buttonStyle}>
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "30px" }}>
            {cart.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  background: "white",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ flex: 2 }}>
                  <h4 style={{ margin: "0 0 5px 0", color: "#185a9d" }}>
                    {item.name}
                  </h4>
                  <p style={{ margin: 0, color: "#666" }}>₹{item.price} each</p>
                </div>

                <div
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                    style={{
                      padding: "5px 10px",
                      background: "#f0f0f0",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: "bold", minWidth: "30px", textAlign: "center" }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                    style={{
                      padding: "5px 10px",
                      background: "#f0f0f0",
                      border: "1px solid #ccc",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                <div style={{ flex: 1, textAlign: "right" }}>
                  <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(index)}
                  style={{
                    padding: "5px 10px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <label style={{ marginRight: "10px", fontWeight: "bold" }}>Payment Type:</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontWeight: "bold",
              }}
            >
              <option value="Instant">Instant Payment</option>
              <option value="Monthly">Monthly Payment</option>
            </select>
          </div>

          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <span>Total Amount:</span>
            <span>₹{total}</span>
          </div>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
            <button onClick={clearCart} style={{ ...buttonStyle, background: "#ff6b6b" }}>
              Clear Cart
            </button>
            <button onClick={() => navigate("/menu")} style={{ ...buttonStyle, background: "#6c757d" }}>
              Continue Shopping
            </button>
            <button onClick={proceedToCheckout} style={buttonStyle}>
              ✅ Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
