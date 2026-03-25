import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Calendar, AlertCircle } from "lucide-react";

export default function ContagemRegressiva() {
  const [tempo, setTempo] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });

  // DATA DO PRÓXIMO EXAME (47º EXAME - PREVISÃO)
  const dataProva = new Date("2026-06-21T09:00:00").getTime();

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
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [dataProva]);

  return (
    <Card className="bg-gradient-to-r from-destructive/10 to-transparent border-destructive/20 overflow-hidden">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-destructive/20 p-2 rounded-lg">
            <Timer className="h-5 w-5 text-destructive animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Próximo Exame (47º)</p>
            <p className="text-xs font-semibold">Contagem Regressiva</p>
          </div>
        </div>

        <div className="flex gap-3 text-center">
          {[
            { label: "Dias", val: tempo.dias },
            { label: "Horas", val: tempo.horas },
            { label: "Min", val: tempo.min },
            { label: "Seg", val: tempo.seg },
          ].map((item, i) => (
            <div key={i} className="min-w-[40px]">
              <p className="text-xl font-black text-foreground tabular-nums leading-none">{item.val}</p>
              <p className="text-[8px] uppercase text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-[9px] font-bold text-destructive uppercase">Hora de acelerar</span>
        </div>
      </CardContent>
    </Card>
  );
}