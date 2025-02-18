import React, { useContext, useState } from 'react';
import { MoreHorizontal, UserPlus, Edit2, Check, X } from 'react-feather'; // Import icons
import CardAdd from './CardAdd';
import { BoardContext } from '../context/BoardContext';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddList from './AddList';
import Utils from '../utils/Utils';

function Main() {
    const { allboard, setAllBoard } = useContext(BoardContext);
    const bdata = allboard.boards[allboard.active];

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

    const [editingCard, setEditingCard] = useState(null);
    const [editText, setEditText] = useState("");

    const startEditing = (cardId, currentTitle) => {
        setEditingCard(cardId);
        setEditText(currentTitle);
    };

    const saveEdit = (listIndex, cardIndex) => {
        if (!editText.trim()) return;

        let newLists = [...bdata.lists];
        newLists[listIndex].items[cardIndex].title = editText;

        let board_ = { ...allboard };
        board_.boards[board_.active].lists = newLists;
        setAllBoard(board_);

        setEditingCard(null);
    };

    const cardData = (e, ind) => {
        let newLists = [...bdata.lists];
        newLists[ind].items.push({ id: Utils.makeid(5), title: e });

        let board_ = { ...allboard };
        board_.boards[board_.active].lists = newLists;
        setAllBoard(board_);
    };

    const listData = (e) => {
        let newLists = [...bdata.lists];
        newLists.push({ id: Utils.makeid(5), title: e, items: [] });

        let board_ = { ...allboard };
        board_.boards[board_.active].lists = newLists;
        setAllBoard(board_);
    };

    return (
        <div className='flex flex-col w-full' style={{ backgroundColor: `${bdata.bgcolor}` }}>
            <div className='p-3 bg-black flex justify-between w-full bg-opacity-50'>
                <h2 className='text-lg'>{bdata.name}</h2>
                <div className='flex items-center justify-center'>
                    <button className='bg-gray-200 text-gray-500 px-2 h-8 py-1 mr-2 rounded flex items-center'>
                        <UserPlus size={16} className='mr-2' /> Share
                    </button>
                    <button className='hover:bg-gray-500 px-2 py-1 h-8 rounded'><MoreHorizontal size={16} /></button>
                </div>
            </div>
            <div className='flex flex-col w-full flex-grow relative'>
                <div className='absolute mb-1 pb-2 left-0 right-0 top-0 bottom-0 p-3 flex overflow-x-scroll overflow-y-hidden'>
                    <DragDropContext onDragEnd={onDragEnd}>
                        {bdata.lists && bdata.lists.map((x, listIndex) => (
                            <div key={x.id} className='mr-3 w-60 h-fit rounded-md p-2 bg-black'>
                                <div className="list-body">
                                    <div className='flex justify-between p-1'>
                                        <span>{x.title}</span>
                                        <button className='hover:bg-gray-500 rounded-sm p-1'><MoreHorizontal size={16} /></button>
                                    </div>
                                    <Droppable droppableId={String(x.id)}>
                                        {(provided, snapshot) => (
                                            <div
                                                className='py-1'
                                                ref={provided.innerRef}
                                                style={{ backgroundColor: snapshot.isDraggingOver ? "#222" : 'transparent' }}
                                                {...provided.droppableProps}
                                            >
                                                {x.items && x.items.map((item, cardIndex) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={cardIndex}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <div className='item flex justify-between items-center bg-zinc-700 p-2 cursor-pointer rounded-md border-2 border-zinc-900 hover:border-gray-500 '>
                                                                    {editingCard === item.id ? (
                                                                        <input
                                                                            type="text"
                                                                            value={editText}
                                                                            onChange={(e) => setEditText(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") saveEdit(listIndex, cardIndex);
                                                                            }}
                                                                            className='bg-gray-800 text-white p-1 rounded-md w-full'
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <span>{item.title}</span>
                                                                    )}
                                                                    <span className='flex'>
                                                                        {editingCard === item.id ? (
                                                                            <>
                                                                                <button
                                                                                    className='hover:bg-gray-600 p-1 rounded-sm'
                                                                                    onClick={() => saveEdit(listIndex, cardIndex)}
                                                                                >
                                                                                    <Check size={16} />
                                                                                </button>
                                                                                <button
                                                                                    className='hover:bg-gray-600 p-1 rounded-sm'
                                                                                    onClick={() => setEditingCard(null)}
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <button
                                                                                className='hover:bg-gray-600 p-1 rounded-sm'
                                                                                onClick={() => startEditing(item.id, item.title)}
                                                                            >
                                                                                <Edit2 size={16} />
                                                                            </button>
                                                                        )}
                                                                    </span>
                                                                </div>
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
                            </div>
                        ))}
                    </DragDropContext>
                    <AddList getlist={listData} />
                </div>
            </div>
        </div>
    );
}

export default Main;
