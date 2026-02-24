import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function SocialBar() {
  const [instagram, setInstagram] = useState(
    "https://instagram.com/widia_sari",
  );
  const [whatsapp, setWhatsapp] = useState("https://wa.me/6281234567890");
  const [tiktok, setTiktok] = useState("https://tiktok.com/@widia_sari");

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabase();
    const load = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("key,value");
        if (!mounted || !data) return;
        data.forEach((r: unknown) => {
          const row = r as { key?: string; value?: string };
          if (row.key === "social_instagram")
            setInstagram(row.value || "https://instagram.com/widia_sari");
          if (row.key === "social_whatsapp")
            setWhatsapp(row.value || "https://wa.me/6281234567890");
          if (row.key === "social_tiktok")
            setTiktok(row.value || "https://tiktok.com/@widia_sari");
        });
      } catch (e) {
        console.error("Could not load social links", e);
      }
    };
    load();
    const onUpdate = () => load();
    globalThis.addEventListener("site_settings_updated", onUpdate);
    return () => {
      mounted = false;
      globalThis.removeEventListener("site_settings_updated", onUpdate);
    };
  }, []);

  const socials = [
    { icon: "fa-brands fa-instagram", href: instagram, label: "Instagram" },
    { icon: "fa-brands fa-whatsapp", href: whatsapp, label: "WhatsApp" },
    { icon: "fa-brands fa-tiktok", href: tiktok, label: "TikTok" },
  ];

  return (
    <>
      {/* Desktop: inline center */}
      <div className="hidden md:flex items-center gap-4">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-11 h-11 rounded-full border border-border bg-card/60 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-300"
          >
            <i className={`${s.icon} text-lg`} />
          </a>
        ))}
      </div>

      {/* Mobile: fixed right side, vertically centered */}
      <div className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 bg-card/80 backdrop-blur-xl border border-border border-r-0 rounded-l-xl py-3 px-2 shadow-lg">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-10 h-10 rounded-full border border-border bg-card/60 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
          >
            <i className={`${s.icon} text-base`} />
          </a>
        ))}
      </div>
    </>
  );
}
