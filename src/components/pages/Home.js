import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './css/Home.css';

const Home = () => {
  const sections = [
    {
      title: 'Resources',
      description: 'Upload, browse, and manage notes, assignments, and study materials for your courses.',
      img: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
      link: '/resources',
    },
    {
      title: 'Events',
      description: 'Create and join seminars, workshops, and campus events. Stay updated with reminders.',
      img: 'https://cdn-icons-png.flaticon.com/512/1160/1160358.png',
      link: '/events',
    },
    {
      title: 'Chat',
      description: 'Real-time 1-to-1 or group chats with students and teachers for seamless communication.',
      img: 'https://cdn-icons-png.flaticon.com/512/2462/2462719.png',
      link: '/chat', // ✅ Now directly navigates to Chat page
    },
    {
      title: 'Study Groups',
      description: 'Create or join study groups for collaborative learning and discussions.',
      img: 'https://cdn-icons-png.flaticon.com/512/1828/1828939.png',
      link: '/study-groups',
    },
    {
      title: 'Forum',
      description: 'Ask questions, answer queries, and participate in campus-wide discussions.',
      img: 'https://cdn-icons-png.flaticon.com/512/565/565313.png',
      link: '/forum',
    },
    {
      title: 'Leaderboard',
      description: 'Track points, badges, and top contributors across the campus.',
      img: 'https://cdn-icons-png.flaticon.com/512/2583/2583340.png',
      link: '/leaderboard',
    },
  ];

  return (
    <div className="home-container">
      <Header />

      <main className="home-main">
        <section className="welcome-section">
          <h1>Welcome to Campus Buddy</h1>
          <p>Your ultimate campus management hub. Manage resources, events, chats, and collaboration effortlessly.</p>
        </section>

        {sections.map((section, index) => (
          <section
            key={index}
            className={`module-section ${index % 2 === 0 ? 'normal' : 'reverse'}`}
          >
            <div className="module-image">
              <img src={section.img} alt={section.title} />
            </div>
            <div className="module-text">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <Link to={section.link}>
                <button className="redirect-btn">Go to {section.title}</button>
              </Link>
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
