import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Welcome from './components/pages/Welcome';
import Login from './components/pages/Login';
import Home from './components/pages/Home';
import AboutUs from './components/pages/AboutUs';
import Contact from './components/pages/ContactUs';
import ForgotPassword from './components/pages/ForgotPassword';
import ChatPage from './components/pages/ChatPage';
import ResetPassword from './components/pages/ResetPassword';
import UploadResources from './components/pages/uploadResources';
import SeeResources from './components/pages/seeResources';
import MyResources from './components/pages/myResources';
import EventsPage from './components/Events/EventsPage';
import CreateEvent from './components/Events/CreateEvents';
import AdminEvents from './components/Events/AdminEvents';
import RoleSelection from "./components/pages/RoleSelection";
import RegisterUniversity from "./components/pages/RegisterUniversity";
import AdminLogin from "./components/pages/AdminLogin";
import AdminDashboard from './components/admin/AdminDashboard';
import RegisterUser from './components/pages/RegisterUser';
import ForumList from "./components/pages/forum/ForumList";
import AskQuestion from "./components/pages/forum/AskQuestion";
import QuestionDetail from "./components/pages/forum/QuestionDetail";
import Leaderboard from './components/Leaderboard/Leaderboard';
import EventDetails from "./components/Events/EventDetails";
import AdminRequests from './components/admin/AdminRequests';

function App() {
  // For demo purposes, store logged-in user here
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/get-started" element={<RoleSelection />} />
        <Route path='/register-user' element={<RegisterUser />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/home" element={currentUser ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/chat/*" element={currentUser ? <ChatPage currentUser={currentUser} /> : <Navigate to="/login" replace />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/upload-resources" element={<UploadResources />} />
        <Route path="/see-resources" element={<SeeResources />} />
        <Route path="/my-resources" element={<MyResources />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/create-events" element={<CreateEvent />} />
        <Route path="/event-details" element={<EventDetails /> } />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/register-university" element={<RegisterUniversity />} />
        <Route path="/admin-dashboard" element={<AdminDashboard setCurrentUser={setCurrentUser} />} />
        <Route path="/forum" element={<ForumList />} />
        <Route path="/forum/ask" element={<AskQuestion />} />
        <Route path="/forum/:id" element={<QuestionDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin/requests" element={<AdminRequests />} />

      </Routes>
    </Router>
  );
}

export default App;
