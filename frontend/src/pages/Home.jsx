import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaEnvelope,
  FaDownload,
  FaGlobe,
  FaInstagram,
  FaYoutube,
  FaMedium,
  FaCodepen,
  FaStackOverflow,
  FaDribbble,
  FaBehance,
  FaLink,
  FaCode,
  FaJava,
  FaAws,
  FaLinux,
  FaWindows,
} from 'react-icons/fa6';
import {
  SiPytorch,
  SiTensorflow,
  SiDocker,
  SiKubernetes,
  SiPython,
  SiOpencv,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiMongodb,
  SiPostgresql,
  SiGo,
  SiFlask,
  SiNumpy,
  SiDjango,
  SiGnubash,
  SiCloudflare,
  SiGit,
} from 'react-icons/si';
import { TypeAnimation } from 'react-type-animation';
import axios from 'axios';
import { LoadingSpinner } from '../components/LoadingStates';
import TerminalAbout from '../components/TerminalAbout';

const TYPE_ANIMATION_DELAY = 2000;

const DEFAULT_TYPING_TEXTS = [
  'Deep Learning Researcher',
  'Computer Vision Expert',
  'DevOps Engineer',
  'ML Systems Architect',
];

const DEFAULT_ONELINER = {
  text: 'Building intelligent systems at the intersection of deep learning, computer vision, and scalable infrastructure',
  highlights: [
    { word: 'deep learning', color: '#9333ea' },
    { word: 'computer vision', color: '#2563eb' },
    { word: 'scalable infrastructure', color: '#16a34a' },
  ],
};

const DEFAULT_SOCIALS = [
  { platform: 'github', url: 'https://github.com', icon: 'FaGithub', color: '#9333ea' },
  { platform: 'linkedin', url: 'https://linkedin.com', icon: 'FaLinkedin', color: '#2563eb' },
  { platform: 'twitter', url: 'https://twitter.com', icon: 'FaTwitter', color: '#0ea5e9' },
  { platform: 'email', url: 'alex.johnson@example.com', icon: 'FaEnvelope', color: '#f43f5e' },
];

const DEFAULT_TECH_STACK = [
  { icon: 'SiPython', name: 'Python', color: '#3776AB' },
  { icon: 'SiGnubash', name: 'Shell Scripting', color: '#4EAA25' },
  { icon: 'SiPytorch', name: 'PyTorch', color: '#EE4C2C' },
  { icon: 'SiTensorflow', name: 'TensorFlow', color: '#FF6F00' },
  { icon: 'SiOpencv', name: 'OpenCV', color: '#5C3EE8' },
  { icon: 'SiFlask', name: 'Flask', color: '#FFFFFF' },
  { icon: 'SiNumpy', name: 'NumPy', color: '#013243' },
  { icon: 'FaCode', name: 'Seaborn', color: '#444876' },
  { icon: 'SiDjango', name: 'Django', color: '#092E20' },
  { icon: 'FaJava', name: 'Java', color: '#007396' },
  { icon: 'FaAws', name: 'AWS', color: '#FF9900' },
  { icon: 'SiDocker', name: 'Docker', color: '#2496ED' },
  { icon: 'SiKubernetes', name: 'Kubernetes', color: '#326CE5' },
  { icon: 'SiJavascript', name: 'JavaScript', color: '#F7DF1E' },
  { icon: 'FaLinux', name: 'Linux', color: '#FCC624' },
  { icon: 'SiCloudflare', name: 'Cloudflare', color: '#F38020' },
  { icon: 'SiGit', name: 'Git', color: '#F05032' },
  { icon: 'FaGithub', name: 'GitHub', color: '#181717' },
  { icon: 'FaWindows', name: 'Windows', color: '#0078D6' },
];

const DEFAULT_EXPERTISE_CARDS = [
  {
    title: 'Deep Learning Research',
    description: 'Neural architectures, model optimization, and cutting-edge ML research',
    icon: '🧠',
  },
  {
    title: 'Computer Vision',
    description: 'Object detection, image segmentation, and visual understanding systems',
    icon: '👁️',
  },
  {
    title: 'DevOps & MLOps',
    description: 'Scalable ML pipelines, containerization, and production deployment',
    icon: '⚙️',
  },
];

