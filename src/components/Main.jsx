import React, { useContext, useState } from 'react';
import { MoreHorizontal, UserPlus, Edit2, Trash2, Image as ImageIcon, X } from 'react-feather';
import CardAdd from './CardAdd';
import { BoardContext } from '../context/BoardContext';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddList from './AddList';
import Utils from '../utils/Utils';

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
            board_.boards[board_.active].lists = newLists;
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
        { id: 2, name: "Sara Brown", initials: "SB", color: "bg-cyan-600" }
    ];

    return (
        <div className='flex flex-col w-full' style={{ backgroundColor: `${bdata.bgcolor}` }}>
            <div className='p-3 bg-[#464847c4] flex w-full h-12 px-4 items-center justify-between'>
                <h2 className='text-lg'>{bdata.name}</h2>
                <div className='flex items-center space-x-3'>
                    <button className='bg-gray-200 text-gray-500 px-2 h-8 py-1 mr-2 rounded flex items-center'>
                        <UserPlus size={16} className='mr-2' /> Share
                    </button>
                    <button className='hover:bg-[#9D00FD] px-2 py-1 h-8 rounded'><MoreHorizontal size={16} /></button>
                </div>
            </div>
            <div className='flex flex-col w-full h-screen overflow-hidden '>
                <div className='mb-1 pb-2 p-3 flex overflow-x-auto overflow-y-hidden '>
                    <div className='flex flex-row space-x-4 px-3 items-start'>
                        <DragDropContext onDragEnd={onDragEnd}>
                            {bdata.lists && bdata.lists.map((x, listIndex) => (
                                <div
                                    key={x.id}
                                    className='w-60 rounded-md p-2 text-black bg-[#f1f2f4] flex flex-col overflow-y-auto'
                                    style={{ minHeight: "50px", maxHeight: "75vh" }}
                                >
                                    <div className='flex justify-between p-1'>
                                        <span>{x.title}</span>
                                        <button className='hover:bg-gray-500 rounded-sm p-1'>
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                    <Droppable droppableId={String(x.id)}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className='flex flex-col space-y-2 transition-all'
                                                style={{ minHeight: "50px", maxHeight: "80vh", overflowY: "auto" }}
                                            >


                                                {x.items.map((item, cardIndex) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={cardIndex}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className='bg-white p-2 rounded-md  border-zinc-900 hover:border-gray-500 cursor-pointer flex-shrink-0'
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

            <div className='flex flex-col w-full' style={{ backgroundColor: `${bdata.bgcolor}` }}>
                {showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-[#000000d8]">
                        <div className="bg-[#f1f2f4] p-6 rounded-lg w-[700px] mb-2 max-h-[80vh] overflow-y-auto relative">

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

                                {/* File Upload */}
                                <input
                                    type="file"
                                    accept="image/*, .pdf, .doc, .docx"
                                    className="mt-2 text-blue-400"
                                    onChange={handleAttachmentUpload}
                                />

                                {/* Display Attachments */}
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
                                <div className="max-h-32 pt-3 pb-3 overflow-hidden  p-2 ">
                                    {comments.map((comment, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white border p-2 rounded mb-1 text-black">
                                            {editCommentIndex === index ? (
                                                <input type="text" className="w-full p-1 border rounded text-black" value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} />
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
    );
}

export default Main;
