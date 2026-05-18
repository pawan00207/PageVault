import React, { useState, useRef, useEffect } from "react";


const FAQ_TABS = [
  {
    key: "buyer",
    label: "Buyers",
    faqs: [
      {
        question: "How do I buy a book?",
        answer: "Browse listings, add to cart, and checkout securely. Auctions allow bidding for rare books.",
      },
      {
        question: "Are books verified/authentic?",
        answer: "Yes, our managers verify rare and collectible books for authenticity.",
      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept all major credit cards, UPI, PayPal, and more.",
      },
    ],
  },
  {
    key: "publisher",
    label: "Publishers",
    faqs: [
      {
        question: "How do I list my books?",
        answer: "Sign up as a publisher, upload book details and images, set price or auction, and publish.",
      },
      {
        question: "What are the fees?",
        answer: "No listing fees for first 10 books. Commission applies on sales.",
      },
      {
        question: "How do I track my sales?",
        answer: "Use your dashboard for real-time analytics and order management.",
      },
    ],
  },
  {
    key: "manager",
    label: "Managers",
    faqs: [
      {
        question: "How do I become a manager?",
        answer: "Apply via the manager signup page. We review credentials and book expertise.",
      },
      {
        question: "What are my responsibilities?",
        answer: "Verify listings, curate inventory, and ensure authenticity for buyers.",
      },
      {
        question: "Is the work remote?",
        answer: "Yes, managers work remotely and flexibly.",
      },
    ],
  },
];

const FAQItem = ({ item, open, onClick, idx }) => {
  useEffect(() => {
    // No debug logs
  }, [open]);
  const appliedClass = `faqContentStyle overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-40 opacity-100 py-2' : 'max-h-0 opacity-0 py-0'}`;

  return (
    <div className="faqBtnStyle">
      <button
        className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer focus:outline-none"
        onClick={onClick}
        aria-expanded={open}
        aria-controls={`faq-content-${idx}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
      >
        <span className="font-semibold">{item.question}</span>
        <i className={`fas fa-chevron-${open ? "up" : "down"}`}></i>
      </button>
      <div
        id={`faq-content-${idx}`}
        className={appliedClass}
      >
        <p className="text-gray-600">{item.answer}</p>
      </div>
    </div>
  );
}

const FAQSection = () => {
  const [activeTab, setActiveTab] = useState("buyer");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  const faqs = FAQ_TABS.find((tab) => tab.key === activeTab)?.faqs || [];
  const filteredFaqs = faqs.filter((item) =>
    item.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="faq-section" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          {/* Tabs for user roles */}
          <div className="flex justify-center gap-2 mb-6">
            {FAQ_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm focus:outline-none
                  ${activeTab === tab.key
                    ? "bg-purple-600 text-white shadow"
                    : "bg-gray-100 text-purple-700 hover:bg-purple-50"}
                `}
                onClick={() => {
                  setActiveTab(tab.key);
                  setOpenIndex(null);
                  setSearch("");
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Search/filter input */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <div className="space-y-4">
            {filteredFaqs.length === 0 && (
              <div className="text-center text-gray-400 py-8">No questions found.</div>
            )}
            {filteredFaqs.map((item, idx) => (
              <FAQItem
                key={idx}
                item={item}
                open={openIndex === idx}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                idx={idx}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default FAQSection;
