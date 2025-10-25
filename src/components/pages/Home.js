import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Home = () => {
  const sections = [
    {
      title: 'Resources',
      description:
        'Upload, browse, and manage notes, assignments, and study materials for your courses.',
      img: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
      link: '/see-resources',
    },
    {
      title: 'Events',
      description:
        'Create and join seminars, workshops, and campus events. Stay updated with reminders.',
      img: 'https://cdn-icons-png.flaticon.com/512/1160/1160358.png',
      link: '/events',
    },
    {
      title: 'Chat',
      description:
        'Real-time 1-to-1 or group chats with students and teachers for seamless communication.',
      img: 'https://cdn-icons-png.flaticon.com/512/2462/2462719.png',
      link: '/chat',
    },
    {
      title: 'Study Groups',
      description:
        'Create or join study groups for collaborative learning and discussions.',
      img: 'https://cdn-icons-png.flaticon.com/512/1828/1828939.png',
      link: '/study-groups',
    },
    {
      title: 'Forum',
      description:
        'Ask questions, answer queries, and participate in campus-wide discussions.',
      img: 'https://cdn-icons-png.flaticon.com/512/565/565313.png',
      link: '/forum',
    },
    {
      title: 'Leaderboard',
      description:
        'Track points, badges, and top contributors across the campus.',
      img: 'https://cdn-icons-png.flaticon.com/512/2583/2583340.png',
      link: '/leaderboard',
    },
  ];

  return (
    <div className="bg-blue-50 min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <section className="bg-blue-500 text-white rounded-2xl p-10 text-center shadow-lg mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Campus Buddy
          </h1>
          <p className="text-lg md:text-xl">
            Your ultimate campus management hub. Manage resources, events, chats, and collaboration effortlessly.
          </p>
        </section>

        {/* Modules */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center md:items-start md:justify-between ${
                index % 2 !== 0 ? 'md:flex-row-reverse' : ''
              } gap-6 md:gap-12`}
            >
              {/* Image */}
              <div className="flex-shrink-0 w-full md:w-1/3 text-center">
                <img
                  src={section.img}
                  alt={section.title}
                  className="mx-auto w-32 h-32 md:w-40 md:h-40 rounded-xl shadow-lg transition-transform transform hover:-translate-y-2 hover:scale-105"
                />
              </div>

              {/* Text Card */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md flex-1 transition-transform transform hover:-translate-y-2">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-700 mb-4">{section.description}</p>
                <Link to={section.link}>
                  <button className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition">
                    Go to {section.title}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
