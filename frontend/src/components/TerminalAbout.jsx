import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const TerminalAbout = ({ profile }) => {
  const aboutSegments = useMemo(() => {
    if (!profile?.about) return [];
    return profile.about
      .split(/\n+/)
      .map((segment) => segment.trim())
      .filter(Boolean);
  }, [profile?.about]);

  const [visibleSegments, setVisibleSegments] = useState([]);

  useEffect(() => {
    setVisibleSegments([]);
    if (!aboutSegments.length) {
      return;
    }

    const timers = aboutSegments.map((segment, index) =>
      setTimeout(() => {
        setVisibleSegments((prev) => [...prev, segment]);
      }, index * 450),
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [aboutSegments]);

  const portraitUrl = useMemo(() => {
    if (!profile?.profileImageUrl) {
      return null;
    }
    const url = profile.profileImageUrl;
    if (/^https?:/i.test(url)) {
      return url;
    }
    const sanitized = url.startsWith('/') ? url : `/${url}`;
    return `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'}${sanitized}`;
  }, [profile?.profileImageUrl]);

  const systemInfo = [
    { label: 'Name', value: profile?.name || 'User' },
    { label: 'Title', value: profile?.title || 'Developer' },
    { label: 'OS', value: 'Arch Linux' },
    { label: 'Shell', value: 'zsh 5.9' },
    { label: 'Uptime', value: '∞ hours' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto font-mono" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
      {/* Terminal Header */}
      <div className="bg-gray-800 dark:bg-gray-900 rounded-t-lg px-3 sm:px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-400 text-xs sm:text-sm ml-2 sm:ml-4 truncate">tmux: [0] about-me</div>
      </div>

      {/* Terminal Body - Tmux Split */}
      <div className="bg-black/95 backdrop-blur-sm rounded-b-lg border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-700 w-full">
          {/* Left Pane - Neofetch Style */}
          <div className="p-3 sm:p-4 lg:p-6 min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden w-full">
            {/* Status Bar */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4 pb-2 border-b border-gray-800">
              <span>0:neofetch</span>
              <span className="text-green-400">●</span>
            </div>

            {/* Neofetch Content */}
            <div className="flex flex-col gap-4 overflow-hidden w-full">
              {/* ASCII Art */}
              <div className="flex justify-center">
                {portraitUrl ? (
                  <img
                    src={portraitUrl}
                    alt={profile?.name ? `${profile.name} portrait` : 'Profile portrait'}
                    className="w-auto h-auto max-w-[240px] sm:max-w-[280px] rounded-xl object-cover border border-gray-800"
                  />
                ) : (
                  <div className="text-gray-500 text-xs font-mono">
                    <pre>
{`   _____
  /     \\
 | () () |
  \\  ^  /
   |||||
   |||||`}
                    </pre>
                  </div>
                )}
              </div>

              {/* System Info */}
              <div className="space-y-1 overflow-hidden w-full">
                <div className="text-cyan-400 font-bold mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm overflow-hidden">
                  <span className="text-green-400 flex-shrink-0">➜</span>
                  <span className="break-all min-w-0">{profile?.name || 'user'}@portfolio</span>
                </div>
                <div className="h-px bg-gray-700 mb-2 sm:mb-3"></div>
                {systemInfo.map((info, index) => (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-2 text-xs sm:text-sm overflow-hidden"
                  >
                    <span className="text-blue-400 font-semibold min-w-[60px] sm:min-w-[80px] flex-shrink-0">
                      {info.label}:
                    </span>
                    <span className="text-gray-300 break-words min-w-0 flex-1">{info.value}</span>
                  </motion.div>
                ))}

                {/* Color Palette */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800">
                  <div className="flex gap-1 flex-wrap">
                    {['bg-black', 'bg-red-500', 'bg-green-500', 'bg-yellow-500',
                      'bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-white'].map((color) => (
                      <div key={color} className={`w-3 h-3 sm:w-4 sm:h-4 ${color}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane - About Me with Typing Animation */}
          <div className="p-3 sm:p-4 lg:p-6 min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden flex flex-col w-full">
            {/* Status Bar */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4 pb-2 border-b border-gray-800 flex-shrink-0">
              <span>1:about.txt</span>
              <span className="text-green-400">●</span>
            </div>

            {/* Command Prompt */}
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm flex-shrink-0">
              <span className="text-green-400">➜</span>{' '}
              <span className="text-blue-400">~</span>{' '}
              <span className="text-gray-300">cat about.txt</span>
            </div>

            {/* Gemini-style streaming content */}
            <div className="text-gray-300 text-xs sm:text-sm leading-relaxed overflow-y-auto overflow-x-hidden flex-1 pr-2 space-y-3">
              {visibleSegments.length === 0 && (
                <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
              )}
              {visibleSegments.map((segment, index) => (
                <motion.p
                  key={`${segment}-${index}`}
                  initial={{ opacity: 0, y: 6, backgroundPosition: '200% 0' }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundPosition: '0% 0',
                  }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeOut',
                  }}
                  className="relative whitespace-pre-wrap break-words bg-gradient-to-r from-white/0 via-white/8 to-transparent bg-[length:200%_100%] rounded-md px-2 py-1"
                >
                  {segment}
                </motion.p>
              ))}
            </div>
          </div>
        </div>

        {/* Terminal Footer - Tmux Status Line */}
        <div className="bg-green-600 dark:bg-green-700 px-3 sm:px-4 py-1 flex items-center justify-between text-[0.65rem] sm:text-xs text-black dark:text-white font-semibold">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <span className="whitespace-nowrap">[0:neofetch]</span>
            <span className="text-black/80 dark:text-white/80 whitespace-nowrap">[1:about.txt]*</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap">
            <span className="hidden sm:inline">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalAbout;
