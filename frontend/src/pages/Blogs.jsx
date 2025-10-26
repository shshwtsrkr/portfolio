import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaClock, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import EmptyState from '../components/EmptyState';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const response = await axios.get(`${apiUrl}/api/blogs`);
        setBlogs(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch blogs');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Get reading time from backend or calculate if not provided
  const getReadingTime = (blog) => {
    if (blog.readDuration && blog.readDuration > 0) {
      return blog.readDuration;
    }
    // Fallback calculation
    const text = blog.content || blog.description || '';
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return minutes || 5;
  };

  // Get category from blog tag
  const getCategory = (blog) => {
    if (blog.tag && blog.tag.trim()) {
      return {
        name: blog.tag,
        color: blog.tagColor || '#6366f1'
      };
    }
    return { name: 'Technical', color: '#6366f1' };
  };

  // Generate gradient based on title hash
  const generateGradient = (title) => {
    const colors = [
      ['#9333ea', '#2563eb'], // purple to blue
      ['#2563eb', '#0ea5e9'], // blue to cyan
      ['#9333ea', '#c026d3'], // purple to pink
      ['#2563eb', '#7c3aed'], // blue to violet
    ];

    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-black dark:border-white border-t-transparent rounded-full"
        />
      </div>
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-white to-blue-50/20 dark:from-[#000000] dark:via-[#000000] dark:to-[#000000] transition-colors duration-500" />

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Blogs Grid */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {blogs.length === 0 ? (
              <EmptyState sectionName="blogs" />
            ) : (
              blogs.map((blog, index) => {
                const readingTime = getReadingTime(blog);
                const category = getCategory(blog);

                return (
                  <motion.a
                    key={blog.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    href={blog.externalUrl || '#'}
                    target={blog.externalUrl ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="card-glass overflow-hidden group cursor-pointer flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden rounded-xl -mt-6 -mx-6 mb-6 transition-opacity duration-300 group-hover:opacity-80">
                      {blog.thumbnailUrl ? (
                        <img
                          src={blog.thumbnailUrl}
                          alt={blog.title}
                          className="w-full h-52 object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-52"
                          style={{
                            background: `linear-gradient(135deg, ${generateGradient(blog.title)[0]}, ${generateGradient(blog.title)[1]})`,
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <div
                          className="text-white px-3 py-1.5 rounded-full shadow-lg"
                          style={{ backgroundColor: category.color }}
                        >
                          <span className="text-xs font-bold">{category.name}</span>
                        </div>
                      </div>

                      {/* Reading Time Badge */}
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                          <FaClock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {readingTime} min read
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col space-y-4 transition-opacity duration-300 group-hover:opacity-70">
                      <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white leading-tight">
                        {blog.title}
                      </h2>

                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
                        {blog.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-white/10">
                        {blog.date && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <FaCalendarAlt className="w-3 h-3" />
                            <span>{blog.date}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-sm">
                          <span>Read More</span>
                          <FaArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.a>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Blogs;
