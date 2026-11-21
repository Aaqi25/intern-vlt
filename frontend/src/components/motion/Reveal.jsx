import React from 'react';
import { motion } from 'framer-motion';
import { MOTION_CONFIG } from '../../config/motion';

const variants = {
  up: {
    hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  left: {
    hidden: { opacity: 0, x: -28 },
    show: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    show: { opacity: 1, scale: 1 },
  },
  clip: {
    hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
    show: { clipPath: 'inset(0% 0% 0% 0%)' },
  },
};

export const Reveal = ({
  children,
  as = 'div',
  variant = 'up',
  delay = 0,
  duration = 0.9,
  className = '',
  stagger = 0,
  viewport = { once: true, amount: 0.15, margin: '0px 0px -8% 0px' },
  ...props
}) => {
  const Component = motion[as] || motion.div;

  if (stagger > 0) {
    const containerVariants = {
      hidden: {},
      show: {
        transition: {
          staggerChildren: stagger,
          delayChildren: delay,
        },
      },
    };

    return (
      <Component
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={containerVariants}
        {...props}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={variants[variant] || variants.up}
      transition={{
        duration,
        delay,
        ease: MOTION_CONFIG.easing.quintOut,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Reveal;
