import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "./components/Hero";
import StatsSection from "./components/StatsSection";
import AboutSection from "./components/AboutSection";
import FeaturedBooks from "./components/FeaturedBooks";
import OpportunitiesSection from "./components/OpportunitiesSection";
import FAQSection from "./components/FAQSection";
import Footer from "../components/Footer";
import axiosInstance from "../../../utils/axiosInstance.util";

const Home = () => {
  const [data, setData] = useState({
    newlyBooks: [],
    mostSoldBooks: [],
    trendingBooks: [],
    metrics: { booksAvailable: 0, activeReaders: 0, publishers: 0, booksSold: 0 },
  });
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/home/data");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch home data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      <Hero />
      <StatsSection data={data.metrics} loading={loading} />
      <AboutSection />
      <FeaturedBooks 
        newlyBooks={data.newlyBooks} 
        mostSoldBooks={data.mostSoldBooks} 
        trendingBooks={data.trendingBooks}
        loading={loading}
      />
      <OpportunitiesSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Home;
