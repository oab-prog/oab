import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, History } from "lucide-react";

const BuscadorEspelhosPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">🔎 Buscador de Espelhos FGV</h1>
        <p className="text-muted-foreground">
          Pesquise por temas e encontre palavras-chave fundamentais exigidas em provas anteriores.
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            placeholder="Pesquise por tema (ex: Reclamação Trabalhista, Habeas Corpus...)" 
            className="pl-10 py-6 text-lg"
          />
        </div>
        <Card className="flex items-center gap-2 px-4 h-[52px] cursor-pointer hover:bg-muted transition-colors">
          <Filter className="h-5 w-5" />
          <span className="font-semibold text-sm">Filtros</span>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="group hover:border-primary transition-all">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-bold">Tema Sugerido {item}</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Baseado em exames recentes. Descubra o que a FGV costuma pontuar para este tema.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BuscadorEspelhosPage;
