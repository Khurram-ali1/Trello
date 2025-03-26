import React, { useContext, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Plus, X } from "react-feather";
import { Popover } from "react-tiny-popover";
import { BoardContext } from "../context/BoardContext";
import axios from "axios";

function Sidebar() {
  const blankBoard = {
    name: "",
    bgcolor: "#000000",
    lists: [],
  };
  
  const [boardData, setBoardData] = useState(blankBoard);
  const [collapsed, setCollapsed] = useState(false);
  const [showpop, setShowPop] = useState(false);
  const { allboard, setAllBoard, fetchBoards, setActiveBoard } = useContext(BoardContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const addBoard = async () => {
    if (!boardData.name.trim()) {
      setError("Board title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: boardData.name,
        background_color_code: boardData.bgcolor,
        owner_id: 1,
      };

      const response = await axios.post(
        "https://trello.testserverwebsite.com/api/boards",
        payload,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.status === 1) {
        const newBoard = {
          id: response.data.board.board_id,
          name: response.data.board.name,
          bgcolor: response.data.board.background_color_code,
          isActive: false,
          lists: []
        };

        setAllBoard((prev) => ({
          ...prev,
          boards: [...prev.boards, newBoard],
          active: newBoard.id,
        }));

        setBoardData(blankBoard);
        setShowPop(false);
      }
    } catch (error) {
      console.error("Error creating board:", error);
      setError(error.response?.data?.message || "Failed to create board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`backdrop-blur-sm h-[96vh] bg-[#464847b9] transition-all linear duration-500 overflow-y-auto custom-scrollbar flex-shrink-0 ${
        collapsed ? "w-[40px]" : "w-[280px]"
      }`}
      style={{
        backgroundColor:
          allboard.active === null
            ? "#464847c4"
            : allboard.boards?.find((b) => b.id === allboard.active)?.bgcolor +
                "cc" || "#5d5b5fcc",
      }}
    >
      <div className="flex flex-col h-full">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mx-2 my-1 rounded">
            <p>{error}</p>
          </div>
        )}

        {collapsed ? (
          <div className="p-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-gray-500 rounded-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div>
            <div className="workspace p-3 flex justify-between border-b border-b-[#9fadbc29]">
              <h4>Remote Dev's Workspace</h4>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hover:bg-gray-500 rounded-sm p-1"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="boardlist">
              <div className="flex justify-between px-3 py-2">
                <h4>Your Boards</h4>
                <Popover
                  isOpen={showpop}
                  align="start"
                  positions={["right", "top", "bottom", "left"]}
                  content={
                    <div className="ml-2 p-2 w-60 flex flex-col justify-center items-center bg-[#f1f2f4] text-black rounded">
                      <button
                        onClick={() => {
                          setShowPop(false);
                          setError(null);
                        }}
                        className="absolute right-2 top-2 hover:text-white hover:bg-gray-500 p-1 rounded"
                      >
                        <X size={16} />
                      </button>
                      <h4 className="py-3">Create Board</h4>
                      <img
                        src="https://placehold.co/200x128/png"
                        alt="Placeholder"
                      />
                      <div className="mt-3 flex flex-col items-start w-full">
                        <label htmlFor="title">
                          Board Title <span>*</span>
                        </label>
                        <input
                          value={boardData.name}
                          onChange={(e) => {
                            setBoardData({
                              ...boardData,
                              name: e.target.value,
                            });
                            setError(null);
                          }}
                          type="text"
                          className="mb-2 h-8 w-full px-2 bg-white text-black outline-none"
                          placeholder="Enter board title"
                          required
                        />

                        <label htmlFor="bgcolor">Board Color</label>
                        <input
                          value={boardData.bgcolor}
                          onChange={(e) =>
                            setBoardData({
                              ...boardData,
                              bgcolor: e.target.value,
                            })
                          }
                          type="color"
                          className="mb-2 h-8 w-full px-2 bg-white"
                        />
                        <button
                          onClick={addBoard}
                          className="w-full h-8 rounded bg-[#464847c4] text-white mt-2 hover:bg-gray-500 disabled:opacity-50"
                          disabled={loading}
                        >
                          {loading ? "Creating..." : "Create"}
                        </button>
                      </div>
                    </div>
                  }
                >
                  <button
                    onClick={() => {
                      setShowPop(!showpop);
                      setError(null);
                    }}
                    className="hover:bg-gray-500 rounded-sm p-1"
                  >
                    <Plus size={16} />
                  </button>
                </Popover>
              </div>
            </div>

            {loading && !allboard.boards.length ? (
              <div className="p-4 text-center">Loading boards...</div>
            ) : (
              <ul>
                {allboard.boards.map((board) => (
                  <li key={board.id}>
                    <button
                      onClick={() => setActiveBoard(board.id)}
                      className={`px-3 py-2 w-full text-sm flex justify-start align-baseline hover:bg-gray-500 ${
                        board.id === allboard.active ? "bg-gray-600" : ""
                      }`}
                    >
                      <span
                        className="w-6 h-max rounded-sm mr-2"
                        style={{ backgroundColor: board.bgcolor }}
                      >
                        &nbsp;
                      </span>
                      <span>{board.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;