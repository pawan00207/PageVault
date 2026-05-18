  //client/src/pages/auth/login/AdminLogin.jsx
  import React, { useEffect, useState } from "react";
  import { useForm } from "react-hook-form";
  import { Link, useNavigate } from "react-router-dom";
  import { useDispatch, useSelector } from "react-redux";
  import { loginAdmin } from "../../../services/admin.services";
  import { setAuth } from "../../../store/slices/authSlice";
  import { setUser } from "../../../store/slices/userSlice";

  const AdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, role } = useSelector((state) => state.auth);

    const {
      register,
      handleSubmit,
      trigger,
      formState: { errors },
    } = useForm({ mode: "onBlur" });

    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    /* Redirect admin if already authenticated */
    useEffect(() => {
      if (isAuthenticated && role === "admin") {
        navigate("/admin/dashboard");
      }
    }, [isAuthenticated, role, navigate]);

    /* ---------------------- FORM SUBMIT ---------------------- */
    const onSubmit = async (data) => {
      setServerError("");
      setLoading(true);

      try {
        const response = await loginAdmin({
          adminKey: data.adminKey.trim(),
        });

        if (response.success && response.data) {
          dispatch(setAuth({ isAuthenticated: true, role: "admin" }));
          dispatch(setUser(response.data.admin));
          navigate("/admin/dashboard", { replace: true });
        } else {
          setServerError(response.message || "Login failed");
        }
      } catch (err) {
        setServerError(err.response?.data?.message || "Invalid admin key");
      }

      setLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-md w-full">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-block">
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                PubliShelf
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Admin Access</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your admin key to continue</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">

            {/* Security Notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start">
                <i className="fas fa-shield-alt text-purple-600 mt-0.5 mr-3"></i>
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">Security Notice</p>
                  <p>This is a restricted area. Unauthorized access attempts are logged and monitored.</p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Admin Key Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Key</label>

                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-key text-gray-400"></i>
                  </div>

                  <input
                    type="password"
                    placeholder="Enter your admin key"
                    autoFocus
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 
                              rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                              focus:border-transparent placeholder-gray-400 transition-all duration-300"
                    {...register("adminKey", {
                      required: "Admin key is required.",
                      minLength: {
                        value: 6,
                        message: "Admin key must be at least 6 characters.",
                      },
                      validate: {
                        noSpaces: (v) =>
                          v.trim() === v || "Admin key cannot start or end with spaces.",
                      },
                    })}
                    onBlur={() => trigger("adminKey")}
                  />
                </div>

                {errors.adminKey && (
                  <p className="text-red-500 text-sm">{errors.adminKey.message}</p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  Only authorized personnel with valid admin key can access this system
                </p>
              </div>

              {/* Global Server Error */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                  <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
                  <span className="text-sm text-red-800">{serverError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm 
                  text-sm font-medium text-white ${
                    loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
                  transition-all duration-300 transform hover:-translate-y-0.5`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Authenticating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i> Access Admin Panel
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                <i className="fas fa-arrow-left mr-1"></i>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default AdminLogin;
