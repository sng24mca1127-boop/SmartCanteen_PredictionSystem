import React, { useEffect, useState } from "react";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/user/orders/${user.user_id}`);
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.orders || []);

          // Calculate monthly dues sum
          const monthlySum = data.orders
            .filter((order) => order.payment_type === "monthly")
            .reduce((sum, order) => sum + order.amount, 0);
          setMonthlyTotal(monthlySum);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading order history...</p>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Please login to view your order history.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", color: "#185a9d" }}>Order History</h2>
      
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3>Welcome, {user.name}!</h3>
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center" }}>You have not ordered anything yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "90%", margin: "auto", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ background: "#43cea2", color: "white" }}>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Order ID</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Token</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Items</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Total Amount</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Payment Type</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Status</th>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "10px" }}>{order.id}</td>
                  <td style={{ padding: "10px", fontWeight: "bold" }}>{order.token}</td>
                  <td style={{ padding: "10px" }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ marginBottom: "5px" }}>
                        {item.name} x {item.quantity} @ ₹{item.price}
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: "10px", fontWeight: "bold" }}>₹{order.amount}</td>
                  <td style={{ 
                    padding: "10px",
                    color: order.payment_type === "monthly" ? "blue" : "green"
                  }}>
                    {order.payment_type === "monthly" ? "Monthly" : "Instant"}
                  </td>
                  <td style={{ 
                    padding: "10px",
                    color: order.order_status === "completed" ? "green" : 
                           order.order_status === "ready_to_serve" ? "blue" : "orange",
                    fontWeight: "bold"
                  }}>
                    {order.order_status.replace('_', ' ').toUpperCase()}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {new Date(order.order_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "30px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
        <h3>
          Total Monthly Dues: <span style={{ color: "green", fontSize: "24px" }}>₹{monthlyTotal}</span>
        </h3>
        {monthlyTotal > 0 && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            Please settle your monthly dues at the accounts office.
          </p>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;