# Widia Sari — Portfolio Website

Website portfolio personal Widia Sari, Sarjana Komunikasi.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- OGL (WebGL Circular Gallery)
- Framer Motion (Shiny Text Effect)
- Font Awesome Icons
- Supabase (Storage & Database)

## Setup Supabase

### 1. Buat Project di Supabase

Buat project baru di [supabase.com](https://supabase.com), lalu ambil **Project URL** dan **Anon Key**.

### 2. Environment Variables

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Jalankan SQL Queries

Buka **SQL Editor** di Supabase Dashboard, lalu jalankan query berikut **secara berurutan**:

#### a) Buat Tabel `gallery_photos`

```sql
-- Tabel untuk menyimpan data foto gallery
CREATE TABLE public.gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa melihat foto (public read)
CREATE POLICY "Anyone can view gallery photos"
  ON public.gallery_photos
  FOR SELECT
  USING (true);

-- Policy: Hanya user yang sudah login (auth) bisa insert foto
CREATE POLICY "Authenticated users can insert gallery photos"
  ON public.gallery_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Hanya user yang sudah login (auth) bisa delete foto
CREATE POLICY "Authenticated users can delete gallery photos"
  ON public.gallery_photos
  FOR DELETE
  TO authenticated
  USING (true);
```

#### b) Buat Tabel `site_settings`

```sql
-- Tabel untuk menyimpan pengaturan situs (resume link, social media, about me)
CREATE TABLE public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa membaca settings (public read)
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Policy: Hanya user yang sudah login (auth) bisa insert settings
CREATE POLICY "Authenticated users can insert site settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Hanya user yang sudah login (auth) bisa update settings
CREATE POLICY "Authenticated users can update site settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('resume_link', 'https://drive.google.com/uc?export=download&id=DUMMY_FILE_ID'),
  ('social_instagram', 'https://instagram.com/widia_sari'),
  ('social_whatsapp', 'https://wa.me/6281234567890'),
  ('social_tiktok', 'https://tiktok.com/@widia_sari'),
  ('about_me', 'Halo! Saya Widia Sari, seorang lulusan Sarjana Komunikasi yang memiliki passion di bidang media, storytelling, dan komunikasi visual.');
```

#### c) Buat Storage Bucket `gallery`

```sql
-- Buat storage bucket untuk foto gallery
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Policy: Public read access untuk storage
CREATE POLICY "Public read access for gallery"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery');

-- Policy: Hanya user yang sudah login bisa upload ke gallery bucket
CREATE POLICY "Authenticated users can upload to gallery"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery');

-- Policy: Hanya user yang sudah login bisa delete dari gallery bucket
CREATE POLICY "Authenticated users can delete from gallery"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery');
```

#### d) Buat User Auth (di Supabase Dashboard)

Buka **Authentication > Users** di Supabase Dashboard, lalu klik **Add User** dan buat user dengan:
- Email: `admin@widia.com`
- Password: `admin123`

Atau gunakan SQL:
```sql
-- Catatan: Membuat user auth harus dilakukan melalui Supabase Dashboard
-- atau melalui Supabase Auth API, bukan melalui SQL langsung.
-- Buka Authentication > Users > Add User di dashboard.
```

### 4. Jalankan Project

```sh
npm install
npm run dev
```

### 5. Login & Admin Panel

1. Buka website, klik **Login** di navbar
2. Gunakan akun demo: `admin@widia.com` / `admin123`
3. Di Admin Panel, kamu bisa:
   - 📸 Upload foto gallery (file lokal atau URL)
   - 🔗 Ganti link resume
   - 📱 Ganti link social media
   - 📝 Edit isi About Me

## Routes

| Route    | Deskripsi              |
| -------- | ---------------------- |
| `/`      | Portfolio homepage     |
| `/login` | Halaman login          |
| `/admin` | Admin panel            |

## Fitur

- ✅ Hero section dengan ShinyText effect
- ✅ Hand-drawn animated resume button
- ✅ Social media bar (fixed di kanan pada mobile)
- ✅ About Me section (editable via admin)
- ✅ Circular 3D Gallery (WebGL/OGL)
- ✅ Mobile-first responsive design
- ✅ Hamburger menu dengan animasi smooth
- ✅ Login page dengan demo account
- ✅ Admin panel: gallery, resume link, social links, about me
- ✅ Integrasi penuh dengan Supabase
- ✅ Soft purple design system
