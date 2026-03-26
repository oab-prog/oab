import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserProgress() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase
        .from("user_progress" as any) as any)
        .select("simulado_data, historico_data")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!error && mounted) {
        setProgress(data?.simulado_data || null);
        setHistory(data?.historico_data || []);
      }
      if (mounted) setLoading(false);
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchData();
      else {
        setProgress(null);
        setHistory([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { loading, progress, history };
}
