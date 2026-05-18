import { FaUserCircle } from "react-icons/fa";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const teamMembers = [
  {
    name: "Akash Varma",
    role: "Frontend Developer",
    desc: "Handles the design and functionality of Forms and Authentication.",
  },
  {
    name: "Ch Vinayak",
    role: "Frontend Manager",
    desc: "Drives user engagement and promotional campaigns.",
  },
  {
    name: "KL Vitesh Reddy",
    role: "Frontend Developer",
    desc: "Focuses on creating intuitive and visually appealing pages.",
  },
  {
    name: "Rithish Reddy",
    role: "Backend Developer",
    desc: "Manages server-side logic and database integration.",
  },
  {
    name: "Vishnu Vardhan",
    role: "Frontend Manager",
    desc: "Oversees the creation and management of website content.",
  },
];

const About = () => {
  return (
    <>
      <Navbar />

      <section className="about-section animate-fade-in">
        <div className="h-10"></div>
        <div className="about-container">
          <div className="about-header">
            <h1 className="about-title">About Us</h1>
            <p className="about-subtitle">
              Discover the story behind PubliShelf and our mission to connect readers and authors worldwide.
            </p>
          </div>
          <div className="about-content">
            <div className="about-card">
              <h2 className="about-card-title">Our Mission</h2>
              <p className="about-card-text">
                At PubliShelf, we believe in the power of books to transform lives. Our mission is to create a
                vibrant marketplace where readers can discover new books and authors can reach a global audience.
              </p>
              <p className="about-card-text">
                We are committed to providing a seamless experience for both buyers and sellers, ensuring that every transaction is smooth and enjoyable.
              </p>
            </div>
            <div className="about-card">
              <h2 className="about-card-title">Our Team</h2>
              <p className="about-card-text">
                Our team is made up of passionate book lovers and tech enthusiasts who are dedicated to making PubliShelf the best place to buy and sell books online.
              </p>
            </div>
          </div>

          <div className="team-section">
            <h2 className="team-title">Meet Our Team</h2>
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div className="team-card" key={index}>
                  <FaUserCircle className="team-member-img mx-auto scale-75" size={50} />
                  <h3 className="team-member-name">{member.name}</h3>
                  <p className="team-member-role">{member.role}</p>
                  <p className="team-member-desc">{member.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default About;
