import React, { useState, useContext } from 'react';
import { X } from 'react-feather';
import { BoardContext } from '../context/BoardContext';
import { useNavigate } from 'react-router-dom';

const WorkspaceModal = ({ onClose }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createWorkspace, fetchAllWorkspaces } = useContext(BoardContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const result = await createWorkspace(workspaceName);
      
      if (result.success) {
        const newWorkspace = {
          id: result.data.id,
          boards: [],
          active: null,
        };

        const savedWorkspaces = JSON.parse(localStorage.getItem('trello-workspaces')) || [];
        localStorage.setItem('trello-workspaces', JSON.stringify([...savedWorkspaces, newWorkspace]));

        await fetchAllWorkspaces();
        onClose();
        navigate(`/workspace/${result.data.id}`);
      } else {
        setError(result.error || 'Failed to create workspace');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#000000d8]" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg w-180 relative text-black" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 hover:text-white hover:bg-gray-500 rounded-sm p-1 cursor-pointer"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Create a Workspace</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error.includes('HTML') ? (
              <>
                Server configuration error. Please try again later.
                <div className="text-xs mt-1">(Technical error: {error.substring(0, 100)})</div>
              </>
            ) : (
              error
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full font-medium p-2 border rounded"
              placeholder="My Workspace"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading || !workspaceName.trim()}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceModal;