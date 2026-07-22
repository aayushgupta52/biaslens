import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import TopNav from './components/TopNav.jsx';
import Home from './pages/Home.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import Spectrum from './pages/Spectrum.jsx';
import Sources from './pages/Sources.jsx';
import About from './pages/About.jsx';
import Exposure from './pages/Exposure.jsx';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <TopNav />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/spectrum" element={<Spectrum />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/about" element={<About />} />
          <Route path="/exposure" element={<Exposure />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
