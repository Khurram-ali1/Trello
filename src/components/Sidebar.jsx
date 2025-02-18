import React, { useContext, useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X } from 'react-feather'
import { Popover } from "react-tiny-popover";
import { BoardContext } from '../context/BoardContext';

function Sidebar() {
    const blankBoard ={
        name:'',
        bgcolor:'#f60000',
        list:[]
    }
    const [boardData,setBoardData] = useState(blankBoard)
    const [collapsed, setCollapsed] = useState(false)
    const [showpop, setShowPop] = useState(false)
    const { allboard, setAllBoard } = useContext(BoardContext)
    const setActiveBoard=(i)=>{
        let newBoard = {...allboard}
        newBoard.active = i;
        setAllBoard(newBoard);
    }
    const addBoard=()=>{
        let newB = {...allboard}
        newB.boards.push({...boardData,lists:[]})
        setAllBoard(newB)
        setBoardData(blankBoard)
        setShowPop(!showpop)
    }

    return (
        <div className={`bg-[#121417] h-[calc(100vh-3rem)] border-r border-r-[#9fadbc29] transition-all linear duration-500 flex-shrink-0 ${collapsed ? 'w-[40px]' : 'w-[280px]'}`}>
            {collapsed && <div className='p-2'>
                <button onClick={() => setCollapsed(!collapsed)} className='hover:bg-slate-600 rounded-sm'>
                    <ChevronRight size={18}></ChevronRight>
                </button>
            </div>}
            {!collapsed && <div>
                <div className="workspace p-3 flex justify-between border-b border-b-[#9fadbc29]">
                    <h4>Remote Dev's Workspace</h4>
                    <button onClick={() => setCollapsed(!collapsed)} className='hover:bg-slate-600 rounded-sm p-1'>
                        <ChevronLeft size={18}></ChevronLeft>
                    </button>
                </div>
                <div className="boardlist">
                    <div className='flex justify-between px-3 py-2'>
                        <h4>Your Boards</h4>

                        <Popover
                            isOpen={showpop}
                            align='start'
                            positions={['right', 'top', 'bottom', 'left']} // preferred positions by priority
                            content={
                                <div className='ml-2 p-2 w-60 flex flex-col justify-center items-center bg-slate-500 text-white rounded'>
                                    <button onClick={() => setShowPop(!showpop)} className='absolute right-2 top-2 hover:bg-gray-500 p-1 rounded'><X size={16}></X></button>
                                    <h4 className='py-3'>Create Board</h4>
                                    <img src="https://placehold.co/200x128/png" alt="" />
                                    <div className="mt-3 flex flex-col items-start w-full">
                                        <label htmlFor="title">Board Title <span>*</span></label>
                                        <input value={boardData.name} onChange={(e)=>setBoardData({...boardData,name:e.target.value})} type="text" className='mb-2 h-8 w-full px-2 bg-gray-700' />
                                        <label htmlFor="title">Board Color</label>
                                        <input value={boardData.bgcolor} onChange={(e)=>setBoardData({...boardData,bgcolor:e.target.value})} type="color" className='mb-2 h-8 w-full px-2 bg-gray-700' />
                                        <button onClick={()=>addBoard()} className='w-full h-8 rounded bg-slate-700 mt-2 hover:bg-gray-500'>Create</button>
                                    </div>
                                </div>
                            }
                        >
                            <button onClick={() => setShowPop(!showpop)} className='hover:bg-slate-600 rounded-sm p-1'><Plus size={16}></Plus></button>
                        </Popover>
                    </div>
                </div>
                <ul>
                    {allboard.boards && allboard.boards.map((x,i)=>{
                        return <li key={i}>
                            <button onClick={()=>setActiveBoard(i)} className='px-3 py-2 w-full text-sm flex justify-start align-baseline hover:bg-gray-500'>
                                <span className='w-6 h-max rounded-sm mr-2' style={{backgroundColor:`${x.bgcolor}`}}>&nbsp;</span>
                                <span>{x.name}</span>
                            </button>
                        </li>
                    })
                    }
                </ul>
            </div>}
        </div>
    )
}

export default Sidebar