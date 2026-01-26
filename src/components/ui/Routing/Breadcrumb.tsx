import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiChevronRight, BiHome } from "react-icons/bi";

const Breadcrumb = () => {
  const pathname = usePathname();

  const isUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const isNumericId = (str: string) => {
    return /^\d+$/.test(str);
  };

  const isIdentifier = (str: string) => {
    return isUUID(str) || isNumericId(str);
  };

  const getBreadcrumbs = () => {
    if (pathname === "/") return [];

    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    return pathSegments.map((segment, index) => {
      const path = "/" + pathSegments.slice(0, index + 1).join("/");
      const label = segment
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      const isIdSegment = isIdentifier(segment);
      const isResourceWithId =
        index < pathSegments.length - 1 &&
        isIdentifier(pathSegments[index + 1]);

      const isClickable = !isIdSegment && !isResourceWithId;

      return {
        label,
        path,
        isClickable,
        isId: isIdSegment,
        idType: isUUID(segment)
          ? "uuid"
          : isNumericId(segment)
          ? "numeric"
          : null,
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="py-1 transition-colors duration-200 -mt-2 mb-2"
    >
      <ol className="flex items-center flex-wrap">
        <li className="flex items-center">
          <Link
            href="/"
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                     text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Home"
          >
            <BiHome className="w-4 h-4" />
          </Link>
        </li>

        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            <BiChevronRight
              className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-1 flex-shrink-0"
              aria-hidden="true"
            />
            {index === breadcrumbs.length - 1 || !breadcrumb.isClickable ? (
              <span
                className={`
                  px-2 py-1 rounded
                  ${
                    breadcrumb.isId
                      ? "font-mono text-xs bg-gray-100 dark:bg-gray-700"
                      : ""
                  }
                  ${
                    breadcrumb.idType === "uuid"
                      ? "text-gray-500 dark:text-gray-400"
                      : ""
                  }
                  ${
                    breadcrumb.idType === "numeric"
                      ? "text-gray-600 dark:text-gray-300"
                      : ""
                  }
                  ${!breadcrumb.isId ? "text-gray-700 dark:text-gray-200" : ""}
                  ${index === breadcrumbs.length - 1 ? "font-medium" : ""}
                  transition-colors duration-200
                `}
                aria-current={
                  index === breadcrumbs.length - 1 ? "page" : undefined
                }
              >
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.path}
                className="px-2 py-1 rounded 
                         hover:bg-gray-100 dark:hover:bg-gray-700 
                         text-gray-500 dark:text-gray-400 
                         transition-colors duration-200"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
