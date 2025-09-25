import React, { useContext, useState } from "react";
import { CartContext } from "../CartContext";
import { useNavigate } from "react-router-dom";

function PlaceOrder() {
  const { cart, clearCart } = useContext(CartContext);
  const [paymentOption, setPaymentOption] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handlePayment = async () => {
    if (!paymentOption) {
      alert("⚠️ Please select a payment option");
      return;
    }

    if (cart.length === 0) {
      alert("⚠️ Your cart is empty");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("⚠️ Please login first");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          user_name: user.name,
          items: cart,
          amount: total,
          payment_type: paymentOption
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(
          paymentOption === "instant" 
            ? `✅ Instant Payment Successful!\nAmount Paid: ₹${total}\nYour Token: ${data.token}`
            : `📅 Order added to your Monthly Bill!\nYour Token: ${data.token}`
        );

        localStorage.setItem("token", data.token);
        clearCart();
        navigate("/queue");
      } else {
        alert("❌ Failed to place order: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("❌ Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#185a9d", marginBottom: "30px" }}>Place Your Order</h2>

      {cart.length === 0 ? (
        <div>
          <p style={{ fontSize: "18px", marginBottom: "20px" }}>Your cart is empty. Please add items first.</p>
          <button 
            onClick={() => navigate("/menu")}
            style={{
              padding: "10px 20px",
              background: "#185a9d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Go to Menu
          </button>
        </div>
      ) : (
        <>
          <div style={{ 
            background: "#f9f9f9", 
            padding: "20px", 
            borderRadius: "10px", 
            marginBottom: "20px",
            textAlign: "left"
          }}>
            <h3 style={{ color: "#185a9d", marginBottom: "15px" }}>Order Summary:</h3>
            {cart.map((item, index) => (
              <div key={index} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                marginBottom: "10px",
                padding: "5px 0",
                borderBottom: "1px solid #eee"
              }}>
                <span>{item.name} × {item.quantity || 1}</span>
                <span style={{ fontWeight: "bold" }}>₹{item.price * (item.quantity || 1)}</span>
              </div>
            ))}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "2px solid #ddd",
              fontWeight: "bold",
              fontSize: "18px"
            }}>
              <span>Total Amount:</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div style={{ 
            background: "#f5f5f5", 
            padding: "20px", 
            borderRadius: "10px", 
            marginBottom: "20px" 
          }}>
            <h3 style={{ color: "#185a9d", marginBottom: "15px" }}>Select Payment Option:</h3>
            <label style={{ display: "block", marginBottom: "15px", fontSize: "16px" }}>
              <input
                type="radio"
                name="payment"
                value="instant"
                onChange={(e) => setPaymentOption(e.target.value)}
                style={{ marginRight: "10px", transform: "scale(1.2)" }}
              />
              💳 Instant Payment (Pay Now)
            </label>
            <label style={{ display: "block", fontSize: "16px" }}>
              <input
                type="radio"
                name="payment"
                value="monthly"
                onChange={(e) => setPaymentOption(e.target.value)}
                style={{ marginRight: "10px", transform: "scale(1.2)" }}
              />
              📅 Monthly Payment (Pay Later)
            </label>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || !paymentOption}
            style={{
              padding: "15px 30px",
              background: loading || !paymentOption ? "#ccc" : "#43cea2",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading || !paymentOption ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              opacity: loading || !paymentOption ? 0.7 : 1,
              minWidth: "200px"
            }}
          >
            {loading ? "⏳ Processing..." : paymentOption ? "✅ Confirm & Place Order" : "Select Payment Option"}
          </button>

          {!paymentOption && (
            <p style={{ color: "red", marginTop: "10px" }}>Please select a payment option</p>
          )}
        </>
      )}
    </div>
  );
}

export default PlaceOrder;