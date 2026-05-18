import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../store/hooks";

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();  
  return (
  <section className="pt-40 pb-12 bg-gradient-to-b from-purple-50 to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in mt-16">
          Discover Your Next Literary Adventure
        </h1>
        <p className="md:text-xl text-gray-600 mb-8 animate-fade-in-delay">
          Join thousands of readers in the world's most vibrant book marketplace
        </p>
        <div className="h-7" />
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 animate-fade-in-delay-2 px-4">
          <button
            disabled={isAuthenticated}
            onClick={() => navigate("/buyer/signup")}
            className="bg-purple-600 text-white px-6 sm:px-8 py-3 font-semibold rounded-lg hover:bg-purple-700 transform transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            Start Reading
          </button>
          <button
            disabled={isAuthenticated}
            onClick={() => navigate("/publisher/signup")}
            className="bg-white text-purple-600 px-6 sm:px-8 py-3 font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transform transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            Sell Your Books
          </button>
          <button
            disabled={isAuthenticated}
            onClick={() => navigate("/manager/signup")}
            className="bg-indigo-500 text-white px-6 sm:px-8 py-3 font-semibold rounded-lg hover:bg-indigo-600 transform transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            Join as Manager
          </button>
        </div>
      </div>
    </div>
  </section>
)};

export default Hero;
