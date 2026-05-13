import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_label: string | null;
  cta_link: string | null;
  image_url: string;
  position: number;
  is_active: boolean;
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true });
      if (active) {
        setBanners((data as Banner[]) || []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { banners, loading };
}
