"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button/Button";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const OptimizedHero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const floatingCardsRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Initial state - prevent black screen glitch
      gsap.set(
        [
          titleRef.current,
          subtitleRef.current,
          buttonsRef.current,
          statsRef.current,
        ],
        {
          opacity: 0,
          y: 30,
        }
      );

      // Hero animation sequence - smoother and optimized
      const tl = gsap.timeline({ delay: 0.2 });

      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          statsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.2"
        );

      // Floating particles animation - optimized
      if (particlesRef.current?.children) {
        gsap.to(particlesRef.current.children, {
          y: "random(-15, 15)",
          x: "random(-8, 8)",
          rotation: "random(-3, 3)",
          duration: "random(4, 8)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.3,
        });
      }

      // Floating cards animation - optimized
      if (floatingCardsRef.current?.children) {
        gsap.to(floatingCardsRef.current.children, {
          y: "random(-10, 10)",
          x: "random(-8, 8)",
          rotation: "random(-2, 2)",
          duration: "random(5, 10)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.4,
        });
      }

      // Demo animation - optimized
      if (demoRef.current) {
        gsap.fromTo(
          demoRef.current,
          {
            scale: 0.9,
            opacity: 0,
            y: 30,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            delay: 0.5,
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden"
    >
      {/* Animated Background Particles - Optimized */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Floating Security Cards - Optimized */}
      <div
        ref={floatingCardsRef}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-16 left-4 sm:left-10 w-10 h-10 sm:w-14 sm:h-14 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm"></div>
        <div className="absolute top-32 right-4 sm:right-20 w-6 h-6 sm:w-10 sm:h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm"></div>
        <div className="absolute bottom-32 left-4 sm:left-20 w-8 h-8 sm:w-12 sm:h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm"></div>
        <div className="absolute bottom-16 right-4 sm:right-10 w-5 h-5 sm:w-8 sm:h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-lg backdrop-blur-sm"></div>
      </div>

      {/* Security Pattern Overlay - Optimized */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 relative z-10 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Security Badge */}
              <div
                ref={badgeRef}
                className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-2 sm:px-4 sm:py-2 mb-6 sm:mb-8"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs sm:text-sm font-medium">
                  Enterprise-Grade Security
                </span>
              </div>

              {/* Main Heading */}
              <h1
                ref={titleRef}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight"
              >
                Next-Generation
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 animate-gradient">
                  PKI Platform
                </span>
              </h1>

              {/* Subtitle */}
              <p
                ref={subtitleRef}
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                AI-Powered • Auto-Healing • Quantum-Ready
                <br />
                <span className="text-sm sm:text-base lg:text-lg text-blue-200">
                  Revolutionary PKI platform with Enhanced Ephemeral
                  Certificates, AI Security Analytics, and Post-Quantum
                  Cryptography.
                </span>
              </p>

              {/* CTA Buttons */}
              <div
                ref={buttonsRef}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center mb-8 sm:mb-12"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  Book Demo
                </Button>
              </div>

              {/* Stats */}
              <div
                ref={statsRef}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto lg:mx-0"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400 mb-1 sm:mb-2">
                    14
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm">
                    Days Free Trial
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400 mb-1 sm:mb-2">
                    47
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm">
                    Database Tables
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-1 sm:mb-2">
                    5
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm">
                    Ephemeral Types
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400 mb-1 sm:mb-2">
                    15min
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm">
                    Ultra-Short Validity
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Demo */}
            <div ref={demoRef} className="relative order-1 lg:order-2">
              <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl">
                {/* Mock Browser */}
                <div className="bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="flex items-center space-x-2 p-3 sm:p-4 bg-gray-700">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 bg-gray-600 rounded px-2 py-1 sm:px-3 text-gray-300 text-xs sm:text-sm">
                      pki-solutions.com/dashboard
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="h-3 sm:h-4 bg-blue-500/20 rounded w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-green-500/20 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="h-16 sm:h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg"></div>
                      <div className="h-16 sm:h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg"></div>
                    </div>
                    <div className="h-3 sm:h-4 bg-yellow-500/20 rounded w-2/3"></div>
                  </div>
                </div>

                {/* Floating Elements - Optimized */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 -left-2 sm:-left-4 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Optimized */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-blue-400 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-blue-400 rounded-full mt-1.5 sm:mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default OptimizedHero;
