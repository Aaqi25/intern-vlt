import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const VltButton = ({
  children,
  to,
  href,
  onClick,
  variant = 'solid', // 'solid' | 'outline' | 'text'
  size = 'md',       // 'sm' | 'md' | 'lg'
  icon = null,
  showArrow = false,
  className = '',
  disabled = false,
  type = 'button',
  target,
  rel,
  ...props
}) => {
  const variantClass = variant === 'solid'
    ? 'vlt-btn--solid'
    : variant === 'text'
    ? 'vlt-btn--text'
    : '';

  const sizeClass = size === 'sm'
    ? 'vlt-btn--sm'
    : size === 'lg'
    ? 'vlt-btn--lg'
    : '';

  const baseClasses = `vlt-btn ${variantClass} ${sizeClass} ${className}`;

  const content = (
    <>
      <span className="vlt-btn__label inline-flex items-center gap-2">
        {children}
        {showArrow && <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
      </span>
      {icon && <span className="vlt-btn__icon ml-1.5">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={baseClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      {...props}
    >
      {content}
    </button>
  );
};

export default VltButton;
