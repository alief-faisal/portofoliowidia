import HorizontalGallery from './HorizontalGallery';

export default function GallerySection() {
  return (
    <section id="gallery" className="py-24 px-0">
      <div className="max-w-3xl mx-auto mb-8 text-center px-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">My Gallery</h2>
        <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
      </div>
      <div className="px-6">
        <HorizontalGallery />
      </div>
    </section>
  );
}
