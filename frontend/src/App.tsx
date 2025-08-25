import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import ComingSoon from './components/ComingSoon';
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
          <Routes>
            <Route path="/" element={<ComingSoon />} />
            <Route
              path="/search"
              element={
                <>
                  <Header />
                  <SearchResults />
                </>
              }
            />
            <Route
              path="/product/:id"
              element={
                <>
                  <Header />
                  <ProductDetail />
                </>
              }
            />
            <Route
              path="/alerts"
              element={
                <>
                  <Header />
                  <PriceAlerts
                    productId="1"
                    currentPrice={999}
                    onSetAlert={() => {}}
                    onClose={() => {}}
                    isOpen={false}
                  />
                </>
              }
            />
            <Route
              path="/compare"
              element={
                <>
                  <Header />
                  <ProductComparison />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
