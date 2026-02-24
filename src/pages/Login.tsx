// pages/Login.tsx
// Login pakai Supabase asli

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const supabase = getSupabase(); // ambil client

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        alert(error.message || "Gagal login");
        return;
      }

      // berhasil
      // tandai sebagai authenticated untuk Admin.tsx (checks localStorage)
      try {
        localStorage.setItem("widia_auth", "true");
      } catch (e) {
        console.warn("Could not write widia_auth to localStorage", e);
      }
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mencoba login");
    } finally {
      setLoading(false);
    }
  };

  // Debug: quick connectivity check and show last error
  const [lastError, setLastError] = useState<string | null>(null);
  const runCheck = async () => {
    setLastError(null);
    try {
      const sessionRes = await supabase.auth.getSession();
      console.log("SESSION CHECK", sessionRes);

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1);
      if (error) {
        console.error("CHECK ERROR", error);
        setLastError(JSON.stringify(error));
        return;
      }
      console.log("CHECK DATA", data);
      setLastError("OK — bisa terhubung dan membaca site_settings");
    } catch (err: any) {
      console.error("RUN CHECK EX", err);
      setLastError(String(err?.message || err));
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm border p-6 rounded-xl space-y-4">
        <h1 className="text-xl font-bold text-center">Login</h1>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Masuk"}
          </Button>
        </form>

        <div className="pt-4 border-t space-y-2">
          <Button variant="secondary" onClick={runCheck} className="w-full">
            Check Supabase
          </Button>
          {lastError && (
            <div className="text-sm text-red-600 break-all">
              Last error: {lastError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
