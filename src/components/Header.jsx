import React from 'react';
import Logo from '../assets/bmybrand_logo.png';
import Profile from '../assets/profile.png';
import { Search } from 'react-feather';

function Header() {
  return (
    <>
    <div className='bg-white w-full h-12 px-4 border-b border-[#9fadbc29] flex items-center justify-between'>
  
  <div className="flex items-center">
    <img src={Logo} alt="Brand Logo" width={120} />
  </div>

 
  <div className="flex items-center space-x-3 text-gray-700">
    
    <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        <Search size={16} />
      </span>
      <input 
        type="text" 
        placeholder="Search..." 
        className="pl-10 pr-3 py-1.5 w-48 border border-gray-300 rounded-lg focus:outline-none focus:ring  transition-all duration-300 focus:w-96"
      />
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
