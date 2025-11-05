import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    axios.get("/api/admin/stats", {
      headers: { Authorization: localStorage.getItem("token") }
    })
    .then(res => setStats(res.data))
    .catch(console.error);
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="cards">
        <div className="card">Users: {stats.totalUsers}</div>
        <div className="card">Resources: {stats.totalResources}</div>
        <div className="card">Events: {stats.totalEvents}</div>
        <div className="card">Active Users: {stats.activeUsers}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
