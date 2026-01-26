"use client";
import Error from "@/components/ui/Error/Error";

// Error boundaries must be Client Components

export default function GlobalError() {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <Error />
      </body>
    </html>
  );
}
