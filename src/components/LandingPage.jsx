import { useEffect, useRef } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { useNavigationAnimation } from '../hooks/useNavigationAnimation';
import MagneticElement from './shared/MagneticElement';

import DynamicFooter from './shared/DynamicFooter';
import Header from './shared/Header';

import heroBg from '../assets/images/top-view-woman-working-as-economist.jpg';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';



import './shared/GlassmorphismHeader.css';
import './shared/Animations.css';
import './shared/CascadeAnimation.css';

gsap.registerPlugin(ScrollTrigger);



const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { navigateWithAnimation } = useNavigationAnimation();
  const containerRef = useRef();
  const heroRef = useRef();
  const skillsRef = useRef();
  const projectsRef = useRef();



  useEffect(() => {
    // Initialize Lenis smooth scroll with lighter settings
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP ScrollTrigger animations
    const ctx = gsap.context(() => {
      // Hero parallax without pinning
      gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      })
      .to(".hero-title", { scale: 0.9, opacity: 0.7, y: -50 })
      .to(".hero-bg", { scale: 1.1 }, 0);

      // Skills batch reveal
      gsap.fromTo(".skill-item", 
        { y: 100, opacity: 0, rotateX: 45 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: skillsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Line drawing scrub animation
      gsap.fromTo(".draw-line",
        { strokeDashoffset: 1000 },
        {
          strokeDashoffset: 0,
          duration: 2,
          scrollTrigger: {
            trigger: ".draw-line",
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1
          }
        }
      );

      // Projects reveal
      gsap.fromTo(".project-card",
        { y: 150, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.3,
          scrollTrigger: {
            trigger: projectsRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Magnetic elements
      document.querySelectorAll('.magnetic-element').forEach(el => {
        el.addEventListener('mouseenter', () => {
          gsap.to(el, { scale: 1.1, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { scale: 1, duration: 0.3 });
        });
      });

    }, containerRef);



    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, [isAuthenticated]);







  return (
    <>
      <Header />
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-white/95 via-gray-50/90 to-white text-gray-900 overflow-x-hidden relative z-10">
        <style jsx>{`
          .magnetic-element { will-change: transform; }
          .draw-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
        `}</style>

        {/* Hero Section */}
        <section ref={heroRef} className="hero-section min-h-screen relative overflow-hidden z-0 flex items-center">
          <div className="hero-bg absolute inset-0" style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-indigo-50/80"></div>
            {/* Floating shapes */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-purple-300/60 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-blue-300/60 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
            <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-300/60 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
            <div className="absolute bottom-20 right-10 w-18 h-18 bg-indigo-300/60 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-12 gap-4 h-full p-8">
                {Array.from({length: 48}).map((_, i) => (
                  <div key={i} className="border border-purple-400/40 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="hero-content absolute inset-0 z-20 flex items-center justify-center px-8">
            <div className="text-center max-w-4xl mx-auto relative">
              {/* Budget tracker related images around the text */}
              <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&h=120&fit=crop&crop=center" 
                   alt="Calculator" 
                   className="absolute -top-16 -left-20 w-16 h-16 rounded-full shadow-lg animate-pulse" 
                   style={{animationDelay: '0s'}} />
              <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=120&h=120&fit=crop&crop=center" 
                   alt="Budget Planning" 
                   className="absolute -top-12 -right-16 w-20 h-20 rounded-full shadow-lg animate-pulse" 
                   style={{animationDelay: '1s'}} />
              <img src="https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=120&h=120&fit=crop&crop=center" 
                   alt="Money Management" 
                   className="absolute -bottom-8 -left-24 w-18 h-18 rounded-full shadow-lg animate-pulse" 
                   style={{animationDelay: '2s'}} />
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&h=120&fit=crop&crop=center" 
                   alt="Financial Charts" 
                   className="absolute -bottom-12 -right-20 w-16 h-16 rounded-full shadow-lg animate-pulse" 
                   style={{animationDelay: '1.5s'}} />
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&h=120&fit=crop&crop=center" 
                   alt="Analytics" 
                   className="absolute top-1/2 -left-32 w-14 h-14 rounded-full shadow-lg animate-pulse" 
                   style={{animationDelay: '0.5s'}} />
              <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=120&h=120&fit=crop&crop=center" 
                   alt="Savings" 
                   className="absolute top-1/2 -right-28 w-16 h-16 rounded-full shadow-lg animate-pulse" 
                   style={{animationDelay: '2.5s'}} />
              <h1 className="hero-title text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-normal py-4">
                Budget Tracker
              </h1>
              <p className="text-xl md:text-2xl opacity-80 mb-8 text-gray-700">
                Take control of your finances with smart budgeting
              </p>
              <div className="flex justify-center">
                <MagneticElement>
                  <button onClick={() => navigateWithAnimation('/register')} className="magnetic-element bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl transition-all text-white">
                    Get Started
                  </button>
                </MagneticElement>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section ref={skillsRef} className="skills-section bg-gradient-to-b from-white to-gray-50 py-16 relative z-10 overflow-hidden">
          {/* Floating shapes for skills section */}
          <div className="absolute top-10 left-16 w-12 h-12 bg-blue-400/40 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
          <div className="absolute top-32 right-12 w-8 h-8 bg-purple-400/40 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3s'}}></div>
          <div className="absolute bottom-20 left-8 w-16 h-16 bg-pink-400/40 rounded-full animate-bounce" style={{animationDelay: '0.8s', animationDuration: '5s'}}></div>
          <div className="absolute bottom-40 right-20 w-10 h-10 bg-indigo-400/40 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
          <div className="container mx-auto px-8 relative z-10">
            <h2 className="text-6xl font-bold mb-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 opacity-100">
              {[
                { 
                  title: 'Expense Tracking', 
                  desc: 'Monitor spending with intelligent categorization',
                  image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&crop=center'
                },
                { 
                  title: 'Budget Management', 
                  desc: 'Set limits and get real-time alerts',
                  image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop&crop=center'
                },
                { 
                  title: 'Visual Analytics', 
                  desc: '3D charts and interactive reports',
                  image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center'
                }
              ].map((skill, i) => (
                <div key={i} className="skill-item magnetic-element">
                  <div className="skill-card bg-gradient-to-br from-purple-100/80 to-blue-100/80 backdrop-blur-lg p-8 rounded-2xl border border-purple-200/50 shadow-lg">
                    <img src={skill.image} alt={skill.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">{skill.title}</h3>
                    <p className="opacity-70 text-gray-600">{skill.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <svg className="w-full h-4 mt-16">
              <line className="draw-line" x1="0" y1="50%" x2="100%" y2="50%" 
                    stroke="url(#gradient)" strokeWidth="2" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>

        {/* Projects/Features Section */}
        <section ref={projectsRef} className="projects-section bg-gradient-to-b from-gray-50 to-white py-16 relative z-10 overflow-hidden">
          {/* Floating shapes for projects section */}
          <div className="absolute top-16 left-10 w-14 h-14 bg-green-400/40 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}></div>
          <div className="absolute top-40 right-16 w-12 h-12 bg-cyan-400/40 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '3.8s'}}></div>
          <div className="absolute bottom-32 left-20 w-18 h-18 bg-teal-400/40 rounded-full animate-bounce" style={{animationDelay: '1.8s', animationDuration: '4.2s'}}></div>
          <div className="absolute bottom-16 right-8 w-10 h-10 bg-orange-400/40 rounded-full animate-bounce" style={{animationDelay: '0.3s', animationDuration: '3.2s'}}></div>
          <div className="absolute top-60 left-1/2 w-8 h-8 bg-red-400/40 rounded-full animate-bounce" style={{animationDelay: '2.5s', animationDuration: '4.8s'}}></div>
          <div className="container mx-auto px-8 relative z-10">
            <h2 className="text-6xl font-bold mb-16 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 opacity-100">
              {[
                { 
                  title: 'Smart Analytics', 
                  desc: 'AI-powered insights into your spending patterns', 
                  color: 'from-purple-500 to-pink-500',
                  image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&crop=center',
                  icon: <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                },
                { 
                  title: '3D Visualizations', 
                  desc: 'Interactive charts that bring your data to life', 
                  color: 'from-blue-500 to-cyan-500',
                  image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center',
                  icon: <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                },
                { 
                  title: 'Real-time Sync', 
                  desc: 'Instant updates across all your devices', 
                  color: 'from-green-500 to-teal-500',
                  image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&crop=center',
                  icon: <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                },
                { 
                  title: 'Secure & Private', 
                  desc: 'Bank-level encryption for your financial data', 
                  color: 'from-orange-500 to-red-500',
                  image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center',
                  icon: <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11C15.4,11 16,11.4 16,12V16C16,16.6 15.6,17 15,17H9C8.4,17 8,16.6 8,16V12C8,11.4 8.4,11 9,11V10C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9.2 10.2,10V11H13.8V10C13.8,9.2 12.8,8.2 12,8.2Z"/></svg>
                }
              ].map((project, i) => (
                <div key={i} className="project-card magnetic-element">
                  <div className={`project-image h-48 bg-gradient-to-br ${project.color} rounded-2xl mb-6 relative overflow-hidden`}>
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 flex items-center justify-center">
                      {project.icon}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-800">{project.title}</h3>
                  <p className="text-gray-600 mb-6">{project.desc}</p>
                  <button className="magnetic-element bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full hover:shadow-lg transition-all">
                    Learn More
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="cta-section h-screen bg-gradient-to-t from-white via-purple-50/30 to-white flex items-center justify-center relative z-10 overflow-hidden">
            {/* Floating shapes for CTA section */}
            <div className="absolute top-20 left-12 w-16 h-16 bg-purple-400/50 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3.5s'}}></div>
            <div className="absolute top-32 right-16 w-12 h-12 bg-pink-400/50 rounded-full animate-bounce" style={{animationDelay: '1.2s', animationDuration: '4s'}}></div>
            <div className="absolute bottom-24 left-16 w-20 h-20 bg-red-400/50 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '4.5s'}}></div>
            <div className="absolute bottom-40 right-12 w-14 h-14 bg-indigo-400/50 rounded-full animate-bounce" style={{animationDelay: '0.7s', animationDuration: '3.8s'}}></div>
            <div className="absolute top-1/2 left-8 w-10 h-10 bg-blue-400/50 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.2s'}}></div>
            <div className="absolute top-1/2 right-8 w-18 h-18 bg-cyan-400/50 rounded-full animate-bounce" style={{animationDelay: '2.3s', animationDuration: '4.2s'}}></div>
            <div className="text-center relative z-10">
              <h2 className="text-7xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Ready to Transform?
              </h2>
              <p className="text-2xl mb-12 opacity-70 text-gray-700">Join thousands mastering their finances</p>
              <div className="flex justify-center gap-8">
                <MagneticElement>
                  <button onClick={() => navigateWithAnimation('/register')} className="magnetic-element bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-6 rounded-full text-xl font-bold hover:shadow-2xl transition-all">
                    Start Your Journey
                  </button>
                </MagneticElement>
                <MagneticElement>
                  <button onClick={() => navigateWithAnimation('/login')} className="magnetic-element border-2 border-purple-600 px-12 py-6 rounded-full text-xl font-bold hover:bg-purple-600 hover:text-white transition-all text-purple-600">
                    Sign In
                  </button>
                </MagneticElement>
              </div>
            </div>
          </section>
        )}



        <DynamicFooter footerType={isAuthenticated ? "utility" : "marketing"} />
      </div>
    </>
  );
};



export default LandingPage;