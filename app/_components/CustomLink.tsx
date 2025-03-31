'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLoadingBar } from '../_hooks/useLoadingBar';

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  fontSize?: string;
  fontFamily?: string;
  arrowSize?: number;
}

export const CustomLink = ({ 
  href, 
  children, 
  className = '',
  fontSize = 'text-lg',
  fontFamily = 'font-morion',
  arrowSize = 20
}: CustomLinkProps) => {
  const { startLoading } = useLoadingBar();

  // Check if this is an internal link (starts with '/')
  const isInternalLink = href.startsWith('/');

  const handleClick = () => {
    if (isInternalLink) {
      startLoading();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group relative flex flex-col items-start text-white hover:text-secondary transition-colors duration-300 ${fontFamily} ${fontSize} ${className}`}
    >
      <span className="transform transition-transform duration-300 group-hover:translate-x-2">
        <Image src="/EvermodeArrow.svg" alt="Arrow" width={arrowSize} height={arrowSize} />
      </span>
      <span className="mt-1">{children}</span>
    </Link>
  );
};

export default CustomLink; 