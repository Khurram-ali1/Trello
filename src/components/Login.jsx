import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(""); // For updating password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm new password
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(false); // Track reset process
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (forgotPassword && !resetStep) {
      // Step 1: Send reset link
      console.log("Reset password request for:", email);
      alert("A password reset link has been sent to your email!");
      setResetStep(true); // Move to next step
      return;
    }

    if (forgotPassword && resetStep) {
      // Step 2: Update password
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
      setForgotPassword(false); // Go back to login
      setResetStep(false);
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-black">
          {forgotPassword
            ? resetStep
              ? "Update Password"
              : "Reset Password"
            : "Login to Trello"}
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">Email</label>
            <input
              type="email"
              className="w-full p-2 mt-1 border rounded-lg text-black"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={resetStep} // Disable email input when updating password
            />
          </div>

          {!forgotPassword && (
            <div>
              <label className="block text-sm font-medium text-black">Password</label>
              <input
                type="password"
                className="w-full p-2 mt-1 border rounded-lg text-black"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {forgotPassword && resetStep && (
            <>
              <div>
                <label className="block text-sm font-medium text-black">New Password</label>
                <input
                  type="password"
                  className="w-full p-2 mt-1 border rounded-lg text-black"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Confirm Password</label>
                <input
                  type="password"
                  className="w-full p-2 mt-1 border rounded-lg text-black"
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

        <div className="text-center">
          {!forgotPassword ? (
            <button
              className="text-black cursor-pointer"
              onClick={() => setForgotPassword(true)}
            >
              Forgot Password?
            </button>
          ) : (
            <button
              className="text-black cursor-pointer"
              onClick={() => {
                setForgotPassword(false);
                setResetStep(false);
              }}
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
