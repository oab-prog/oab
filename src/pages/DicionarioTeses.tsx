import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookMarked, Gavel, Scale, Copy, CheckCircle2, ShieldAlert } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { toast } from "sonner";

interface Tese {
  materia: string;
  tema: string;
  fundamentacao: string;
  artigo: string;
  sumula?: string;
}

const TESES_DATABASE: Tese[] = [
  // TRIBUTÁRIO
  { materia: "Tributário", tema: "ICMS sobre TUST/TUSD", fundamentacao: "Não incidência de ICMS sobre as tarifas de uso do sistema de transmissão e distribuição de energia elétrica.", artigo: "Art. 155, §2º, IX, 'a' da CF", sumula: "Súmula 166 STJ" },
  { materia: "Tributário", tema: "Imunidade ITBI", fundamentacao: "Imunidade de ITBI na integralização de capital com imóveis, exceto se a atividade preponderante for imobiliária.", artigo: "Art. 156, §2º, I da CF", sumula: "Tema 796 STF" },
  { materia: "Tributário", tema: "Princípio da Anterioridade", fundamentacao: "Vedação de cobrança de tributos no mesmo exercício financeiro e antes de 90 dias da publicação da lei.", artigo: "Art. 150, III, 'b' e 'c' da CF" },
  { materia: "Tributário", tema: "Taxa de Lixo", fundamentacao: "Constitucionalidade da taxa cobrada exclusivamente em razão do serviço público de coleta de lixo.", artigo: "Art. 145, II da CF", sumula: "Súmula Vinculante 19" },
  { materia: "Tributário", tema: "PIS/COFINS na Base do ICMS", fundamentacao: "O ICMS não compõe a base de cálculo para a incidência do PIS e da COFINS (Tese do Século).", artigo: "Art. 195, I, 'b' da CF", sumula: "Tema 69 STF" },
  
  // PENAL
  { materia: "Penal", tema: "Insignificância", fundamentacao: "Aplicação do princípio da insignificância para excluir a tipicidade material em crimes sem violência ou grave ameaça.", artigo: "Art. 1º do CP", sumula: "Jurisprudência Consolidada STF/STJ" },
  { materia: "Penal", tema: "Habeas Corpus Substitutivo", fundamentacao: "Inadequação da via do HC para substituir recurso próprio (Apelação/RESE), salvo flagrante ilegalidade.", artigo: "Art. 5º, LXVIII da CF", sumula: "Súmula 691 STF" },
  { materia: "Penal", tema: "Reincidência e Maus Antecedentes", fundamentacao: "Distinção entre reincidência (período depurador de 5 anos) e maus antecedentes para fixação da pena-base.", artigo: "Art. 64, I do CP", sumula: "Súmula 444 STJ" },
  { materia: "Penal", tema: "Crime Impossível", fundamentacao: "Inexistência de crime quando, por ineficácia absoluta do meio ou absoluta impropriedade do objeto, é impossível consumar-se.", artigo: "Art. 17 do CP" },
  { materia: "Penal", tema: "Continuidade Delitiva", fundamentacao: "Aplicação da pena de um só dos crimes, se idênticas, ou da mais grave, aumentada de 1/6 a 2/3.", artigo: "Art. 71 do CP" },

  // CIVIL
  { materia: "Civil", tema: "Dano Moral In Re Ipsa", fundamentacao: "Dano moral presumido em casos de inscrição indevida em cadastros de inadimplentes.", artigo: "Art. 186 e 927 do CC", sumula: "Súmula 385 STJ" },
  { materia: "Civil", tema: "Bem de Família", fundamentacao: "Impenhorabilidade do imóvel residencial da entidade familiar, com as exceções legais.", artigo: "Lei 8.009/90", sumula: "Súmula 364 STJ" },
  { materia: "Civil", tema: "Teoria do Desvio Produtivo", fundamentacao: "Responsabilidade civil do fornecedor pelo tempo desperdiçado pelo consumidor para resolver problemas causados pelo produto/serviço.", artigo: "Art. 6º, VI do CDC" },
  { materia: "Civil", tema: "Usucapião Extraordinária", fundamentacao: "Aquisição da propriedade imóvel por posse ininterrupta de 15 anos, independentemente de título e boa-fé.", artigo: "Art. 1.238 do CC" },
  { materia: "Civil", tema: "Guarda Compartilhada", fundamentacao: "Regra geral na fixação da guarda, visando o melhor interesse da criança e a divisão de responsabilidades.", artigo: "Art. 1.583 do CC" },

  // TRABALHO
  { materia: "Trabalho", tema: "Vínculo Empregatício", fundamentacao: "Configuração do vínculo mediante subordinação, habitualidade, onerosidade e pessoalidade.", artigo: "Art. 3º da CLT" },
  { materia: "Trabalho", tema: "Horas Extras (Ônus)", fundamentacao: "Ônus da prova do empregador que possui mais de 20 empregados quanto ao registro de jornada.", artigo: "Art. 74, §2º da CLT", sumula: "Súmula 338 TST" },
  { materia: "Trabalho", tema: "Equiparação Salarial", fundamentacao: "Mesma função, trabalho de igual valor, prestado ao mesmo empregador, no mesmo estabelecimento empresarial.", artigo: "Art. 461 da CLT", sumula: "Súmula 6 TST" },
  { materia: "Trabalho", tema: "Rescisão Indireta", fundamentacao: "Falta grave cometida pelo empregador que autoriza o empregado a considerar rescindido o contrato.", artigo: "Art. 483 da CLT" },
  { materia: "Trabalho", tema: "Intervalo Intrajornada", fundamentacao: "Pagamento apenas do período suprimido, com acréscimo de 50%, de natureza indenizatória.", artigo: "Art. 71, §4º da CLT" },

  // CONSTITUCIONAL
  { materia: "Constitucional", tema: "Controle de Constitucionalidade", fundamentacao: "Legitimidade ativa especial (Confederação Sindical ou Entidade de Classe de âmbito nacional) para ADI.", artigo: "Art. 103, IX da CF" },
  { materia: "Constitucional", tema: "Remédios Constitucionais", fundamentacao: "Cabimento de Mandado de Segurança para proteger direito líquido e certo, não amparado por HC ou HD.", artigo: "Art. 5º, LXIX da CF", sumula: "Súmula 630 STF" },
  { materia: "Constitucional", tema: "Competência Legislativa", fundamentacao: "Competência privativa da União para legislar sobre Direito Civil, Penal, Processual e Trabalho.", artigo: "Art. 22, I da CF" },
  { materia: "Constitucional", tema: "Súmula Vinculante", fundamentacao: "Efeito vinculante em relação aos demais órgãos do Poder Judiciário e à administração pública direta e indireta.", artigo: "Art. 103-A da CF" },
  { materia: "Constitucional", tema: "Reserva de Plenário", fundamentacao: "Necessidade de maioria absoluta para declarar inconstitucionalidade de lei ou ato normativo pelo tribunal.", artigo: "Art. 97 da CF", sumula: "Súmula Vinculante 10" },

  // ADMINISTRATIVO
  { materia: "Administrativo", tema: "Responsabilidade Objetiva", fundamentacao: "Responsabilidade do Estado por danos que seus agentes causarem a terceiros, assegurado o direito de regresso.", artigo: "Art. 37, §6º da CF" },
  { materia: "Administrativo", tema: "Improbidade Administrativa", fundamentacao: "Necessidade de dolo para a configuração de atos de improbidade administrativa em todas as modalidades.", artigo: "Lei 8.429/92 (Nova LIA)" },
  { materia: "Administrativo", tema: "Poder de Polícia", fundamentacao: "Atributos: discricionariedade, autoexecutoriedade e coercitividade.", artigo: "Art. 78 do CTN" },
  { materia: "Administrativo", tema: "Contratos Administrativos", fundamentacao: "Possibilidade de alteração unilateral pela Administração Pública (Cláusulas Exorbitantes).", artigo: "Art. 124 da Lei 14.133/21" },
  { materia: "Administrativo", tema: "Serviço Público", fundamentacao: "Continuidade do serviço público e impossibilidade de interrupção em serviços essenciais, salvo aviso prévio.", artigo: "Lei 8.987/95" },
];

