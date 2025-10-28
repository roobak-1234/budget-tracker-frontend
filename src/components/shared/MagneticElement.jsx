import React, { useRef, useEffect } from 'react';
import './MagneticElement.css';

// Simple animation without GSAP
const animateElement = (element, x, y, duration = 300, easing = 'ease-out') => {
  element.style.transition = `transform ${duration}ms ${easing}`;
  element.style.transform = `translate(${x}px, ${y}px)`;
};

const MagneticElement = ({ children, strength = 0.3 }) => {
  const elementRef = useRef(null);
  const childRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    const child = childRef.current;

    if (!element || !child) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = (e.clientX - centerX) * strength;
      const mouseY = (e.clientY - centerY) * strength;

      animateElement(child, mouseX, mouseY, 300, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');
    };

    const handleMouseLeave = () => {
      child.style.transition = 'transform 800ms cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      child.style.transform = 'translate(0px, 0px)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={elementRef} className="magnetic-element">
      <div ref={childRef} className="magnetic-child">
        {children}
      </div>
    </div>
  );
};

export default MagneticElement;