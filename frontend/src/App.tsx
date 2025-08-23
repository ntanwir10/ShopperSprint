import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import SearchResults from './components/SearchResults';
import ProductDetail from './components/ProductDetail';
import PriceAlerts from './components/PriceAlert';
import ProductComparison from './components/ProductComparison';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/alerts" element={<PriceAlerts productId="1" currentPrice={999} onSetAlert={() => {}} onClose={() => {}} isOpen={false} />} />
            <Route path="/compare" element={<ProductComparison />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
