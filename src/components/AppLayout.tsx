import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 shrink-0">
            <SidebarTrigger />
          </header>
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* Rodapé institucional da SoftGestão */}
          <footer className="border-t border-border py-4 px-6 bg-background/50 text-center text-xs text-muted-foreground shrink-0">
            <p>© 2026 SoftGestão – Todos os direitos reservados – By Adriana Sousa</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
