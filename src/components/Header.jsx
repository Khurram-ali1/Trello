import React, { useState } from "react";
import Logo from "../assets/bmybrand_logo.png";
import Profile from "../assets/profile.png";
import { Search } from "react-feather";
import "../../src/App.css";

function Header() {
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
    <>
      <div className="bg-white w-full h-12 px-4 border-b border-[#9fadbc29] flex items-center justify-between">
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
                className="pl-10 pr-3 py-1.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring transition-all duration-300"
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
                    onMouseDown={() => setSearchText(suggestion.name)} // Select on click
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

          <span>Khurram Ali</span>

          <div className="w-10 h-10 rounded-full border-2 border-purple-500 shadow-md overflow-hidden">
            <img className="w-full h-full object-cover" src={Profile} alt="Profile Logo" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
