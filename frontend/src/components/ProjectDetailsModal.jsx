import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { FaGithub, FaExternalLinkAlt, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import Button from './Button';

const modalRoot = typeof document !== 'undefined' ? document.body : null;

const ProjectDetailsModal = ({ project, onClose }) => {
  const scrollContainerRef = useRef(null);
  const scrollContentRef = useRef(null);

  // Lock background scroll and enable smooth scroll in modal
  useEffect(() => {
    // Capture scroll position before any changes
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Lock background scroll completely
    document.documentElement.classList.add('lenis-stopped');
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalLeft = document.body.style.left;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Prevent scroll events on window
    const preventScroll = (e) => {
      // Check if the event target is within the modal scroll container
      if (scrollContainerRef.current && scrollContainerRef.current.contains(e.target)) {
        // Allow scrolling in modal
        return;
      }
      // Prevent all other scrolling
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    window.addEventListener('wheel', preventScroll, { passive: false, capture: true });
    window.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
    window.addEventListener('scroll', preventScroll, { passive: false, capture: true });

    // Initialize Lenis for modal content
    let modalLenis = null;
    let rafId = null;

    // Wait for refs to be available
    const initLenis = () => {
      if (scrollContainerRef.current && scrollContentRef.current) {
        modalLenis = new Lenis({
          wrapper: scrollContainerRef.current,
          content: scrollContentRef.current,
          duration: 0.8,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1.2,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false,
        });

        function raf(time) {
          modalLenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initLenis, 0);
    initLenis();

    return () => {
      // Cleanup timer and modal Lenis first
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      if (modalLenis) modalLenis.destroy();

      // Remove scroll prevention listeners
      window.removeEventListener('wheel', preventScroll, { capture: true });
      window.removeEventListener('touchmove', preventScroll, { capture: true });
      window.removeEventListener('scroll', preventScroll, { capture: true });

      // Re-enable Lenis BEFORE restoring position to prevent scroll jump
      document.documentElement.classList.remove('lenis-stopped');

      // Restore all styles
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.left = originalLeft;
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;

      // Restore scroll position with instant behavior
      window.scrollTo({ top: scrollY, left: scrollX, behavior: 'instant' });
    };
  }, []);

  if (!project || !modalRoot) return null;

  const buttons = [
    project.showCodeButton && project.githubUrl && {
      label: 'Code',
      href: project.githubUrl,
      icon: FaGithub,
    },
    project.showLiveDemoButton && project.liveUrl && {
      label: 'Live Demo',
      href: project.liveUrl,
      icon: FaExternalLinkAlt,
    },
  ].filter(Boolean);

  const content = (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl my-auto max-h-[calc(100vh-3rem)] rounded-3xl border border-white/15 bg-black/85 text-white shadow-[0_40px_120px_rgba(0,0,0,0.45)] overflow-hidden"
          onClick={(event) => event.stopPropagation()}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/15"
            aria-label="Close"
          >
            <FaTimes className="h-4 w-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="max-h-[calc(100vh-3rem)] overflow-y-auto overflow-x-hidden"
            onWheelCapture={(e) => {
              // Allow scroll only in modal, prevent bubbling to window
              e.stopPropagation();
            }}
            onTouchMoveCapture={(e) => {
              e.stopPropagation();
            }}
          >
            <div ref={scrollContentRef} className="space-y-6 p-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight">{project.title}</h3>
                {project.technologies && (
                  <p className="text-sm text-white/70">
                    {project.technologies.split(',').map((tech) => tech.trim()).join(' • ')}
                  </p>
                )}
              </div>

              {project.previewImageUrl && (
                <div className="overflow-hidden rounded-2xl border border-white/12 bg-black/40">
                  <img
                    src={project.previewImageUrl}
                    alt={`${project.title} preview`}
                    className="w-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                {project.status && (
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {project.status}
                  </span>
                )}

                <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">
                  {project.description || 'Description unavailable for this project.'}
                </p>

                {project.completedDate && (
                  <div className="flex items-center gap-2 text-sm text-white/60 pt-2 border-t border-white/10">
                    <FaCalendarAlt className="w-3 h-3" />
                    <span>Completed: {project.completedDate}</span>
                  </div>
                )}
              </div>

              {buttons.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-4">
                  {buttons.map((btn) => (
                    <Button
                      key={btn.label}
                      href={btn.href}
                      icon={btn.icon}
                      variant="ghost"
                      className="px-4 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
    </motion.div>
  );

  return createPortal(content, modalRoot);
};

export default ProjectDetailsModal;
