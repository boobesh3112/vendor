import { useEffect, useRef, useState } from 'react';

export default function BlurReveal({ children, delay = 0, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can stop observing
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // trigger when 10% visible
        rootMargin: '0px 0px -50px 0px' // offset to reveal slightly before center viewport
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={`${className} ${isVisible ? 'reveal-active' : 'reveal-hidden'}`}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
