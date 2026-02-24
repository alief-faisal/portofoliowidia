import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function AboutSection() {
  const [about, setAbout] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabase();

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "about_me")
          .limit(1);
        if (error) {
          console.warn("Could not load about_me", error);
          return;
        }
        if (!mounted) return;
        if (data && data.length > 0) setAbout(data[0].value);
      } catch (e) {
        console.error("AboutSection load error", e);
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

  const defaultAbout = `Halo! Saya Widia Sari, seorang lulusan Sarjana Komunikasi yang memiliki passion di bidang media, storytelling, dan komunikasi visual. Saya percaya bahwa setiap cerita layak untuk diceritakan dengan cara yang menarik dan bermakna.\n\nSelama perjalanan akademik dan profesional saya, saya telah mengembangkan keterampilan dalam public relations, content creation, social media management, serta fotografi. Saya senang mengeksplorasi berbagai medium untuk menyampaikan pesan yang efektif dan membangun koneksi dengan audiens.\n\nDi waktu luang, saya gemar memotret momen-momen sederhana dalam kehidupan sehari-hari, membaca buku non-fiksi, dan mengikuti perkembangan tren digital. Saya selalu terbuka untuk kolaborasi dan kesempatan baru yang memungkinkan saya untuk terus berkembang.`;

  const text = about ?? defaultAbout;
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => <p key={p.slice(0, 40)}>{p}</p>);

  return (
    <section id="about" className="py-24 px-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-foreground mb-2 text-center">
        About Me
      </h2>
      <div className="w-16 h-1 bg-primary rounded-full mb-8 mx-auto" />
      <div className="space-y-5 text-muted-foreground leading-relaxed text-justify">
        {paragraphs}
      </div>
    </section>
  );
}
