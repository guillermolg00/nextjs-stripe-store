"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
	const getMatches = () =>
		typeof window !== "undefined" ? window.matchMedia(query).matches : false;
	const [matches, setMatches] = useState(getMatches);

	useEffect(() => {
		const mediaQueryList = window.matchMedia(query);
		const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
		mediaQueryList.addEventListener("change", listener);
		setMatches(mediaQueryList.matches);
		return () => mediaQueryList.removeEventListener("change", listener);
	}, [query]);

	return matches;
}