export default function DicionarioTeses() {
  const [busca, setBusca] = useState("");
  const reveal = useScrollReveal();

  const handleCopy = (tese: Tese) => {
    const texto = `${tese.tema}\nFundamentação: ${tese.fundamentacao}\nBase Legal: ${tese.artigo}${tese.sumula ? ` | ${tese.sumula}` : ""}`;
    navigator.clipboard.writeText(texto);
    toast.success("Fundamentação copiada com sucesso!");
  };

  const resultados = useMemo(() => {
    const termo = busca.toLowerCase();
    if (!termo) return TESES_DATABASE;
    
    return TESES_DATABASE.filter(t => 
      t.tema.toLowerCase().includes(termo) || 
      t.materia.toLowerCase().includes(termo) ||
      t.fundamentacao.toLowerCase().includes(termo) ||
      t.artigo.toLowerCase().includes(termo) ||
      (t.sumula && t.sumula.toLowerCase().includes(termo))
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
          Acesso ultrarrápido às 10 teses mais recorrentes de cada matéria. Use para fundamentar peças e questões em segundos.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <Input 
          placeholder="Busque por tema, matéria ou artigo... (Ex: ICMS, Penal, Art. 5)" 
          className="pl-12 h-14 bg-zinc-900/50 border-zinc-800 rounded-2xl text-lg focus:ring-red-500 text-white placeholder:text-zinc-600"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resultados.map((res, i) => (
          <Card key={i} className="bg-zinc-900/40 border-zinc-800 hover:border-red-500/50 transition-all group relative overflow-hidden flex flex-col">
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
                   "{res.fundamentacao}"
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded text-[10px] font-bold text-zinc-300 border border-zinc-700">
                  <Scale className="h-3 w-3 text-blue-400" />
                  {res.artigo}
                </div>
                {res.sumula && (
                  <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded text-[10px] font-bold text-zinc-300 border border-zinc-700">
                    <BookMarked className="h-3 w-3 text-amber-400" />
                    {res.sumula}
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
           <CheckCircle2 className="h-4 w-4 text-green-500" /> JurisVision v1.8.0 • Engine de Teses Estratégicas
         </p>
      </div>
    </div>
  );
}