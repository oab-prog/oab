export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">Política de Privacidade</h1>
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary">1. Proteção de Dados (LGPD)</h2>
          <p className="text-muted-foreground leading-relaxed">
            O JurisVision está em total conformidade com a Lei Geral de Proteção de Dados (LGPD). Seus dados pessoais são coletados e processados exclusivamente para a finalidade de gestão de estudos e autenticação no sistema.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary">2. Coleta de Informações</h2>
          <p className="text-muted-foreground leading-relaxed">
            Coletamos apenas as informações essenciais para o seu progresso acadêmico: e-mail de acesso e histórico de questões resolvidas (progresso do aluno). Não coletamos dados sensíveis ou informações desnecessárias ao propósito educacional da ferramenta.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary">3. Segurança e Criptografia</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todas as informações são armazenadas de forma segura através da infraestrutura do Supabase, utilizando tecnologia de criptografia de ponta para garantir que seu progresso e credenciais estejam protegidos contra acessos não autorizados.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary">4. Não Compartilhamento</h2>
          <p className="text-muted-foreground leading-relaxed">
            O JurisVision não comercializa nem compartilha seus dados pessoais ou de desempenho com terceiros. Seus dados pertencem a você e são utilizados apenas para aprimorar sua experiência de estudo.
          </p>
        </section>

        <div className="pt-8 border-t border-border/50 text-sm text-muted-foreground">
          Última atualização: Março de 2026
        </div>
      </div>
    </div>
  );
}
