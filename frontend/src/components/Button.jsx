import { motion } from 'framer-motion';

const Button = ({ children, onClick, href, variant = 'primary', icon: Icon, className = '', ...props }) => {

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50',
    secondary: 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black shadow-lg hover:shadow-xl',
    outline: 'bg-white/10 dark:bg-white/5 backdrop-blur-2xl border-2 border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-white/20 dark:hover:bg-white/10',
    ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white',
  };

  const buttonClasses = `
    relative overflow-hidden
    flex items-center justify-center
    px-6 py-3 rounded-xl font-semibold
    transition-all duration-500 ease-out
    ${variants[variant]}
    ${className}
  `;

  const buttonContent = (
    <span className="flex items-center justify-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
        onClick={onClick}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        {...props}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={buttonClasses}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;
