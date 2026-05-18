import { Link } from "react-router-dom";

export const AuthHeader = ({ title, subtitle, children }) => {
  return (
    <div className="text-center mb-10">
      <Link to="/" className="inline-block">
        <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
          PubliShelf
        </span>
      </Link>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      )}
      {children}
    </div>
  );
};

export default AuthHeader;