const SOCIAL_ICON_MAP = {
  github: FaGithub,
  fagithub: FaGithub,
  linkedin: FaLinkedin,
  falinkedin: FaLinkedin,
  twitter: FaXTwitter,
  fatwitter: FaXTwitter,
  faxtwitter: FaXTwitter,
  x: FaXTwitter,
  email: FaEnvelope,
  faenvelope: FaEnvelope,
  mail: FaEnvelope,
  globe: FaGlobe,
  faglobe: FaGlobe,
  website: FaGlobe,
  instagram: FaInstagram,
  fainstagram: FaInstagram,
  youtube: FaYoutube,
  fayoutube: FaYoutube,
  medium: FaMedium,
  famedium: FaMedium,
  codepen: FaCodepen,
  facodepen: FaCodepen,
  stackoverflow: FaStackOverflow,
  fastackoverflow: FaStackOverflow,
  dribbble: FaDribbble,
  fadribbble: FaDribbble,
  behance: FaBehance,
  fabehance: FaBehance,
  download: FaDownload,
  fadownload: FaDownload,
  link: FaLink,
  falink: FaLink,
  default: FaLink,
};

const TECH_ICON_MAP = {
  sipytorch: SiPytorch,
  pytorch: SiPytorch,
  sitensorflow: SiTensorflow,
  tensorflow: SiTensorflow,
  siopencv: SiOpencv,
  opencv: SiOpencv,
  sidocker: SiDocker,
  docker: SiDocker,
  sikubernetes: SiKubernetes,
  kubernetes: SiKubernetes,
  sipython: SiPython,
  python: SiPython,
  sireact: SiReact,
  react: SiReact,
  sinextdotjs: SiNextdotjs,
  nextjs: SiNextdotjs,
  sinodedotjs: SiNodedotjs,
  nodedotjs: SiNodedotjs,
  node: SiNodedotjs,
  sijavascript: SiJavascript,
  javascript: SiJavascript,
  sitypescript: SiTypescript,
  typescript: SiTypescript,
  sitailwindcss: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  tailwind: SiTailwindcss,
  simongodb: SiMongodb,
  mongodb: SiMongodb,
  sipostgresql: SiPostgresql,
  postgresql: SiPostgresql,
  sigo: SiGo,
  golang: SiGo,
  siflask: SiFlask,
  flask: SiFlask,
  sinumpy: SiNumpy,
  numpy: SiNumpy,
  sidjango: SiDjango,
  django: SiDjango,
  fajava: FaJava,
  java: FaJava,
  faaws: FaAws,
  aws: FaAws,
  amazonaws: FaAws,
  falinux: FaLinux,
  linux: FaLinux,
  signubash: SiGnubash,
  bash: SiGnubash,
  shell: SiGnubash,
  shellscripting: SiGnubash,
  fawindows: FaWindows,
  windows: FaWindows,
  sicloudflare: SiCloudflare,
  cloudflare: SiCloudflare,
  sigit: SiGit,
  git: SiGit,
  fagithub: FaGithub,
  github: FaGithub,
  default: FaCode,
};

const FALLBACK_SOCIAL_ICON = FaLink;
const FALLBACK_TECH_ICON = FaCode;

const safeParseJson = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse JSON value', { value, error });
    return fallback;
  }
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildHighlightedSegments = (config) => {
  if (!config || typeof config.text !== 'string' || !config.text.trim()) {
    return DEFAULT_ONELINER.text
      ? [{ type: 'text', text: DEFAULT_ONELINER.text }]
      : [];
  }

  const baseSegments = [{ type: 'text', text: config.text }];
  const highlights = Array.isArray(config.highlights) ? config.highlights : [];

  return highlights.reduce((accSegments, highlight) => {
    if (!highlight?.word) {
      return accSegments;
    }

    const regex = new RegExp(`(${escapeRegExp(highlight.word)})`, 'gi');

    return accSegments.flatMap((segment) => {
      if (segment.type !== 'text') {
        return segment;
      }

      const parts = segment.text.split(regex);

      if (parts.length === 1) {
        return segment;
      }

      return parts
        .filter(Boolean)
        .map((part) => {
          if (part.toLowerCase() === highlight.word.toLowerCase()) {
            return {
              type: 'highlight',
              text: part,
              color: highlight.color || '#6366f1',
            };
          }

          return { type: 'text', text: part };
        });
    });
  }, baseSegments);
};

