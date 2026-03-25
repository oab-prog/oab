import { useState, useMemo } from "react";
import { bancoCompleto } from "@/data/questoes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Rotate3d, ChevronRight, ChevronLeft, Sparkles, Scale } from "lucide-react";

export default function EticaFlashcards() {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const reveal = useScrollReveal();

  // Filtra apenas questões de Ética do banco de 1055 questões
  const cardsEtica = useMemo(() => {
    return bancoCompleto.filter(q => 
      q.tema.toLowerCase().includes("ética") || 
      q.tema.toLowerCase().includes("advogado") ||
      q.tema.toLowerCase().includes("oab")
    );
  }, []);

  const cardAtual = cardsEtica[index];

  const proximo = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % cardsEtica.length);
    }, 150);
  };

  const anterior = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + cardsEtica.length) % cardsEtica.length);
    }, 150);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 min-h-[80vh] flex flex-col items-center justify-center">
      <div ref={reveal.ref} style={reveal.style} className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
          <Scale className="text-gold h-8 w-8" /> 
          GABARITANDO <span className="text-gradient-gold">ÉTICA</span>
        </h1>
        <p className="text-muted-foreground text-sm">Toque no cartão para ver a fundamentação legal.</p>
      </div>

      {/* Container do Card com Efeito 3D */}
      <div 
        className="relative w-full max-w-md h-[450px] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* FRENTE DO CARTÃO (O Problema/Caso) */}
          <Card className="absolute inset-0 w-full h-full backface-hidden border-2 border-primary/20 bg-secondary/10 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
            <span className="absolute top-4 left-4 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">
              Caso Prático
            </span>
            <p className="text-lg font-medium leading-relaxed">
              {cardAtual.pergunta.split('.')[0]}.? {/* Pega a primeira parte para ser direto */}
            </p>
            <div className="mt-8 flex items-center gap-2 text-primary animate-pulse">
              <Rotate3d className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase">Clique para virar</span>
            </div>
          </Card>

          {/* VERSO DO CARTÃO (A Resposta e Comentário) */}
          <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-2 border-gold/30 bg-black flex flex-col p-8 shadow-2xl overflow-y-auto">
             <div className="flex items-center gap-2 mb-4">
               <Sparkles className="h-4 w-4 text-gold" />
               <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Resposta & Base Legal</span>
             </div>
             <p className="text-sm font-bold text-success mb-4">
               Resposta Correta: Letra {cardAtual.correta}
             </p>
             <div className="text-xs leading-relaxed text-muted-foreground space-y-3">
                {cardAtual.comentario.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
             </div>
          </Card>

        </div>
      </div>

      {/* Navegação */}
      <div className="flex items-center gap-6">
        <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); anterior(); }} className="rounded-full h-12 w-12 border-white/10">
          <ChevronLeft />
        </Button>
        <span className="text-xs font-mono text-muted-foreground">
          Card {index + 1} de {cardsEtica.length}
        </span>
        <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); proximo(); }} className="rounded-full h-12 w-12 border-white/10">
          <ChevronRight />
        </Button>
      </div>

      {/* Estilos para a animação 3D (Tailwind Customizado) */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}