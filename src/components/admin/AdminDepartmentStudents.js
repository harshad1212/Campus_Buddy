import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { Award } from "lucide-react";

const AdminDepartmentStudents = () => {
  const { department } = useParams();
  const [students, setStudents] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const universityCode = currentUser?.universityCode;

  const fetchStudents = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/department/${universityCode}/${department}/students`
    );
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, [department]);

  return (
    <>
      <AdminSidebar pendingCount={0} />
      <AdminHeader />

      <main className="ml-64 p-6 bg-slate-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">
          Students – {department}
        </h2>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th>Email</th>
                <th>Enrollment No</th>
                <th>Semester</th>
                <th>Points</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-medium">{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.enrollmentNumber}</td>
                  <td>{s.semester || "—"}</td>
                  <td className="flex items-center gap-1 pt-4">
                    <Award size={14} className="text-yellow-500" />
                    {s.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {students.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No students found in this department
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminDepartmentStudents;
