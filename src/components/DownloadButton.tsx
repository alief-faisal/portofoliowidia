import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function DownloadButton() {
  const [resumeLink, setResumeLink] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabase();
    const load = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "resume_link")
          .limit(1);
        if (!mounted) return;
        if (data && data.length > 0) setResumeLink(data[0].value || null);
      } catch (e) {
        console.error("Could not load resume_link", e);
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href =
      resumeLink ||
      "https://drive.google.com/uc?export=download&id=DUMMY_FILE_ID";
    link.download = "Widia_Sari_Resume.pdf";
    link.click();
  };
  return (
    <>
      {/* SVG Filters for hand-drawn effect */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="handDrawnNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="5"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="handDrawnNoise2">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.06"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="handDrawnNoiset">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="handDrawnNoiset2">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.07"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <button
        className="hand-drawn-button"
        onClick={handleDownload}
        type="button"
      >
        <svg
          className="highlight"
          viewBox="0 0 300 60"
          preserveAspectRatio="none"
        >
          <rect x="5" y="5" width="290" height="50" rx="25" ry="25" />
        </svg>
        <svg className="button-cosm" viewBox="0 0 24 24" width="24" height="24">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <i className="fa-solid fa-file-lines mr-2" />
        Resume
      </button>
    </>
  );
}
