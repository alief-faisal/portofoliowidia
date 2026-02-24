import DownloadButton from './DownloadButton';
import SocialBar from './SocialBar';
import ShinyText from './ShinyText';

export default function HeroSection() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative px-6">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center space-y-6 relative z-10">
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Halo, saya</p>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          <ShinyText
            text="Widia Nurfarida S.Pd"
            color="#1a1a1a"
            shineColor="#ffffff"
            speed={3}
            className="text-5xl md:text-7xl font-extrabold"
          />
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
          Sarjana Pendidikan
        </p>
        <div className="flex flex-col items-center gap-6 pt-4">
          <DownloadButton />
          <SocialBar />
        </div>
      </div>
    </section>
  );
}
