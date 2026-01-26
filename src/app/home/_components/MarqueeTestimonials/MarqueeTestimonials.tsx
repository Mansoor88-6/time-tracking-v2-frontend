"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const MarqueeTestimonials = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!marqueeRef.current) return;

    const ctx = gsap.context(() => {
      // Create infinite marquee animation
      gsap.to(marqueeRef.current, {
        x: "-50%",
        duration: 30,
        ease: "none",
        repeat: -1,
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "CISO",
      company: "Global Financial Corp",
      content:
        "The AI-powered security analytics have revolutionized our threat detection capabilities. We've seen a 95% reduction in false positives.",
      rating: 5,
      avatar: "SC",
    },
    {
      name: "Michael Rodriguez",
      role: "IT Security Director",
      company: "Healthcare Systems Inc",
      content:
        "The post-quantum cryptography implementation gives us confidence in our long-term security strategy. Exceptional platform.",
      rating: 5,
      avatar: "MR",
    },
    {
      name: "Jennifer Walsh",
      role: "Cybersecurity Lead",
      company: "Government Agency",
      content:
        "The zero trust architecture implementation was seamless. The blockchain anchoring provides immutable audit trails.",
      rating: 5,
      avatar: "JW",
    },
    {
      name: "David Kim",
      role: "CISO",
      company: "Tech Innovation Labs",
      content:
        "The ephemeral certificates feature is game-changing for our microservices architecture. Perfect balance of security and performance.",
      rating: 5,
      avatar: "DK",
    },
    {
      name: "Lisa Thompson",
      role: "Security Architect",
      company: "Manufacturing Corp",
      content:
        "The ACME protocol integration has automated our certificate management across thousands of IoT devices. Outstanding support.",
      rating: 5,
      avatar: "LT",
    },
    {
      name: "Alex Johnson",
      role: "Head of Infrastructure",
      company: "Cloud Services Ltd",
      content:
        "The multi-tenant architecture allows us to serve our enterprise clients with complete isolation. Highly recommended.",
      rating: 5,
      avatar: "AJ",
    },
  ];

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Trusted by Security Professionals
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of security professionals who trust our PKI platform
            for their critical infrastructure needs.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          <div
            ref={marqueeRef}
            className="flex space-x-8 will-change-transform"
            style={{ width: "200%" }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-96 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              10K+
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Enterprise Users
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              99.9%
            </div>
            <div className="text-gray-600 dark:text-gray-300">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
              150+
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Compliance Checks
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              24/7
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              AI Monitoring
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarqueeTestimonials;
