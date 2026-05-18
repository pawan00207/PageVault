import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { searchBooks } from "../../../services/buyer.services.js";
import BookGrid from "./components/BookGrid.jsx";
import { useDispatch } from "react-redux";
import { addToWishlistThunk, removeFromWishlistThunk } from "../../../store/slices/wishlistSlice";
import { useWishlist } from "../../../store/hooks";
import Pagination from "../../../components/Pagination";

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden skeleton-shimmer animate-fade-in">
    <div className="w-full h-40 md:h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        </div>
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
      </div>
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
    {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

const SearchPage = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useWishlist();
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentCategory, setCurrentCategory] = useState("All Books");
  const [currentPriceFilter, setCurrentPriceFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await searchBooks(q);
        if (r.success) setAllBooks(r.data.books || []);
        else setError(r.message);
      } catch {
        setError("Failed to fetch books");
      } finally {
        setLoading(false);
      }
    })();
  }, [q]);

  useEffect(() => {
    if (!allBooks.length) return;
    let f = [...allBooks];
    if (currentCategory !== "All Books") f = f.filter(b => b.genre?.toLowerCase().includes(currentCategory.toLowerCase()));
    const price = {
      under500: b => (b.price || 0) < 500,
      "500-1000": b => (b.price || 0) >= 500 && (b.price || 0) <= 1000,
      "1000-2000": b => (b.price || 0) >= 1000 && (b.price || 0) <= 2000,
      "2000-3000": b => (b.price || 0) >= 2000 && (b.price || 0) <= 3000,
      over3000: b => (b.price || 0) > 3000,
    };
    if (currentPriceFilter !== "all") f = f.filter(price[currentPriceFilter]);
    const sorters = {
      "price-asc": (a, b) => (a.price || 0) - (b.price || 0),
      "price-desc": (a, b) => (b.price || 0) - (a.price || 0),
      "rating-asc": (a, b) => (a.rating || 0) - (b.rating || 0),
      "rating-desc": (a, b) => (b.rating || 0) - (a.rating || 0),
      "quantity-asc": (a, b) => (a.quantity || 0) - (b.quantity || 0),
      "quantity-desc": (a, b) => (b.quantity || 0) - (a.quantity || 0),
      newest: (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
    };
    if (currentSort !== "relevance") f.sort(sorters[currentSort]);
    setBooks(f);
    setCurrentPage(1);
  }, [allBooks, currentCategory, currentPriceFilter, currentSort]);

  const handlePageChange = p => {
    setPageLoading(true);
    const el = document.getElementById("filters-sorts");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 100, behavior: "smooth" });
    setTimeout(() => {
      setCurrentPage(p);
      setPageLoading(false);
    }, 500);
  };

  const paginatedBooks = books.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);

  const handleWishlistAdd = id => {
    const exist = wishlistItems.some(i => i._id === id);
    if (exist) {
      dispatch(removeFromWishlistThunk(id))
        .unwrap()
        .then(() => toast.success("Removed from Wishlisted"))
        .catch(() => toast.error("Failed"));
    } else {
      dispatch(addToWishlistThunk({ bookId: id, book: books.find(b => b._id === id) }))
        .unwrap()
        .then(() => toast.success("Added to Wishlist"))
        .catch(() => toast.error("Failed"));
    }
  };

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div id="filters-sorts" className="pt-16">
        <div className="bg-white border-b border-gray-300">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8 py-4">
              {["All Books","Fiction","Non-Fiction","Mystery","Science Fiction","Romance","Thriller","Other"].map(c => (
                <Link key={c} to="#" onClick={e=>{e.preventDefault();setCurrentCategory(c);}}
                  className={currentCategory===c?"text-purple-600 border-b-2 border-purple-600 pb-4 -mb-4":"text-gray-600 hover:text-purple-600"}>
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xs px-4 py-3">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Filter & Sort Books</h2>
              <p className="text-sm text-gray-500 hidden sm:block">Refine your results</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select value={currentSort} onChange={e=>setCurrentSort(e.target.value)}
                  className="px-4 py-2.5 pr-10 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-purple-500 cursor-pointer">
                  <option value="relevance">Relevance</option><option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option><option value="rating-desc">Rating: High → Low</option>
                  <option value="rating-asc">Rating: Low → High</option><option value="quantity-desc">Qty: High → Low</option>
                  <option value="quantity-asc">Qty: Low → High</option><option value="newest">Newest</option>
                </select>
              </div>

              <div className="relative">
                <select value={currentPriceFilter} onChange={e=>setCurrentPriceFilter(e.target.value)}
                  className="px-4 py-2.5 pr-10 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-purple-500 cursor-pointer">
                  <option value="all">All Prices</option><option value="under500">Under ₹500</option>
                  <option value="500-1000">₹500–₹1000</option><option value="1000-2000">₹1000–₹2000</option>
                  <option value="2000-3000">₹2000–₹3000</option><option value="over3000">Over ₹3000</option>
                </select>
              </div>

              <button onClick={()=>{setCurrentCategory("All Books");setCurrentPriceFilter("all");setCurrentSort("relevance");}}
                className="px-4 py-2 text-sm text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50">
                Reset
              </button>
            </div>
          </div>

          <div id="search-results">
            {(loading || pageLoading) ? (
              <SkeletonGrid />
            ) : (
              <div className="transition-opacity duration-500 opacity-100">
                <BookGrid books={paginatedBooks} onWishlistAdd={handleWishlistAdd} />
              </div>
            )}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
