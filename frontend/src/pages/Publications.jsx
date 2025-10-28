import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FaFilePdf, FaGithub, FaQuoteLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import Button from '../components/Button';
import PublicationDetailsModal from '../components/PublicationDetailsModal';
import ActivityRings from '../components/ActivityRings';
import { LoadingSpinner, SkeletonLoader } from '../components/LoadingStates';
import EmptyState from '../components/EmptyState';

const Publications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [activePublication, setActivePublication] = useState(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const response = await axios.get(`${apiUrl}/api/publications`);
        setPublications(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch publications');
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Get citation count from publication data
  const getCitationCount = (publication) => {
    if (publication.showCitations && publication.citationCount > 0) {
      return publication.citationCount;
    }
    return null;
  };

  // Get status counts from actual publication data
  const getStatusCounts = () => {
    const counts = {
      'Under Preparation': 0,
      'Submitted': 0,
      'Under Review': 0,
      'Accepted': 0,
    };

    publications.forEach((publication) => {
      if (publication.status && counts.hasOwnProperty(publication.status)) {
        counts[publication.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Filter publications based on selected status
  const filteredPublications = statusFilter
    ? publications.filter((publication) => publication.status === statusFilter)
    : publications;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#000000] to-[#000000]" />

        <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 text-center">
              <LoadingSpinner size="lg" message="Loading research publications..." />
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
                  label: 'Under Preparation',
                  count: statusCounts['Under Preparation'],
                },
                {
                  label: 'Submitted',
                  count: statusCounts['Submitted'],
                },
                {
                  label: 'Under Review',
                  count: statusCounts['Under Review'],
                },
                {
                  label: 'Accepted',
                  count: statusCounts['Accepted'],
                },
              ]}
              colors={[
                { color: '#A855F7', gradient: 'from-purple-500 to-violet-500' },  // Under Preparation - Purple
                { color: '#EAB308', gradient: 'from-yellow-500 to-amber-500' },    // Submitted - Yellow
                { color: '#3B82F6', gradient: 'from-blue-500 to-indigo-500' },     // Under Review - Blue
                { color: '#22C55E', gradient: 'from-green-500 to-emerald-500' },   // Accepted - Green
              ]}
              ringSpacing={13}
              startRadius={85}
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

          {/* Publications List */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {filteredPublications.length === 0 ? (
              <EmptyState sectionName={statusFilter ? `publications with status: ${statusFilter}` : 'publications'} />
            ) : (
              filteredPublications.map((publication, index) => {
                const citations = getCitationCount(publication);
                const isFeatured = index === 0;

                const openDetails = () =>
                  setActivePublication({ ...publication, citationCount: citations });

                return (
                  <motion.button
                    key={publication.id}
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
                      <div className="relative overflow-hidden rounded-xl -mt-6 -mx-6 mb-6 transition-opacity duration-300 group-hover:opacity-80">
                        {publication.thumbnailUrl ? (
                          <img
                            src={publication.thumbnailUrl}
                            alt={publication.title}
                            className="w-full h-52 object-cover"
                          />
                        ) : (
                          <div className="w-full h-52 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                        {isFeatured && (
                          <div className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur shadow-lg">
                            Featured
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col space-y-4">
                        <div className="transition-opacity duration-300 group-hover:opacity-70 space-y-4">
                          <div className="space-y-2">
                            <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
                              {publication.title}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {publication.venue}
                              {publication.year ? ` · ${publication.year}` : ''}
                            </p>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
                            {publication.abstract}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
                            {publication.status && (
                              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                {publication.status}
                              </span>
                            )}
                            {citations !== null && citations > 0 && (
                              <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
                                <FaQuoteLeft className="w-3 h-3 opacity-60" />
                                {citations} citation(s)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-end border-t border-black/10 pt-4 text-sm dark:border-white/10">
                            <span
                              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold"
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
                          const showCode = publication.showCodeButton && publication.codeUrl;
                          const showPdf = publication.showPdfButton && publication.pdfUrl;
                          const visibleButtons = [showCode, showPdf].filter(Boolean).length;

                          if (visibleButtons === 0) return null;

                          return (
                            <div className={`grid gap-3 ${visibleButtons === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {showCode && (
                                <Button
                                  href={publication.codeUrl}
                                  variant="ghost"
                                  icon={FaGithub}
                                  className="px-4 py-2.5 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  Code
                                </Button>
                              )}
                              {showPdf && (
                                <Button
                                  href={publication.pdfUrl}
                                  variant="ghost"
                                  icon={FaFilePdf}
                                  className="px-4 py-2.5 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  Paper
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
          </div>
          <AnimatePresence>
            {activePublication && (
              <PublicationDetailsModal
                publication={activePublication}
                onClose={() => setActivePublication(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Publications;
