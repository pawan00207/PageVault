import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const Contact = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitted },
    reset,
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Validation helper - no leading/trailing spaces
  const noEdgeSpaces = (value) => {
    if (!value) return true;
    return value === value.trim() || "No leading or trailing spaces allowed.";
  };

  // Form submission handler
  const onSubmit = (data) => {
    // Trim all string values
    const trimmedData = {
      name: data.name.trim(),
      email: data.email.trim(),
      message: data.message.trim(),
    };
    
    // Here you would typically send the data to your backend
    console.log("Contact form submitted:", trimmedData);
    
    // Show success message
    toast.success("Your message has been sent successfully!");
    
    // Reset form
    reset();
  };

  return (
    <div className="bg-gray-50 font-sans">
    
      <Navbar/>
      <section className="pt-40 pb-12 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in">Contact Us</h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay">
              We'd love to hear from you! Reach out to us with any questions or feedback.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register("name", {
                      required: "Name is required.",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters long.",
                      },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Name should contain only letters and spaces.",
                      },
                      validate: {
                        noEdgeSpaces,
                      },
                    })}
                    className="mt-1 block w-full px-3 py-2 bg-white border-0 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:shadow-md transition-shadow"
                  />
                  {(touchedFields.name || isSubmitted) && errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address.",
                      },
                      validate: {
                        noEdgeSpaces,
                        lowercase: (value) =>
                          value === value.toLowerCase() || "Email must be lowercase.",
                      },
                    })}
                    className="mt-1 block w-full px-3 py-2 bg-white border-0 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:shadow-md transition-shadow"
                  />
                  {(touchedFields.email || isSubmitted) && errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    {...register("message", {
                      required: "Message is required.",
                      minLength: {
                        value: 10,
                        message: "Message must be at least 10 characters long.",
                      },
                      maxLength: {
                        value: 500,
                        message: "Message must not exceed 500 characters.",
                      },
                      validate: {
                        noEdgeSpaces,
                      },
                    })}
                    className="mt-1 block w-full px-3 py-2 bg-white border-0 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:shadow-md transition-shadow resize-none"
                  ></textarea>
                  {(touchedFields.message || isSubmitted) && errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <div>
                  <button 
                    type="submit" 
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:translate-y-[-2px] transition-all duration-500 linear w-full"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 animate-fade-in-delay">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600 mb-4">Have questions or need assistance? We're here to help!</p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-purple-600 mr-2"></i>
                  <span className="text-gray-600">IIIT Sri City, Boys Hostel-3, Gnan Marg Circle</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-phone text-purple-600 mr-2"></i>
                  <span className="text-gray-600">+91 80992 69269</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-envelope text-purple-600 mr-2"></i>
                  <span className="text-gray-600">publishelf07@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Contact;