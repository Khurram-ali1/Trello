import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginImg from "../assets/LoginImg.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard", { replace: true }); // Replace in history to prevent going back
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    // Validation
    if (!formData.email || (!forgotPassword && !formData.password)) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }
  
    try {
      if (forgotPassword && resetStep) {
        // Handle password reset logic
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Passwords don't match");
        }
        // Add your password reset API call here
      } else if (forgotPassword) {
        // Handle forgot password logic
        // Add your forgot password API call here
      } else {
        // Regular login
        const response = await axios.post(
          "https://trello.testserverwebsite.com/api/login",
          {
            email: formData.email,
            password: formData.password
          }
        );
  
        // Use API response status and message
        if (response.data.status === 1) {
          // Store both token and user data
          localStorage.setItem("authToken", response.data.token || response.data.data.token);
          
          // Store user information if available in response
          if (response.data.user || response.data.data?.user) {
            localStorage.setItem("user", JSON.stringify({
              id: response.data.user?.id || response.data.data?.user?.id,
              name: response.data.user?.name || response.data.data?.user?.name,
              email: response.data.user?.email || response.data.data?.user?.email
            }));
          }
          
          navigate("/dashboard", { replace: true });
        } else {
          // If status is not 1, show the API's error message
          setError(response.data.message || "Login failed");
        }
      }
    } catch (error) {
      // Use the API's error message if available
      let errorMessage = error.response?.data?.message || 
                        error.message || 
                        "An error occurred. Please try again.";
      
      setError(errorMessage);
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left - Login Form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {forgotPassword
              ? resetStep
                ? "Update Password"
                : "Reset Password"
              : "Login"}
          </h2>

          {error && (
            <div className="p-2 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="w-full p-2 mt-1 border rounded-lg text-gray-900"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={resetStep}
                required
              />
            </div>

            {!forgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-2 mt-1 border rounded-lg text-gray-900"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {forgotPassword && resetStep && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="w-full p-2 mt-1 border rounded-lg text-gray-900"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full p-2 mt-1 border rounded-lg text-gray-900"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : forgotPassword ? (
                resetStep ? "Update Password" : "Send Reset Link"
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              className="text-blue-600 text-sm cursor-pointer hover:text-blue-800"
              onClick={() => {
                setForgotPassword(!forgotPassword);
                setResetStep(false);
                setError("");
              }}
            >
              {forgotPassword ? "Back to Login" : "Forgot Password?"}
            </button>
          </div>
        </div>

        {/* Right - Image */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-50 p-4">
          <img src={LoginImg} alt="Login Illustration" className="w-[80%] h-auto object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Login;