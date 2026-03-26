import tkinter as tk
from tkinter import scrolledtext, messagebox
import os

class CentralDiagnostico:
    def __init__(self, root):
        self.root = root
        self.root.title("M.A | Central de Diagnóstico e Segurança")
        self.root.geometry("850x650")
        self.root.configure(bg="#020617")

        # Cabeçalho
        tk.Label(root, text="🔧 M.A | CAIXA PRETA E DIAGNÓSTICO", font=("Inter", 18, "bold"), bg="#020617", fg="#ef4444").pack(pady=20)
        
        # Área de Texto (O Log)
        self.txt_log = scrolledtext.ScrolledText(root, height=22, bg="#0f172a", fg="#f8fafc", font=("Consolas", 10), padx=15, pady=15)
        self.txt_log.pack(fill="both", expand=True, padx=30, pady=10)

        # Botões de Ação
        btn_frame = tk.Frame(root, bg="#020617")
        btn_frame.pack(pady=15)

        tk.Button(btn_frame, text="📜 LER ERROS (CAIXA PRETA)", command=self.ler_log, bg="#1e293b", activebackground="#334155", fg="white", font=("Inter", 10, "bold"), pady=10, width=25, cursor="hand2").pack(side=tk.LEFT, padx=5)
        
        # O Novo Scanner de Saúde
        tk.Button(btn_frame, text="🔍 ESCANEAR SAÚDE DO SISTEMA", command=self.escanear_sistema, bg="#3b82f6", activebackground="#2563eb", fg="white", font=("Inter", 10, "bold"), pady=10, width=30, cursor="hand2").pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🗑️ LIMPAR CAIXA PRETA", command=self.limpar_log, bg="#7f1d1d", activebackground="#991b1b", fg="white", font=("Inter", 10, "bold"), pady=10, width=22, cursor="hand2").pack(side=tk.LEFT, padx=5)

        # Lê automaticamente ao abrir
        self.ler_log()

    def ler_log(self):
        self.txt_log.delete(1.0, tk.END)
        caminho_log = os.path.join(os.path.dirname(__file__), "caixa_preta_ma.txt")
        
        if os.path.exists(caminho_log):
            with open(caminho_log, "r", encoding="utf-8", errors="ignore") as f:
                conteudo = f.read()
                if conteudo.strip():
                    self.txt_log.insert(tk.END, "=== REGISTROS DE ERRO DO HUB CENTRAL ===\n\n")
                    self.txt_log.insert(tk.END, conteudo)
                else:
                    self.txt_log.insert(tk.END, "[ CAIXA PRETA VAZIA ]\nNenhum erro crítico registrado pelo painel central no momento.")
        else:
            self.txt_log.insert(tk.END, "[ ARQUIVO NÃO ENCONTRADO ]\nO arquivo caixa_preta_ma.txt ainda não foi gerado. Isso significa que o sistema rodou limpo até agora.")

    def limpar_log(self):
        caminho_log = os.path.join(os.path.dirname(__file__), "caixa_preta_ma.txt")
        if os.path.exists(caminho_log):
            open(caminho_log, "w", encoding="utf-8").close()
            self.ler_log()
            messagebox.showinfo("Sucesso", "Caixa Preta apagada. O sistema está limpo.")

    def escanear_sistema(self):
        self.txt_log.delete(1.0, tk.END)
        self.txt_log.insert(tk.END, "=== ESCANEAMENTO TÁTICO DA PASTA M.A ===\nVerificando a integridade da sua Suíte de Elite...\n\n")
        
        # A lista ATUALIZADA de 13 arquivos (sem o Gerador antigo)
        modulos_esperados = [
            "0_INICIAR_SISTEMA.py",
            "Processador Forense.py",
            "Diretor Estrategico.py",
            "2A_Auditor_Criminal.py",
            "2B_Auditor_Civel.py",
            "2C_Auditor_Trabalhista.py",
            "2D_Auditor_Familia.py",
            "2E_Auditor_Previdenciario.py",
            "Redator_Forense.py",
            "Inspetor_Geral_v2.py",
            "4_Revisor_de_Contratos.py",
            "5_Central_de_Diagnostico.py",
            "6_Perito_Audiovisual.py"
        ]

        pasta_atual = os.path.dirname(__file__)
        tudo_ok = True
        
        for modulo in modulos_esperados:
            caminho = os.path.join(pasta_atual, modulo)
            
            # Ajuste de segurança para variações de nome
            if not os.path.exists(caminho) and modulo == "0_INICIAR_SISTEMA.py":
                caminho_alt = os.path.join(pasta_atual, "O_INICIAR_SISTEMA.py")
                if os.path.exists(caminho_alt):
                    modulo = "O_INICIAR_SISTEMA.py"
                    caminho = caminho_alt
                    
            if not os.path.exists(caminho) and modulo == "Processador Forense.py":
                caminho_alt = os.path.join(pasta_atual, "Processador Forense.PY")
                if os.path.exists(caminho_alt):
                    modulo = "Processador Forense.PY"
                    caminho = caminho_alt

            if os.path.exists(caminho):
                status = "[ ONLINE ]"
                alerta = ""
                
                try:
                    with open(caminho, "r", encoding="utf-8", errors="ignore") as f:
                        conteudo = f.read()
                        if "COLE_SUA_CHAVE_AQUI" in conteudo:
                            status = "[ ALERTA ]"
                            alerta = " <-- ⚠️ CHAVE DO GOOGLE FALTANDO NESTE ARQUIVO!"
                            tudo_ok = False
                except:
                    pass
                
                self.txt_log.insert(tk.END, f"{status.ljust(12)} {modulo}{alerta}\n")
            else:
                self.txt_log.insert(tk.END, f"[ OFFLINE ]  {modulo} <-- ❌ ARQUIVO NÃO ENCONTRADO NA PASTA!\n")
                tudo_ok = False

        self.txt_log.insert(tk.END, "\n" + "="*50 + "\n")
        if tudo_ok:
            self.txt_log.insert(tk.END, "✅ SISTEMA 100% OPERACIONAL E MAPEADO.\nTodos os 13 módulos estão instalados.")
        else:
            self.txt_log.insert(tk.END, "⚠️ ATENÇÃO NECESSÁRIA.\nVerifique os arquivos offline ou os alertas acima.")

if __name__ == "__main__":
    root = tk.Tk()
    app = CentralDiagnostico(root)
    root.mainloop()