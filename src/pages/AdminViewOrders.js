import React, { useEffect, useState } from "react";

function AdminViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders from backend
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders");
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Refresh every 10 seconds for live updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", color: "#185a9d" }}>Admin - View Ordered Items</h2>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center" }}>No orders found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#43cea2", color: "white" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Order ID</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Token</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>User</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Ordered Items</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Amount</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Payment Status</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Order Status</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.id}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px", fontWeight: "bold" }}>{order.token}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.user_name}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ marginBottom: "5px" }}>
                        <strong>{item.name}</strong> x {item.quantity} (₹{item.price} each)
                      </div>
                    ))}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>₹{order.amount}</td>
                  <td style={{ 
                    border: "1px solid #ccc", 
                    padding: "8px",
                    color: order.payment_status === "completed" ? "green" : "red",
                    fontWeight: "bold"
                  }}>
                    {order.payment_status}
                  </td>
                  <td style={{ 
                    border: "1px solid #ccc", 
                    padding: "8px",
                    color: order.order_status === "ready_to_serve" ? "green" : 
                           order.order_status === "preparing" ? "orange" : "blue"
                  }}>
                    {order.order_status.replace('_', ' ').toUpperCase()}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {new Date(order.order_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminViewOrders;