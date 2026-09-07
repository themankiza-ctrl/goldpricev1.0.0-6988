import { useEffect } from "react";

/**
 * Sets document title + meta description per page. Landing pages used in ads
 * are scored on relevance, so every route gets its own pair.
 */
export function useSeo(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description);
  }, [title, description]);
}
