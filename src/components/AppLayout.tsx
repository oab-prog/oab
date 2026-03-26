import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Auth } from "@/components/Auth";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { User, LogOut, Cloud } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background transition-all duration-300 ease-in-out">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative transition-all duration-300 ease-in-out">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="z-50 hover:bg-accent transition-colors" />
            </div>
            
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-success uppercase bg-success/10 px-2 py-1 rounded-full">
                    <Cloud className="h-3 w-3" /> Sincronizado
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[120px]">
                    {user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold uppercase tracking-wider border-primary/30 hover:border-primary transition-all">
                      <User className="h-3.5 w-3.5" /> Entrar / Salvar Progresso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10">
                    <Auth onToggle={() => setOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* Rodapé institucional da SoftGestão */}
          <footer className="border-t border-border py-4 px-6 bg-background/50 text-center text-[10px] text-muted-foreground shrink-0 space-y-1">
            <p>© 2026 SoftGestão – Todos os direitos reservados – Themis M.A. Consultoria Forense By Adriana Sousa</p>
            <p className="opacity-50 uppercase tracking-widest font-semibold">JurisVision v1.4.0 — Arsenal 2ª Fase — Oficial</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
