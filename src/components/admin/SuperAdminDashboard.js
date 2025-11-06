import React, { useEffect, useState } from "react";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    axios
      .get("/api/superadmin/pending-universities", {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((res) => setPending(res.data))
      .catch((err) => console.error("Error fetching pending universities:", err));
  }, []);

  const approveUniversity = async (id) => {
    try {
      await axios.patch(
        `/api/superadmin/approve/${id}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      setPending(pending.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error approving university:", err);
    }
  };

  const rejectUniversity = async (id) => {
    try {
      await axios.delete(`/api/superadmin/reject/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setPending(pending.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error rejecting university:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-[Poppins]">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 text-center">
        Pending University Approvals
      </h1>

      {pending.length === 0 ? (
        <p className="text-center text-gray-500 text-base sm:text-lg">
          No pending universities 🎉
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((uni) => (
            <div
              key={uni._id}
              className="border border-gray-200 rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <img
                src={uni.logoUrl || "/default-logo.png"}
                alt="logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-4"
              />

              <h3 className="text-lg font-semibold text-gray-800">{uni.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Code: {uni.code}</p>
              <p className="text-sm text-gray-600 truncate w-full">
                Admin: {uni.adminId?.email || "N/A"}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-5 w-full sm:justify-center">
                <button
                  onClick={() => approveUniversity(uni._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition w-full sm:w-auto"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectUniversity(uni._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition w-full sm:w-auto"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
