import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App.jsx'
import Home from './pages/Home.jsx'
import ListItem from './pages/ListItem.jsx'
import './css/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
       <Route path="/list/:listId" element={<ListItem />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)