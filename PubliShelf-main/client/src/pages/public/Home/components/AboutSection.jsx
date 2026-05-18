import React from "react";
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white animate-fade-in-delay-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Gateway to a World of Books</h2>
            <p className="text-md text-gray-600 max-w-3xl mx-auto">
              India's premier platform for buying and selling used books effortlessly. Connect with fellow book lovers,
              declutter your shelves, and discover affordable literary treasures.
            </p>
            <p className="text-md text-gray-600">
              PubliShelf connects book lovers across India, making it easy to buy and sell used books. Whether you're a
              college student looking to offload textbooks or a collector searching for rare editions, our platform
              brings the book community together.
            </p>
            <div className="pt-2">
              <blockquote className="italic text-gray-700 pl-4 border-l-4 border-purple-600">
                "Selling used books at your desired price has never been easier. With PubliShelf, your books find new
                readers, and you earn money effortlessly!"
              </blockquote>
            </div>
            <div className="pt-4 flex justify-center md:justify-start">
              <button
                onClick={() => navigate("/auth/login")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                Join Our Community
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-xl p-4 shadow-md transform transition-transform hover:-translate-y-1">
              <div className="h-32 flex items-center justify-center">
                <i className="fas fa-book-open text-6xl text-purple-500"></i>
              </div>
              <h3 className="text-center font-semibold mt-2">Used Books</h3>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 shadow-md transform transition-transform hover:-translate-y-1">
              <div className="h-32 flex items-center justify-center">
                <i className="fas fa-university text-6xl text-indigo-500"></i>
              </div>
              <h3 className="text-center font-semibold mt-2">College Textbooks</h3>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-md transform transition-transform hover:-translate-y-1">
              <div className="h-32 flex items-center justify-center">
                <i className="fas fa-landmark text-6xl text-blue-500"></i>
              </div>
              <h3 className="text-center font-semibold mt-2">Antique Books</h3>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 shadow-md transform transition-transform hover:-translate-y-1">
              <div className="h-32 flex items-center justify-center">
                <i className="fas fa-users text-6xl text-purple-500"></i>
              </div>
              <h3 className="text-center font-semibold mt-2">Book Community</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
