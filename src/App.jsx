import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Trello from "./components/TrelloApp";
import Dashboard from "./components/Dashboard";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
    <Routes>
    <Route 
          path="/" 
          element={
            localStorage.getItem('authToken') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/trello" element={
        <ProtectedRoute>
          <Trello />
        </ProtectedRoute>
      } />
    </Routes>
  </Router>
  );
}

export default App;