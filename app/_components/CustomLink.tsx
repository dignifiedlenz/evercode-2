'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLoadingBar } from '../_hooks/useLoadingBar';
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  fontSize?: string;
  fontFamily?: string;
  arrowSize?: number;
  activeClassName?: string;
  transitionDirection?: 'horizontal' | 'vertical';
}

export const CustomLink = ({ 
  href, 
  children, 
  className = '',
  fontSize = 'text-lg',
  fontFamily = 'font-morion',
  arrowSize = 20,
  activeClassName = "font-bold text-secondary",
  transitionDirection
}: CustomLinkProps) => {
  const { startLoading } = useLoadingBar();
  const router = useTransitionRouter();
  const pathname = usePathname();
  const isActive = pathname === href;

  // Check if this is an internal link (starts with '/')
  const isInternalLink = href.startsWith('/');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    let animationOptions: Record<string, any> | undefined = undefined;

    if (transitionDirection === 'horizontal') {
      animationOptions = {
        animation: `
          ::view-transition-old(root) {
            animation: slideLeftOutSimple 0.5s ease-out forwards;
          }
          ::view-transition-new(root) {
            animation: slideLeftInSimple 0.5s ease-out forwards;
          }
          @keyframes slideLeftOutSimple {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); } /* Slide fully out */
          }
          @keyframes slideLeftInSimple {
            from { transform: translateX(100%); } /* Start fully off-screen */
            to { transform: translateX(0); }
          }
        `
      };
    } else if (transitionDirection === 'vertical') {
      animationOptions = {
        animation: `
          ::view-transition-old(root) { /* Target root for consistency */
            animation: slideUpOutSimple 0.5s ease-out forwards;
          }
          ::view-transition-new(root) { /* Target root for consistency */
            animation: slideDownInSimple 0.5s ease-out forwards;
          }
          @keyframes slideUpOutSimple {
            from { transform: translateY(0); }
            to { transform: translateY(-100%); }
          }
          @keyframes slideDownInSimple {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `
      };
    }

    if (isInternalLink) {
      startLoading();
    }

    router.push(href, animationOptions);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group relative flex flex-col items-start text-white hover:text-secondary transition-colors duration-300 ${fontFamily} ${fontSize} ${className} ${isActive ? activeClassName : ""}`}
    >
      <span className="transform transition-transform duration-300 group-hover:translate-x-2">
        <Image src="/EvermodeArrow.svg" alt="Arrow" width={arrowSize} height={arrowSize} />
      </span>
      <span className="mt-1">{children}</span>
    </Link>
  );
};

export default CustomLink; 