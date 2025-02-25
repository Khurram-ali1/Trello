import React, { useState } from 'react'
import './App.css'
import TrelloApp from './components/TrelloApp'
import Login from './components/Login'
import { BrowserRouter as Router , Route ,Routes } from 'react-router-dom'

function App() {
  

  return (
    <>
    <Router>
      <Routes>
        <Route path="/trello" element={<TrelloApp/>}/>
        <Route path="/" element={<Login/>}/>
      </Routes>
    </Router>
    
    
    </>
  )
}

export default App