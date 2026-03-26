import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, AlertCircle, Calendar } from "lucide-react";

export default function ContagemRegressiva() {
  const [tempo1, setTempo1] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });
  const [tempo2, setTempo2] = useState({ dias: 0, horas: 0, min: 0, seg: 0 });

  // Datas Oficiais (2026)
  const data1aFase = useMemo(() => new Date(2026, 4, 17, 13, 0).getTime(), []); 
  const data2aFase = useMemo(() => new Date(2026, 6, 5, 13, 0).getTime(), []); 

  const calculateTimeLeft = (targetDate: number) => {
    const agora = new Date().getTime();
    const diff = targetDate - agora;

    if (diff > 0) {
      return {
        dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        min: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seg: Math.floor((diff % (1000 * 60)) / 1000),
      };
    }
    return { dias: 0, horas: 0, min: 0, seg: 0 };
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo1(calculateTimeLeft(data1aFase));
      setTempo2(calculateTimeLeft(data2aFase));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [data1aFase, data2aFase]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* CARD 1ª FASE */}
      <Card className="bg-gradient-to-r from-destructive/20 to-transparent border-destructive/30 overflow-hidden shadow-lg border-l-4 border-l-destructive">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/20 p-2 rounded-xl">
                <Timer className="h-5 w-5 text-destructive animate-pulse" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-destructive/80 leading-none mb-1">
                  Contagem 1ª Fase OAB
                </p>
                <p className="text-sm font-bold text-foreground">
                  46º Exame (17/05/2026)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-destructive/10 px-2 py-1 rounded text-[9px] font-bold text-destructive border border-destructive/20">
              <AlertCircle className="h-3 w-3" /> CRÍTICO
            </div>
          </div>

          <div className="flex justify-around items-center">
            {[
              { label: "Dias", val: tempo1.dias },
              { label: "Hrs", val: tempo1.horas },
              { label: "Min", val: tempo1.min },
              { label: "Seg", val: tempo1.seg },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-secondary/30 rounded-lg px-2.5 py-1.5 min-w-[50px] border border-white/5 text-center">
                  <p className="text-xl font-black text-foreground tabular-nums leading-none">
                    {String(item.val).padStart(2, '0')}
                  </p>
                </div>
                <p className="text-[8px] uppercase font-bold text-muted-foreground mt-1.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CARD 2ª FASE */}
      <Card className="bg-gradient-to-r from-primary/20 to-transparent border-primary/30 overflow-hidden shadow-lg border-l-4 border-l-primary">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-primary/80 leading-none mb-1">
                  Contagem 2ª Fase OAB
                </p>
                <p className="text-sm font-bold text-foreground">
                  46º Exame (05/07/2026)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-around items-center">
            {[
              { label: "Dias", val: tempo2.dias },
              { label: "Hrs", val: tempo2.horas },
              { label: "Min", val: tempo2.min },
              { label: "Seg", val: tempo2.seg },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-secondary/30 rounded-lg px-2.5 py-1.5 min-w-[50px] border border-white/5 text-center">
                  <p className="text-xl font-black text-foreground tabular-nums leading-none">
                    {String(item.val).padStart(2, '0')}
                  </p>
                </div>
                <p className="text-[8px] uppercase font-bold text-muted-foreground mt-1.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}