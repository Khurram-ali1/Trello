import React from 'react';
import Logo from '../assets/bmybrand_logo.png';
import Profile from '../assets/profile.png';

function Header() {
  return (
    <div className='bg-white w-full h-12 px-4 border-b border-[#9fadbc29] flex items-center justify-between'>
      {/* Left Side - Logo */}
      <div className="flex items-center">
        <img src={Logo} alt="Brand Logo" width={120} />
      </div>

      {/* Right Side - Profile */}
      <div className="flex items-center space-x-3 text-gray-700">
        <span>Remote Dev</span>
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 shadow-md overflow-hidden">
          <img className="w-full h-full object-cover" src={Profile} alt="Profile Logo" />
        </div>
      </div>
    </div>
  );
}

export default Header;
