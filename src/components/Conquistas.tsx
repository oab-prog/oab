import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Scale, BookOpen, Sun, Trophy, Lock } from "lucide-react";

interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icon: any;
  cor: string;
  desbloqueada: boolean;
}

export default function Conquistas() {
  const [conquistas, setConquistas] = useState<Conquista[]>([]);

  useEffect(() => {
    const historico = JSON.parse(localStorage.getItem("jurisvision_historico") || "[]");
    
    // Regras de Negócio para as Medalhas
    const regras: Conquista[] = [
      {
        id: "consistencia",
        titulo: "Fogo no Código",
        descricao: "Realizou pelo menos 3 simulados.",
        icon: Flame,
        cor: "text-orange-500",
        desbloqueada: historico.length >= 3
      },
      {
        id: "etica",
        titulo: "Mestre da Ética",
        descricao: "80% de acerto em Ética.",
        icon: Scale,
        cor: "text-gold",
        desbloqueada: historico.some((h: any) => h.disciplina === "Ética" && h.percentual >= 80)
      },
      {
        id: "doutrinador",
        titulo: "Doutrinador",
        descricao: "Completou um Simulado Oficial (80 qst).",
        icon: BookOpen,
        cor: "text-primary",
        desbloqueada: historico.some((h: any) => h.total === 80)
      },
      {
        id: "perfeito",
        titulo: "Precisão Cirúrgica",
        descricao: "Acertou todas as questões de um teste.",
        icon: Trophy,
        cor: "text-yellow-400",
        desbloqueada: historico.some((h: any) => h.percentual === 100)
      }
    ];

    setConquistas(regras);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Trophy className="h-4 w-4" /> Suas Conquistas
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {conquistas.map((c) => (
          <Card key={c.id} className={`relative overflow-hidden transition-all duration-500 ${c.desbloqueada ? 'bg-secondary/20 border-primary/20' : 'bg-secondary/5 border-white/5 opacity-50'}`}>
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <div className={`p-3 rounded-full ${c.desbloqueada ? 'bg-background shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'bg-muted'}`}>
                {c.desbloqueada ? (
                  <c.icon className={`h-6 w-6 ${c.cor} animate-pulse`} />
                ) : (
                  <Lock className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className={`text-[11px] font-bold uppercase ${c.desbloqueada ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {c.titulo}
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight mt-1">
                  {c.descricao}
                </p>
              </div>
              
              {c.desbloqueada && (
                <div className="absolute -top-1 -right-1">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}