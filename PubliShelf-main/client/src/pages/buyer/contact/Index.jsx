//client/src/pages/public/Contact.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormData({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">PubliShelf</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">Contact</Link>
              <Link to="/#faq-section" className="text-gray-700 hover:text-purple-600 transition-colors">FAQ</Link>
              <Link to="/buyer/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors">Bookstores</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth/login" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:-translate-y-[2px] transition-all duration-300">Join Now</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contact Section */}
      <section className="min-h-screen pt-16 bg-white">
        <div className="contact-container max-w-7xl mx-auto px-4 py-16">
          <div className="contact-header text-center mb-16">
            <h1 className="contact-title text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
            <p className="contact-subtitle text-xl text-gray-600 max-w-3xl mx-auto">
              We'd love to hear from you! Reach out to us with any questions or feedback.
            </p>
          </div>

          <div className="contact-content grid md:grid-cols-2 gap-12">
            <div className="contact-form space-y-6">
              <h2 className="contact-form-title text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your message"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
              {submitted && <p className="text-green-600 text-center mt-4">Thank you! Your message has been sent.</p>}
            </div>

            <div className="contact-info space-y-6">
              <h2 className="contact-info-title text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <p className="contact-info-text text-gray-600">
                Have questions or need assistance? We're here to help!
              </p>
              <div className="contact-info-details space-y-4">
                <div className="contact-info-item flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-purple-600 text-xl" />
                  <span className="text-gray-700">IIIT SRI CITY, Gnan Marg Road, SRI CITY, 517541</span>
                </div>
                <div className="contact-info-item flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <FaPhone className="text-purple-600 text-xl" />
                  <span className="text-gray-700">+91 8714746146</span>
                </div>
                <div className="contact-info-item flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-purple-600 text-xl" />
                  <span className="text-gray-700">support@publishelf.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PubliShelf</h3>
              <p className="text-gray-400">Your gateway to endless literary discoveries.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white"><FaTwitter /></a>
                <a href="#" className="text-gray-400 hover:text-white"><FaFacebook /></a>
                <a href="#" className="text-gray-400 hover:text-white"><FaInstagram /></a>
                <a href="#" className="text-gray-400 hover:text-white"><FaLinkedin /></a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <form className="flex">
                <input type="email" placeholder="Enter your email" className="px-4 py-2 rounded-l-lg w-full focus:outline-none focus:outline-purple-500" />
                <button className="bg-purple-600 px-4 py-2 rounded-r-lg hover:bg-purple-700">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Contact;