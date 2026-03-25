import { useState } from "react";
import { bancoCompleto } from "@/data/questoes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Search, FileText, Download } from "lucide-react";
import { exportarQuestoesPDF } from "@/lib/pdf-export";

export default function BuscadorPage() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<typeof bancoCompleto>([]);
  const [searched, setSearched] = useState(false);
  const hero = useScrollReveal();

  const buscar = () => {
    if (!termo.trim()) return;
    const t = termo.toLowerCase();
    const found = bancoCompleto.filter(
      q => q.pergunta.toLowerCase().includes(t) || q.tema.toLowerCase().includes(t)
    );
    setResultados(found);
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") buscar();
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div ref={hero.ref} style={hero.style}>
        <h1 className="text-3xl font-bold mb-1">
          Buscador <span className="text-gradient-gold">Estratégico</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-6">Pesquise em todo o banco de dados por tema, palavra-chave ou assunto.</p>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Ex: Ética, Habeas Corpus, Constitucional..."
            value={termo}
            onChange={e => setTermo(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11"
          />
          <Button onClick={buscar} className="h-11 px-6 active:scale-[0.97]">
            <Search className="h-4 w-4 mr-2" /> Buscar
          </Button>
        </div>
      </div>

      {searched && (
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-medium ${resultados.length > 0 ? "text-success" : "text-destructive"}`}>
            {resultados.length > 0
              ? `${resultados.length} questão(ões) encontrada(s) sobre "${termo}"`
              : `Nenhum resultado para "${termo}"`}
          </p>
          {resultados.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="active:scale-[0.97]"
              onClick={() => exportarQuestoesPDF(resultados, `Busca: "${termo}" - JurisVision`, `busca-${termo}.pdf`)}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Exportar PDF
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {resultados.map((q, i) => (
          <Card
            key={q.id + "-" + i}
            className="animate-reveal-up"
            style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {q.tema}
                </span>
                {q.estrategica && (
                  <span className="text-[10px] text-warning bg-warning/10 px-2 py-0.5 rounded font-medium">
                    Estratégica
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-3">{q.pergunta}</p>
              <div className="space-y-1 mb-3">
                {q.opcoes.map((op, j) => (
                  <p
                    key={j}
                    className={`text-xs py-1 px-2 rounded ${
                      op.slice(0, 2) === q.correta.slice(0, 2)
                        ? "text-success bg-success/10 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {op}
                  </p>
                ))}
              </div>
              <details className="group">
                <summary className="text-xs text-primary cursor-pointer hover:underline">Ver comentário</summary>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{q.comentario}</p>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>

      {resultados.length === 0 && !searched && (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Digite um termo para pesquisar no banco de questões.</p>
        </div>
      )}
    </div>
  );
}
