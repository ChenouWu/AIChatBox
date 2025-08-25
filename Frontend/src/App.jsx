import { useState } from 'react'
import Home from './pages/Home'
import Header from './components/Header'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
    <BrowserRouter>
      <Header/>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
