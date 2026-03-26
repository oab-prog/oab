import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookMarked, Gavel, Scale, Copy, CheckCircle2, ShieldAlert } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { toast } from "sonner";
import { TESES_DATABASE, type Tese } from "@/data/teses";

export default function DicionarioTeses() {
  const [busca, setBusca] = useState("");
  const reveal = useScrollReveal();

  const handleCopy = (tese: Tese) => {
    const texto = `Fundamentação Jurídica: ${tese.artigo} c/c ${tese.sumula_tese}. ${tese.descricao}`;
    navigator.clipboard.writeText(texto);
    toast.success("Fundamentação copiada com sucesso!");
  };

  const resultados = useMemo(() => {
    const termo = busca.toLowerCase();
    if (!termo) return TESES_DATABASE;
    
    return TESES_DATABASE.filter(t => 
      t.tema.toLowerCase().includes(termo) || 
      t.artigo.toLowerCase().includes(termo) ||
      t.materia.toLowerCase().includes(termo) ||
      t.descricao.toLowerCase().includes(termo) ||
      t.sumula_tese.toLowerCase().includes(termo)
    );
  }, [busca]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 py-12 bg-[#020617] min-h-screen text-white">
      <div ref={reveal.ref} style={reveal.style} className="text-center space-y-4">
        <div className="inline-flex p-3 bg-red-500/10 rounded-2xl mb-2 border border-red-500/20">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          BOTÃO DE <span className="text-red-500">PÂNICO</span>: DICIONÁRIO DE TESES
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto font-medium">
          Acesso ultrarrápido às 100 teses mais recorrentes de cada matéria. Use para fundamentar peças e questões em segundos.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <Input 
          placeholder="Busque por tema, artigo ou súmula... (Ex: ICMS, Art. 5, Súmula 52)" 
          className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl text-lg focus:ring-red-500 text-white placeholder:text-zinc-600"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resultados.map((res, i) => (
          <Card key={res.id} className="bg-zinc-900/40 border-zinc-800 hover:border-red-500/50 transition-all group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <CardContent className="p-6 space-y-4 flex-grow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded">
                  {res.materia}
                </span>
                <Gavel className="h-4 w-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
              </div>
              
              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors leading-tight">
                {res.tema}
              </h3>

              <div className="p-4 bg-black/40 rounded-xl border border-zinc-800/50">
                <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">
                   "{res.descricao}"
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded text-[10px] font-bold text-zinc-300 border border-zinc-700">
                  <Scale className="h-3 w-3 text-blue-400" />
                  {res.artigo}
                </div>
                {res.sumula_tese && (
                  <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded text-[10px] font-bold text-zinc-300 border border-zinc-700">
                    <BookMarked className="h-3 w-3 text-amber-400" />
                    {res.sumula_tese}
                  </div>
                )}
              </div>
            </CardContent>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <button 
                onClick={() => handleCopy(res)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-red-600 text-white rounded-lg transition-all text-xs font-black uppercase tracking-widest"
              >
                <Copy className="h-4 w-4" /> Copiar Fundamentação
              </button>
            </div>
          </Card>
        ))}
      </div>

      {resultados.length === 0 && (
        <div className="text-center py-20 space-y-4 opacity-40">
          <ShieldAlert className="h-12 w-12 mx-auto text-zinc-500" />
          <p className="text-zinc-400">Nenhuma tese estratégica encontrada para "{busca}".</p>
        </div>
      )}

      <div className="mt-12 p-6 border border-zinc-800 rounded-2xl bg-zinc-900/20 text-center">
         <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
           <CheckCircle2 className="h-4 w-4 text-green-500" /> JurisVision v1.9.1 • Engine de Teses Estratégicas
         </p>
      </div>
    </div>
  );
}