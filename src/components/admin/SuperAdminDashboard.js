import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdmin.css";

const SuperAdminDashboard = () => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    axios.get("/api/superadmin/pending-universities", {
      headers: { Authorization: localStorage.getItem("token") }
    }).then(res => setPending(res.data));
  }, []);

  const approveUniversity = async (id) => {
    await axios.patch(`/api/superadmin/approve/${id}`, {}, {
      headers: { Authorization: localStorage.getItem("token") }
    });
    setPending(pending.filter(p => p._id !== id));
  };

  const rejectUniversity = async (id) => {
    await axios.delete(`/api/superadmin/reject/${id}`, {
      headers: { Authorization: localStorage.getItem("token") }
    });
    setPending(pending.filter(p => p._id !== id));
  };

  return (
    <div className="superadmin-dashboard">
      <h1>Pending University Approvals</h1>
      {pending.length === 0 ? (
        <p>No pending universities 🎉</p>
      ) : (
        pending.map((uni) => (
          <div key={uni._id} className="card">
            <img src={uni.logoUrl || "/default-logo.png"} alt="logo" />
            <h3>{uni.name}</h3>
            <p>Code: {uni.code}</p>
            <p>Admin: {uni.adminId?.email}</p>
            <button onClick={() => approveUniversity(uni._id)}>Approve</button>
            <button onClick={() => rejectUniversity(uni._id)} className="reject">Reject</button>
          </div>
        ))
      )}
    </div>
  );
};

export default SuperAdminDashboard;
