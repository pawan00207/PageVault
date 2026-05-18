
import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OpportunityCard = ({ title, subtitle, features, cta, icon, badge, testimonial, to }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.classList.add("opacity-0");
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          card.classList.add("animate-fade-in");
          card.classList.remove("opacity-0");
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex flex-col justify-between p-8 rounded-2xl shadow-md bg-white hover:shadow-lg transition-shadow duration-300 min-h-[340px] group"
      style={{ position: "relative" }}
    >
      {/* Badge */}
      {badge && (
        <span className="absolute top-6 right-6 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {badge}
        </span>
      )}
      <div>
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-full bg-gray-100 mr-3">
            <i className={`fas ${icon} text-2xl text-purple-600`}></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{subtitle}</p>
        <ul className="mb-6 list-disc list-inside text-sm text-gray-700">
          {features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => navigate(to)}
        className="mt-2 px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow hover:bg-purple-700 transition-all group-hover:scale-101"
      >
        {cta}
      </button>
      {/* Testimonial */}
      {testimonial && (
        <div className="mt-6 text-xs italic text-gray-500 border-t pt-3">
          <i className="fas fa-quote-left mr-2"></i>
          {testimonial}
        </div>
      )}
    </div>
  );
};


const OpportunitiesSection = () => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Opportunities for Publishers & Managers</h2>
        <p className="text-gray-600 text-lg">Grow your business or career with PubliShelf</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <OpportunityCard
          title="For Publishers"
          subtitle="List your books, reach thousands of readers, and manage sales with ease."
          features={["No listing fees for first 10 books", "Real-time sales analytics", "Auction or fixed-price options"]}
          cta="Start Selling"
          icon="fa-store"
          badge="New"
          testimonial="“I doubled my sales in just 2 months!”"
          to="/publisher/signup"
        />
        <OpportunityCard
          title="For Managers"
          subtitle="Curate inventory, verify listings, and earn with your expertise."
          features={["Flexible remote work", "Competitive compensation", "Work with rare and popular books"]}
          cta="Apply Now"
          icon="fa-user-shield"
          badge="Hiring"
          testimonial="“Flexible work, great team, and rewarding experience.”"
          to="/manager/signup"
        />
      </div>
    </div>
  </section>
);

export default OpportunitiesSection;
