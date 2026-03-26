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
  { title: "📝 Simulado Real", url: "/simulado", icon: Crosshair },
  { title: "🗂️ Flashcards", url: "/etica", icon: Layers },
  { title: "🔎 Buscador de Questões", url: "/buscador", icon: Search },
  { title: "⚖️ Dominando Ética", url: "/etica", icon: Scale },
];

const items2aFase = [
  { title: "✒️ Treino de Peças", url: "/treino-peca", icon: PenTool },
  { title: "✍️ Treino de Discursivas", url: "/treino-discursivas", icon: Edit3 },
  { title: "🔎 Buscador de Espelhos FGV", url: "/buscador-espelhos", icon: Search },
  { title: "🦴 Construtor de Esqueletos", url: "/bone", icon: Bone },
  { title: "📚 Dicionário de Teses", url: "/teses", icon: BookMarked },
];

const itemsRecursosGerais = [
  { title: "📊 Radar de Recorrência", url: "/radar-recorrencia", icon: BarChart3 },
  { title: "⏱️ Calculadora de Prazos", url: "/calculadora-prazos", icon: Clock },
  { title: "📖 Vade Mecum Online", url: "https://www4.planalto.gov.br/legislacao/", icon: BookOpen, external: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile, loading } = useProfile();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isAssinante2aFase = !!profile?.assinante_2_fase;
  const canAccess2aFase = isAssinante2aFase;

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-[#020617]">
      <SidebarContent className="pt-2 overflow-y-auto">
        <div className="px-4 mb-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <img 
                src="https://raw.githubusercontent.com/oab-prog/oab/main/logo.png" 
                alt="Logo JurisVision" 
                className="h-10 w-10 object-contain brightness-125"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight leading-none mb-1">
                  Themis M.A.
                </h2>
                <p className="text-[10px] text-zinc-400 tracking-widest uppercase font-semibold">
                  Consultoria Forense
                </p>
              </div>
            </div>
          ) : (
            <img 
              src="https://raw.githubusercontent.com/oab-prog/oab/main/logo.png" 
              alt="Logo" 
              className="h-8 w-8 mx-auto object-contain brightness-125"
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-200"
                  activeClassName="bg-white/10 text-white font-bold border-l-4 border-yellow-400 rounded-l-none"
                >
                  <Home className={`h-4 w-4 shrink-0 ${location.pathname === "/" ? "text-yellow-400" : "text-white"}`} />
                  {!collapsed && <span className="text-sm">🏠 Início</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-wider text-zinc-500 mb-2">JURISVISION 1ª FASE</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items1aFase.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-200"
                      activeClassName="bg-white/10 text-white font-bold border-l-4 border-yellow-400 rounded-l-none"
                    >
                      <item.icon className={`h-4 w-4 shrink-0 
                        ${location.pathname === item.url ? "text-yellow-400" : "text-white"}
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
          {!collapsed && <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-wider text-zinc-500 mb-2">JURISVISION 2ª FASE</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items2aFase.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={canAccess2aFase ? item.url : "#"}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-200 ${!canAccess2aFase ? "cursor-not-allowed" : ""}`}
                      activeClassName="bg-white/10 text-white font-bold border-l-4 border-yellow-400 rounded-l-none"
                      onClick={(e) => {
                        if (!canAccess2aFase) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 transition-colors
                        ${location.pathname === item.url ? "text-yellow-400" : (canAccess2aFase ? "text-white" : "text-zinc-600")}
                      `} />
                      {!collapsed && (
                        <div className="flex items-center w-full">
                          <span className={`text-sm truncate ${!canAccess2aFase ? "text-zinc-600" : ""}`}>{item.title}</span>
                          {!isAssinante2aFase && !loading && (
                            <Badge variant="secondary" className="ml-2 text-[9px] px-1.5 py-0 bg-zinc-800 text-zinc-400 hover:bg-zinc-800 border-none rounded-full whitespace-nowrap">
                              🔒 Exclusivo
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-wider text-zinc-500 mb-2">CENTRAL DE INTELIGÊNCIA</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsRecursosGerais.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-200"
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-white" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </a>
                    ) : (
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-200"
                        activeClassName="bg-white/10 text-white font-bold border-l-4 border-yellow-400 rounded-l-none"
                      >
                        <item.icon className={`h-4 w-4 shrink-0 
                          ${location.pathname === item.url ? "text-yellow-400" : "text-white"}
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