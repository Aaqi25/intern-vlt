import React from 'react';
import { motion } from 'framer-motion';
import { MOTION_CONFIG } from '../../config/motion';

export const SplitText = ({
  text,
  lines,
  as = 'h2',
  className = '',
  delay = 0,
  stagger = 0.08,
  duration = 1.0,
  amount = 0.25,
  lineClassName = '',
  ...props
}) => {
  const rawLines = lines || (text ? [text] : []);
  const Component = motion[as] || motion.h2;

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const lineVariants = {
    hidden: { y: '110%' },
    show: {
      y: '0%',
      transition: {
        duration,
        ease: MOTION_CONFIG.easing.quintOut,
      },
    },
  };

  return (
    <Component
      className={`text-reveal ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      {...props}
    >
      {rawLines.map((line, idx) => (
        <span key={idx} className={`text-reveal__mask block overflow-hidden ${lineClassName}`}>
          <motion.span
            className="text-reveal__line inline-block will-change-transform"
            variants={lineVariants}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
};

export default SplitText;
