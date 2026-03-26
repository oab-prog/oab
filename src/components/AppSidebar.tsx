import { Home, Crosshair, Search, BarChart3, Scale, BookOpen, Sparkles, BookMarked, PenTool, Lock, Clock, Bone, Edit3, Layers } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/use-profile";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items1aFase = [
  { title: "Radar de Recorrência", url: "/radar", icon: BarChart3 },
  { title: "Simulado Real", url: "/simulado", icon: Crosshair },
  { title: "Flashcards", url: "/etica", icon: Layers },
  { title: "Buscador de Questões", url: "/buscador", icon: Search },
  { title: "Dominando Ética", url: "/etica", icon: Scale },
];

const items2aFase = [
  { title: "Treino de Peças", url: "/treino-peca", icon: PenTool },
  { title: "Treino de Discursivas", url: "/treino-discursivas", icon: Edit3 },
  { title: "Buscador de Espelhos FGV", url: "/buscador-espelhos", icon: Search },
  { title: "Construtor de Esqueletos", url: "/construtor-esqueletos", icon: Bone },
  { title: "Calculadora de Prazos", url: "/calculadora-prazos", icon: Clock },
  { title: "Dicionário de Teses", url: "/teses", icon: BookMarked },
  { title: "Vade Mecum Online", url: "https://www4.planalto.gov.br/legislacao/", icon: BookOpen, external: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile, loading } = useProfile();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isAssinante2aFase = profile?.assinante_2_fase === true;
  const canAccess2aFase = loading || isAssinante2aFase;

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
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/"
                  end
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                  activeClassName="bg-primary/10 text-primary font-bold border-l-2 border-primary rounded-l-none"
                >
                  <Home className={`h-4 w-4 shrink-0 ${location.pathname === "/" ? "text-primary" : "text-muted-foreground/70"}`} />
                  {!collapsed && <span className="text-sm">Início</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground mb-2">JURISVISION 1ª FASE</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items1aFase.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                      activeClassName="bg-primary/10 text-primary font-bold border-l-2 border-primary rounded-l-none"
                    >
                      <item.icon className={`h-4 w-4 shrink-0 
                        ${location.pathname === item.url ? "text-primary" : "text-muted-foreground/70"}
                        ${item.title === "Dominando Ética" ? "text-gold" : ""}
                      `} />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground mb-2">JURISVISION 2ª FASE</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items2aFase.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        {!collapsed && (
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-sm">{item.title}</span>
                            {!isAssinante2aFase && !loading && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-none whitespace-nowrap">
                                🔒 Exclusivo
                              </Badge>
                            )}
                          </div>
                        )}
                      </a>
                    ) : (
                      <NavLink
                        to={canAccess2aFase ? item.url : "#"}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 ${!canAccess2aFase ? "opacity-70 cursor-not-allowed" : ""}`}
                        activeClassName="bg-primary/10 text-primary font-bold border-l-2 border-primary rounded-l-none"
                        onClick={(e) => {
                          if (!canAccess2aFase) {
                            e.preventDefault();
                            // Optional: show toast or redirect
                          }
                        }}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 
                          ${location.pathname === item.url ? "text-primary" : "text-muted-foreground/70"}
                        `} />
                        {!collapsed && (
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-sm truncate">{item.title}</span>
                            {!isAssinante2aFase && !loading && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-none whitespace-nowrap">
                                🔒 Exclusivo
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