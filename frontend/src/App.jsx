import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import SmoothScroll from './components/SmoothScroll';
import SwipeHint from './components/SwipeHint';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Projects from './pages/Projects';
import Publications from './pages/Publications';
import { useEffect, useState } from 'react';

const ROUTES = ['/', '/blogs', '/projects', '/publications'];

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isMobile) return;

      const currentIndex = ROUTES.indexOf(location.pathname);
      const prevIndex = (currentIndex - 1 + ROUTES.length) % ROUTES.length;
      navigate(ROUTES[prevIndex]);
    },
    onSwipedRight: () => {
      if (!isMobile) return;

      const currentIndex = ROUTES.indexOf(location.pathname);
      const nextIndex = (currentIndex + 1) % ROUTES.length;
      navigate(ROUTES[nextIndex]);
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50, // minimum swipe distance
    preventScrollOnSwipe: false,
  });

  return (
    <div {...handlers}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/publications" element={<Publications />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <SmoothScroll>
          <div className="w-full transition-colors duration-300">
            <Navigation />
            <AnimatedRoutes />
            <SwipeHint />
          </div>
        </SmoothScroll>
      </Router>
    </ThemeProvider>
  );
}

export default App;
