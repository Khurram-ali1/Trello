import React from 'react'
import { useState } from 'react'

const Footer = () => {
   
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  return (
    <div>
       
 <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1100,
          background: "#007bff",
          color: "white",
          padding: "10px 20px",
          borderRadius: "20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {isChatbotOpen ? "X" : "💬"}
      </button>

      {/* Chatbot Iframe */}
      <iframe
        src="https://chatapp-khurram.netlify.app/"
        style={{
          position: "fixed",
          bottom: "50px",
          right: "-10px",
          zIndex: 1000,
          height: "700px",
          width: "550px",
          border: "none",
          pointerEvents: isChatbotOpen ? "auto" : "none", // Enable interaction only when open
          opacity: isChatbotOpen ? 1 : 0, // Hide visually when closed
          transition: "opacity 0.3s ease-in-out",
        }}
      ></iframe>
    </div>
  )
}

export default Footer