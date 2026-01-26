"use client";
import * as React from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { twMerge } from "tailwind-merge";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
}

const Tabs = ({ children, defaultValue }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
}

const TabsList = ({ children }: TabsListProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkOverflow = React.useCallback(() => {
    const element = scrollRef.current;
    if (element) {
      setIsOverflowing(element.scrollWidth > element.clientWidth);
      setCanScrollLeft(element.scrollLeft > 3); // Check if items are scrolled slightly to the left
      setCanScrollRight(
        element.scrollLeft + element.clientWidth < element.scrollWidth - 3 // Ensure tabs aren't fully scrolled right
      );
    }
  }, []);

  React.useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children, checkOverflow]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -100, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  };

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Tabs List */}
      <div
        ref={scrollRef}
        onScroll={checkOverflow}
        className="relative overflow-x-auto hide-scroll-bar bg-gray-200 dark:bg-gray-900 pr-12"
      >
        <ul
          className="flex items-center whitespace-nowrap w-full "
          role="tablist"
        >
          {children}
        </ul>
      </div>

      {/* Scroll Buttons */}
      {isOverflowing && (
        <>
          {/* Left Button */}
          {canScrollLeft && (
            <button
              className="absolute left-0 top-0 h-full px-1 "
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
              className="absolute right-0 top-0 h-full px-1  "
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
  );
};

interface TabsTriggerProps {
  id: string;
  label: string;
}
const TabsTrigger = ({ id, label }: TabsTriggerProps) => {
  const context = React.useContext(TabsContext);
  const { activeTab, setActiveTab } = context || {};

  const activeClasses =
    "border-b-2 text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500";
  const inactiveClasses =
    "text-gray-500 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700";

  return (
    <li
      className={twMerge(
        "flex-shrink-0 py-4 px-6 inline-block text-sm font-medium text-center cursor-pointer md:w-auto",
        activeTab === id ? activeClasses : inactiveClasses
      )}
      onClick={() => setActiveTab?.(id)}
      role="tab"
    >
      {label}
    </li>
  );
};

interface TabsContentProps {
  id: string;
  children: React.ReactNode;
}
const TabsContent = ({ id, children }: TabsContentProps) => {
  const context = React.useContext(TabsContext);
  const { activeTab } = context || {};

  return activeTab === id ? <div>{children}</div> : null;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
