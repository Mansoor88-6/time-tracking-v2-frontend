import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased">
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-gray-100 via-gray-50 to-gray-100">
        {/* Analytical Grid Overlay */}
        <div className="absolute inset-0 bg-grid-dark dark:bg-grid-light opacity-5 bg-size-200"></div>

        {/* Subtle Floating Shapes */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 transform rotate-45 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-tl from-indigo-500 to-pink-500 opacity-20 transform rotate-45 blur-2xl"></div>

        {/* Soft Background Gradient for Depth */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-indigo-500 opacity-20 dark:opacity-20"></div>
        {/* Children (Login form, centered and untouched) */}
        <div className="z-0 opacity-95">
          {/* ==================== Login Form Section ==================== */}
          <div className="w-[20.8rem] sm:w-96 md:w-[24.8rem]">
            <div className="mb-3 flex justify-center items-center">
              <Image
                src={"/assets/images/logo.png"}
                width={90}
                height={90}
                alt="Logo"
              />
            </div>
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-2xl">
              <div className="  px-7 py-7 ">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
