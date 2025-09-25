import React, { useEffect, useState } from "react";

function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders");
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        setError("");
      } else {
        setError("Failed to fetch orders: " + (data.message || "Unknown error"));
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Network error. Please check if server is running.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshOrders = () => {
    setLoading(true);
    fetchOrders();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'preparing': { color: 'orange', text: 'Preparing' },
      'partially_completed': { color: 'blue', text: 'Partial' },
      'ready_to_serve': { color: 'green', text: 'Ready' },
      'completed': { color: 'purple', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { color: 'gray', text: status };
    return (
      <span style={{
        background: config.color,
        color: 'white',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#185a9d", margin: 0 }}>Admin - Orders & Payments</h2>
        <button 
          onClick={refreshOrders}
          style={{
            padding: "8px 16px",
            background: "#43cea2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={{ 
          background: "#ffe6e6", 
          color: "red", 
          padding: "15px", 
          borderRadius: "5px", 
          marginBottom: "20px",
          border: "1px solid red"
        }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📦</div>
          <p>No orders found.</p>
          <p style={{ color: "#666" }}>Orders will appear here when customers place them.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", background: "white", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#185a9d", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Order ID</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Token</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>User</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Items</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Amount</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Payment Type</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Payment Status</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Order Status</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", border: "1px solid #eee" }}>#{order.id}</td>
                  <td style={{ padding: "12px", border: "1px solid #eee", fontWeight: "bold", fontFamily: "monospace" }}>
                    {order.token}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #eee" }}>
                    <div>{order.user_name}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{order.user_id}</div>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #eee", maxWidth: "200px" }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ marginBottom: "4px", fontSize: "14px" }}>
                        • {item.name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #eee", fontWeight: "bold" }}>
                    ₹{order.amount}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #eee" }}>
                    <span style={{
                      background: order.payment_type === 'instant' ? '#e8f5e8' : '#e8f4f8',
                      color: order.payment_type === 'instant' ? '#2e7d32' : '#1565c0',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {order.payment_type === 'instant' ? 'Instant' : 'Monthly'}
                    </span>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #eee" }}>
                    <span style={{
                      color: order.payment_status === 'completed' ? 'green' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #eee" }}>
                    {getStatusBadge(order.order_status)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #eee", fontSize: "14px", color: "#666" }}>
                    {new Date(order.order_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "20px", textAlign: "center", color: "#666" }}>
        <p>Total Orders: <strong>{orders.length}</strong></p>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default AdminPayments;