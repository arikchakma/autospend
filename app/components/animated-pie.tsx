import { motion, AnimatePresence } from 'motion/react';

type AnimatedPieProps = {
  progress: number;
  show: boolean;
};

export function AnimatedPie(props: AnimatedPieProps) {
  const { progress, show } = props;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="bg-opacity-50 h-full w-full rounded-full bg-white/20"
          exit={{ opacity: 0, scale: 0.75 }}
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            initial={{ '--progress': 0 as number }}
            animate={{ '--progress': progress }}
            transition={{ duration: 0.5, easing: 'ease-in-out' }}
            style={{
              transform: 'scale(1.02)',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `conic-gradient(#fff calc(var(--progress) * 360deg), transparent 0)`,
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
