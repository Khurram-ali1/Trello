import React, { useState } from "react";
import { X } from "react-feather"; // Import the X icon

const WorkspaceModal = ({ onClose }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle workspace creation logic here
    console.log("Workspace Name:", workspaceName);
    console.log("Workspace Type:", workspaceType);
    console.log("Workspace Description:", workspaceDescription);
    onClose(); // Close the modal after submission
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#000000d8]"
      onClick={onClose} // Close the modal when clicking outside
    >
      <div
        className="bg-white p-6 rounded-lg w-180 relative text-black"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        {/* Cross Icon */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Create a Workspace</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full font-medium p-2 border rounded"
              placeholder="Jacob’s Co."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              This is the name of your company, team or organization.
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Workspace Type</label>
            <select
              value={workspaceType}
              onChange={(e) => setWorkspaceType(e.target.value)}
              className="w-full font-medium p-2 border rounded"
              required
            >
              <option value="">Choose...</option>
              <option value="Marketing">Marketing</option>
              <option value="Engineering">Development</option>
              <option value="Design">Design</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Workspace Description (Optional)
            </label>
            <textarea
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              className="w-full font-medium p-2 border rounded"
              placeholder="Our team organizes everything here."
            />
            <p className="text-sm text-gray-500 mt-1">
              Get your members on board with a few words about your Workspace.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose} // Close the modal when Cancel is clicked
              className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceModal;