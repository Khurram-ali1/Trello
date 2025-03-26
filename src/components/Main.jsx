import React, { useContext, useState, useEffect, useCallback } from "react";
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
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddList from "./AddList";
import Utils from "../utils/Utils";
import "../../src/App.css";

function Main() {
  const {
    allboard,
    setAllBoard,
    fetchListsForBoard,
    updateListTitle,
    createList,
    createCard,
  } = useContext(BoardContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCommentIndex, setEditCommentIndex] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [editingListIndex, setEditingListIndex] = useState(null);
  const [editedListTitle, setEditedListTitle] = useState("");
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [updatingListTitle, setUpdatingListTitle] = useState(false);
  const [listUpdateError, setListUpdateError] = useState(null);

  const activeBoard = allboard.boards.find(
    (board) => board.id === allboard.active
  );

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

  const onDragEnd = useCallback(
    (res) => {
      if (!res.destination || !activeBoard?.lists) return;

      const { source, destination } = res;
      const sourceListIndex = activeBoard.lists.findIndex(
        (list) => list?.id === source.droppableId
      );
      const destListIndex = activeBoard.lists.findIndex(
        (list) => list?.id === destination.droppableId
      );

      if (sourceListIndex === -1 || destListIndex === -1) return;

      setAllBoard((prev) => {
        const newBoards = [...prev.boards];
        const boardIndex = newBoards.findIndex((b) => b.id === prev.active);
        if (boardIndex === -1) return prev;

        const newLists = [...newBoards[boardIndex].lists];
        const sourceItems = [...newLists[sourceListIndex].items];
        const [movedItem] = sourceItems.splice(source.index, 1);

        if (source.droppableId === destination.droppableId) {
          sourceItems.splice(destination.index, 0, movedItem);
          newLists[sourceListIndex] = {
            ...newLists[sourceListIndex],
            items: sourceItems,
          };
        } else {
          const destItems = [...newLists[destListIndex].items];
          destItems.splice(destination.index, 0, movedItem);
          newLists[sourceListIndex] = {
            ...newLists[sourceListIndex],
            items: sourceItems,
          };
          newLists[destListIndex] = {
            ...newLists[destListIndex],
            items: destItems,
          };
        }

        newBoards[boardIndex] = {
          ...newBoards[boardIndex],
          lists: newLists,
        };

        return {
          ...prev,
          boards: newBoards,
        };
      });
    },
    [activeBoard?.lists, setAllBoard]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadLists = async () => {
      if (allboard.active) {
        try {
          const result = await fetchListsForBoard(
            allboard.active,
            controller.signal
          );
          if (!result.success) {
            console.warn("Note:", result.error); // Changed from error to warn for empty lists case
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Critical error loading lists:", error);
          }
        }
      }
    };

    loadLists();

    return () => controller.abort();
  }, [allboard.active]);

  const handleAttachmentUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            preview: file.type.startsWith("image/") ? reader.result : null,
            timestamp: new Date().toLocaleString(),
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeAttachment = useCallback((index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addComment = useCallback(() => {
    if (newComment.trim() === "") return;
    setComments((prev) => [...prev, newComment]);
    setNewComment("");
  }, [newComment]);

  const startEditingComment = useCallback((index, text) => {
    setEditCommentIndex(index);
    setEditCommentText(text);
  }, []);

  const saveEditedComment = useCallback(
    (index) => {
      setComments((prev) => {
        const updated = [...prev];
        updated[index] = editCommentText;
        return updated;
      });
      setEditCommentIndex(null);
      setEditCommentText("");
    },
    [editCommentText]
  );

  const deleteComment = useCallback((index) => {
    setComments((prev) => prev.filter((_, i) => i !== index));
  }, []);

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

  const saveCardChanges = useCallback(() => {
    if (!selectedCard) return;
  
    setAllBoard((prev) => {
      const newState = {
        ...prev,
        boards: prev.boards.map(board => 
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
                                image: editImage,
                                description: editDescription,
                                comments,
                                attachments,
                              }
                            : item
                        )
                      }
                    : list
                )
              }
            : board
        )
      };
      localStorage.setItem('boardState', JSON.stringify(newState));
      return newState;
    });
  
    closePopup();
  }, [selectedCard, editTitle, editImage, editDescription, comments, attachments]);

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
            lists: [
              ...newBoards[boardIndex].lists,
              result.data, // Use the list data from API response
            ],
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
        console.log("Attempting to update list:", {
          id: originalId,
          title: editedListTitle,
        }); // Debugging

        const result = await updateListTitle(originalId, editedListTitle);
        console.log("Backend response:", result); // Debugging

        if (!result.success) {
          throw new Error(result.error);
        }

        if (result.data.id !== originalId) {
          throw new Error("Server returned mismatched list ID"); // Check for backend inconsistency
        }

        // Update state with the original ID and new title
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
        console.error("Error updating list:", error.message); // Debugging
        setListUpdateError(error.message);
        setEditedListTitle(originalTitle); // Reset edited title on error
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
  const handleAddCard = async (listId, cardTitle) => {
    const list = allboard.boards
      .find((board) => board.id === allboard.active)
      ?.lists.find((l) => l.id === listId);

    if (!list) return;

    const position = list.items.length;
    const result = await createCard(listId, cardTitle, position);

    if (result.success) {
      setAllBoard((prev) => {
        const newState = {
          ...prev,
          boards: prev.boards.map((board) =>
            board.id === prev.active
              ? {
                  ...board,
                  lists: board.lists.map((l) =>
                    l.id === listId
                      ? { ...l, items: [...l.items, result.data] }
                      : l
                  ),
                }
              : board
          ),
        };
        localStorage.setItem("boardState", JSON.stringify(newState));
        return newState;
      });
    }
  };

  const members = [
    { id: 1, name: "Michael Scott", initials: "MS", color: "bg-purple-600" },
    { id: 2, name: "Sara Brown", initials: "SB", color: "bg-cyan-600" },
    { id: 3, name: "Akash Surya", initials: "AS", color: "bg-green-600" },
  ];

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

  return (
    <div
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
      <div
        className="h-screen overflow-x-auto"
        style={{ minWidth: "87vw", maxWidth: "100vw" }}
      >
        <div
          className="flex-grow flex overflow-x-auto p-3 "
          style={{ whiteSpace: "nowrap", minWidth: "80%" }}
        >
          <div className="min-w-full h-full overflow-x-auto custom-scrollbar">
            <div
              className="flex flex-row space-x-4 px-3 items-start pb-2"
              style={{ minWidth: "fit-content", display: "flex" }}
            >
              <DragDropContext onDragEnd={onDragEnd}>
                {activeBoard.lists?.map((list, listIndex) => (
                  <div
                    key={list.id}
                    className="w-[280px] rounded-md p-2 text-black bg-[#f1f2f4] flex flex-col overflow-y-auto overflow-x-hidden whitespace-normal"
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
                              // Only save if the title actually changed
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
                    <Droppable droppableId={list.id.toString()}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex flex-col space-y-2 transition-all custom-scrollbar"
                          style={{
                            overflowY: "auto",
                            minHeight: "40px",
                            maxHeight: "calc(100vh - 200px)", // Adjust based on your layout
                            paddingRight: "8px",
                          }}
                        >
                          {list.items?.map((item, cardIndex) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id.toString()}
                              index={cardIndex}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white p-2 rounded-md border-zinc-900 hover:border-gray-500 cursor-pointer"
                                  onClick={() =>
                                    openPopup(item, listIndex, cardIndex)
                                  }
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
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    <CardAdd
                      listId={list.id}
                      getcard={(cardTitle) => handleAddCard(list.id, cardTitle)}
                    />
                  </div>
                ))}
                <AddList getlist={listData} />
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>

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
            <input
              type="text"
              placeholder="Enter your Title"
              className="w-full p-2 border rounded bg-white text-black"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
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
              <input
                type="file"
                accept="image/*, .pdf, .doc, .docx"
                className="mt-2 text-blue-400"
                onChange={handleAttachmentUpload}
              />
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white border rounded"
                  >
                    <div className="flex items-center space-x-4">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt="Attachment"
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md">
                          📄
                        </div>
                      )}
                      <div className="text-black">
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-gray-500 text-sm">
                          Added {file.timestamp}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-black"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <h4 className="text-black text-md mt-4">Description</h4>
            <textarea
              className={`w-full p-2 rounded border text-black resize-none overflow-hidden bg-white transition-all duration-200 ${
                showMore ? "h-auto" : "h-[80px]"
              }`}
              rows={3}
              placeholder="Add a description..."
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onInput={(e) => (e.target.style.height = "auto")}
              onFocus={(e) =>
                (e.target.style.height = e.target.scrollHeight + "px")
              }
            ></textarea>
            <div className="mt-4">
              <h4 className="text-black text-md mb-2">Comments</h4>
              <div className="pt-3 pb-2 p-2">
                {comments.map((comment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white border p-2 rounded mb-3 text-black"
                  >
                    {editCommentIndex === index ? (
                      <textarea
                        className="w-full p-1 text-black bg-transparent resize-none focus:outline-none"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        style={{
                          height: "auto",
                          minHeight: "40px",
                          overflow: "hidden",
                        }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = "auto";
                            el.style.height = el.scrollHeight + "px";
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <p>{comment}</p>
                    )}
                    <div className="flex space-x-2">
                      {editCommentIndex === index ? (
                        <button
                          onClick={() => saveEditedComment(index)}
                          className="text-black ml-1"
                        >
                          <Edit2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditingComment(index, comment)}
                          className="text-black"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(index)}
                        className="text-black"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full p-2 border rounded mt-2 text-black"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                onClick={addComment}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
              >
                Add Comment
              </button>
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
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;
