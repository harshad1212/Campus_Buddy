import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const AboutUs = () => {
  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#2b6cb0] mb-4">
            About <span className="text-gray-900">CampusBuddy</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Your trusted digital companion for smarter campus management.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#2b6cb0] mb-3">
              🎯 Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              CampusBuddy simplifies campus life by connecting students,
              teachers, and administrators through one platform — streamlining
              communication, resources, and events.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#2b6cb0] mb-3">
              💡 What We Offer
            </h2>
            <ul className="text-gray-600 space-y-2 text-left">
              <li>✔ Efficient communication between faculty and students</li>
              <li>✔ Access to centralized study resources</li>
              <li>✔ Event and notice management</li>
              <li>✔ Secure university-specific access control</li>
            </ul>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#2b6cb0] mb-3">
              👩‍💻 Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To build a future-ready academic ecosystem where technology
              empowers education, promotes collaboration, and enhances
              learning for all.
            </p>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-[#2b6cb0] mb-6">
            Meet Our Team 👩‍💻
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <img
                src="/assests/Mansi.jpg"
                alt="Team Member"
                className="w-24 h-24 mx-auto rounded-full mb-3"
              />
              <h3 className="font-medium text-lg text-gray-800">Mansi Dhandha</h3>
              <p className="text-sm text-gray-600">Developer & Project Lead</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5">
              <img
                src="/assets/profile2.jpg"
                alt="Team Member"
                className="w-24 h-24 mx-auto rounded-full mb-3"
              />
              <h3 className="font-medium text-lg text-gray-800">Harshad Dalsaniya</h3>
              <p className="text-sm text-gray-600">Design & QA</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
