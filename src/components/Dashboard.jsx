import React, { useState, useEffect, useContext } from "react";
import { Plus, ChevronLeft, ChevronRight } from "react-feather";
import Header from "./Header"; // Import the Header component
import WorkspaceModal from "./WorkspaceModal";
import img1 from "../assets/Background.jpg";
import img2 from "../assets/Board.jpg";
import ProtectedRoute from "./ProtectedRoute";
import { BoardContext } from "../context/BoardContext";
import { useNavigate } from "react-router-dom";
 
const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false); // State for collapsed sidebar
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [workspaceError, setWorkspaceError] = useState(null);
  const { workspaces, loading, error, fetchAllWorkspaces } =
    useContext(BoardContext);
  const navigate = useNavigate();

  // Refresh workspaces when modal closes
  const handleModalClose = () => {
    setShowWorkspaceModal(false);
    fetchAllWorkspaces();
  };
  const handleWorkspaceClick = (workspaceId) => {
    // Open in new tab with workspace-specific URL
    navigate(`/workspace/${workspaceId}`);
  };

  return (
    <ProtectedRoute>
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
                className="hover:bg-gray-500 rounded-sm p-1 cursor-pointer"
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
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Trello
                </h2>
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
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} /> Create a Workspace
                </button>
                <a href="/trello">
                  <span className="mt-4 w-full text-white py-2 rounded flex items-center justify-start gap-2 hover:text-blue-500 cursor-pointer">
                    My Trello Board
                  </span>
                </a>
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
            
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Your Workspaces
                </h2>
                <button
                  onClick={() => setShowWorkspaceModal(true)}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                >
                  <Plus size={16} /> New Workspace
                </button>
              </div>

              {/* Workspace Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => handleWorkspaceClick(workspace.id)}
                    className="relative group cursor-pointer"
                  >
                    {/* Workspace Card */}
                    <div className="h-40 rounded-lg bg-white shadow-md transition-all duration-200 group-hover:shadow-lg overflow-hidden border border-gray-200">
                      {/* Card Content */}
                      <div className="h-full flex flex-col justify-between p-4 text-black">
                        <div>
                          <h3 className="text-lg font-semibold truncate">
                            {workspace.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {workspace.description || "No description"}
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-gray-500">
                            {workspace.boards?.length || 0} boards
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            #{workspace.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {workspaces.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    You don't have any workspaces yet
                  </p>
                  <button
                    onClick={() => setShowWorkspaceModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Create Your First Workspace
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
        {showWorkspaceModal && (
          <WorkspaceModal onClose={() => setShowWorkspaceModal(false)} />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;