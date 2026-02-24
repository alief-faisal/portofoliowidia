import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase, type GalleryPhoto } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth check
  useEffect(() => {
    if (localStorage.getItem("widia_auth") !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  const [configError, setConfigError] = useState<string | null>(null);
  const supabase = useMemo(() => {
    try {
      return getSupabase();
    } catch (e: any) {
      setConfigError(e.message);
      return null;
    }
  }, []);

  // Gallery state
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadLock = useRef(false);

  // Settings state
  const [resumeLink, setResumeLink] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialWhatsapp, setSocialWhatsapp] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchPhotos = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else setPhotos(data || []);
    setLoading(false);
  };

  const fetchSettings = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      data.forEach((row: any) => {
        if (row.key === "resume_link") setResumeLink(row.value || "");
        if (row.key === "social_instagram") setSocialInstagram(row.value || "");
        if (row.key === "social_whatsapp") setSocialWhatsapp(row.value || "");
        if (row.key === "social_tiktok") setSocialTiktok(row.value || "");
        if (row.key === "about_me") setAboutMe(row.value || "");
      });
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchSettings();
  }, []);

  const handleUpload = async () => {
    if (!supabase) return;
    if (uploadLock.current) return; // prevent re-entrancy/double-click
    uploadLock.current = true;

    if (uploadMode === "url") {
      if (!imageUrl.trim() || !title.trim()) {
        toast({
          title: "Error",
          description: "Mohon isi judul dan URL gambar",
          variant: "destructive",
        });
        uploadLock.current = false;
        return;
      }
      setUploading(true);
      // idempotency: skip if same image_url already exists
      const existing = await supabase
        .from("gallery_photos")
        .select("id")
        .eq("image_url", imageUrl.trim())
        .limit(1);
      if (existing?.data && existing.data.length > 0) {
        toast({
          title: "Sudah ada",
          description: "Foto ini sudah pernah ditambahkan",
          variant: "default",
        });
        setTitle("");
        setImageUrl("");
        fetchPhotos();
        setUploading(false);
        uploadLock.current = false;
        return;
      }

      const { error } = await supabase
        .from("gallery_photos")
        .insert({ title: title.trim(), image_url: imageUrl.trim() });
      if (error)
        toast({
          title: "Gagal simpan",
          description: error.message,
          variant: "destructive",
        });
      else {
        toast({ title: "Berhasil", description: "Foto berhasil ditambahkan!" });
        setTitle("");
        setImageUrl("");
        fetchPhotos();
      }
      setUploading(false);
      uploadLock.current = false;
      return;
    }

    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) {
      toast({
        title: "Error",
        description: "Mohon isi judul dan pilih file",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, file);
    if (uploadError) {
      toast({
        title: "Upload gagal",
        description: uploadError.message,
        variant: "destructive",
      });
      setUploading(false);
      uploadLock.current = false;
      return;
    }
    const { data: urlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);
    const publicUrl = urlData?.publicUrl;
    // idempotency: skip if same image_url already exists
    if (publicUrl) {
      const existingFile = await supabase
        .from("gallery_photos")
        .select("id")
        .eq("image_url", publicUrl)
        .limit(1);
      if (existingFile?.data && existingFile.data.length > 0) {
        toast({
          title: "Sudah ada",
          description: "Foto ini sudah pernah ditambahkan",
          variant: "default",
        });
        setTitle("");
        if (fileRef.current) fileRef.current.value = "";
        fetchPhotos();
        setUploading(false);
        uploadLock.current = false;
        return;
      }
    }

    const { error: insertError } = await supabase
      .from("gallery_photos")
      .insert({ title: title.trim(), image_url: publicUrl });
    if (insertError)
      toast({
        title: "Gagal simpan",
        description: insertError.message,
        variant: "destructive",
      });
    else {
      toast({ title: "Berhasil", description: "Foto berhasil diupload!" });
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      fetchPhotos();
    }
    setUploading(false);
    uploadLock.current = false;
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!supabase) return;
    // Only try to delete from storage if it's a supabase storage URL
    if (photo.image_url.includes("supabase")) {
      const fileName = photo.image_url.split("/").pop();
      if (fileName) await supabase.storage.from("gallery").remove([fileName]);
    }
    const { error } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", photo.id);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else {
      toast({ title: "Dihapus", description: "Foto telah dihapus" });
      fetchPhotos();
    }
  };

  const handleSaveSettings = async () => {
    if (!supabase) return;
    setSavingSettings(true);
    const settings = [
      { key: "resume_link", value: resumeLink },
      { key: "social_instagram", value: socialInstagram },
      { key: "social_whatsapp", value: socialWhatsapp },
      { key: "social_tiktok", value: socialTiktok },
      { key: "about_me", value: aboutMe },
    ];
    for (const s of settings) {
      await supabase
        .from("site_settings")
        .upsert({ key: s.key, value: s.value }, { onConflict: "key" });
    }
    toast({ title: "Tersimpan!", description: "Pengaturan berhasil disimpan" });
    // Notify other components to reload site_settings
    try {
      window.dispatchEvent(new Event("site_settings_updated"));
    } catch (e) {
      // ignore
    }
    setSavingSettings(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("widia_auth");
    navigate("/");
  };

  if (configError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md text-center space-y-4">
          <i className="fa-solid fa-triangle-exclamation text-4xl text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">
            Supabase Belum Dikonfigurasi
          </h2>
          <p className="text-sm text-muted-foreground">{configError}</p>
          <p className="text-xs text-muted-foreground">
            Lihat README.md untuk panduan setup lengkap.
          </p>
          <a
            href="/"
            className="text-sm text-primary hover:underline inline-block mt-2"
          >
            ← Kembali ke Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          <i className="fa-solid fa-gear mr-2 text-primary" />
          Admin Panel
        </h1>
        <div className="flex gap-3">
          <a href="/" className="text-sm text-primary hover:underline">
            <i className="fa-solid fa-arrow-left mr-1" />
            Home
          </a>
          <button
            onClick={handleLogout}
            className="text-sm text-destructive hover:underline"
          >
            <i className="fa-solid fa-right-from-bracket mr-1" />
            Logout
          </button>
        </div>
      </div>

      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          <TabsTrigger value="about">Tentang Widi</TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Upload Foto Baru</h2>
            <Input
              placeholder="Judul foto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                variant={uploadMode === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadMode("file")}
              >
                <i className="fa-solid fa-upload mr-1" />
                LINK
              </Button>
              <Button
                variant={uploadMode === "url" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadMode("url")}
              >
                <i className="fa-solid fa-link mr-1" />
                URL Link
              </Button>
            </div>

            {uploadMode === "file" ? (
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:transition-colors"
              />
            ) : (
              <Input
                placeholder="https://example.com/foto.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">
              Daftar Foto ({photos.length})
            </h2>
            {loading ? (
              <p className="text-muted-foreground text-sm">Memuat...</p>
            ) : photos.length === 0 ? (
              <p className="text-muted-foreground text-sm">Belum ada foto.</p>
            ) : (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 bg-card border border-border rounded-xl p-3"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {photo.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(photo.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(photo)}
                  >
                    <i className="fa-solid fa-trash" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Link Resume</h2>
            <Input
              placeholder="https://drive.google.com/..."
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
            />

            <h2 className="font-semibold text-foreground pt-4">
              Social Media Links
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <i className="fa-brands fa-instagram text-lg text-muted-foreground w-6 text-center" />
                <Input
                  placeholder="https://instagram.com/..."
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-brands fa-whatsapp text-lg text-muted-foreground w-6 text-center" />
                <Input
                  placeholder="https://wa.me/62..."
                  value={socialWhatsapp}
                  onChange={(e) => setSocialWhatsapp(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-brands fa-tiktok text-lg text-muted-foreground w-6 text-center" />
                <Input
                  placeholder="https://tiktok.com/@..."
                  value={socialTiktok}
                  onChange={(e) => setSocialTiktok(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full mt-4"
            >
              {savingSettings ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk mr-2" />
                  Simpan Pengaturan
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* About Me Tab */}
        <TabsContent value="about" className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">
              Di isi tentang widi
            </h2>
            <Textarea
              placeholder="Tulis tentang dirimu..."
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={10}
            />
            <Button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full"
            >
              {savingSettings ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
