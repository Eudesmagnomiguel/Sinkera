import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Options {
  selector?: string;
  y?: number;
  stagger?: number;
  duration?: number;
  start?: string;
}

/** Reveals children of the returned ref on scroll using GSAP ScrollTrigger. */
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(
  options: Options = {}
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const {
      selector = ".reveal",
      y = 40,
      stagger = 0.08,
      duration = 0.9,
      start = "top 85%",
    } = options;

    const ctx = gsap.context(() => {
      const targets = ref.current!.querySelectorAll<HTMLElement>(selector);
      if (!targets.length) return;

      gsap.from(targets, {
        y,
        opacity: 0,
        duration,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: "play none none reverse",
        },
      });
    }, ref);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
};