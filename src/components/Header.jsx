import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/bmybrand_logo.png";
import DefaultProfile from "../assets/profile.png";
import { Search, ChevronDown, LogOut, User, Settings, HelpCircle } from "react-feather";
import "../../src/App.css";

function Header() {
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    profilePicture: ""
  });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user data when component mounts
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        
        if (!token) {
          console.error("No authentication token found");
          return;
        }
  
        const response = await axios.get(
          "https://trello.testserverwebsite.com/api/user", 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
  
        // Properly access the nested user data
        if (response.data?.status === 1 && response.data?.data?.user) {
          const user = response.data.data.user;
          setUserData({
            name: user.name,  // This will be "john" from the API
            email: user.email, // This will be "johndoe@gmail.com"
            profilePicture: DefaultProfile // Default since no picture in API
          });
        } else {
          console.error("Unexpected API response structure");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

   // Search Data with Titles and Categories
   const suggestions = [
    { name: "My Trello Board", category: "Project Management" },
    { name: "Web Development", category: "Software Engineering" },
    { name: "Web Designing", category: "UI/UX Design" },
    { name: "React JS", category: "Frontend Development" },
    { name: "Node JS", category: "Backend Development" },
    { name: "Express JS", category: "Backend Development" },
    { name: "MongoDB", category: "Database Management" },
    { name: "MySQL", category: "Database Management" },
    { name: "PostgreSQL", category: "Database Management" },
    { name: "Firebase", category: "Cloud Services" },
    { name: "AWS", category: "Cloud Services" },
    { name: "Heroku", category: "Cloud Deployment" },
    { name: "Trello", category: "Task Management" },
    { name: "Asana", category: "Task Management" },
    { name: "Jira", category: "Agile Development" },
    { name: "Monday.com", category: "Productivity Tools" },
    { name: "Notion", category: "Productivity Tools" },
  ];

  // Filtered suggestions based on search input
  const filteredSuggestions = suggestions.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="bg-white w-full h-12 px-4 border-b border-[#9fadbc29] flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center">
        <img src={Logo} alt="Brand Logo" width={120} />
      </div>

      <div className="flex items-center space-x-3 text-gray-700">
        {/* Search Bar */}
        <div className={`relative transition-all duration-300 ${isFocused ? "w-126" : "w-64"}`}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="pl-10 pr-3 py-1.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>

          {/* Suggestions Dropdown */}
          {isFocused && filteredSuggestions.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-300 shadow-lg rounded-lg p-2 z-50 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <div className="p-2 font-semibold text-[11px] text-gray-600 border-b border-gray-300">
                RECENT BOARDS
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-1 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => setSearchText(suggestion.name)}
                >
                  <div className="text-[18px] font-medium text-gray-800">
                    {suggestion.name}
                  </div>
                  <div className="text-[12px] text-gray-500">
                    {suggestion.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading ? (
          <div className="flex items-center space-x-2 relative">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 shadow-md overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src={userData.profilePicture} 
                  alt="Profile" 
                  onError={(e) => {
                    e.target.src = DefaultProfile;
                  }}
                />
              </div>
              <span className="font-medium">{userData.name}</span>
              <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* User Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                </div>
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User size={14} className="mr-2" />
                  Profile
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings size={14} className="mr-2" />
                  Settings
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <HelpCircle size={14} className="mr-2" />
                  Help
                </a>
                <div className="border-t border-gray-200"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={14} className="mr-2" />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;