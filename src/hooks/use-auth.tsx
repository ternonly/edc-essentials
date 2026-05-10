import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function applySession(sess: Session | null) {
      if (cancelled) return;
      setSession(sess);
      setUser(sess?.user ?? null);

      if (!sess?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (cancelled) return;
      setIsAdmin(!!data);
      setLoading(false);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setLoading(true);
      setTimeout(() => { void applySession(sess); }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      void applySession(sess);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, user, isAdmin, loading, signOut };
}
