import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Welcome from './components/pages/Welcome';
import Login from './components/pages/Login';
import Home from './components/pages/Home';
import About from './components/pages/AboutUs';
import Contact from './components/pages/ContactUs';
import Register from './components/pages/Register';
import ForgotPassword from './components/pages/ForgotPassword'; 
import Resources from './components/pages/Resources';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />  {/* Root page */}
        <Route path="/login" element={<Login />} /> {/* Login page */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </Router>
  );
}

export default App;
