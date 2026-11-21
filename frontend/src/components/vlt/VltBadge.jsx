/**
 * VltBadge — inline status/tag chip in VLT monochrome style.
 * Usage: <VltBadge>HIGH-THROUGHPUT NLP</VltBadge>
 *        <VltBadge variant="success">ACTIVE</VltBadge>
 */
import React from 'react';

const VARIANTS = {
  default: 'bg-neutral-900 border border-neutral-700 text-neutral-300',
  light:   'bg-white border border-neutral-300 text-neutral-700',
  success: 'bg-emerald-950 border border-emerald-800 text-emerald-400',
  warning: 'bg-amber-950 border border-amber-800 text-amber-400',
  danger:  'bg-rose-950 border border-rose-800 text-rose-400',
  outline: 'bg-transparent border border-current text-current',
};

export const VltBadge = ({
  children,
  variant = 'default',
  dot = false,
  className = '',
  ...props
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${VARIANTS[variant] || VARIANTS.default} ${className}`}
    {...props}
  >
    {dot && (
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        variant === 'success' ? 'bg-emerald-400 animate-pulse' :
        variant === 'warning' ? 'bg-amber-400' :
        variant === 'danger'  ? 'bg-rose-400' : 'bg-current'
      }`} />
    )}
    {children}
  </span>
);

export default VltBadge;
