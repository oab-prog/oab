import { Home, Crosshair, Search, BarChart3, Scale, BookOpen, Sparkles, BookMarked } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Início", url: "/", icon: Home },
  { title: "Simulado Real", url: "/simulado", icon: Crosshair },
  { title: "Dominando Ética", url: "/etica", icon: Sparkles },
  { title: "Buscador", url: "/buscador", icon: Search },
  { title: "Radar de Recorrência", url: "/radar", icon: BarChart3 },
  { title: "Dicionário de Teses", url: "/teses", icon: BookMarked }, // <-- O NOVO GOOGLE JURÍDICO
  { title: "Veredito e Predição", url: "/predicao", icon: Scale },
  { title: "Vademecum Online", url: "https://www4.planalto.gov.br/legislacao/", icon: BookOpen, external: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarContent className="pt-6">
        <div className="px-4 mb-8">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <img 
                src="https://raw.githubusercontent.com/oab-prog/oab/main/logo.png" 
                alt="Logo JurisVision" 
                className="h-9 w-9 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">
                  JurisVision OAB
                </h2>
                <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-medium">
                  By SoftGestão
                </p>
              </div>
            </div>
          ) : (
            <img 
              src="https://raw.githubusercontent.com/oab-prog/oab/main/logo.png" 
              alt="Logo" 
              className="h-8 w-8 mx-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${item.title === "Dominando Ética" ? "text-gold" : ""}`} />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </a>
                    ) : (
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                        activeClassName="bg-primary/10 text-primary font-bold border-l-2 border-primary rounded-l-none"
                      >
                        <item.icon className={`h-4 w-4 shrink-0 
                          ${item.title === "Dominando Ética" && location.pathname !== "/etica" ? "text-gold/70" : ""}
                          ${item.title === "Dicionário de Teses" && location.pathname !== "/teses" ? "text-primary/70" : ""}
                        `} />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
