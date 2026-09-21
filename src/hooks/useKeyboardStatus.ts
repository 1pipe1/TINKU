import { useState, useEffect } from "react";

/**
 * Hook to detect whether the virtual keyboard is open on mobile devices.
 * Uses the Visual Viewport API where supported, with fallback to window resize.
 */
export function useKeyboardStatus(): boolean {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Visual Viewport API is standard in modern iOS Safari and Android Chrome
    const viewport = window.visualViewport;

    if (viewport) {
      const handleViewportResize = () => {
        // If the viewport height is noticeably smaller than the window's total height,
        // it indicates a software keyboard is taking up the bottom space (>120px).
        const diff = window.innerHeight - viewport.height;
        setIsKeyboardOpen(diff > 120);
      };

      viewport.addEventListener("resize", handleViewportResize);
      viewport.addEventListener("scroll", handleViewportResize);

      // Initial check
      handleViewportResize();

      return () => {
        viewport.removeEventListener("resize", handleViewportResize);
        viewport.removeEventListener("scroll", handleViewportResize);
      };
    }

    // Fallback: window resize comparing against initial height
    let initialHeight = window.innerHeight;
    const handleResize = () => {
      const diff = initialHeight - window.innerHeight;
      setIsKeyboardOpen(diff > 120);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isKeyboardOpen;
}

export default useKeyboardStatus;
