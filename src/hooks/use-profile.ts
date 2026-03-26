import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await (supabase
          .from("profiles" as any) as any)
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (mounted) {
          if (error) {
            console.error("Error fetching profile:", error);
          } else {
            setProfile(data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        if (mounted) setLoading(false);
      }
    }

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile();
      } else {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}
