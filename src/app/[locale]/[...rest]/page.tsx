import { notFound } from "next/navigation";

/**
 * Any path that doesn't match a real route falls through to here and renders
 * the localized not-found page (inside the [locale] layout, which provides the
 * <html> document). Without this catch-all the not-found boundary would render
 * outside the locale layout.
 */
export default function CatchAllPage() {
  notFound();
}
