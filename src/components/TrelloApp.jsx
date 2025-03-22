import React, { useState } from 'react';
import '../../src/App.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Main from '../components/Main';
import { BoardContext } from '../context/BoardContext';

const TrelloApp = () => {
  const initialBoardData = {
    active: 0,
    boards: [
      {
        name: "My Trello Board",
        bgcolor: "",
        lists: [
          { id: "1", title: "New Order", items: [{ id: "cdrFt", title: "Project Description 1" }] },
          { id: "2", title: "Under Development", items: [{ id: "cdfdr", title: "Project Description 2" }] },
          { id: "3", title: "Waiting Need Complete Info", items: [{ id: "cdfer", title: "Project Description 3" }] },
        ]
      }
    ]
  };

  const [allboard, setAllBoard] = useState(initialBoardData);

  return (
   <>
    <BoardContext.Provider value={{ allboard, setAllBoard }}>
      <Header />
      <div className='content flex'>
        <Sidebar />
        <Main />
      </div>
      
    </BoardContext.Provider>
   
    </>
  );
};

export default TrelloApp;