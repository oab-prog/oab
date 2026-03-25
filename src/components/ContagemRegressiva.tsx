import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, AlertCircle } from "lucide-react";

export default function ContagemRegressiva() {
  const [tempo, setTempo] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });

  // CORREÇÃO: DATA OFICIAL DO 46º EXAME DE ORDEM (1ª FASE)
  const dataProva = new Date("2026-05-03T09:00:00").getTime();

  useEffect(() => {
    const intervalo = setInterval(() => {
      const agora = new Date().getTime();
      const diff = dataProva - agora;

      if (diff > 0) {
        setTempo({
          dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
          horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          min: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seg: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTempo({ dias: 0, horas: 0, min: 0, seg: 0 });
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [dataProva]);

  return (
    <Card className="bg-gradient-to-r from-destructive/20 to-transparent border-destructive/30 overflow-hidden shadow-lg border-l-4">
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-destructive/20 p-2.5 rounded-xl">
            <Timer className="h-6 w-6 text-destructive animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive/80">
              Contagem Regressiva Final
            </p>
            <p className="text-sm font-bold text-foreground">
              46º Exame de Ordem Unificado
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-center">
          {[
            { label: "Dias", val: tempo.dias },
            { label: "Hrs", val: tempo.horas },
            { label: "Min", val: tempo.min },
            { label: "Seg", val: tempo.seg },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-secondary/30 rounded-lg px-3 py-2 min-w-[55px] border border-white/5">
                <p className="text-2xl font-black text-foreground tabular-nums leading-none">
                  {String(item.val).padStart(2, '0')}
                </p>
              </div>
              <p className="text-[9px] uppercase font-bold text-muted-foreground mt-2 tracking-tighter">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <div className="text-left">
            <p className="text-[10px] font-black text-destructive uppercase leading-none">Status: Crítico</p>
            <p className="text-[9px] text-muted-foreground mt-1">Foco total em questões</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
