import React, { useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  MoreHorizontal,
  UserPlus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
} from "react-feather";
import CardAdd from "./CardAdd";
import { BoardContext } from "../context/BoardContext";
import AddList from "./AddList";

import "../../src/App.css";

function Main() {
  // All original state declarations remain exactly the same
  const {
    allboard,
    setAllBoard,
    fetchListsForBoard,
    updateListTitle,
    createList,
    createCard,
    updateCardTitle,
    moveCard,
    addComment: apiAddComment, getComments: apiGetComments, updateComment: apiUpdateComment, deleteComment: apiDeleteComment,
    addAttachment: apiAddAttachment,
  getAttachments: apiGetAttachments,
  deleteAttachment: apiDeleteAttachment
  } = useContext(BoardContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState("");
 
  
  const [editDescription, setEditDescription] = useState("");
  const [editCommentIndex, setEditCommentIndex] = useState(null);
  
  const [showMore, setShowMore] = useState(false);

  const [editingListIndex, setEditingListIndex] = useState(null);
  const [editedListTitle, setEditedListTitle] = useState("");
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [updatingListTitle, setUpdatingListTitle] = useState(false);
  const [listUpdateError, setListUpdateError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [moveError, setMoveError] = useState(null);
  const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState("");
const [editCommentId, setEditCommentId] = useState(null);
const [editCommentText, setEditCommentText] = useState("");
const [isCommentLoading, setIsCommentLoading] = useState(false);
const [attachments, setAttachments] = useState([]);
const [isAttachmentLoading, setIsAttachmentLoading] = useState(false);
  const boardRef = useRef(null);
  const [dragState, setDragState] = useState({
    isDragging: false,
    item: null,
    originalPosition: null,
    currentPosition: { x: 0, y: 0 },
    dropTarget: null,
    dragPreview: null
  });
  // Original derived state
  const activeBoard = allboard.boards.find(
    (board) => board.id === allboard.active
  );
  //here to change 
  

  // Original useEffect hooks remain exactly the same
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeBoard) {
      setAllBoard((prev) => ({
        ...prev,
        boards: prev.boards.map((board) => ({
          ...board,
          lists: board.lists?.map((list) => ({
            ...list,
            items: list.items?.map((item) => ({
              ...item,
              description: item.description || "",
              image: item.image || "",
              comments: item.comments || [],
              attachments: item.attachments || [],
            })),
          })),
        })),
      }));
    }
  }, [activeBoard?.id, setAllBoard]);

   // Improved drag handlers
   const handleDragStart = useCallback((e, listIndex, cardIndex) => {
    console.log('[Drag] Started dragging:', { listIndex, cardIndex });
    e.preventDefault();
  e.stopPropagation();
    const card = activeBoard.lists[listIndex].items[cardIndex];
    const cardElement = e.currentTarget;
    const rect = cardElement.getBoundingClientRect();
    
    // Get coordinates - works for both mouse and touch
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
  
    if (!clientX || !clientY) return;
  
    // Calculate offset from mouse to card top-left corner
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
  
    setDragState({
      isDragging: true,
      item: { listIndex, cardIndex },
      originalPosition: { listIndex, cardIndex },
      currentPosition: { x: clientX, y: clientY }, // Store absolute screen coordinates
      dropTarget: null,
      dragPreview: {
        element: cardElement,
        width: rect.width,
        height: rect.height,
        offsetX,
        offsetY,
        data: card
      }
    });
  
    // Hide original card but keep its space
    cardElement.style.opacity = '0.4';
    cardElement.style.cursor = 'grabbing';
  }, [activeBoard]);
  
  const handleDragMove = useCallback((e) => {
    if (!dragState.isDragging) return;
    e.preventDefault();
  
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
  
    if (!clientX || !clientY) return;
  
    // Find the element under the cursor
    const elements = document.elementsFromPoint(clientX, clientY);
    const cardElement = elements.find(el => el.classList.contains('draggable-card'));
    const listElement = elements.find(el => el.classList.contains('draggable-list'));
  
    let dropTarget = null;
    
    if (cardElement) {
      const listIndex = parseInt(cardElement.dataset.listIndex);
      const cardIndex = parseInt(cardElement.dataset.cardIndex);
      dropTarget = { listIndex, cardIndex, type: 'card' };
    } else if (listElement) {
      const listIndex = parseInt(listElement.dataset.listIndex);
      
      // Check if we're in the bottom half of the list for better drop positioning
      const listRect = listElement.getBoundingClientRect();
      const inBottomHalf = clientY > (listRect.top + listRect.height / 2);
      
      dropTarget = { 
        listIndex, 
        cardIndex: inBottomHalf ? -1 : 0, // -1 means end of list, 0 means beginning
        type: 'list' 
      };
    }
  
    setDragState(prev => ({
      ...prev,
      currentPosition: { x: clientX, y: clientY },
      dropTarget: dropTarget && !(
        dropTarget.listIndex === prev.item.listIndex && 
        dropTarget.cardIndex === prev.item.cardIndex
      ) ? dropTarget : null
    }));
  }, [dragState.isDragging]);
  
  const handleDragEnd = useCallback(async () => {
    if (!dragState.isDragging || !dragState.item) return;
  
    // 1. Always restore card appearance first
    const previewElement = dragState.dragPreview?.element;
    if (previewElement) {
      previewElement.style.opacity = '1';
      previewElement.style.cursor = 'grab';
    }
  
    // 2. Check if we have a valid drop target
    if (!dragState.dropTarget) {
      console.log('No drop target - canceling drag');
      resetDragState();
      return;
    }
  
    // 3. Get movement details
    const { listIndex: fromListIndex, cardIndex: fromCardIndex } = dragState.item;
    const { listIndex: toListIndex, cardIndex: toCardIndex } = dragState.dropTarget;
    const card = activeBoard.lists[fromListIndex]?.items[fromCardIndex];
  
    console.log(`Moving card "${card?.title}" from list ${fromListIndex} to list ${toListIndex} at position ${toCardIndex}`);
  
    // 4. Perform the visual update IMMEDIATELY
    setAllBoard(prev => {
      const newState = JSON.parse(JSON.stringify(prev)); // Deep clone
      const boardIndex = newState.boards.findIndex(b => b.id === newState.active);
      
      if (boardIndex === -1) return prev;
  
      // Remove from original position
      const [movedCard] = newState.boards[boardIndex].lists[fromListIndex].items.splice(fromCardIndex, 1);
      
      // Add to new position
      const insertPosition = toCardIndex === -1 
        ? newState.boards[boardIndex].lists[toListIndex].items.length 
        : Math.min(toCardIndex, newState.boards[boardIndex].lists[toListIndex].items.length);
      
      newState.boards[boardIndex].lists[toListIndex].items.splice(insertPosition, 0, movedCard);
  
      console.log('Visual update complete - new positions:', {
        fromList: newState.boards[boardIndex].lists[fromListIndex].items.map(i => i.title),
        toList: newState.boards[boardIndex].lists[toListIndex].items.map(i => i.title)
      });
  
      return newState;
    });
  
    // 5. Then make the API call
    try {
      const result = await moveCard(
        card.id,
        activeBoard.lists[toListIndex].id,
        toCardIndex === -1 
          ? activeBoard.lists[toListIndex].items.length 
          : toCardIndex
      );
  
      if (!result.success) throw new Error(result.error);
      console.log('Server confirmed movement');
    } catch (error) {
      console.error('API error - reverting UI', error);
      // Revert by reloading from saved state
      setAllBoard(JSON.parse(localStorage.getItem("boardState")));
    }
  
    // 6. Reset drag state
    resetDragState();
  }, [dragState, activeBoard?.lists, moveCard]);
  
  const resetDragState = () => {
    setDragState({
      isDragging: false,
      item: null,
      originalPosition: null,
      currentPosition: { x: 0, y: 0 },
      dropTarget: null,
      dragPreview: null
    });
  };

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);


 
  
  // Load comments when card is selected
  useEffect(() => {
    if (showPopup && selectedCard) {
      const loadComments = async () => {
        try {
          const result = await apiGetComments(selectedCard.id);
          if (result.success) {
            setComments(result.data || []);
          } else {
            console.error("Failed to load comments:", result.error);
            setComments([]);
          }
        } catch (error) {
          console.error("Failed to load comments:", error);
          setComments([]);
        }
      };
      loadComments();
    }
  }, [showPopup, selectedCard, apiGetComments]);
  
  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedCard) return;
  
    try {
      setIsCommentLoading(true);
      const result = await apiAddComment(selectedCard.id, newComment.trim());
      
      if (result.success) {
        setComments(prev => [...prev, result.data]);
        setNewComment("");
      } else {
        // Handle different error types
        const errorMessage = result.isHtmlError 
          ? "Server is currently unavailable. Please try again later."
          : result.error || "Failed to add comment";
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert(error.message);
    } finally {
      setIsCommentLoading(false);
    }
  };
  
  // Update existing comment
  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;
  
    try {
      setIsCommentLoading(true);
      const result = await apiUpdateComment(commentId, editCommentText.trim());
      
      if (result.success) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, content: editCommentText } 
              : comment
          )
        );
        setEditCommentId(null);
        setEditCommentText("");
      } else {
        throw new Error(result.error || "Failed to update comment");
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert(error.message);
    } finally {
      setIsCommentLoading(false);
    }
  };
  
  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
  
    try {
      setIsCommentLoading(true);
      const result = await apiDeleteComment(commentId);
      
      if (result.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      } else {
        throw new Error(result.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert(error.message);
    } finally {
      setIsCommentLoading(false);
    }
  };

  useEffect(() => {
    if (showPopup && selectedCard) {
      const loadAttachments = async () => {
        try {
          const result = await apiGetAttachments(selectedCard.id);
          if (result.success) {
            setAttachments(result.data || []);
          } else {
            console.error("Failed to load attachments:", result.error);
            setAttachments([]);
          }
        } catch (error) {
          console.error("Failed to load attachments:", error);
          setAttachments([]);
        }
      };
      loadAttachments();
    }
  }, [showPopup, selectedCard, apiGetAttachments]);
  
  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCard) return;
  
    try {
      setIsAttachmentLoading(true);
      const result = await apiAddAttachment(selectedCard.id, file);
      
      if (result.success) {
        setAttachments(prev => [...prev, result.data]);
      } else {
        throw new Error(result.error || "Failed to upload attachment");
      }
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      alert(error.message);
    } finally {
      setIsAttachmentLoading(false);
      e.target.value = ''; // Reset file input
    }
  };
  
  const handleRemoveAttachment = async (attachmentId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
  
    try {
      setIsAttachmentLoading(true);
      const result = await apiDeleteAttachment(attachmentId);
      
      if (result.success) {
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      } else {
        throw new Error(result.error || "Failed to delete attachment");
      }
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      alert(error.message);
    } finally {
      setIsAttachmentLoading(false);
    }
  };

  // Original useEffect for loading lists
  useEffect(() => {
    const controller = new AbortController();

    const loadLists = async () => {
      if (allboard.active) {
        try {
          setLoading(true);
          const result = await fetchListsForBoard(
            allboard.active,
            controller.signal
          );

          if (!result.success) {
            console.warn(
              "Failed to load lists:",
              result.error || "Unknown error"
            );
            return;
          }

          // Success case - lists should now be in state
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error loading lists:", error);
            setError(error.message);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    loadLists();

    return () => controller.abort();
  }, [allboard.active, fetchListsForBoard]);

  // All original handler functions remain with useCallback
  // const handleAttachmentUpload = useCallback((e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setAttachments((prev) => [
  //         ...prev,
  //         {
  //           name: file.name,
  //           type: file.type,
  //           preview: file.type.startsWith("image/") ? reader.result : null,
  //           timestamp: new Date().toLocaleString(),
  //         },
  //       ]);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }, []);

  // const removeAttachment = useCallback((index) => {
  //   setAttachments((prev) => prev.filter((_, i) => i !== index));
  // }, []);

  // const addComment = useCallback(() => {
  //   if (newComment.trim() === "") return;
  //   setComments((prev) => [...prev, newComment]);
  //   setNewComment("");
  // }, [newComment]);

  // const startEditingComment = useCallback((index, text) => {
  //   setEditCommentIndex(index);
  //   setEditCommentText(text);
  // }, []);

  // const saveEditedComment = useCallback(
  //   (index) => {
  //     setComments((prev) => {
  //       const updated = [...prev];
  //       updated[index] = editCommentText;
  //       return updated;
  //     });
  //     setEditCommentIndex(null);
  //     setEditCommentText("");
  //   },
  //   [editCommentText]
  // );

  // const deleteComment = useCallback((index) => {
  //   setComments((prev) => prev.filter((_, i) => i !== index));
  // }, []);

  const openPopup = useCallback((card, listIndex, cardIndex) => {
    setSelectedCard({ ...card, listIndex, cardIndex });
    setEditTitle(card.title || "");
    setEditImage(card.image || "");
    setEditDescription(card.description || "");
    setComments(card.comments || []);
    setAttachments(card.attachments || []);
    setShowPopup(true);
  }, []);

  const closePopup = useCallback(() => {
    setShowPopup(false);
    setSelectedCard(null);
  }, []);

  const saveCardChanges = useCallback(async () => {
    if (!selectedCard) return;
    setIsSaving(true);
    try {
      // Update both title and description via API
      const result = await updateCardTitle(selectedCard.id, editTitle, editDescription);
  
      if (!result.success) {
        throw new Error(result.error || "Failed to update card");
      }
  
      // Update local state
      setAllBoard((prev) => {
        const newState = {
          ...prev,
          boards: prev.boards.map((board) =>
            board.id === prev.active
              ? {
                  ...board,
                  lists: board.lists.map((list, idx) =>
                    idx === selectedCard.listIndex
                      ? {
                          ...list,
                          items: list.items.map((item, cardIdx) =>
                            cardIdx === selectedCard.cardIndex
                              ? {
                                  ...item,
                                  title: editTitle,
                                  description: editDescription,
                                  image: editImage,
                                  comments: comments, // Update comments
                                  attachments,
                                }
                              : item
                          ),
                        }
                      : list
                  ),
                }
              : board
          ),
        };
        localStorage.setItem("boardState", JSON.stringify(newState));
        return newState;
      });
  
      closePopup();
    } catch (error) {
      console.error("Error saving card changes:", error);
      alert(`Failed to save changes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedCard, 
    editTitle, 
    editDescription,
    editImage,
    comments,
    attachments,
    setAllBoard,
    closePopup,
    updateCardTitle
  ]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const listData = useCallback(
    async (title) => {
      const result = await createList(allboard.active, title);
      if (result.success) {
        setAllBoard((prev) => {
          const newBoards = [...prev.boards];
          const boardIndex = newBoards.findIndex((b) => b.id === prev.active);
          if (boardIndex === -1) return prev;

          newBoards[boardIndex] = {
            ...newBoards[boardIndex],
            lists: [...newBoards[boardIndex].lists, result.data],
          };

          return { ...prev, boards: newBoards };
        });
      }
    },
    [setAllBoard, createList, allboard.active]
  );

  const startEditingList = useCallback((index, title) => {
    setEditingListIndex(index);
    setEditedListTitle(title);
    setMenuOpenIndex(null);
  }, []);

  const saveEditedList = useCallback(
    async (listIndex) => {
      if (!activeBoard?.lists?.[listIndex]) return;

      const list = activeBoard.lists[listIndex];
      const originalId = list.id;
      const originalTitle = list.title;

      setUpdatingListTitle(true);
      setListUpdateError(null);

      try {
        const result = await updateListTitle(originalId, editedListTitle);

        if (!result.success) {
          throw new Error(result.error);
        }

        if (result.data.id !== originalId) {
          throw new Error("Server returned mismatched list ID");
        }

        setAllBoard((prev) => ({
          ...prev,
          boards: prev.boards.map((board) =>
            board.id === prev.active
              ? {
                  ...board,
                  lists: board.lists.map((l) =>
                    l.id === originalId ? { ...l, title: editedListTitle } : l
                  ),
                }
              : board
          ),
        }));
      } catch (error) {
        console.error("Error updating list:", error.message);
        setListUpdateError(error.message);
        setEditedListTitle(originalTitle);
      } finally {
        setUpdatingListTitle(false);
        setEditingListIndex(null);
      }
    },
    [activeBoard, editedListTitle, updateListTitle, setAllBoard]
  );

  useEffect(() => {
    const savedState = localStorage.getItem("boardState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.boards?.length > 0) {
        setAllBoard(parsedState);
      }
    }
  }, [setAllBoard]);

  useEffect(() => {
    if (allboard.activeWorkspace) {
      const savedWorkspaces = JSON.parse(localStorage.getItem('trello-workspaces')) || [];
      const activeWorkspaceData = savedWorkspaces.find(w => w.id === allboard.activeWorkspace);
  
      if (activeWorkspaceData) {
        setAllBoard(prev => ({
          ...prev,
          boards: activeWorkspaceData.boards,
          active: activeWorkspaceData.active,
        }));
      }
    }
  }, [allboard.activeWorkspace, setAllBoard]);


  
  const handleAddCard = async (listId, cardTitle, description) => {
    console.log(
      "[Card Creation] Starting process for list:",
      listId,
      cardTitle,
      description,
    );

    try {
      const activeBoard = allboard.boards.find((b) => b.id === allboard.active);
      if (!activeBoard) throw new Error("No active board found");

      const targetList = activeBoard.lists?.find((l) => l.id === listId);
      if (!targetList) throw new Error(`List ${listId} not found`);

      // Calculate position - use server's preferred default if empty
      const position =
        targetList.items?.length > 0
          ? targetList.items[targetList.items.length - 1].position + 1
          : 0;

      console.log("[Card Creation] Calling API with:", {
        listId,
        title: cardTitle,
        position,
      });

      const result = await createCard(listId, cardTitle, position, description);

      if (!result.success) {
        throw new Error(result.error || "Unknown error creating card");
      }

      console.log("[Card Creation] Success! Updating state...");
      setAllBoard((prev) => {
        const newState = {
          ...prev,
          boards: prev.boards.map((board) =>
            board.id === prev.active
              ? {
                  ...board,
                  lists: board.lists.map((list) =>
                    list.id === listId
                      ? {
                          ...list,
                          items: [
                            ...(list.items || []),
                            {
                              id: result.data.id,
                              title: result.data.title,
                              position: result.data.position,
                              description: result.data.description || "",
                              image: "",
                              comments: [],
                              attachments: [],
                            },
                          ],
                        }
                      : list
                  ),
                }
              : board
          ),
        };
        localStorage.setItem("boardState", JSON.stringify(newState));
        return newState;
      });
    } catch (error) {
      console.error("[Card Creation] Failed:", {
        error: error.message,
        stack: error.stack,
        listId,
        cardTitle,
      });
      // Consider adding user feedback here (e.g., toast notification)
    }
  };

  // Original members array
  const members = [
    { id: 1, name: "Michael Scott", initials: "MS", color: "bg-purple-600" },
    { id: 2, name: "Sara Brown", initials: "SB", color: "bg-cyan-600" },
    { id: 3, name: "Akash Surya", initials: "AS", color: "bg-green-600" },
  ];

  // Original conditional renders
  if (loading) return null;
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-red-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-red-800">
            Error Loading Board
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activeBoard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            No Board Selected
          </h2>
          <p className="text-gray-600">
            Please select a board from the sidebar
          </p>
        </div>
      </div>
    );
  }

  // Original JSX return remains exactly the same
  return (
    <div
    ref={boardRef}
    className="flex flex-col w-full overflow-x-auto content min-h-screen"
    style={{ backgroundColor: activeBoard?.bgcolor || "#464847" }}
  >
      {/* Header */}
      <div className="p-3 bg-[#464847c4] flex w-full min-w-0 h-12 px-4 items-center justify-between flex-shrink-0">
        <h2 className="text-lg truncate max-w-[50%] text-white">
          {activeBoard?.name || "Untitled Board"}
        </h2>
        <div className="flex items-center space-x-2">
          {members.map((member) => (
            <div
              key={member.id}
              className={`w-7 h-7 flex items-center justify-center text-white text-sm font-bold rounded-full ${member.color}`}
              title={member.name}
            >
              {member.initials}
            </div>
          ))}
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 cursor-pointer">
            <UserPlus size={16} />
          </div>
          <button className="hover:bg-gray-500 px-2 py-1 h-8 rounded flex-shrink-0">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Board Content */}
      <div className="h-screen overflow-x-auto" style={{ minWidth: "87vw", maxWidth: "100vw" }}>
        <div className="flex-grow flex overflow-x-auto p-3" style={{ whiteSpace: "nowrap", minWidth: "80%" }}>
          <div className="min-w-full h-full overflow-x-auto custom-scrollbar">
            <div className="flex flex-row space-x-4 px-3 items-start pb-2" style={{ minWidth: "fit-content", display: "flex" }}>
              {activeBoard.lists?.map((list, listIndex) => (
                <div
                  key={list.id}
                  className={`w-[280px] rounded-md p-2 text-black bg-[#f1f2f4] flex flex-col overflow-y-auto overflow-x-hidden whitespace-normal draggable-list ${
                    dragState.dropTarget?.listIndex === listIndex && 
                    dragState.dropTarget?.type === 'list'
                      ? 'bg-[#e2e4e6]'
                      : ''
                  }`}
                  data-list-index={listIndex}
                >
                    {/* List Header */}
                    <div className="flex justify-between p-1 relative">
                    {editingListIndex === listIndex ? (
                      <div className="relative group">
                        <input
                          type="text"
                          className="w-full p-2 border rounded text-black pr-8"
                          value={editedListTitle}
                          onChange={(e) => setEditedListTitle(e.target.value)}
                          onBlur={() => {
                            if (editedListTitle !== list.title) {
                              saveEditedList(listIndex);
                            }
                            setEditingListIndex(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveEditedList(listIndex);
                              setEditingListIndex(null);
                            }
                            if (e.key === "Escape") {
                              setEditedListTitle(list.title);
                              setEditingListIndex(null);
                            }
                          }}
                          autoFocus
                          disabled={updatingListTitle}
                        />
                        {updatingListTitle && (
                          <div className="absolute right-2 top-2.5">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="font-medium cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                        onClick={() => {
                          setEditingListIndex(listIndex);
                          setEditedListTitle(list.title);
                        }}
                      >
                        {list.title}
                      </div>
                    )}
                    <button
                      className="hover:bg-gray-500 rounded-sm p-1"
                      onClick={() =>
                        setMenuOpenIndex(
                          menuOpenIndex === listIndex ? null : listIndex
                        )
                      }
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {menuOpenIndex === listIndex && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10">
                        <button
                          className="w-full text-left px-4 py-2 cursor-pointer"
                          onClick={() =>
                            startEditingList(listIndex, list.title)
                          }
                        >
                          Edit List Name
                        </button>
                      </div>
                    )}
                  </div>

                    {/* List Items */}
                    <div className="flex flex-col space-y-2 transition-all custom-scrollbar"
                    style={{
                      overflowY: "auto",
                      minHeight: "40px",
                      maxHeight: "calc(100vh - 200px)",
                      paddingRight: "8px",
                    }}
                  >
                    {list.items?.map((item, cardIndex) => (
                      <React.Fragment key={item.id}>
                        {/* Drop indicator above card */}
                        {dragState.dropTarget?.listIndex === listIndex && 
                         dragState.dropTarget?.cardIndex === cardIndex && (
                          <div className="h-2 bg-blue-200 rounded-full my-1" />
                        )}

                        <div
                          className={`bg-white p-2 rounded-md border-zinc-900 hover:border-gray-500 cursor-pointer draggable-card transition-all duration-150 ${
                            dragState.isDragging && 
                            dragState.item?.listIndex === listIndex && 
                            dragState.item?.cardIndex === cardIndex 
                              ? 'opacity-0' 
                              : ''
                          } ${
                            dragState.dropTarget?.listIndex === listIndex && 
                            dragState.dropTarget?.cardIndex === cardIndex
                              ? 'border-2 border-blue-500'
                              : ''
                          }`}
                          onMouseDown={(e) => handleDragStart(e, listIndex, cardIndex)}
                          onTouchStart={(e) => handleDragStart(e, listIndex, cardIndex)}
                          data-list-index={listIndex}
                          data-card-index={cardIndex}
                          data-card-id={item.id}
                          onClick={(e) => {
                            if (!dragState.isDragging) {
                              openPopup(item, listIndex, cardIndex);
                            }
                          }}
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt="Uploaded"
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                          )}
                          <span>{item.title}</span>
                        </div>
                      </React.Fragment>
                    ))}

                   {/* Drop indicator at end of list */}
                   {dragState.dropTarget?.listIndex === listIndex && 
                     dragState.dropTarget?.cardIndex === -1 && (
                      <div className="h-2 bg-blue-200 rounded-full my-1" />
                    )}
                  </div>

                  <CardAdd
                    listId={list.id}
                    getcard={(cardTitle) => handleAddCard(list.id, cardTitle)}
                  />
                </div>
              ))}
              <AddList getlist={listData} />
            </div>
          </div>
        </div>
      </div>

      {/* Drag Preview */}
      {dragState.isDragging && dragState.dragPreview && (
  <div
    className="fixed bg-white p-2 rounded-md border border-gray-300 shadow-lg pointer-events-none z-50 will-change-transform"
    style={{
      width: `${dragState.dragPreview.width}px`,
      left: `${dragState.currentPosition.x - dragState.dragPreview.offsetX}px`,
      top: `${dragState.currentPosition.y - dragState.dragPreview.offsetY}px`,
      transform: 'translate(0, 0)',
      opacity: 0.9,
      transition: 'none', // Remove transition during drag for precise following
      cursor: 'grabbing',
    }}
  >
    {dragState.dragPreview.data.image && (
      <img
        src={dragState.dragPreview.data.image}
        alt="Preview"
        className="w-full h-32 object-cover rounded-md mb-2"
      />
    )}
    <span>{dragState.dragPreview.data.title}</span>
  </div>
)}

      {/* Card Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000d8]">
          <div className="bg-[#f1f2f4] p-6 rounded-lg w-[700px] mb-2 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-lg font-bold"
            >
              <X size={24} className="mt-2" />
            </button>
            {editImage && (
              <div className="w-full h-48 flex justify-center">
                <img
                  src={editImage}
                  alt="Cover"
                  className="w-auto max-w-full h-48 object-contain mx-auto rounded-md"
                />
              </div>
            )}
            <h3 className="text-lg mb-2 text-black mt-4 text-center">
              Edit Card
            </h3>
            <div className="mt-4">
              <label className="text-black text-md mb-2 block">
                Card Title
              </label>
              <input
                type="text"
                placeholder="Enter card title"
                className="w-full p-2 border rounded bg-white text-black"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveCardChanges();
                }}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              className="mt-2 text-blue-400"
              onChange={handleImageUpload}
            />
            <div className="flex items-center space-x-2 mt-4">
              <h4 className="text-sm font-semibold text-gray-700">Members</h4>
              {members.map((member) => (
                <div
                  key={member.id}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold ${member.color}`}
                >
                  {member.initials}
                </div>
              ))}
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 cursor-pointer">
                <UserPlus size={16} />
              </div>
            </div>
            <div className="mt-4">
  <h4 className="text-black text-md mb-2">Attachments</h4>
  <div className="space-y-2">
    <label className="inline-block">
      <span className="sr-only">Choose attachment</span>
      <input
        type="file"
        onChange={handleAttachmentUpload}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
        disabled={isAttachmentLoading}
      />
    </label>

    {isAttachmentLoading && (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )}

    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center justify-between p-2 bg-white border rounded">
          <div className="flex items-center space-x-3">
            {attachment.type?.startsWith('image/') ? (
              <img
                src={attachment.url || attachment.preview_url}
                alt="Attachment preview"
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                <FileIcon className="text-gray-400" size={20} />
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{attachment.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(attachment.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRemoveAttachment(attachment.id)}
            className="text-red-500 hover:text-red-700 p-1"
            disabled={isAttachmentLoading}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>
</div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-black text-md font-medium">Description</h4>
                {editDescription && (
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    {showMore ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
              <textarea
                className={`w-full p-3 rounded-md border border-gray-300 text-black resize-none bg-white transition-all duration-200 shadow-sm  ${
                  showMore ? "min-h-[120px]" : "min-h-[80px]"
                }`}
                placeholder="Add a detailed description..."
                value={editDescription}
                onChange={(e) => {
                  setEditDescription(e.target.value);
                  // Auto-resize
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onFocus={() => setShowMore(true)}
                style={{
                  minHeight: "80px",
                  maxHeight: showMore ? "none" : "200px",
                  overflowY: showMore ? "auto" : "hidden",
                }}
              />
              {editDescription && (
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {editDescription.length}/1000 characters
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4">
  <h4 className="text-black text-md mb-2">Comments</h4>
  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar p-2">
    {comments.map((comment) => (
      <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {editCommentId === comment.id ? (
              <textarea
                className="w-full p-2 border rounded text-black bg-gray-50 mb-2"
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                rows={3}
              />
            ) : (
              <>
                <p className="text-gray-800">{comment.content}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="font-medium">
                    {comment.user?.name || 'Anonymous'}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex space-x-2 ml-2">
            {editCommentId === comment.id ? (
              <>
                <button
                  onClick={() => handleUpdateComment(comment.id)}
                  className="text-green-500 hover:text-green-600 transition-colors"
                  disabled={isCommentLoading}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditCommentId(null);
                    setEditCommentText("");
                  }}
                  className="text-gray-500 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditCommentId(comment.id);
                    setEditCommentText(comment.content);
                  }}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>

  <div className="mt-4 flex gap-2">
    <input
      type="text"
      placeholder="Add a comment..."
      className="flex-1 p-2 border rounded text-black"
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
    />
    <button
      onClick={handleAddComment}
      disabled={!newComment.trim() || isCommentLoading}
      className={`px-4 py-2 text-white rounded ${
        !newComment.trim() || isCommentLoading 
          ? 'bg-gray-400' 
          : 'bg-green-500 hover:bg-green-600'
      }`}
    >
      {isCommentLoading ? "Adding..." : "Add"}
    </button>
  </div>
</div>
            <div className="flex justify-end mt-4">
              <button
                onClick={closePopup}
                className="mr-2 px-4 py-2 bg-gray-400 rounded"
              >
                Close
              </button>
              <button
                onClick={saveCardChanges}
                disabled={isSaving}
                className={`px-4 py-2 text-white rounded ${
                  isSaving ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;