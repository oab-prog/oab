import { Home, Crosshair, Search, BarChart3, Scale, BookOpen, Sparkles, BookMarked, PenTool, Lock, Clock, Bone, Edit3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/use-profile";
import { Badge } from "@/components/ui/badge";
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
  { title: "Treino de Peças", url: "/treino-peca", icon: PenTool },
  { title: "Treino de Discursivas", url: "/treino-discursivas", icon: Edit3 },
  { title: "Buscador de Espelhos FGV", url: "/buscador-espelhos", icon: Search },
  { title: "Construtor de Esqueletos", url: "/construtor-esqueletos", icon: Bone },
  { title: "Calculadora de Prazos", url: "/calculadora-prazos", icon: Clock },
  { title: "Dicionário de Teses", url: "/teses", icon: BookMarked },
  { title: "Vade Mecum Online", url: "https://www4.planalto.gov.br/legislacao/", icon: BookOpen, external: true },
  { title: "Radar de Recorrência", url: "/radar", icon: BarChart3, exclusive1aFase: true },
  { title: "Simulado Real", url: "/simulado", icon: Crosshair, exclusive1aFase: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile } = useProfile();
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
                  Portal JurisVision
                </h2>
                <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-medium">
                  Themis M.A. Consultoria Forense
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
                          ${location.pathname === item.url ? "text-primary" : "text-muted-foreground/70"}
                        `} />
                        {!collapsed && (
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-sm truncate">{item.title}</span>
                            {item.exclusive1aFase && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-none whitespace-nowrap">
                                🔒 Exclusivo 1ª Fase
                              </Badge>
                            )}
                          </div>
                        )}
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