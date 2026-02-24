import { useEffect, useRef, useState } from 'react';
import { getSupabase, type GalleryPhoto } from '@/lib/supabase';

const defaultImages = [
  { image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600', title: 'Landscape' },
  { image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', title: 'Nature' },
  { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', title: 'Beach' },
  { image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600', title: 'Mountain' },
  { image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600', title: 'Lake' },
  { image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600', title: 'Meadow' },
  { image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600', title: 'Valley' },
  { image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600', title: 'Forest' },
];

export default function HorizontalGallery() {
  const [photos, setPhotos] = useState<{ image: string; title: string }[]>(defaultImages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    try {
      const supabase = getSupabase();
      supabase.from('gallery_photos').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        if (data && data.length > 0) {
          setPhotos(data.map((p: GalleryPhoto) => ({ image: p.image_url, title: p.title })));
        }
      });
    } catch {
      // Supabase not configured, use defaults
    }
  }, []);

  // Infinite scroll: when reaching near the end, reset scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const halfWidth = el.scrollWidth / 2;
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += halfWidth;
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [photos]);

  // Drag to scroll
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const onMouseUp = () => { isDragging.current = false; };

  // Duplicate items for infinite effect
  const items = [...photos, ...photos];

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto cursor-grab active:cursor-grabbing scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {items.map((item, i) => (
        <div
          key={`${item.title}-${i}`}
          className="flex-shrink-0 w-64 md:w-80 group"
        >
          <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              draggable={false}
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white font-semibold text-sm">{item.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
