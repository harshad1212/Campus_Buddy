import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Welcome from './components/pages/Welcome';
import Login from './components/pages/Login';
import Home from './components/pages/Home';
import About from './components/pages/AboutUs';
import Contact from './components/pages/ContactUs';
import Register from './components/pages/Register';
import ForgotPassword from './components/pages/ForgotPassword';
import ChatPage from './components/pages/ChatPage';
import ResetPassword from './components/pages/ResetPassword';
import UploadResources from './components/pages/uploadResources';
import SeeResources from './components/pages/seeResources';
import MyResources from './components/pages/myResources';
import Events from './components/Events/Events';
import CreateEvent from './components/Events/CreateEvents';
import AdminEvents from './components/Events/AdminEvents';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import RoleSelection from "./components/pages/RoleSelection";
import RegisterSuperAdmin from "./components/pages/RegisterSuperAdmin";
import RegisterUniversity from "./components/pages/RegisterUniversity";
import AdminLogin from "./components/pages/AdminLogin";
import AdminDashboard from './components/admin/AdminDashboard';
import RegisterUser from './components/pages/RegisterUser';

function App() {
  // For demo purposes, store logged-in user here
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/get-started" element={<RoleSelection />} />
        <Route path="/register/superadmin" element={<RegisterSuperAdmin />} />
        <Route path='/register-user' element={<RegisterUser />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/home" element={currentUser ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/chat/*" element={currentUser ? <ChatPage currentUser={currentUser} /> : <Navigate to="/login" replace />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/upload-resources" element={<UploadResources />} />
        <Route path="/see-resources" element={<SeeResources />} />
        <Route path="/my-resources" element={<MyResources />} />
        <Route path="/events" element={<Events />} />
        <Route path="/create-events" element={<CreateEvent />} />
        <Route path="/admin-events" element={<AdminEvents />} />
        <Route path="/register-university" element={<RegisterUniversity />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/admin-dashboard" element={<AdminDashboard currentUser={currentUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
