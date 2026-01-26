"use client";
import { usePathname } from "next/navigation";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface MenuItem {
  path: string;
  label: string;
  title?: string;
}

const TabLink = ({
  menuItems,
  basePath,
  title,
}: {
  menuItems: MenuItem[];
  basePath: string;
  title?: string;
}) => {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check if the menu is overflowing
  const checkOverflow = () => {
    const element = scrollRef.current;
    if (element) {
      setIsOverflowing(element.scrollWidth > element.clientWidth);
      setCanScrollLeft(element.scrollLeft > 3);
      setCanScrollRight(
        element.scrollLeft + element.clientWidth < element.scrollWidth - 3
      );
    }
  };

  // Add resize event listener to recheck overflow on window resize
  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [menuItems]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -100, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  };

  const activeClasses =
    "border-b-2 text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500";
  const inactiveClasses =
    "text-gray-500 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700";

  return (
    <div className="relative w-full bg-slate-300  dark:bg-gray-800 text-white shadow-md mb-2">
      {title && (
        <>
          <h2 className=" sm:text-2xl font-bold mb-10 p-4 text-gray-800 dark:text-white">
            {title}
          </h2>
        </>
      )}
      <div className="w-full overflow-x-hidden bg-slate-200 dark:bg-slate-900 ">
        {/* Scrollable Tab List */}

        <div
          ref={scrollRef}
          onScroll={checkOverflow}
          className="relative overflow-x-auto hide-scroll-bar"
        >
          <ul className="flex items-center whitespace-nowrap w-full">
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={`inline-flex items-center justify-center px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  pathname === `${basePath}/${item.path}`
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Link href={`${basePath}/${item.path}`}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Scroll Buttons */}
        {isOverflowing && (
          <>
            {/* Left Button */}
            {canScrollLeft && (
              <button
                className="absolute left-0 top-[32%] sm:top-[33%]  md:top-[33%] h-full px-1"
                onClick={scrollLeft}
                aria-label="Scroll Left"
              >
                <BiChevronLeft
                  size={25}
                  className="text-white bg-slate-400 dark:bg-gray-800 hover:bg-gray-500 dark:hover:bg-slate-700 rounded-full px-0 left-0 top-0"
                />
              </button>
            )}

            {/* Right Button */}
            {canScrollRight && (
              <button
                className="absolute right-0 top-[32%] sm:top-[33%]  md:top-[33%] h-full px-1"
                onClick={scrollRight}
                aria-label="Scroll Right"
              >
                <BiChevronRight
                  size={25}
                  className="text-white bg-slate-400 dark:bg-gray-800 hover:bg-gray-500 dark:hover:bg-slate-700 rounded-full px-0 right-0 top-0"
                />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TabLink;
