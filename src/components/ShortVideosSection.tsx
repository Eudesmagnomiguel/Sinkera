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
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface ShortVideo {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  video_url: string | null;
  thumbnail_url: string;
  product_link: string | null;
  position: number;
  is_active: boolean;
}

const FALLBACK: ShortVideo[] = [
  {
    id: "1",
    title: "Fones Low Game Edition",
    price: 95000,
    original_price: 120000,
    badge: "50% OFF",
    video_url: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=600&fit=crop",
    product_link: null,
    position: 1,
    is_active: true,
  },
  {
    id: "2",
    title: "Microfones Sem Fio",
    price: 85000,
    original_price: null,
    badge: "Novo",
    video_url: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1606220588913-b3adf547d474?w=400&h=600&fit=crop",
    product_link: null,
    position: 2,
    is_active: true,
  },
  {
    id: "3",
    title: "Caneta Stylus Premium",
    price: 45000,
    original_price: null,
    badge: null,
    video_url: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=600&fit=crop",
    product_link: null,
    position: 3,
    is_active: true,
  },
  {
    id: "4",
    title: "Fones Bluetooth Pro",
    price: 110000,
    original_price: null,
    badge: "Vendido",
    video_url: null,
    thumbnail_url:
      "https://images.unsplash.com/photo-1631867675167-90a456a90863?w=400&h=600&fit=crop",
    product_link: null,
    position: 4,
    is_active: true,
  },
];

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

function badgeStyle(badge: string) {
  if (badge.includes("OFF"))
    return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
  if (badge === "Novo")
    return "bg-gradient-to-r from-emerald-500 to-green-600 text-white";
  if (badge === "Vendido")
    return "bg-gradient-to-r from-gray-500 to-slate-600 text-white";
  return "bg-gradient-to-r from-orange-500 to-amber-500 text-white";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const hasVideo = !!video.video_url;
  const isYT = hasVideo && isYouTube(video.video_url!);
  const isDirectVideo =
    hasVideo && !isYT;

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

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (video.badge === "Vendido") {
      toast({ title: "Produto esgotado", description: "Este produto não está disponível.", variant: "destructive" });
      return;
    }
    toast({
      title: "✓ Adicionado ao carrinho",
      description: video.title,
    });
  };

  return (
    <div
      className="flex-shrink-0 w-[260px] snap-start"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative h-[460px] rounded-[28px] overflow-hidden shadow-lg transition-all duration-500 ${
          hovered ? "shadow-2xl -translate-y-2 scale-[1.02]" : ""
        }`}
      >
        {/* ── Thumbnail ── */}
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
            playing && isYT ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* ── Direct video ── */}
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

        {/* ── YouTube embed ── */}
        {playing && isYT && (
          <iframe
            src={toYouTubeEmbed(video.video_url!)}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
          />
        )}

        {/* ── Gradient overlays ── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20 pointer-events-none" />
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-transparent pointer-events-none transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 70%)" }}
        />

        {/* ── Badge ── */}
        {video.badge && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg ${badgeStyle(video.badge)}`}>
              {video.badge}
            </span>
          </div>
        )}

        {/* ── Like button ── */}
        <button
          onClick={() => setLiked((l) => !l)}
          className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 ${
            liked ? "bg-red-500/80 scale-110" : "bg-white/15 hover:bg-white/25"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${liked ? "fill-white text-white" : "text-white"}`}
          />
        </button>

        {/* ── Close / Controls (when playing) ── */}
        {playing && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              {muted ? (
                <VolumeX className="w-3.5 h-3.5 text-white" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            {isDirectVideo && (
              <button
                onClick={togglePause}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Pause className="w-3.5 h-3.5 text-white" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}

        {/* ── Play button (center, when not playing) ── */}
        {!playing && hasVideo && (
          <button
            onClick={handlePlay}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-all duration-300 ${
              hovered
                ? "bg-white/25 scale-110 shadow-xl"
                : "bg-white/15 opacity-0 group-hover:opacity-100"
            }`}
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <Play className="w-7 h-7 text-white fill-white ml-0.5" />
          </button>
        )}

        {/* ── Video progress bar ── */}
        {playing && isDirectVideo && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-20">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ── Bottom content ── */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 z-10">
          {/* Discount pill */}
          {video.original_price && video.original_price > video.price && (
            <div className="inline-flex">
              <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount(video.price, video.original_price)}%
              </span>
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-white font-bold text-base leading-snug line-clamp-2 drop-shadow">
              {video.title}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-white text-xl font-extrabold tracking-tight">
                {video.price.toLocaleString()} Kz
              </span>
              {video.original_price && (
                <span className="text-white/50 text-xs line-through">
                  {video.original_price.toLocaleString()} Kz
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className={`flex-1 h-10 rounded-2xl text-sm font-bold transition-all duration-200 gap-1.5 ${
                video.badge === "Vendido"
                  ? "bg-gray-600 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-500/25"
              }`}
              onClick={handleBuy}
            >
              <Zap className="w-3.5 h-3.5" />
              {video.badge === "Vendido" ? "Esgotado" : "Comprar Agora"}
            </Button>
            {video.product_link && (
              <Link to={video.product_link}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-2xl border-white/30 bg-white/10 hover:bg-white/20 text-white"
                >
                  <ExternalLink className="w-4 h-4" />
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
    <div className="flex-shrink-0 w-[260px] snap-start">
      <div className="h-[460px] rounded-[28px] overflow-hidden bg-muted animate-pulse" />
    </div>
  );
}

export const ShortVideosSection = () => {
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("short_videos")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true })
        .limit(4);
      setVideos(data && data.length > 0 ? (data as ShortVideo[]) : FALLBACK);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
              Shorts
            </span>
          </div>
          <h2 className="text-xl font-bold">Em Destaque</h2>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:block">
          Desliza para ver mais →
        </span>
      </div>

      {/* Cards carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
        {loading
          ? SLOTS_SKELETON.map((i) => <SkeletonCard key={i} />)
          : videos.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

const SLOTS_SKELETON = [1, 2, 3, 4];
