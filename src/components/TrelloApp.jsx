import React, { useState } from 'react'
import '../../src/App.css'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Main from '../components/Main'
import { BoardContext } from '../context/BoardContext'


const TrelloApp = () => {
     const boardData= {
        active:0,
        boards:[
          {
            name: "My Trello Board",
            bgcolor:"",
            lists:[
              {id:"1", title:"To do",items:[{id:"cdrFt", title:"Project Description 1"}]},
              {id:"2", title:"In Progress",items:[{id:"cdfdr", title:"Project Description 2"}]},
              {id:"3", title:"Completed",items:[{id:"cdfer", title:"Project Description 3"}]},
            ]
          }
        ]
      }
      const [allboard , setAllBoard] = useState(boardData)
  return (
    <BoardContext.Provider value={{allboard,setAllBoard}}> 
    <Header></Header>
    <div className='content flex'>
      <Sidebar></Sidebar>
      <Main></Main>
    </div>
    </BoardContext.Provider>
  )
}

export default TrelloApp