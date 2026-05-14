import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import sinkeraLogoWhite from "@/assets/sinkera-logo-white.png";

export default function NotFound() {
  const location = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6"
      style={{ background: "hsl(222 47% 5%)" }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(22 100% 46% / 0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">

        {/* Logo */}
        <img
          src={sinkeraLogoWhite}
          alt="Sinkera"
          className="h-7 w-auto mb-12 opacity-80"
        />

        {/* 404 */}
        <p
          className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4"
          style={{ color: "hsl(22 100% 46%)" }}
        >
          Erro 404
        </p>
        <h1
          className="text-[96px] sm:text-[128px] font-black leading-none tracking-tighter mb-2"
          style={{ color: "rgba(255,255,255,0.06)" }}
        >
          404
        </h1>

        <div className="mt-2 mb-8 space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Página não encontrada
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            O endereço <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}>{location.pathname}</span> não existe ou foi removido.
          </p>
        </div>

        {/* Divider */}
        <div className="w-10 h-px mb-8" style={{ background: "rgba(255,255,255,0.1)" }} />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
              background: "transparent",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold transition-all"
            style={{ background: "hsl(22 100% 46%)", color: "white" }}
            onMouseEnter={e => e.currentTarget.style.background = "hsl(22 100% 40%)"}
            onMouseLeave={e => e.currentTarget.style.background = "hsl(22 100% 46%)"}
          >
            <Home className="w-4 h-4" />
            Ir para a loja
          </button>
        </div>
      </div>

      {/* Footer */}
      <p
        className="absolute bottom-6 text-[10px] tracking-widest uppercase"
        style={{ color: "rgba(255,255,255,0.15)" }}
      >
        Sinkera © 2025 · Luanda, Angola
      </p>
    </div>
  );
}
