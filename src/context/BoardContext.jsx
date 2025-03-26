import { createContext, useState, useEffect } from "react";

export const BoardContext = createContext({
  allboard: {
    boards: [],
    active: null,
  },
  setAllBoard: () => {},
  fetchBoards: () => {},
  fetchListsForBoard: () => {},
  createList: () => Promise.resolve({ success: false }),
  createCard: () => Promise.resolve({ success: false }),
  setActiveBoard: () => {},
  updateListTitle: () => Promise.resolve({ success: false }),
});

export const BoardProvider = ({ children }) => {
  const [allboard, setAllBoard] = useState(() => {
    const saved = localStorage.getItem('boardState');
    return saved ? JSON.parse(saved) : {
      boards: [],
      active: null,
    };
  });

  // Fetch boards on initial load
  useEffect(() => {
    fetchBoards();
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('boardState', JSON.stringify(allboard));
  }, [allboard]);

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      console.log("Token:", token); // Debugging token
  
      const response = await fetch("https://trello.testserverwebsite.com/api/boards", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Failed to fetch boards");
  
      const responseData = await response.json();
      console.log("Full API Response:", responseData); // Debug entire response
  
      if (responseData?.data && Array.isArray(responseData.data)) {
        console.log("Boards Array:", responseData.data); // Debug boards array
        setAllBoard((prev) => ({
          ...prev,
          boards: responseData.data.map((board) => ({
            id: board.id,
            name: board.name,
            bgcolor: "#5d5b5f", // Default color since it's missing in the response
            lists: [], // Empty lists for now as they're not in the response
          })),
          active: prev.active || responseData.data?.[0]?.id || null,
        }));
      } else {
        console.error("Unexpected API response structure:", responseData);
        setAllBoard((prev) => ({
          ...prev,
          boards: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching boards:", error.message);
    }
  };
  
  

  const fetchListsForBoard = async (boardId, signal) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const response = await fetch(`https://trello.testserverwebsite.com/api/lists/${boardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch lists");
      }
  
      const data = await response.json();
      
      // Handle both cases - empty array or actual lists
      if (data.status === 1) {
        setAllBoard(prev => ({
          ...prev,
          boards: prev.boards.map(board => 
            board.id === boardId
              ? {
                  ...board,
                  lists: Array.isArray(data.data) ? data.data.map(list => ({
                    id: list.id,
                    title: list.title,
                    position: list.position,
                    items: []
                  })) : []
                }
              : board
          )
        }));
        return { success: true };
      }
      
      return { success: false, error: data.message || "Unknown error" };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Fetch error:", error.message);
        // Return success even if no lists found, but with empty array
        setAllBoard(prev => ({
          ...prev,
          boards: prev.boards.map(board => 
            board.id === boardId
              ? { ...board, lists: [] }
              : board
          )
        }));
      }
      return { success: true }; // Treat as success with empty lists
    }
  };

  const createList = async (boardId, title) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      const response = await fetch("https://trello.testserverwebsite.com/api/lists", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          board_id: boardId,
          title: title,
          position: allboard.boards.find(b => b.id === boardId)?.lists?.length || 0
        })
      });
  
      const data = await response.json();
  
      if (data.status === 1) {
        return { 
          success: true, 
          data: {
            id: data.data.id, // Use server-generated numeric ID
            title: data.data.title,
            items: []
          }
        };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createCard = async (listId, title, position) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      console.log("Creating card with:", { listId, title, position }); // Debugging

      const response = await fetch("https://trello.testserverwebsite.com/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          list_id: listId,
          title: title,
          position: position,
        }),
      });

      const data = await response.json();
      console.log("Backend response:", data); // Debugging

      if (data.status === 1) {
        console.log("Card created successfully:", data.data);
        return {
          success: true,
          data: {
            id: data.data.id,
            title: data.data.title,
            position: data.data.position,
          },
        };
      }
      return { success: false, error: data.message };
    } catch (error) {
      console.error("Error creating card:", error.message); // Debugging
      return { success: false, error: error.message };
    }
  };

  const setActiveBoard = (boardId) => {
    setAllBoard((prev) => ({
      ...prev,
      active: boardId,
      boards: prev.boards.map((board) => ({
        ...board,
        isActive: board.id === boardId,
      })),
    }));
  };

  const updateListTitle = async (listId, newTitle) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  
      if (typeof listId !== "number") {
        throw new Error("Invalid list ID format");
      }
  
      const encodedTitle = encodeURIComponent(newTitle);
      const url = `https://trello.testserverwebsite.com/api/lists/${listId}?name=${encodedTitle}`;
      console.log("PUT request URL:", url); // Debugging
  
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      console.log("Backend response data:", data); // Debugging
  
      if (!response.ok || data.status !== 1) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
  
      if (data.data.id !== listId) {
        throw new Error("Server returned mismatched list ID");
      }
  
      return { success: true, data: data.data };
  
    } catch (error) {
      console.error("Error in updateListTitle:", error.message); // Debugging
      return { success: false, error: error.message, isInvalidId: error.message.includes("Invalid list ID") };
    }
  };
  const fetchCardsForList = async (listId) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const response = await fetch(`https://trello.testserverwebsite.com/api/cards/${listId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || data.status !== 1) {
        throw new Error(data.message || `Failed to fetch cards. Status code: ${response.status}`);
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error fetching cards:", error.message);
      return { success: false, error: error.message };
    }
  };



  return (
    <BoardContext.Provider
      value={{
        allboard,
        setAllBoard,
        fetchBoards,
        fetchListsForBoard,
        createList,
        createCard,
        setActiveBoard,
        updateListTitle,
        fetchCardsForList
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
