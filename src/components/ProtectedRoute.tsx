// components/ProtectedRoute.tsx
// Versi yang lebih stabil, tidak bikin mental lagi

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getSupabase();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil session awal
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Dengarkan perubahan login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
