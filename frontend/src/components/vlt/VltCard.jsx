/**
 * VltCard — a standard content card in VLT monochrome style.
 * Replaces inline border+bg+padding patterns on public pages.
 * Dashboard components keep their own pre-existing card styles.
 *
 * Usage:
 *   <VltCard>...</VltCard>
 *   <VltCard dark hover>...</VltCard>
 */
import React from 'react';

export const VltCard = ({
  children,
  dark = false,
  hover = false,
  className = '',
  as: Tag = 'div',
  ...props
}) => {
  const base = [
    'p-6 border relative',
    dark
      ? 'bg-neutral-950 border-neutral-800 text-white'
      : 'bg-neutral-50/50 border-neutral-200 text-black',
    hover
      ? dark
        ? 'hover:border-white transition-colors duration-300 cursor-pointer'
        : 'hover:border-black transition-colors duration-300 cursor-pointer'
      : '',
    'vlt-card', // keep selector for CustomCursor hover detection
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={base} {...props}>
      {children}
    </Tag>
  );
};

export default VltCard;
