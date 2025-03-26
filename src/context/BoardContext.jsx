import { createContext, useState, useEffect, useCallback } from "react";

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
  fetchCardsForList: () => Promise.resolve({ success: false }),
});

// Helper functions
const getAuthToken = () => localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

const handleApiError = (error) => {
  if (error.name === 'AbortError') {
    console.log('Request aborted');
    return { success: false, aborted: true };
  }
  console.error('API Error:', error);
  return { success: false, error: error.message };
};

const fetchApi = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) throw new Error("No authentication token found");
    
    const response = await fetch(`https://trello.testserverwebsite.com${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    console.log("API Response:", { endpoint, status: response.status, data });

    if (!response.ok) {
      // Include server validation errors if available
      const errorMsg = data.message || 
                      (data.errors ? JSON.stringify(data.errors) : `HTTP ${response.status}`);
      throw new Error(errorMsg);
    }

    return { success: true, data };
  } catch (error) {
    console.error("API Error Details:", {
      endpoint,
      error: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
};

export const BoardProvider = ({ children }) => {
  const [allboard, setAllBoard] = useState(() => {
    const saved = localStorage.getItem('boardState');
    return saved ? JSON.parse(saved) : { boards: [], active: null };
  });

  // Debounced localStorage saving
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('boardState', JSON.stringify(allboard));
    }, 500);
    return () => clearTimeout(timer);
  }, [allboard]);

  const fetchBoards = useCallback(async () => {
    const result = await fetchApi('/api/boards');
    if (!result.success) return result;

    const boardsData = result.data?.data || [];
    setAllBoard(prev => ({
      ...prev,
      boards: boardsData.map(board => ({
        id: board.id,
        name: board.name,
        bgcolor: board.bgcolor || "#5d5b5f",
        lists: prev.boards.find(b => b.id === board.id)?.lists || [],
      })),
      active: prev.active || boardsData[0]?.id || null,
    }));

    return { success: true };
  }, []);

  const fetchListsForBoard = useCallback(async (boardId, signal) => {
    const result = await fetchApi(`/api/lists/${boardId}`, { signal });
    if (!result.success) return result;

    setAllBoard(prev => ({
      ...prev,
      boards: prev.boards.map(board => 
        board.id === boardId
          ? {
              ...board,
              lists: Array.isArray(result.data.data) 
                ? result.data.data.map(list => ({
                    id: list.id,
                    title: list.title,
                    position: list.position,
                    items: board.lists.find(l => l.id === list.id)?.items || [],
                  }))
                : []
            }
          : board
      )
    }));

    return { success: true };
  }, []);

  const createList = async (boardId, title) => {
    try {
      // Calculate position based on existing lists
      const board = allboard.boards.find(b => b.id === boardId);
      const position = board?.lists?.length > 0 
        ? board.lists[board.lists.length - 1].position + 1000
        : 1000;
  
      const result = await fetchApi('/api/lists', {
        method: 'POST',
        body: JSON.stringify({
          board_id: boardId,
          title: title.trim(),
          position: position
        })
      });
  
      if (!result.success) {
        console.error("List creation failed:", result.error);
        return { success: false, error: result.error };
      }
  
      return { 
        success: true,
        data: {
          id: result.data.data.id,
          title: result.data.data.title,
          position: result.data.data.position,
          items: []
        }
      };
    } catch (error) {
      console.error("Error in createList:", error);
      return { success: false, error: error.message };
    }
  };

  const createCard = async (listId, title, position) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");
      
      const payload = {
        list_id: listId,
        title: title,
        position: position,
        // Add any other required fields your API expects
      };
  
      console.log("Sending card creation payload:", payload);
  
      const response = await fetch("https://trello.testserverwebsite.com/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log("API response:", data);
  
      if (!response.ok) {
        // Include more detailed error info from server if available
        throw new Error(data.message || data.error || `HTTP ${response.status} - Failed to create card`);
      }
  
      if (!data.data) {
        throw new Error("Invalid response format from server");
      }
  
      return {
        success: true,
        data: {
          id: data.data.id,
          title: data.data.title,
          position: data.data.position,
        },
      };
    } catch (error) {
      console.error("Detailed error creating card:", {
        error: error.message,
        stack: error.stack,
      });
      return { 
        success: false, 
        error: error.message,
        fullError: error // Include full error object for debugging
      };
    }
  };

  const updateCardTitle = async (cardId, newTitle) => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");
  
      // Encode the title for URL safety
      const encodedTitle = encodeURIComponent(newTitle);
      const url = `https://trello.testserverwebsite.com/api/cards/${cardId}?title=${encodedTitle}`;
  
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to update card title. Status: ${response.status}`);
      }
  
      return { 
        success: true,
        data: {
          id: data.data.id,
          title: data.data.title,
          // Include other fields you might need
        }
      };
    } catch (error) {
      console.error("Error updating card title:", error);
      return { success: false, error: error.message };
    }
  };
  

  const setActiveBoard = useCallback((boardId) => {
    setAllBoard(prev => ({
      ...prev,
      active: boardId
    }));
  }, []);

  const updateListTitle = useCallback(async (listId, newTitle) => {
    const encodedTitle = encodeURIComponent(newTitle);
    const result = await fetchApi(`/api/lists/${listId}?name=${encodedTitle}`, {
      method: 'PUT'
    });

    if (result.success) {
      setAllBoard(prev => ({
        ...prev,
        boards: prev.boards.map(board => ({
          ...board,
          lists: board.lists.map(list => 
            list.id === listId
              ? { ...list, title: newTitle }
              : list
          )
        }))
      }));
    }

    return result;
  }, []);

  const fetchCardsForList = useCallback(async (listId) => {
    const result = await fetchApi(`/api/cards/${listId}`);
    if (!result.success) return result;

    setAllBoard(prev => ({
      ...prev,
      boards: prev.boards.map(board => ({
        ...board,
        lists: board.lists.map(list => 
          list.id === listId
            ? { ...list, items: result.data.data || [] }
            : list
        )
      }))
    }));

    return { success: true };
  }, []);

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
        fetchCardsForList,
        updateCardTitle,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};