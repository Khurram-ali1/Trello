import React, { useState } from "react";
import Logo from "../assets/bmybrand_logo.png";
import Profile from "../assets/profile.png";
import { Search } from "react-feather";

function Header() {
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const suggestions = ["My Trello Board", "Web Development", " Web Designing", ];

  // Filtered suggestions based on input
  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase())
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
              <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-300 shadow-lg rounded-lg p-2">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => setSearchText(suggestion)} // Select suggestion on click
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <span>Remote Dev</span>

          <div className="w-10 h-10 rounded-full border-2 border-purple-500 shadow-md overflow-hidden">
            <img className="w-full h-full object-cover" src={Profile} alt="Profile Logo" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
