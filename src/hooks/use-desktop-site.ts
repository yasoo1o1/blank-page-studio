import * as React from "react";

const DESKTOP_BREAKPOINT = 1024;
const DESKTOP_FRAME_WIDTH = 1120;

const detectDesktopSite = () => {
  if (typeof window === "undefined") return false;

  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const hoverNone = window.matchMedia?.("(hover: none)")?.matches ?? false;
  const isNarrowViewport = window.innerWidth < DESKTOP_BREAKPOINT;
  const touchPoints = navigator.maxTouchPoints ?? 0;
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  const mobileUserAgent = nav.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  return isNarrowViewport && coarsePointer && hoverNone && touchPoints > 0 && !mobileUserAgent;
};

export function useDesktopSite() {
  const [state, setState] = React.useState({ isDesktopSite: false, scale: 1 });

  React.useEffect(() => {
    const update = () => {
      const isDesktopSite = detectDesktopSite();
      const availableWidth = Math.max(window.innerWidth - 12, 320);
      const scale = isDesktopSite ? Math.min(availableWidth / DESKTOP_FRAME_WIDTH, 1) : 1;

      setState({ isDesktopSite, scale });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return state;
}