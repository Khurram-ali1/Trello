import React, { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "react-feather";
import Header from "./Header"; // Import the Header component
import WorkspaceModal from "./WorkspaceModal";
import img1 from "../assets/Background.jpg";
import img2 from "../assets/Board.jpg";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false); // State for collapsed sidebar
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  return (
    <div className="flex flex-col h-screen font-bold">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`backdrop-blur-sm bg-[#464847b9] shadow-md p-4 transition-all duration-300  ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Collapse/Expand Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-gray-500 rounded-sm p-1"
            >
              {collapsed ? (
                <ChevronRight size={18} className="text-white" />
              ) : (
                <ChevronLeft size={18} className="text-white" />
              )}
            </button>
          </div>

          {/* Sidebar Content */}
          {!collapsed && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-white">Trello</h2>
              <nav>
                <ul className="space-y-2">
                  <li className="p-2 bg-blue-500 font-bold rounded text-white">
                    Boards
                  </li>
                  <li className="p-2 hover:bg-gray-500 font-bold rounded text-white">
                    Templates
                  </li>
                  <li className="p-2 hover:bg-gray-500 font-bold rounded text-white">
                    Home
                  </li>
                </ul>
              </nav>
              <button
                onClick={() => setShowWorkspaceModal(true)}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Create a Workspace
              </button>
            </>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Popular Templates */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Most Popular Templates
            </h3>
            <div className="grid grid-cols-6 gap-4">
              <div
                className="relative bg-cover bg-center text-white font-bold p-4 rounded-lg cursor-pointer flex items-center justify-center h-28"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img2})`,
                }}
              >
                
                Basic Board
              </div>
              <div
                className="relative bg-cover bg-center text-white font-bold p-4 rounded-lg cursor-pointer flex items-center justify-center h-28"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img1})`,
                }}
              >
                Kanban Template
              </div>
              <div
                className="relative bg-cover bg-center text-white font-bold p-4 rounded-lg cursor-pointer flex items-center justify-center h-28"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img2})`,
                }}
              >
                
                Daily Task Management
              </div>
              <div
                className="relative bg-cover bg-center text-white font-bold p-4 rounded-lg cursor-pointer flex items-center justify-center h-28"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img1})`,
                }}
              >
              
                Remote Team Hub
              </div>
            </div>
          </section>

          {/* Recently Viewed */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recently Viewed</h3>
            <div className="grid grid-cols-6 gap-4">
              <div
                className="relative bg-cover bg-center text-white font-bold p-4 rounded-lg cursor-pointer flex items-center justify-center h-28"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img2})`,
                }}
              >
                Website Development
              </div>
              <div
                className="relative bg-cover bg-center text-white font-bold p-4 rounded-lg cursor-pointer flex items-center justify-center h-28"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img1})`,
                }}
              >
              
                Website Design
              </div>
              <div
                className="relative bg-cover bg-center text-white font-bold p-4 rounded-lg cursor-pointer flex items-center justify-center h-28"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img2})`,
                }}
              >
                
                Web Development
              </div>
            </div>
          </section>

          {/* Workspaces */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Your Workspaces</h3>
            <div className="flex flex-row items-center">
              <p className="text-white">
                You aren’t a member of any workspaces yet.
              </p>
              <div
                onClick={() => setShowWorkspaceModal(true)}
                className="text-blue-500 hover:text-blue-400 cursor-pointer flex items-center justify-center gap-2 ml-2"
              >
                <Plus size={16} /> Create a Workspace
              </div>
            </div>
          </section>
        </div>
      </div>
      {showWorkspaceModal && (
        <WorkspaceModal onClose={() => setShowWorkspaceModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
