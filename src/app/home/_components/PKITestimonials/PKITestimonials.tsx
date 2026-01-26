"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PKITestimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate testimonials
      testimonialsRef.current.forEach((testimonial, index) => {
        if (testimonial) {
          gsap.fromTo(
            testimonial,
            {
              opacity: 0,
              y: 60,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: testimonial,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
              delay: index * 0.1,
            }
          );
        }
      });

      // Animate stats
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            stagger: 0.2,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Security Officer",
      company: "Global Financial Corp",
      avatar: "SC",
      content: "The AI-powered security analytics have revolutionized our threat detection capabilities. We've seen a 95% reduction in false positives and 60% faster incident response times.",
      rating: 5,
      industry: "Financial Services"
    },
    {
      name: "Michael Rodriguez",
      role: "IT Security Director",
      company: "Healthcare Systems Inc",
      avatar: "MR",
      content: "The post-quantum cryptography implementation gives us confidence in our long-term security strategy. The compliance automation has saved us hundreds of hours in audit preparation.",
      rating: 5,
      industry: "Healthcare"
    },
    {
      name: "Jennifer Walsh",
      role: "Cybersecurity Lead",
      company: "Government Agency",
      avatar: "JW",
      content: "The zero trust architecture implementation was seamless. The blockchain anchoring provides the immutable audit trails we need for regulatory compliance.",
      rating: 5,
      industry: "Government"
    },
    {
      name: "David Kim",
      role: "CISO",
      company: "Tech Innovation Labs",
      avatar: "DK",
      content: "The ephemeral certificates feature is game-changing for our microservices architecture. The 15-minute validity periods provide the perfect balance of security and performance.",
      rating: 5,
      industry: "Technology"
    },
    {
      name: "Lisa Thompson",
      role: "Security Architect",
      company: "Manufacturing Corp",
      avatar: "LT",
      content: "The ACME protocol integration has automated our certificate management across thousands of IoT devices. The deployment was smooth and the support team is exceptional.",
      rating: 5,
      industry: "Manufacturing"
    },
    {
      name: "Alex Johnson",
      role: "Head of Infrastructure",
      company: "Cloud Services Ltd",
      avatar: "AJ",
      content: "The multi-tenant architecture allows us to serve our enterprise clients with complete isolation. The API integration made it easy to embed PKI services into our platform.",
      rating: 5,
      industry: "Cloud Services"
    }
  ];

  const stats = [
    { number: "10K+", label: "Enterprise Users", color: "text-blue-600 dark:text-blue-400" },
    { number: "99.9%", label: "Uptime SLA", color: "text-green-600 dark:text-green-400" },
    { number: "150+", label: "Compliance Checks", color: "text-purple-600 dark:text-purple-400" },
    { number: "24/7", label: "AI Monitoring", color: "text-orange-600 dark:text-orange-400" }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Trusted by Security Professionals
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what security professionals 
            and enterprises are saying about our PKI platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) testimonialsRef.current[index] = el;
              }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
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
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {testimonial.industry}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl sm:text-5xl font-bold mb-2 ${stat.color}`}>
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PKITestimonials;
