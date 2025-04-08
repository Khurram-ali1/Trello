import { createContext, useState, useEffect, useCallback } from "react";

export const BoardContext = createContext({
  allboard: {
    boards: [],
    workspaces: [],
    active: null,
    activeWorkspace: null,
  },
  setAllBoard: () => {},
  fetchBoards: () => {},
  fetchListsForBoard: () => {},
  createList: () => Promise.resolve({ success: false }),
  createCard: () => Promise.resolve({ success: false }),
  setActiveBoard: () => {},
  updateListTitle: () => Promise.resolve({ success: false }),
  fetchCardsForList: () => Promise.resolve({ success: false }),

  setActiveWorkspace: () => {},
});

// Helper functions
const getAuthToken = () =>
  localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.id || 1;
};

const fetchApi = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `https://trello.testserverwebsite.com${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }
    );

    const data = await response.json();
    console.log("API Response:", { endpoint, status: response.status, data });

    if (!response.ok) {
      const errorMsg =
        data.message ||
        (data.errors ? JSON.stringify(data.errors) : `HTTP ${response.status}`);
      throw new Error(errorMsg);
    }

    return { success: true, data };
  } catch (error) {
    console.error("API Error Details:", {
      endpoint,
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
};

export const BoardProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allboard, setAllBoard] = useState(() => {
    const saved = localStorage.getItem("boardState");
    return saved
      ? JSON.parse(saved)
      : { boards: [], workspaces: [], active: null, activeWorkspace: null };
  });

  // Debounced localStorage saving
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("boardState", JSON.stringify(allboard));
    }, 500);
    return () => clearTimeout(timer);
  }, [allboard]);
 
  const fetchBoards = useCallback(async () => {
    const result = await fetchApi("/api/boards");
    if (!result.success) return result;

    const boardsData = result.data?.data || [];
    setAllBoard((prev) => ({
      ...prev,
      boards: boardsData.map((board) => ({
        id: board.id,
        name: board.name || board.title, // Handle both 'name' and 'title'
        bgcolor: board.bgcolor || board.background_color_code || "#5d5b5f", // Handle both
        lists: prev.boards.find((b) => b.id === board.id)?.lists || [],
      })),
      active: prev.active || boardsData[0]?.id || null,
    }));

    return { success: true };
  }, []);

  const fetchListsForBoard = useCallback(async (boardId, signal) => {
    const result = await fetchApi(`/api/lists/${boardId}`, { signal });
    if (!result.success) return result;

    setAllBoard((prev) => ({
      ...prev,
      boards: prev.boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              lists: Array.isArray(result.data.data)
                ? result.data.data.map((list) => ({
                    id: list.id,
                    title: list.title,
                    position: list.position,
                    items:
                      board.lists.find((l) => l.id === list.id)?.items || [],
                  }))
                : [],
            }
          : board
      ),
    }));

    return { success: true };
  }, []);

  const createList = async (boardId, title) => {
    try {
      // Calculate position based on existing lists
      const board = allboard.boards.find((b) => b.id === boardId);
      const position =
        board?.lists?.length > 0
          ? board.lists[board.lists.length - 1].position + 1
          : 0;

      const result = await fetchApi("/api/lists", {
        method: "POST",
        body: JSON.stringify({
          board_id: boardId,
          title: title.trim(),
          position: position,
        }),
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
          items: [],
        },
      };
    } catch (error) {
      console.error("Error in createList:", error);
      return { success: false, error: error.message };
    }
  };

  const createCard = async (listId, title, position, description) => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const payload = {
        list_id: listId,
        title: title,
        position: position,
        description: description || "",
        // Add any other required fields your API expects
      };

      console.log("Sending card creation payload:", payload);

      const response = await fetch(
        "https://trello.testserverwebsite.com/api/cards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        // Include more detailed error info from server if available
        throw new Error(
          data.message ||
            data.error ||
            `HTTP ${response.status} - Failed to create card`
        );
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
          description: data.data.description,
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
        fullError: error, // Include full error object for debugging
      };
    }
  };

  const updateCardTitle = async (cardId, newTitle, newDescription = "") => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `https://trello.testserverwebsite.com/api/cards/${cardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newTitle,
            description: newDescription, // Ensure description is included
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to update card. Status: ${response.status}`
        );
      }

      return {
        success: true,
        data: {
          id: data.data.id,
          title: data.data.title,
          description: data.data.description || "", // Ensure description is returned
        },
      };
    } catch (error) {
      console.error("Error updating card:", error);
      return { success: false, error: error.message };
    }
  };

  const setActiveBoard = useCallback((boardId) => {
    setAllBoard((prev) => ({
      ...prev,
      active: boardId,
    }));
  }, []);

  const updateListTitle = useCallback(async (listId, newTitle) => {
    const encodedTitle = encodeURIComponent(newTitle);
    const result = await fetchApi(`/api/lists/${listId}?name=${encodedTitle}`, {
      method: "PUT",
    });

    if (result.success) {
      setAllBoard((prev) => ({
        ...prev,
        boards: prev.boards.map((board) => ({
          ...board,
          lists: board.lists.map((list) =>
            list.id === listId ? { ...list, title: newTitle } : list
          ),
        })),
      }));
    }

    return result;
  }, []);

  const fetchCardsForList = useCallback(async (listId) => {
    const result = await fetchApi(`/api/cards/${listId}`);
    if (!result.success) return result;

    setAllBoard((prev) => ({
      ...prev,
      boards: prev.boards.map((board) => ({
        ...board,
        lists: board.lists.map((list) =>
          list.id === listId ? { ...list, items: result.data.data || [] } : list
        ),
      })),
    }));

    return { success: true };
  }, []);

  //move card Put API
  const moveCard = async (cardId, newListId, position) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Please login to perform this action");
      }

      const response = await fetch(
        `https://trello.testserverwebsite.com/api/cards/${cardId}/move`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            new_list_id: newListId,
            position: position,
          }),
        }
      );

      // Check for HTML responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const html = await response.text();
        console.error("Server returned HTML:", html.substring(0, 500));
        throw new Error("Server configuration error");
      }

      // Handle successful responses
      if (response.ok) {
        const responseData = await response.json();

        if (responseData.status !== 1) {
          throw new Error(responseData.message || "API operation failed");
        }

        return {
          success: true,
          data: responseData.data,
        };
      }

      // Handle error responses
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    } catch (error) {
      console.error("Move Card Error:", {
        error: error.message,
        request: { cardId, newListId, position },
      });

      // Handle authentication errors specifically
      if (error.message.includes("token") || error.message.includes("auth")) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        return {
          success: false,
          error: "Session expired. Please login again.",
          requiresLogin: true,
        };
      }

      return {
        success: false,
        error: error.message.includes("HTML")
          ? "Server is currently unavailable"
          : error.message,
      };
    }
  };

  // Add these to your BoardContext provider
  const addComment = async (cardId, content) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const userId = getCurrentUserId();
      if (!userId) throw new Error("User not found");

      const response = await fetch(
        "https://trello.testserverwebsite.com/api/comments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card_id: cardId,
            user_id: userId,
            content: content.trim(),
          }),
        }
      );

      // First check if response is HTML
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const html = await response.text();
        console.error(
          "Server returned HTML error page:",
          html.substring(0, 500)
        );
        throw new Error(
          "Server configuration error - received HTML instead of JSON"
        );
      }

      // Then try to parse JSON
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || `Server error: ${response.status}`
        );
      }

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error("Add comment error:", error);
      return {
        success: false,
        error: error.message,
        isHtmlError: error.message.includes("HTML"), // Flag for HTML errors
      };
    }
  };

  const getComments = async (cardId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `https://trello.testserverwebsite.com/api/comments/${cardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch comments");
      }

      return await response.json();
    } catch (error) {
      console.error("Get comments error:", error);
      throw error;
    }
  };

  const updateComment = async (commentId, content) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `https://trello.testserverwebsite.com/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update comment");
      }

      return await response.json();
    } catch (error) {
      console.error("Update comment error:", error);
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `https://trello.testserverwebsite.com/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }

      return true;
    } catch (error) {
      console.error("Delete comment error:", error);
      throw error;
    }
  };

  // Add to BoardContext.jsx
  const addAttachment = async (cardId, file) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const formData = new FormData();
      formData.append("card_id", cardId);
      formData.append("file", file);

      const response = await fetch(
        "https://trello.testserverwebsite.com/api/attachments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      // Check for HTML responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const html = await response.text();
        console.error("Server returned HTML:", html.substring(0, 500));
        throw new Error("Server configuration error");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const responseData = await response.json();
      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error("Add attachment error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const getAttachments = async (cardId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `https://trello.testserverwebsite.com/api/attachments/${cardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check for HTML responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const html = await response.text();
        console.error("Server returned HTML:", html.substring(0, 500));
        throw new Error("Server configuration error");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const responseData = await response.json();
      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error("Get attachments error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const deleteAttachment = async (attachmentId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `https://trello.testserverwebsite.com/api/attachments/${attachmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Delete attachment error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

// Add this method to your BoardContext
const fetchWorkspaceById = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(
      `https://trello.testserverwebsite.com/api/workspaces/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch workspace");
    }

    const data = await response.json();
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error("Get workspace error:", error);
    return { success: false, error: error.message };
  }
};

  const fetchAllWorkspaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch('https://trello.testserverwebsite.com/api/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }

      const data = await response.json();
      setWorkspaces(data.data || data); // Handle both nested and flat responses
      localStorage.setItem('trello-workspaces', JSON.stringify(data.data || data));
    } catch (err) {
      setError(err.message);
      // Fallback to localStorage if API fails
      const savedWorkspaces = localStorage.getItem('trello-workspaces');
      if (savedWorkspaces) {
        setWorkspaces(JSON.parse(savedWorkspaces));
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new workspace
  const createWorkspace = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();
      if (!token || !userId) throw new Error('Authentication required');

      const response = await fetch('https://trello.testserverwebsite.com/api/workspaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      const newWorkspace = await response.json();
      const workspaceData = newWorkspace.data || newWorkspace;
      
      // Update state and localStorage
      setWorkspaces(prev => [...prev, workspaceData]);
      localStorage.setItem(
        'trello-workspaces', 
        JSON.stringify([...workspaces, workspaceData])
      );
      
      return { success: true, data: workspaceData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Load workspaces on initial render
  useEffect(() => {
    fetchAllWorkspaces();
  }, []);

  const getWorkspaces = async (workspaceId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `https://trello.testserverwebsite.com/api/workspaces/${workspaceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check for HTML error response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const html = await response.text();
        console.error("Server returned HTML:", html.substring(0, 500));
        throw new Error("Server configuration error");
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to fetch workspace (${response.status})`);
      }

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error("Get workspace error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };


  
const setActiveWorkspace = useCallback((workspaceId) => {
  setAllBoard((prev) => {
    const savedWorkspaces = JSON.parse(localStorage.getItem('trello-workspaces')) || [];
    const activeWorkspaceData = savedWorkspaces.find(w => w.id === workspaceId) || {
      boards: [],
      active: null,
    };

    return {
      ...prev,
      ...activeWorkspaceData,
      activeWorkspace: workspaceId,
    };
  });
}, []);

const saveWorkspaceData = useCallback(() => {
  const savedWorkspaces = JSON.parse(localStorage.getItem('trello-workspaces')) || [];
  const updatedWorkspaces = savedWorkspaces.map(w =>
    w.id === allboard.activeWorkspace ? { ...w, boards: allboard.boards } : w
  );

  localStorage.setItem('trello-workspaces', JSON.stringify(updatedWorkspaces));
}, [allboard]);

useEffect(() => {
  if (allboard.activeWorkspace) {
    saveWorkspaceData();
  }
}, [allboard, saveWorkspaceData]);

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
        moveCard,
        addComment,
        getComments,
        updateComment,
        deleteComment,
        addAttachment,
        getAttachments,
        deleteAttachment,
        workspaces,
        loading,
        error,
        createWorkspace,
        fetchAllWorkspaces,
        getWorkspaces,
        setActiveWorkspace,
        fetchWorkspaceById
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};