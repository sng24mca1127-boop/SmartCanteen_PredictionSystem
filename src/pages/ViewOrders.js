import React, { useEffect, useState } from "react";

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed orders from backend
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders");
      const data = await response.json();
      
      if (data.success) {
        // Show all orders for viewing
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
    const interval = setInterval(fetchOrders, 10000); // refresh every 10 seconds
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
      <h2 style={{ textAlign: "center", color: "#185a9d" }}>View Orders</h2>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center" }}>No orders found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ background: "#43cea2", color: "white" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Order ID</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Token</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>User</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Items</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Amount</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.id}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.token}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.user_name}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {order.items.map((item, i) => (
                      <div key={i}>
                        {item.name} x {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>₹{order.amount}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{order.order_status}</td>
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

export default ViewOrders;