import { notFound } from "next/navigation";

/**
 * Matches unknown paths without inheriting the `(root)` shell (sidebar, header, fake user).
 * Replacing `notFound()` from within `(root)` keeps parent layouts; this route lives only
 * under the root layout so `app/not-found.tsx` is a plain full-page 404.
 */
export default function CatchAllNotFound() {
  notFound();
}
