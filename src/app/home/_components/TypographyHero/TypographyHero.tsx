"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button/Button";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TypographyHero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const animatedTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Initial state with proper typography timing
      gsap.set(
        [
          titleRef.current,
          subtitleRef.current,
          descriptionRef.current,
          buttonsRef.current,
        ],
        {
          opacity: 0,
          y: 30,
        }
      );

      // Typography animation sequence with proper timing
      const tl = gsap.timeline({ delay: 0.2 });

      // Badge first (smallest element)
      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        // Main title (largest element)
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.3"
        )
        // Subtitle (medium element)
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.4"
        )
        // Description (body text)
        .to(
          descriptionRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        )
        // CTA buttons (action elements)
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.2"
        )
        // Stats (supporting data)
        .to(
          statsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.1"
        );

      // Dashboard animation
      if (dashboardRef.current) {
        gsap.fromTo(
          dashboardRef.current,
          {
            scale: 0.95,
            opacity: 0,
            y: 40,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.8,
          }
        );
      }

      // Animated text effect
      if (animatedTextRef.current) {
        gsap.fromTo(
          animatedTextRef.current,
          {
            backgroundPosition: "200% 0%",
          },
          {
            backgroundPosition: "-200% 0%",
            duration: 3,
            ease: "none",
            repeat: -1,
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-20">
            {/* Left Content - Typography Focused */}
            <div className="text-center lg:text-left">
              {/* Social Proof Badge - Small Typography */}
              <div
                ref={badgeRef}
                className="inline-flex items-center space-x-3 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8"
              >
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-green-400 text-sm font-medium tracking-wide uppercase">
                  Trusted by 10,000+ enterprises
                </span>
              </div>

              {/* Main Heading - Display Typography */}
              <h1
                ref={titleRef}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tight"
              >
                Next-Generation
                <br />
                <span
                  ref={animatedTextRef}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-[length:200%_100%] font-black"
                >
                  PKI Platform
                </span>
              </h1>

              {/* Subtitle - Large Typography */}
              <p
                ref={subtitleRef}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight"
              >
                <span className="text-blue-400 font-black">Secure.</span>{" "}
                <span className="text-cyan-400 font-black">Reliable.</span>{" "}
                <span className="text-purple-400 font-black">Unstoppable.</span>
              </p>

              {/* Description - Body Typography */}
              <p
                ref={descriptionRef}
                className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                AI-Powered PKI with Enhanced Ephemeral Certificates,
                Post-Quantum Cryptography, and Zero-Trust Architecture for
                enterprise-grade security infrastructure.
              </p>

              {/* CTA Buttons - Interactive Typography */}
              <div
                ref={buttonsRef}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-10 py-5 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 tracking-wide"
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-10 py-5 text-lg font-bold border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 tracking-wide"
                >
                  Book a Demo
                </Button>
              </div>

              {/* Stats - Data Typography */}
              <div
                ref={statsRef}
                className="grid grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0"
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-blue-400 mb-2">
                    14
                  </div>
                  <div className="text-blue-200 text-sm font-semibold tracking-wide uppercase">
                    Days Free Trial
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-cyan-400 mb-2">
                    99.9%
                  </div>
                  <div className="text-blue-200 text-sm font-semibold tracking-wide uppercase">
                    Uptime SLA
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-green-400 mb-2">
                    10K+
                  </div>
                  <div className="text-blue-200 text-sm font-semibold tracking-wide uppercase">
                    Enterprise Users
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div
                ref={dashboardRef}
                className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl"
              >
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        PKI Dashboard
                      </h3>
                      <p className="text-gray-400 text-sm font-medium">
                        Real-time Security Analytics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-semibold">
                      Live
                    </span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="space-y-6">
                  {/* Portfolio Value */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 text-sm font-semibold tracking-wide uppercase">
                        Portfolio Value
                      </span>
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-green-400 text-sm font-bold">
                          +19.44%
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                      $91,134,765.99
                    </div>
                    <div className="text-gray-400 text-sm font-medium">
                      19 Jun 2025
                    </div>
                  </div>

                  {/* Security Metrics */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300 text-sm font-semibold tracking-wide uppercase">
                        Security Metrics
                      </span>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full">
                          Week
                        </button>
                        <button className="px-4 py-2 text-gray-400 text-sm font-medium rounded-full hover:text-white transition-colors">
                          Month
                        </button>
                        <button className="px-4 py-2 text-gray-400 text-sm font-medium rounded-full hover:text-white transition-colors">
                          Year
                        </button>
                      </div>
                    </div>

                    {/* Mock Graph */}
                    <div className="relative h-32">
                      <svg className="w-full h-full" viewBox="0 0 300 120">
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3B82F6"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="#3B82F6"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,80 Q50,60 100,40 T200,20 T300,10"
                          stroke="#3B82F6"
                          strokeWidth="3"
                          fill="none"
                          className="opacity-90"
                        />
                        <path
                          d="M0,80 Q50,60 100,40 T200,20 T300,10 L300,120 L0,120 Z"
                          fill="url(#gradient)"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Security Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-gray-300 text-xs font-semibold tracking-wide uppercase mb-2">
                        Active Certificates
                      </div>
                      <div className="text-2xl font-black text-white mb-1">
                        2,847
                      </div>
                      <div className="text-green-400 text-xs font-bold">
                        +12 this week
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-gray-300 text-xs font-semibold tracking-wide uppercase mb-2">
                        Threats Blocked
                      </div>
                      <div className="text-2xl font-black text-white mb-1">
                        1,234
                      </div>
                      <div className="text-red-400 text-xs font-bold">
                        -5% this week
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -left-4 w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-blue-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default TypographyHero;
