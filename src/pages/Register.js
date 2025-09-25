import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userId: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getRoleLabel = (role) => {
    switch (role) {
      case "faculty":
        return "Faculty ID";
      case "admin":
        return "Admin ID";
      case "kitchen":
        return "Kitchen Staff ID";
      case "student":
        return "Student ID";
      default:
        return "User ID";
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.role) errors.role = "Please select a role";
    if (!formData.userId.trim()) errors.userId = `${getRoleLabel(formData.role)} is required`;
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) errors.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok) {
          alert("✅ Registration successful! Please login.");
          navigate("/login");
        } else {
          setErrors({ server: data.error || "Registration failed" });
        }
      } catch (err) {
        console.error(err);
        setErrors({ server: "Server error. Try again later." });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        background: "white",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}
    >
      <h2 style={{ textAlign: "center", color: "#185a9d", marginBottom: "20px" }}>
        User Registration
      </h2>

      {errors.server && (
        <div style={{ 
          color: "red", 
          textAlign: "center", 
          background: "#ffe6e6", 
          padding: "10px", 
          borderRadius: "5px",
          marginBottom: "15px",
          border: "1px solid red"
        }}>
          {errors.server}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: errors.name ? "1px solid red" : "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px"
            }}
            placeholder="Enter your full name"
          />
          {errors.name && <span style={{ color: "red", fontSize: "14px" }}>{errors.name}</span>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: errors.email ? "1px solid red" : "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px"
            }}
            placeholder="Enter your email"
          />
          {errors.email && <span style={{ color: "red", fontSize: "14px" }}>{errors.email}</span>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: errors.role ? "1px solid red" : "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px"
            }}
          >
            <option value="">-- Select Role --</option>
            <option value="student">Student/User</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
            <option value="kitchen">Kitchen Staff</option>
          </select>
          {errors.role && <span style={{ color: "red", fontSize: "14px" }}>{errors.role}</span>}
        </div>

        {formData.role && (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              {getRoleLabel(formData.role)}:
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              style={{ 
                width: "100%", 
                padding: "10px", 
                border: errors.userId ? "1px solid red" : "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "16px"
              }}
              placeholder={`Enter ${getRoleLabel(formData.role)}`}
            />
            {errors.userId && <span style={{ color: "red", fontSize: "14px" }}>{errors.userId}</span>}
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: errors.password ? "1px solid red" : "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px"
            }}
            placeholder="Enter password (min. 6 characters)"
          />
          {errors.password && <span style={{ color: "red", fontSize: "14px" }}>{errors.password}</span>}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: errors.confirmPassword ? "1px solid red" : "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px"
            }}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <span style={{ color: "red", fontSize: "14px" }}>{errors.confirmPassword}</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#ccc" : "#43cea2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <p>Already have an account? <a href="/login" style={{ color: "#185a9d", textDecoration: "none" }}>Login here</a></p>
      </div>
    </div>
  );
}

export default Register;