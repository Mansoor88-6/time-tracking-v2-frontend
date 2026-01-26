import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      company: "TechCorp",
      avatar: "SJ",
      content:
        "This admin dashboard template has been a game-changer for our project. The code quality is excellent, and the documentation is comprehensive. It saved us weeks of development time.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Full Stack Developer",
      company: "StartupXYZ",
      avatar: "MC",
      content:
        "The role-based access control system is incredibly well-implemented. It's exactly what we needed for our enterprise application. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager",
      company: "InnovateLab",
      avatar: "ER",
      content:
        "The responsive design works perfectly across all devices. Our team was able to customize the components easily to match our brand guidelines.",
      rating: 5,
    },
    {
      name: "David Kim",
      role: "Lead Developer",
      company: "DevStudio",
      avatar: "DK",
      content:
        "The TypeScript integration and modern React patterns make this template a joy to work with. The performance is outstanding.",
      rating: 5,
    },
    {
      name: "Lisa Thompson",
      role: "UI/UX Designer",
      company: "DesignCo",
      avatar: "LT",
      content:
        "The component library is extensive and well-designed. The dark mode implementation is seamless, and the theming system is very flexible.",
      rating: 5,
    },
    {
      name: "Alex Wilson",
      role: "CTO",
      company: "ScaleUp",
      avatar: "AW",
      content:
        "We've been using this template for multiple projects. The code structure is maintainable, and the regular updates keep it current with best practices.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            What Our Users Say
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what developers and teams
            are saying about our admin dashboard template.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
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
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              10K+
            </div>
            <div className="text-gray-600 dark:text-gray-300">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              50+
            </div>
            <div className="text-gray-600 dark:text-gray-300">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
              99.9%
            </div>
            <div className="text-gray-600 dark:text-gray-300">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              24/7
            </div>
            <div className="text-gray-600 dark:text-gray-300">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
