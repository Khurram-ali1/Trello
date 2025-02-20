import React, { useContext, useState } from 'react';
import { MoreHorizontal, UserPlus, Edit2, Image as ImageIcon, X } from 'react-feather';
import CardAdd from './CardAdd';
import { BoardContext } from '../context/BoardContext';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddList from './AddList';
import Utils from '../utils/Utils';

function Main() {
    const { allboard, setAllBoard } = useContext(BoardContext);
    const bdata = allboard.boards[allboard.active];

    // States for managing popups
    const [selectedCard, setSelectedCard] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editImage, setEditImage] = useState("");
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

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
    const addComment = () => {
        if (newComment.trim() === "") return;
        setComments([...comments, newComment]);
        setNewComment("");
    };

    const openPopup = (card, listIndex, cardIndex) => {
        setSelectedCard({ ...card, listIndex, cardIndex });
        setEditTitle(card.title);
        setEditImage(card.image || "");
        setComments(card.comments || []);
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
            comments: comments
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

    return (
        <div className='flex flex-col w-full ' style={{ backgroundColor: `${bdata.bgcolor}` }}>
            <div className='p-3 bg-[#474648] flex justify-between w-full bg-opacity-50'>
                <h2 className='text-lg'>{bdata.name}</h2>
                <div className='flex items-center justify-center'>
                    <button className='bg-gray-200 text-gray-500 px-2 h-8 py-1 mr-2 rounded flex items-center'>
                        <UserPlus size={16} className='mr-2' /> Share
                    </button>
                    <button className='hover:bg-gray-500 px-2 py-1 h-8 rounded'><MoreHorizontal size={16} /></button>
                </div>
            </div>
            <div className='flex flex-col w-full flex-grow relative h-screen overflow-hidden'>
                <div className='mb-1 pb-2 p-3 flex overflow-x-auto overflow-y-hidden'>
                    <div className='flex flex-row space-x-4 px-3 items-start'>
                        <DragDropContext onDragEnd={onDragEnd}>
                            {bdata.lists && bdata.lists.map((x, listIndex) => (
                                <div
                                    key={x.id}
                                    className='w-60 rounded-md p-2 text-black bg-[#f1f2f4] flex flex-col overflow-y-auto'
                                    style={{ minHeight: "50px", maxHeight: "90vh" }}
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
                                                            className='bg-white p-2 rounded-md border-2 border-zinc-900 hover:border-gray-500 cursor-pointer flex-shrink-0'
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
                    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-40 backdrop-blur-md">
                        <div className="bg-white bg-opacity-50 backdrop-blur-lg p-6 rounded-lg shadow-lg w-100 ">
                            <h3 className="text-lg mb-2 text-black">Edit Card</h3>
                            <input type="text" placeholder='Enter your Title' className="w-full p-2 border rounded text-black" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />

                            <input type="file" accept="image/*" className="mt-2 text-blue-400" onChange={handleImageUpload} />
                            {editImage && <img src={editImage} alt="Preview" className="w-full mt-2 rounded-md" />}

                            <div className="mt-4">
                                <h4 className="text-black text-md mb-2">Comments</h4>
                                <div className="max-h-32 overflow-y-auto border p-2 rounded scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
                                    {comments.map((comment, index) => (
                                        <p key={index} className="bg-white border p-2 rounded mb-1 text-black">{comment}</p>
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
