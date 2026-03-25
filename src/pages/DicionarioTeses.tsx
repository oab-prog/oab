import { useState, useMemo } from "react";
import { bancoCompleto } from "@/data/questoes";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookMarked, Gavel, Scale, ExternalLink } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function DicionarioTeses() {
  const [busca, setBusca] = useState("");
  const reveal = useScrollReveal();

  // Lógica de busca inteligente nas 1055 questões
  const resultados = useMemo(() => {
    if (busca.length < 3) return [];

    const termo = busca.toLowerCase();
    return bancoCompleto.filter(q => 
      q.pergunta.toLowerCase().includes(termo) || 
      q.comentario.toLowerCase().includes(termo) ||
      q.tema.toLowerCase().includes(termo)
    ).slice(0, 20); // Limita aos 20 melhores para performance
  }, [busca]);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 py-12">
      <div ref={reveal.ref} style={reveal.style} className="text-center space-y-4">
        <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
          <BookMarked className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          DICIONÁRIO DE <span className="text-gradient-gold">TESES</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Consulte como a FGV aplica conceitos jurídicos na prática. Digite um tema e veja a fundamentação aceita pela banca.
        </p>
      </div>

      {/* BARRA DE BUSCA ESTILO GOOGLE JURÍDICO */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Ex: Dano Moral, Prisão Preventiva, Honorários..." 
          className="pl-12 h-14 bg-secondary/20 border-white/10 rounded-2xl text-lg focus:ring-primary"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {busca.length > 0 && busca.length < 3 && (
          <p className="text-center text-xs text-muted-foreground animate-pulse">
            Digite pelo menos 3 letras para pesquisar...
          </p>
        )}

        {resultados.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {resultados.map((res, i) => (
              <Card key={i} className="bg-secondary/10 border-white/5 hover:border-primary/30 transition-all group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                      {res.tema.split(';')[0]}
                    </span>
                    <Gavel className="h-4 w-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-foreground/90 leading-relaxed mb-3">
                      "{res.pergunta.substring(0, 200)}..."
                    </p>
                    <div className="p-4 bg-background/50 rounded-xl border border-white/5 border-l-2 border-l-gold">
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        <span className="text-gold font-bold not-italic">Tese da Banca: </span>
                        {res.comentario}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : busca.length >= 3 ? (
          <div className="text-center py-20 space-y-4 opacity-40">
            <Scale className="h-12 w-12 mx-auto" />
            <p>Nenhuma tese encontrada para "{busca}".</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}