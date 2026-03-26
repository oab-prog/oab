import { AppLayout } from "@/components/AppLayout";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">Termos de Uso</h1>
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary">1. Licença de Uso</h2>
          <p className="text-muted-foreground leading-relaxed">
            O JurisVision concede ao usuário uma licença pessoal, intransferível e não exclusiva para utilizar a ferramenta como auxílio nos estudos para o Exame da Ordem. Esta licença é estritamente para uso individual.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary">2. Propriedade Intelectual</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todo o conteúdo, algoritmos e funcionalidades, incluindo o "Radar de Recorrência", são propriedade exclusiva da Themis / Adriana Mourão. É expressamente proibido o uso de scrapers, ferramentas de mineração de dados, engenharia reversa ou qualquer tentativa de copiar a lógica de funcionamento da plataforma.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary">3. Limitação de Responsabilidade</h2>
          <p className="text-muted-foreground leading-relaxed">
            A ferramenta JurisVision é um auxílio estatístico baseado em dados históricos de provas anteriores. Embora utilizemos tecnologia de ponta para análise forense de dados, o JurisVision não garante a aprovação no exame da Ordem, sendo o desempenho final de inteira responsabilidade do estudante.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary">4. JurisAuditor Pro</h2>
          <p className="text-muted-foreground leading-relaxed">
            O suporte oferecido pelo JurisAuditor Pro consiste em análise técnica e auxílio na elaboração de recursos administrativos, não configurando prestação de serviços advocatícios ou garantia de êxito em recursos.
          </p>
        </section>

        <div className="pt-8 border-t border-border/50 text-sm text-muted-foreground">
          Última atualização: Março de 2026
        </div>
      </div>
    </div>
  );
}
