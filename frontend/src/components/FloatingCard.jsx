import { motion } from 'framer-motion';

export default function FloatingCard({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.17, 0.67, 0.83, 0.67],
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl"
    >
      {children}
    </motion.div>
  );
}