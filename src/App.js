import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Welcome from './components/pages/Welcome';
import Login from './components/pages/Login';
import Home from './components/pages/Home';
import About from './components/pages/AboutUs';
import Contact from './components/pages/ContactUs';
import Register from './components/pages/Register';
import ChatPage from './components/pages/ChatPage';
import SeeResources from './components/pages/seeResources';
import ForgotPassword from './components/pages/ForgotPassword';
import UploadResources from './components/pages/uploadResources';

function App() {
  // For demo purposes, store logged-in user here
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/home" element={currentUser ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/see-resources" element={<SeeResources />} />
        <Route path="/upload-resources" element={<UploadResources />} />
      </Routes>
    </Router>
  );
}

export default App;
