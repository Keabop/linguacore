import { motion, type Easing } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: Easing;
  splitType?: 'chars' | 'words';
  animationFrom?: Record<string, string | number>;
  animationTo?: Record<string, string | number>;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 0.5,
  ease = 'easeOut',
  splitType = 'chars',
  animationFrom = { opacity: 0, y: 40 },
  animationTo = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-50px',
  tag = 'p',
  onLetterAnimationComplete,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const elements = splitType === 'words' ? text.split(' ') : text.split('');
  const Tag = tag as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={`inline-flex flex-wrap overflow-hidden ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {elements.map((char, index) => (
        <motion.span
          key={index}
          initial={animationFrom}
          animate={inView ? animationTo : animationFrom}
          transition={{
            duration,
            ease,
            delay: (index * delay) / 1000,
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onLetterAnimationComplete : undefined
          }
          style={{ display: 'inline-block', willChange: 'transform, opacity' }}
        >
          {char === ' ' ? '\u00A0' : char}
          {splitType === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </Tag>
  );
};

export default SplitText;
