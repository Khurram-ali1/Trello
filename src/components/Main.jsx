import React, { useContext, useState } from 'react';

import { MoreHorizontal, UserPlus, Edit2, Trash2, Image as ImageIcon, X } from 'react-feather';
import CardAdd from './CardAdd';
import { BoardContext } from '../context/BoardContext';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddList from './AddList';
import Utils from '../utils/Utils';
import '../../src/App.css';

function Main() {
    const { allboard, setAllBoard } = useContext(BoardContext);
    const bdata = allboard.boards[allboard.active];

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



    // Function to start editing the list name
    const startEditingList = (index, title) => {
        setEditingListIndex(index);
        setEditedListTitle(title);
        setMenuOpenIndex(null); // Close menu when editing
    };

    // Function to save the edited list name
    const saveEditedList = (index) => {
        if (editedListTitle.trim() === "") return;

        let newLists = [...bdata.lists];
        newLists[index].title = editedListTitle;

        let board_ = { ...allboard };
        board_.boards[allboard.active].lists = newLists;
        setAllBoard(board_);

        setEditingListIndex(null); // Exit edit mode
    };

    function onDragEnd(res) {
        if (!res.destination) return;
        const { source, destination } = res;
        const sourceListIndex = bdata.lists.findIndex(list => list.id === source.droppableId);
        const destListIndex = bdata.lists.findIndex(list => list.id === destination.droppableId);

        if (sourceListIndex === destListIndex) {
            const newItems = [...bdata.lists[sourceListIndex].items];
            const [movedItem] = newItems.splice(source.index, 1);
            newItems.splice(destination.index, 0, movedItem);

            let newLists = [...bdata.lists];
            newLists[sourceListIndex].items = newItems;

            let board_ = { ...allboard };
            board_.boards[board_.active].lists = newLists;
            setAllBoard(board_);
        } else {
            const sourceItems = [...bdata.lists[sourceListIndex].items];
            const destItems = [...bdata.lists[destListIndex].items];
            const [movedItem] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, movedItem);

            let newLists = [...bdata.lists];
            newLists[sourceListIndex].items = sourceItems;
            newLists[destListIndex].items = destItems;

            let board_ = { ...allboard };
            board_.boards[allboard.active].lists = newLists;
            setAllBoard(board_);
        }
    }

    const handleAttachmentUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAttachments((prevAttachments) => [
                    ...prevAttachments,
                    {
                        name: file.name,
                        type: file.type,
                        preview: file.type.startsWith("image/") ? reader.result : null,
                        timestamp: new Date().toLocaleString() // Store upload time
                    }
                ]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const addComment = () => {
        if (newComment.trim() === "") return;
        setComments([...comments, newComment]);
        setNewComment("");
    };

    const startEditingComment = (index, text) => {
        setEditCommentIndex(index);
        setEditCommentText(text);
    };

    const saveEditedComment = (index) => {
        let updatedComments = [...comments];
        updatedComments[index] = editCommentText;
        setComments(updatedComments);
        setEditCommentIndex(null);
        setEditCommentText("");
    };

    const deleteComment = (index) => {
        let updatedComments = comments.filter((_, i) => i !== index);
        setComments(updatedComments);
    };

    const openPopup = (card, listIndex, cardIndex) => {
        setSelectedCard({ ...card, listIndex, cardIndex });
        setEditTitle(card.title);
        setEditImage(card.image || "");
        setEditDescription(card.description || "");
        setComments(card.comments || []);
        setAttachments(card.attachments || []);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedCard(null);
    };

    const saveCardChanges = () => {
        if (!selectedCard) return;

        let newLists = [...bdata.lists];
        newLists[selectedCard.listIndex].items[selectedCard.cardIndex] = {
            ...newLists[selectedCard.listIndex].items[selectedCard.cardIndex],
            title: editTitle,
            image: editImage,
            description: editDescription,
            comments: comments,
            attachments: attachments
        };

        let board_ = { ...allboard };
        board_.boards[allboard.active].lists = newLists;
        setAllBoard(board_);

        closePopup();
    };

    const handleImageUpload = (e) => {
        if (!selectedCard) return;

        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const cardData = (e, listIndex) => {
        let newLists = [...bdata.lists];
        newLists[listIndex].items.push({ id: Utils.makeid(5), title: e });

        let board_ = { ...allboard };
        board_.boards[allboard.active].lists = newLists;
        setAllBoard(board_);
    };

    const listData = (e) => {
        let newLists = [...bdata.lists];
        newLists.push({ id: Utils.makeid(5), title: e, items: [] });

        let board_ = { ...allboard };
        board_.boards[allboard.active].lists = newLists;
        setAllBoard(board_);
    };

    const members = [
        { id: 1, name: "Michael Scott", initials: "MS", color: "bg-purple-600" },
        { id: 2, name: "Sara Brown", initials: "SB", color: "bg-cyan-600" },
        { id: 3, name: "Akash Surya", initials: "AS", color: "bg-green-600" }
    ];

    return (
        <>
            <div className='flex flex-col w-full overflow-x-auto content' style={{ backgroundColor: `${bdata.bgcolor}` }}>
                <div className='p-3 bg-[#464847c4] flex w-full min-w-0 h-12 px-4 items-center justify-between flex-shrink-0'>
                    <h2 className='text-lg truncate max-w-[50%]'>{bdata.name}</h2>

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
                        <button className='hover:bg-gray-500 px-2 py-1 h-8 rounded flex-shrink-0'>
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                </div>

                <div className='h-screen overflow-x-auto' style={{ minWidth: '87vw', maxWidth: '100vw' }}>
                    <div className='flex-grow flex overflow-x-auto p-3' style={{ whiteSpace: 'nowrap', minWidth: '80%' }}>
                        <div className="min-w-full h-full overflow-x-auto custom-scrollbar">
                            <div className='flex flex-row space-x-4 px-3 items-start pb-2' style={{ minWidth: 'fit-content', display: 'flex' }}>
                                <DragDropContext onDragEnd={onDragEnd}>
                                    {bdata.lists && bdata.lists.map((x, listIndex) => (
                                        <div key={x.id} className='w-[280px] rounded-md p-2 text-black bg-[#f1f2f4] flex flex-col overflow-y-auto overflow-x-hidden whitespace-normal'>
                                            <div className='flex justify-between p-1 relative'>
                                                {editingListIndex === listIndex ? (
                                                    <input
                                                        type="text"
                                                        className="w-full p-1 border rounded text-black cursor-pointer"
                                                        value={editedListTitle}
                                                        onChange={(e) => setEditedListTitle(e.target.value)}
                                                        onBlur={() => saveEditedList(listIndex)}
                                                        onKeyDown={(e) => e.key === "Enter" && saveEditedList(listIndex)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span>{x.title}</span>
                                                )}
                                                <button
                                                    className='hover:bg-gray-500 rounded-sm p-1'
                                                    onClick={() => setMenuOpenIndex(menuOpenIndex === listIndex ? null : listIndex)}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                                {menuOpenIndex === listIndex && (
                                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10">
                                                        <button
                                                            className="w-full text-left px-4 py-2 cursor-pointer"
                                                            onClick={() => startEditingList(listIndex, x.title)}
                                                        >
                                                            Edit List Name
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <Droppable droppableId={String(x.id)}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className='flex flex-col space-y-2 transition-all custom-scrollbar'
                                                        style={{ minHeight: "10px", maxHeight: "80vh", overflowY: "auto" }}
                                                    >
                                                        {x.items.map((item, cardIndex) => (
                                                            <Draggable key={item.id} draggableId={item.id} index={cardIndex}>
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className='bg-white p-2 rounded-md border-zinc-900 hover:border-gray-500 cursor-pointer'
                                                                        onClick={() => openPopup(item, listIndex, cardIndex)}
                                                                    >
                                                                        {item.image && (
                                                                            <img src={item.image} alt='Uploaded' className='w-full h-32 object-cover rounded-md mb-2' />
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
                                            <CardAdd getcard={(e) => cardData(e, listIndex)} />
                                        </div>
                                    ))}
                                    <AddList getlist={listData} />
                                </DragDropContext>
                            </div>
                        </div>
                    </div>
                </div>
               

                <div className='flex flex-col w-full' style={{ backgroundColor: `${bdata.bgcolor}` }}>
                    {showPopup && (
                        <div className="fixed inset-0 flex items-center justify-center bg-[#000000d8]">
                            <div className="bg-[#f1f2f4] p-6 rounded-lg w-[700px] mb-2 max-h-[85vh] overflow-y-auto relative">
                                <button
                                    onClick={closePopup}
                                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-lg font-bold"
                                >
                                    <X size={24} className='mt-2' />
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
                                <h3 className="text-lg mb-2 text-black mt-4 text-center">Edit Card</h3>
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
                                            <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                                                <div className="flex items-center space-x-4">
                                                    {file.preview ? (
                                                        <img src={file.preview} alt="Attachment" className="w-12 h-12 object-cover rounded-md" />
                                                    ) : (
                                                        <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md">
                                                            📄
                                                        </div>
                                                    )}
                                                    <div className="text-black">
                                                        <p className="font-semibold">{file.name}</p>
                                                        <p className="text-gray-500 text-sm">Added {file.timestamp}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeAttachment(index)} className="text-black">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <h4 className="text-black text-md mt-4">Description</h4>
                                <textarea
                                    className={`w-full p-2 rounded border text-black resize-none overflow-hidden bg-white transition-all duration-200 ${showMore ? 'h-auto' : 'h-[80px]'}`}
                                    rows={3}
                                    placeholder="Add a description..."
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    onInput={(e) => e.target.style.height = "auto"}
                                    onFocus={(e) => e.target.style.height = e.target.scrollHeight + "px"}
                                ></textarea>
                                <div className="mt-4">
                                    <h4 className="text-black text-md mb-2">Comments</h4>
                                    <div className="pt-3 pb-2 p-2">
                                        {comments.map((comment, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white border p-2 rounded mb-3 text-black">
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
                                                        <button onClick={() => saveEditedComment(index)} className="text-black ml-1"><Edit2 size={16} /></button>
                                                    ) : (
                                                        <button onClick={() => startEditingComment(index, comment)} className="text-black"><Edit2 size={16} /></button>
                                                    )}
                                                    <button onClick={() => deleteComment(index)} className="text-black"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <input type="text" placeholder="Add a comment..." className="w-full p-2 border rounded mt-2 text-black" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                    <button onClick={addComment} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">Add Comment</button>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button onClick={closePopup} className="mr-2 px-4 py-2 bg-gray-400 rounded">Close</button>
                                    <button onClick={saveCardChanges} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}

export default Main;