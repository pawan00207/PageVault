//client/src/pages/publisher/profile/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../../../services/publisher.services.js"; // Reuse dashboard for profile data

const Profile = () => {
  const [publisher, setPublisher] = useState(null);
  const [soldBooks, setSoldBooks] = useState([]);
  const [analytics, setAnalytics] = useState({ totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", publishingHouse: "" });
  const [showBookEditModal, setShowBookEditModal] = useState(false);
  const [editBookForm, setEditBookForm] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getDashboard(); // Assuming dashboard includes profile data
      if (response.success) {
        setPublisher(response.data.publisher);
        setSoldBooks(response.data.books || []);
        setAnalytics(response.data.analytics || { totalRevenue: 0 });
        setEditForm({
          name: `${response.data.publisher.firstname} ${response.data.publisher.lastname}`,
          email: response.data.publisher.email,
          publishingHouse: response.data.publisher.publishingHouse,
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const openEditProfile = () => {
    setShowEditModal(true);
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    // Implement update profile API call
    alert("Profile updated!"); // Placeholder
    setShowEditModal(false);
    fetchProfile();
  };

  const openEditBookModal = (book) => {
    setSelectedBook(book);
    setEditBookForm({
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      basePrice: book.basePrice,
      totalQuantity: book.totalQuantity,
      images: book.images.join(","),
    });
    setShowBookEditModal(true);
  };

  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    // Implement update book API call
    alert("Book updated!"); // Placeholder
    setShowBookEditModal(false);
    fetchProfile();
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/auth/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!publisher) return <div className="min-h-screen flex items-center justify-center">Profile not found</div>;

  return (
    <div className="bg-gray-50 font-sans pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[350px_1fr] gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-purple-100">
          <div className="text-center pb-5">
            <div className="profile-pic" />
            <h2 className="text-2xl font-bold text-indigo-700">{publisher.firstname} {publisher.lastname}</h2>
            <p className="text-gray-600 text-sm">Member since {new Date(publisher.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 my-5 p-4 bg-gray-100 rounded-lg">
            <div className="text-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="block text-purple-600 font-semibold text-lg">{soldBooks.length}</span>
              <span className="text-gray-600 text-sm">Books Sold</span>
            </div>
            <div className="text-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="block text-purple-600 font-semibold text-lg">₹{analytics.totalRevenue.toFixed(2)}</span>
              <span className="text-gray-600 text-sm">Revenue</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors">
              <span className="text-indigo-700 font-semibold text-sm">Name:</span>
              <span className="text-gray-700 text-sm">{publisher.firstname} {publisher.lastname}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors">
              <span className="text-indigo-700 font-semibold text-sm">Email:</span>
              <span className="text-gray-700 text-sm">{publisher.email}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors">
              <span className="text-indigo-700 font-semibold text-sm">Publishing House:</span>
              <span className="text-gray-700 text-sm">{publisher.publishingHouse}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors">
              <span className="text-indigo-700 font-semibold text-sm">Status:</span>
              <span className="text-gray-700 text-sm">{publisher.status.charAt(0).toUpperCase() + publisher.status.slice(1)}</span>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={openEditProfile} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:brightness-110 hover:-translate-y-1 transition-all font-semibold text-sm uppercase">
              <FaUser className="mr-2" /> Edit Profile
            </button>
            <button onClick={handleLogout} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 hover:-translate-y-1 transition-all font-semibold text-sm uppercase">
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Books Section */}
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            {soldBooks.length > 0 ? (
              soldBooks.map((book) => (
                <div key={book._id} className="grid md:grid-cols-[120px_1fr_200px] gap-6 p-5 mb-5 bg-white rounded-lg shadow-md hover:shadow-xl hover:translate-x-2 transition-all slide-in border border-purple-100">
                  <img src={book.images[0] || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=120"} alt={book.title} className="w-32 h-40 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform" />
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-purple-600">{book.title}</h4>
                    <p className="text-gray-600 text-sm"><strong>Author:</strong> {book.author}</p>
                    <p className="text-gray-600 text-sm"><strong>Genre:</strong> {book.genre}</p>
                    <p className="text-gray-600 text-sm"><strong>Price:</strong> ₹{book.basePrice}</p>
                    <p className="text-gray-600 text-sm"><strong>Quantity Sold:</strong> {book.totalQuantity}</p>
                    <p className="text-gray-600 text-sm"><strong>Revenue:</strong> ₹{book.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col gap-3 justify-center">
                    <button onClick={() => openEditBookModal(book)} className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      <FaUser className="mr-2" /> Edit Book
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No books sold yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div id="edit-profile-modal" className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleEditProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Publishing House</label>
                <input
                  type="text"
                  name="publishingHouse"
                  value={editForm.publishingHouse}
                  onChange={(e) => setEditForm({ ...editForm, publishingHouse: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showBookEditModal && (
        <div id="edit-book-modal" className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Book Details</h3>
              <button onClick={() => setShowBookEditModal(false)} className="text-gray-600 hover:text-gray-900">
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleEditBookSubmit} className="space-y-4">
              <input type="hidden" value={selectedBook?._id} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editBookForm.title}
                  onChange={(e) => setEditBookForm({ ...editBookForm, title: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  name="author"
                  value={editBookForm.author}
                  onChange={(e) => setEditBookForm({ ...editBookForm, author: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows="4"
                  name="description"
                  value={editBookForm.description}
                  onChange={(e) => setEditBookForm({ ...editBookForm, description: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Genre</label>
                <select
                  name="genre"
                  value={editBookForm.genre}
                  onChange={(e) => setEditBookForm({ ...editBookForm, genre: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Genre</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                <input
                  type="number"
                  name="basePrice"
                  value={editBookForm.basePrice}
                  onChange={(e) => setEditBookForm({ ...editBookForm, basePrice: e.target.value })}
                  step="1"
                  min="0"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={editBookForm.totalQuantity}
                  onChange={(e) => setEditBookForm({ ...editBookForm, totalQuantity: e.target.value })}
                  step="1"
                  min="0"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  name="images"
                  value={editBookForm.images}
                  onChange={(e) => setEditBookForm({ ...editBookForm, images: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setShowBookEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">PubliShelf</span>
              <p className="text-sm mt-2">© 2025 PubliShelf. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/terms" className="text-gray-300 hover:text-purple-400 text-sm">Terms and Conditions</a>
              <a href="/privacy" className="text-gray-300 hover:text-purple-400 text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;