import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginImg from "../assets/LoginImg.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (forgotPassword && !resetStep) {
      console.log("Reset password request for:", email);
      alert("A password reset link has been sent to your email!");
      setResetStep(true);
      return;
    }

    if (forgotPassword && resetStep) {
      if (!newPassword || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      console.log("Password updated for:", email);
      alert("Your password has been updated successfully!");
      setForgotPassword(false);
      setResetStep(false);
      setNewPassword("");
      setConfirmPassword("");
      setPassword("");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setError("");
    console.log("Logging in with:", { email, password });
    navigate("/trello");
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                className="w-full p-2 mt-1 border rounded-lg text-gray-900"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={resetStep}
              />
            </div>

            {!forgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="w-full p-2 mt-1 border rounded-lg text-gray-900"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {forgotPassword && resetStep && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    className="w-full p-2 mt-1 border rounded-lg text-gray-900"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full p-2 mt-1 border rounded-lg text-gray-900"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {forgotPassword
                ? resetStep
                  ? "Update Password"
                  : "Send Reset Link"
                : "Login"}
            </button>
          </form>

          
          <div className="text-center mt-4">
            <button
              className="text-blue-600 text-sm cursor-pointer"
              onClick={() => {
                setForgotPassword(!forgotPassword);
                setResetStep(false);
              }}
            >
              {forgotPassword ? "Back to Login" : "Forgot Password?"}
            </button>
          </div>
        </div>

        
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-50 p-4">
          <img src={LoginImg} alt="Login Illustration" className="w-[80%] h-auto object-contain" />
        </div>

      </div>
    </div>
  );
};

export default Login;
