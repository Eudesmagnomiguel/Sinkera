import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

interface HighlightSplitProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string;
  reverse?: boolean;
  accent?: "cyan" | "violet" | "rose";
}

const accentBg: Record<string, string> = {
  cyan: "from-blue-800 to-blue-900",
  violet: "from-[#1a3a8a] to-blue-900",
  rose: "from-blue-900 to-[#0f2671]",
};

export const HighlightSplit = ({
  eyebrow,
  title,
  description,
  ctaLabel = "Explorar",
  ctaHref = "/produtos",
  image,
  reverse,
  accent = "violet",
}: HighlightSplitProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(rootRef.current!.querySelectorAll(".hs-reveal"), {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="py-6">
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${accentBg[accent]} shadow-md`}
      >
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          {/* Text Side */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14 text-white">
            <div className="hs-reveal inline-flex items-center gap-2 bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-4 uppercase tracking-wider">
              {eyebrow}
            </div>

            <h3 className="hs-reveal text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
              {title}
            </h3>

            <p className="hs-reveal text-blue-100 text-sm sm:text-base leading-relaxed max-w-md mb-8">
              {description}
            </p>

            <div className="hs-reveal">
              <Link
                to={ctaHref}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-md transition-colors text-sm group"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Image Side */}
          <div className="hs-reveal relative flex items-center justify-center bg-white/5 min-h-[240px] sm:min-h-[300px]">
            {/* Badge */}
            <div className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-md z-10">
              Sinkera Pick
            </div>

            <img
              src={image}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover max-h-[320px] lg:max-h-none lg:h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
