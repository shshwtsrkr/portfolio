import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import Button from '../components/Button';
import ActivityRings from '../components/ActivityRings';
import { LoadingSpinner, SkeletonLoader } from '../components/LoadingStates';
import EmptyState from '../components/EmptyState';
import ProjectDetailsModal from '../components/ProjectDetailsModal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const response = await axios.get(`${apiUrl}/api/projects`);
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#000000] to-[#000000]" />

        <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <LoadingSpinner size="lg" message="Loading amazing projects..." />
            </div>
            <SkeletonLoader type="card" count={2} />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-glass text-center max-w-md w-full">
          <p className="text-xl text-black dark:text-white">{error}</p>
        </div>
      </div>
    );
  }

  // Get status counts from actual project data
  const getStatusCounts = () => {
    const counts = {
      'Completed': 0,
      'Active Development': 0,
    };

    projects.forEach((project) => {
      if (project.status && counts.hasOwnProperty(project.status)) {
        counts[project.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Filter projects based on selected status
  const filteredProjects = statusFilter
    ? projects.filter((project) => project.status === statusFilter)
    : projects;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#000000] to-[#000000]" />

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Activity Rings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <ActivityRings
              data={[
                {
                  label: 'Completed',
                  count: statusCounts['Completed'],
                },
                {
                  label: 'Active Development',
                  count: statusCounts['Active Development'],
                },
              ]}
              onFilterChange={setStatusFilter}
              selectedFilter={statusFilter}
            />
          </motion.div>

          {/* Filter indicator */}
          {statusFilter && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-center justify-center gap-4"
            >
              <span className="text-gray-400">Showing: </span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-white font-semibold">
                {statusFilter}
              </span>
              <button
                onClick={() => setStatusFilter(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                Clear Filter
              </button>
            </motion.div>
          )}

          {/* Projects Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.length === 0 ? (
              <EmptyState sectionName={statusFilter ? `projects with status: ${statusFilter}` : 'projects'} />
            ) : (
              filteredProjects.map((project, index) => {
                const openDetails = () => setActiveProject(project);

                return (
                  <motion.button
                    key={project.id}
                    type="button"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="group h-full text-left focus-visible:outline-none"
                    onClick={openDetails}
                  >
                    <div className="card-glass flex h-full flex-col overflow-hidden">
                    {project.previewImageUrl && (
                      <div className="relative overflow-hidden rounded-xl -mt-6 -mx-6 mb-6 transition-opacity duration-300 group-hover:opacity-80">
                        <img
                          src={project.previewImageUrl}
                          alt={project.title}
                          className="w-full h-52 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                        {project.status && (
                          <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur shadow-lg">
                            {project.status}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-1 flex-col space-y-4">
                      <div className="transition-opacity duration-300 group-hover:opacity-70 space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-white">
                          {project.title}
                        </h2>

                        <p className="text-gray-400 leading-relaxed line-clamp-3">
                          {project.description}
                        </p>

                        {project.technologies && (
                          <p className="text-xs font-medium text-gray-200">
                            {project.technologies.split(',').map((tech) => tech.trim()).join(' • ')}
                          </p>
                        )}

                        {project.completedDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <FaCalendarAlt className="w-3 h-3" />
                            <span>{project.completedDate}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-end border-t border-white/10 pt-4 text-sm">
                          <span
                            className="flex items-center gap-2 text-gray-400 font-semibold"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDetails();
                            }}
                          >
                            View Details
                            <FaArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const showCode = project.showCodeButton && project.githubUrl;
                        const showLiveDemo = project.showLiveDemoButton && project.liveUrl;
                        const visibleButtons = [showCode, showLiveDemo].filter(Boolean).length;

                        if (visibleButtons === 0) return null;

                        return (
                          <div className={`grid gap-3 mt-auto ${visibleButtons === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {showCode && (
                              <Button
                                href={project.githubUrl}
                                variant="ghost"
                                icon={FaGithub}
                                className="px-3 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
                                onClick={(event) => event.stopPropagation()}
                              >
                                Code
                              </Button>
                            )}
                            {showLiveDemo && (
                              <Button
                                href={project.liveUrl}
                                variant="ghost"
                                icon={FaExternalLinkAlt}
                                className="px-3 py-2 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
                                onClick={(event) => event.stopPropagation()}
                              >
                                Live Demo
                              </Button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.button>
              );
            })
            )}
          </motion.div>
          <AnimatePresence>
            {activeProject && (
              <ProjectDetailsModal
                project={activeProject}
                onClose={() => setActiveProject(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Projects;
