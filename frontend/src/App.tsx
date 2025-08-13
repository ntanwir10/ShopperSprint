import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import SearchResults from './components/SearchResults'
import ProductComparison from './components/ProductComparison'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/compare" element={<ProductComparison />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
