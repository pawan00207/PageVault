import { useNavigate } from 'react-router-dom';
import { FaHome, FaBook } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-white to-gray-50 px-4">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaBook className="text-purple-200 text-6xl md:text-8xl opacity-50 animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12 animate-fade-in-delay">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Page Not Found
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for seems to have been misplaced in our digital library.
          </p>
        </div>

        {/* Home Button */}
        <div className="animate-fade-in-delay-2">
          <button
            onClick={handleGoHome}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <FaHome className="text-xl group-hover:scale-110 transition-transform duration-300" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-2 opacity-40">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
