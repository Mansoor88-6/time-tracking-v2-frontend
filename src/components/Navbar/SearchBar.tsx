import Link from "next/link";
import { useState } from "react";
import { BiSearch } from "react-icons/bi";

interface SearchBarProps {
  showSuggestions?: boolean;
  className?: string;
}

interface Service {
  service_id: string | number;
  service_uuid: string;
  name: string;
  description: string;
  category_name: string;
  price_range: string;
}

export const SearchBar = ({
  showSuggestions = false,
  className,
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]); // Stores fetched services
  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchServices = async (searchTerm: string) => {
    if (!searchTerm) {
      setServices([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/services?search=${searchTerm}`);
      const data = await res.json();
      setServices(data.data || []); // Ensure data is an array
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search services..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 
           border border-gray-300 dark:border-gray-700 rounded-lg 
           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 
           focus:border-transparent text-gray-800 dark:text-gray-200 
           placeholder-gray-400 dark:placeholder-gray-500"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            fetchServices(e.target.value); // Fetch services based on input
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      {/* Search Result Body */}
      {showSuggestions && isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg shadow-lg z-50">
          <div
            className=" max-h-80 overflow-y-auto  [&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-track]:bg-slate-100
        [&::-webkit-scrollbar-thumb]:bg-slate-200
        dark:[&::-webkit-scrollbar-track]:bg-slate-700
        dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
          >
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            ) : services.length > 0 ? (
              services.map((service) => (
                <Link
                  key={service.service_id}
                  href={`/services/providers/${service.service_uuid}`}
                  onClick={() => setIsOpen(false)} // Close dropdown on link click
                  className="w-full px-4 py-3 text-left flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700 border-b dark:border-slate-600 last:border-0 transition-colors duration-150 last:rounded-bl-lg first:rounded-tl-lg"
                >
                  {/* Service Details */}
                  <div className="flex-1 ">
                    <div className="font-medium text-gray-800 dark:text-gray-200 ">
                      <h3>{service.name}</h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {service.description}
                    </div>
                    <div className=" flex items-center gap-2 mt-1.5">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {service.category_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {service.price_range}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-3 text-base text-gray-500 dark:text-gray-400 text-center">
                No services found matching &#34;{query}&#34;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
