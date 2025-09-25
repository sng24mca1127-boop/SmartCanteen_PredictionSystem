import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Queue() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQueueStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:5000/api/queue/${token}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus(data.status || "pending");
        } else {
          setStatus("not_found");
        }

        // Also fetch order details
        const orderResponse = await fetch(`http://localhost:5000/api/orders/token/${token}`);
        const orderData = await orderResponse.json();
        if (orderData.success) {
          setOrderDetails(orderData.order);
        }
      } catch (err) {
        console.error("Error fetching queue status:", err);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ready_to_serve":
        return "green";
      case "preparing":
        return "orange";
      case "partially_completed":
        return "blue";
      case "completed":
        return "purple";
      case "error":
      case "not_found":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      "preparing": "🟡 Preparing",
      "partially_completed": "🔵 Partially Completed", 
      "ready_to_serve": "🟢 Ready to Serve",
      "completed": "✅ Completed",
      "pending": "⚫ Pending",
      "not_found": "❌ Order Not Found",
      "error": "❌ Error"
    };
    return statusMap[status] || status;
  };

  const getStatusMessage = (status) => {
    const messages = {
      "preparing": "Your order is being prepared. Please wait...",
      "partially_completed": "Some items are ready. Please collect available items.",
      "ready_to_serve": "Your order is ready! Please collect it from the counter.",
      "completed": "Order has been served. Thank you!",
      "pending": "Your order is being processed...",
      "not_found": "No active order found with this token.",
      "error": "Error fetching order status. Please try again."
    };
    return messages[status] || "Checking order status...";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div style={{ fontSize: "24px", marginBottom: "20px" }}>⏳</div>
        <p>Loading your order status...</p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2 style={{ color: "#185a9d" }}>Queue Status</h2>
        <p>No active order found.</p>
        <p>Please place an order first.</p>
        <div style={{ marginTop: "20px" }}>
          <button 
            onClick={() => navigate("/menu")}
            style={{
              padding: "10px 20px",
              background: "#43cea2",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px"
            }}
          >
            Go to Menu
          </button>
          <button 
            onClick={() => navigate("/login")}
            style={{
              padding: "10px 20px",
              background: "#185a9d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#185a9d", marginBottom: "10px" }}>Order Status</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>Hello, {user.name}!</p>

      <div style={{ 
        background: "#f9f9f9", 
        padding: "30px", 
        borderRadius: "15px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        marginBottom: "20px"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎟️</div>
        <h3 style={{ color: "#185a9d", marginBottom: "5px" }}>Token Number</h3>
        <div style={{ 
          fontSize: "48px", 
          fontWeight: "bold", 
          color: "green",
          marginBottom: "20px"
        }}>
          {token}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#666", marginBottom: "10px" }}>Current Status</h4>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: "bold",
            color: getStatusColor(status),
            padding: "10px",
            background: "white",
            borderRadius: "5px",
            display: "inline-block",
            minWidth: "200px"
          }}>
            {getStatusText(status)}
          </div>
        </div>

        <p style={{ 
          fontSize: "16px", 
          color: "#666",
          fontStyle: "italic"
        }}>
          {getStatusMessage(status)}
        </p>
      </div>

      {orderDetails && (
        <div style={{ 
          background: "#f5f5f5", 
          padding: "20px", 
          borderRadius: "10px",
          textAlign: "left",
          marginBottom: "20px"
        }}>
          <h4 style={{ color: "#185a9d", marginBottom: "15px" }}>Order Details:</h4>
          {orderDetails.items.map((item, index) => (
            <div key={index} style={{ 
              display: "flex", 
              justifyContent: "space-between",
              marginBottom: "5px"
            }}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <hr style={{ margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Total:</span>
            <span>₹{orderDetails.amount}</span>
          </div>
          <div style={{ marginTop: "10px", color: "#666" }}>
            Payment: {orderDetails.payment_type === 'instant' ? 'Instant' : 'Monthly'}
          </div>
        </div>
      )}

      <div style={{ 
        background: "#e8f4f8", 
        padding: "15px", 
        borderRadius: "8px",
        fontSize: "14px",
        color: "#185a9d"
      }}>
        <p><strong>💡 Tip:</strong> This page updates automatically every 5 seconds.</p>
        <p>Show your token number at the counter when your order is ready.</p>
      </div>
    </div>
  );
}

export default Queue;