const buildTypeAnimationSequence = (texts) => {
  const safeTexts = Array.isArray(texts) && texts.length ? texts : DEFAULT_TYPING_TEXTS;
  return safeTexts.flatMap((text) => [text, TYPE_ANIMATION_DELAY]);
};

const enhanceSocials = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && item.url)
    .map((item) => {
      const key = (item.icon || item.platform || '').toLowerCase();
      const iconComponent =
        SOCIAL_ICON_MAP[key] ||
        SOCIAL_ICON_MAP[`fa${key}`] ||
        SOCIAL_ICON_MAP.default ||
        FALLBACK_SOCIAL_ICON;

      return {
        ...item,
        Icon: iconComponent,
        color: item.color || '#6366f1',
      };
    });
};

const enhanceTechStack = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && item.name)
    .map((item) => {
      const rawKey = (item.icon || item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const iconComponent =
        TECH_ICON_MAP[rawKey] ||
        TECH_ICON_MAP[`si${rawKey}`] ||
        TECH_ICON_MAP.default ||
        FALLBACK_TECH_ICON;

      return {
        ...item,
        Icon: iconComponent,
        color: item.color || '#6366f1',
      };
    });
};

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const nameHeadingRef = useRef(null);
  const firstLetterRef = useRef(null);
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const response = await axios.get(`${apiUrl}/api/profile`);
        if (response.data.length > 0) {
          setProfile(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const typingTexts = useMemo(() => {
    const parsed = safeParseJson(profile?.typingAnimationTexts, DEFAULT_TYPING_TEXTS);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_TYPING_TEXTS;
  }, [profile]);

  const onelinerConfig = useMemo(() => {
    const parsed = safeParseJson(profile?.onelinerConfig, DEFAULT_ONELINER);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        text: typeof parsed.text === 'string' && parsed.text.trim() ? parsed.text : DEFAULT_ONELINER.text,
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : DEFAULT_ONELINER.highlights,
      };
    }

    return DEFAULT_ONELINER;
  }, [profile]);

  const onelinerSegments = useMemo(
    () => buildHighlightedSegments(onelinerConfig),
    [onelinerConfig],
  );

  const socialLinks = useMemo(() => {
    const parsed = safeParseJson(profile?.socials, DEFAULT_SOCIALS);
    const normalized = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SOCIALS;
    const enhanced = enhanceSocials(normalized);
    return enhanced.length ? enhanced : enhanceSocials(DEFAULT_SOCIALS);
  }, [profile]);

  const techStackItems = useMemo(() => {
    const parsed = safeParseJson(profile?.techStack, DEFAULT_TECH_STACK);
    const normalized = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_TECH_STACK;
    const enhanced = enhanceTechStack(normalized);
    return enhanced.length ? enhanced : enhanceTechStack(DEFAULT_TECH_STACK);
  }, [profile]);

  const expertiseCards = useMemo(() => {
    const parsed = safeParseJson(profile?.expertiseCards, DEFAULT_EXPERTISE_CARDS);
    const normalized = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_EXPERTISE_CARDS;
    return normalized.length ? normalized : DEFAULT_EXPERTISE_CARDS;
  }, [profile]);

  const typeAnimationSequence = useMemo(
    () => buildTypeAnimationSequence(typingTexts),
    [typingTexts],
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading profile..." />
      </div>
    );
  }

  return (
    <>
        {/* Hero Section */}
      <motion.section
        style={{ opacity: scrollOpacity, scale }}
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-48 pb-24 relative"
      >
        {/* Static subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-950" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto text-center relative z-10"
        >
          {/* Name */}
          <motion.h1
            ref={nameHeadingRef}
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tight relative"
            style={{
              color: 'rgba(255, 255, 255, 0)',
            }}
          >
            <motion.span
              className="absolute inset-0 text-white"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0 0 0)' }}
              transition={{
                duration: profile?.nameAnimationSpeed || 2.5,
                delay: 0.6,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <span ref={firstLetterRef} className="inline-block">
                {(profile?.name || 'Your Name').charAt(0)}
              </span>
              {(profile?.name || 'Your Name').slice(1)}
            </motion.span>
            <span ref={firstLetterRef} className="inline-block">
              {(profile?.name || 'Your Name').charAt(0)}
            </span>
            {(profile?.name || 'Your Name').slice(1)}
          </motion.h1>
          {/* Typing Animation */}
          <motion.div
            variants={itemVariants}
            className="h-16 md:h-20 flex items-center justify-center mb-12"
          >
            <TypeAnimation
              sequence={typeAnimationSequence}
              wrapper="span"
              speed={50}
              style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: '400' }}
              className="text-xl md:text-3xl text-gray-300"
              repeat={Infinity}
            />
          </motion.div>
          {/* Short Bio */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            {onelinerSegments.map((segment, index) =>
              segment.type === 'highlight' ? (
                <span
                  key={`highlight-${segment.text}-${index}`}
                  className="font-semibold"
                  style={{ color: segment.color }}
                >
                  {segment.text}
                </span>
              ) : (
                <Fragment key={`text-${segment.text}-${index}`}>
                  {segment.text}
                </Fragment>
              ),
            )}
          </motion.p>
          {/* Social Links */}
          <motion.div
            variants={itemVariants}
            className="flex gap-4 justify-center flex-wrap mb-8"
          >
            {socialLinks.map((social) => {
              const IconComponent = social.Icon || FALLBACK_SOCIAL_ICON;

              const href =
                social.platform?.toLowerCase() === 'email' && !social.url.startsWith('http')
                  ? `mailto:${social.url}`
                  : social.url;

              return (
                <motion.a
                  key={`${social.platform}-${social.url}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group relative overflow-hidden transition-all duration-300 rounded-2xl p-4 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20"
                  title={social.platform}
                >
                  <IconComponent
                    className="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_var(--icon-glow)]"
                    style={{
                      color: social.color || '#6366f1',
                      '--icon-glow': social.color || '#6366f1'
                    }}
                  />
                </motion.a>
              );
            })}
            {profile?.resumeFileUrl && (
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={async (e) => {
                  e.preventDefault();
                  // Open in new tab
                  window.open(profile.resumeFileUrl, '_blank');

                  // Download the file with custom filename
                  try {
                    const response = await fetch(profile.resumeFileUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'ShashwatSarkar_Resume.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Failed to download resume:', error);
                  }
                }}
                href={profile.resumeFileUrl}
                className="group relative overflow-hidden transition-all duration-300 rounded-2xl p-4 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20"
                title="Download Resume"
              >
                <FaDownload
                  className="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_#10b981]"
                  style={{ color: '#10b981' }}
                />
              </motion.a>
            )}
          </motion.div>

          {/* Scroll Indicator - Below Social Icons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="flex-shrink-0"
            >
              <div className="w-5 h-8 border-2 border-gray-600/70 rounded-full flex justify-center p-1.5">
                <div className="w-0.5 h-2 bg-gray-500 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Tech Stack Section - Outside of scroll fade */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#000000] to-[#000000]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
              Tech Stack
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-8 justify-items-center">
            {techStackItems.map((tech, index) => {
              const IconComponent = tech.Icon || FALLBACK_TECH_ICON;

              return (
                <motion.div
                  key={`${tech.name}-${index}`}
                  initial={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="p-4 bg-transparent rounded-2xl border-0 transition-all">
                    <IconComponent
                      className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: tech.color || '#6366f1' }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {tech.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* About Section - Terminal Style */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      >
        <TerminalAbout profile={profile} />
      </motion.section>
      {/* Expertise Section */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="pt-10 pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-10 md:grid-cols-3">
            {expertiseCards.length ? (
              expertiseCards.map((area, index) => (
                <motion.div
                  key={`${area.title}-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="card-glass h-full text-center"
                >
                  <div className="text-5xl mb-4">{area.icon || '✨'}</div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                    {area.title || 'Expertise'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {area.description || ''}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full card-glass text-center text-gray-500 dark:text-gray-400">
                No expertise cards configured yet.
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default Home;
