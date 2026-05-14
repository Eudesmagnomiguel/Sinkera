import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Heart,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  ShoppingCart,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

interface ShortVideo {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  video_url: string | null;
  thumbnail_url: string;
  product_link: string | null;
  product_id?: string | null;
  position: number;
  is_active: boolean;
}


function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function toYouTubeEmbed(url: string) {
  const match =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/) ||
    url.match(/embed\/([^?&\s]+)/);
  if (!match) return url;
  return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&modestbranding=1`;
}

function badgeColor(badge: string) {
  if (badge.includes("OFF")) return "bg-[hsl(var(--sale-red))] text-white";
  if (badge === "Novo") return "bg-primary text-primary-foreground";
  if (badge === "Vendido") return "bg-white/20 text-white/70 backdrop-blur-sm border border-white/15";
  return "bg-[hsl(var(--cta-orange))] text-white";
}

function discount(price: number, orig: number) {
  return Math.round(((orig - price) / orig) * 100);
}

function VideoCard({ video, index }: { video: ShortVideo; index: number }) {
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const hasVideo = !!video.video_url;
  const isYT = hasVideo && isYouTube(video.video_url!);
  const isDirectVideo = hasVideo && !isYT;

  // Extrai product_id do product_link se não vier directo (ex: /produto/abc123)
  const resolvedProductId = video.product_id ||
    (video.product_link?.match(/\/produto\/([^/?#]+)/)?.[1] ?? null);

  const handlePlay = () => {
    if (!hasVideo) return;
    setPlaying(true);
  };

  const handleClose = () => {
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setProgress(0);
  };

  const toggleMute = () => {
    setMuted((m) => !m);
    if (videoRef.current) videoRef.current.muted = !muted;
  };

  const togglePause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const update = () => setProgress((v.currentTime / v.duration) * 100 || 0);
    v.addEventListener("timeupdate", update);
    return () => v.removeEventListener("timeupdate", update);
  }, [playing]);

  const handleBuy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;

    if (!resolvedProductId) {
      toast({
        title: "Produto não configurado",
        description: "Este vídeo ainda não tem produto associado.",
        variant: "destructive",
      });
      return;
    }

    await addToCart(resolvedProductId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const soldOut = video.badge === "Vendido";

  return (
    <div
      className="flex-shrink-0 w-[240px] snap-start"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative h-[420px] rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          boxShadow: hovered
            ? "0 24px 48px -12px rgba(0,0,0,0.35), 0 8px 16px -6px rgba(0,0,0,0.2)"
            : "0 4px 16px -4px rgba(0,0,0,0.18)",
          transform: hovered ? "translateY(-6px) scale(1.015)" : "translateY(0) scale(1)",
        }}
      >
        {/* Thumbnail */}
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
            playing && isYT ? "opacity-0" : "opacity-100"
          } ${hovered && !playing ? "scale-[1.04]" : "scale-100"}`}
          style={{ transition: "transform 0.7s ease, opacity 0.3s ease" }}
        />

        {/* Direct video */}
        {playing && isDirectVideo && (
          <video
            ref={videoRef}
            src={video.video_url!}
            autoPlay
            muted={muted}
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* YouTube embed */}
        {playing && isYT && (
          <iframe
            src={toYouTubeEmbed(video.video_url!)}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
          />
        )}

        {/* Dark overlay — strong at bottom, light at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent pointer-events-none" />

        {/* Sold-out dim */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        )}

        {/* Badge — top right */}
        {video.badge && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeColor(video.badge)}`}>
              {video.badge}
            </span>
          </div>
        )}

        {/* Like — top left */}
        <button
          onClick={() => setLiked((l) => !l)}
          className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 ${
            liked
              ? "bg-red-500/80 border-red-400/30 scale-110"
              : "bg-white/10 border-white/15 hover:bg-white/20"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-all duration-200 ${liked ? "fill-white text-white" : "text-white"}`}
          />
        </button>

        {/* Controls (when playing) */}
        {playing && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              {muted ? <VolumeX className="w-3 h-3 text-white" /> : <Volume2 className="w-3 h-3 text-white" />}
            </button>
            {isDirectVideo && (
              <button
                onClick={togglePause}
                className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Pause className="w-3 h-3 text-white" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )}

        {/* Play button (center) */}
        {!playing && hasVideo && (
          <button
            onClick={handlePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md bg-white/15 border border-white/25 transition-all duration-300 hover:bg-white/25 hover:scale-110"
            style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.25s ease, transform 0.25s ease, background 0.2s" }}
          >
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </button>
        )}

        {/* Progress bar */}
        {playing && isDirectVideo && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/15 z-20">
            <div
              className="h-full bg-[hsl(var(--cta-orange))] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2.5 z-10">
          {/* Discount indicator */}
          {video.original_price && video.original_price > video.price && (
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[hsl(var(--sale-red))] text-white">
              -{discount(video.price, video.original_price)}%
            </span>
          )}

          {/* Title + price */}
          <div className="space-y-0.5">
            <h3 className="text-white font-semibold text-[13px] leading-snug line-clamp-2 tracking-tight">
              {video.title}
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white text-lg font-black tracking-tight">
                {video.price.toLocaleString("pt-AO", { maximumFractionDigits: 0 })}
              </span>
              <span className="text-white/60 text-[11px] font-medium">Kz</span>
              {video.original_price && (
                <span className="text-white/35 text-xs line-through ml-0.5">
                  {video.original_price.toLocaleString("pt-AO", { maximumFractionDigits: 0 })} Kz
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className={`flex-1 h-9 rounded-xl text-[12px] font-bold transition-all duration-200 gap-1.5 ${
                soldOut
                  ? "bg-white/10 border border-white/15 text-white/40 cursor-not-allowed"
                  : added
                  ? "bg-emerald-500 text-white"
                  : "bg-[hsl(var(--cta-orange))] hover:bg-[hsl(var(--cta-orange-hover))] text-white shadow-lg shadow-orange-900/30"
              }`}
              onClick={handleBuy}
              disabled={soldOut}
            >
              {soldOut ? (
                <><ShoppingCart className="w-3 h-3" /> Esgotado</>
              ) : added ? (
                <><Check className="w-3 h-3" /> Adicionado</>
              ) : (
                <><ShoppingCart className="w-3 h-3" /> Comprar</>
              )}
            </Button>
            {video.product_link && (
              <Link to={video.product_link}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl border border-white/15 bg-white/8 hover:bg-white/15 text-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[240px] snap-start">
      <div className="h-[420px] rounded-2xl overflow-hidden bg-muted animate-pulse" />
    </div>
  );
}

export const ShortVideosSection = () => {
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("short_videos")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true });
      setVideos((data as ShortVideo[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (!loading && videos.length === 0) return null;

  const track = videos.length > 0 ? [...videos, ...videos, ...videos] : [];
  const duration = Math.max(videos.length * 7, 28);

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Shorts
              </span>
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight leading-none">
              Em Destaque
            </h2>
          </div>
        </div>
      </div>

      {/* Cards marquee */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {loading ? (
          <div className="flex gap-4 pb-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div
            className="flex gap-4 pb-4"
            style={{
              animation: `shorts-scroll ${duration}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {track.map((v, i) => (
              <VideoCard key={`${v.id}-${i}`} video={v} index={i} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shorts-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};
