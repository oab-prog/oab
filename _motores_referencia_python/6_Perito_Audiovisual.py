import os
import time
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext, ttk
from google import genai
from google.genai import types

# ==========================================
# CONFIGURAÇÃO DA CHAVE
# ==========================================
API_KEY_LOCAL = os.getenv("GEMINI_API_KEY") 

class MAPeritoAudiovisual:
    def __init__(self, root):
        self.root = root
        self.root.title("M.A | Perito Audiovisual Forense (Degravação e Análise)")
        self.root.geometry("1100x750")
        self.root.configure(bg="#020617")
        
        self.caminho_arquivo = ""
        
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        self.construir_interface()

    def construir_interface(self):
        # Sidebar
        sidebar = tk.Frame(self.root, bg="#0f172a", width=300)
        sidebar.pack(side=tk.LEFT, fill=tk.Y)
        sidebar.pack_propagate(False)
        
        tk.Label(sidebar, text="M.A | PERITO AV", font=("Segoe UI", 18, "bold"), bg="#0f172a", fg="#D4AF37", pady=30).pack()
        tk.Label(sidebar, text="Degravação em texto,\nresumo de audiências e\nanálise de provas em vídeo.\n\n[ Sigilo: Mídia apagada da\nnuvem após análise ]", bg="#0f172a", fg="#cbd5e1", justify="center").pack(pady=10)
        
        # Área Principal
        main_area = tk.Frame(self.root, bg="#020617", padx=20, pady=20)
        main_area.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        # Top Frame (Seleção de Arquivo)
        frame_top = tk.Frame(main_area, bg="#020617")
        frame_top.pack(fill=tk.X, pady=(0, 15))
        
        self.btn_selecionar = tk.Button(frame_top, text="📁 SELECIONAR VÍDEO OU ÁUDIO (MP4, MP3, WAV)", command=self.selecionar_arquivo, bg="#0284c7", fg="white", font=("Segoe UI", 11, "bold"), pady=8, cursor="hand2")
        self.btn_selecionar.pack(side=tk.LEFT)
        
        self.lbl_arquivo = tk.Label(frame_top, text="Nenhum arquivo selecionado.", bg="#020617", fg="#64748b", font=("Segoe UI", 10, "italic"))
        self.lbl_arquivo.pack(side=tk.LEFT, padx=15)

        # Divisão em Abas/Painéis
        paned = ttk.PanedWindow(main_area, orient=tk.VERTICAL)
        paned.pack(side=tk.TOP, fill=tk.BOTH, expand=True, pady=(0, 15))
        
        # Painel de Instruções
        frame_instrucao = tk.Frame(paned, bg="#1e293b")
        tk.Label(frame_instrucao, text=" 🎯 Comando para o Perito (O que você quer que ele faça com a mídia?):", bg="#1e293b", fg="#94a3b8", font=("Segoe UI", 10, "bold"), anchor="w").pack(fill=tk.X, pady=5)
        self.txt_instrucao = scrolledtext.ScrolledText(frame_instrucao, bg="#0f172a", fg="#fbbf24", insertbackground="white", borderwidth=0, font=("Segoe UI", 11), padx=10, pady=10, height=4)
        self.txt_instrucao.pack(fill=tk.BOTH, expand=True)
        self.txt_instrucao.insert(tk.END, "Ex: Faça a degravação literal de todo o áudio. Destaque os trechos em que o réu João fala sobre valores em dinheiro.")
        paned.add(frame_instrucao, weight=1)

        # Painel de Resultado
        frame_resultado = tk.Frame(paned, bg="#1e293b")
        tk.Label(frame_resultado, text=" 📄 Laudo Pericial / Degravação Gerada:", bg="#1e293b", fg="#94a3b8", font=("Segoe UI", 10, "bold"), anchor="w").pack(fill=tk.X, pady=5)
        self.txt_resultado = scrolledtext.ScrolledText(frame_resultado, bg="#f8fafc", fg="#0f172a", borderwidth=0, font=("Segoe UI", 11), padx=15, pady=15)
        self.txt_resultado.pack(fill=tk.BOTH, expand=True)
        paned.add(frame_resultado, weight=4)

        # Botão de Execução
        action_frame = tk.Frame(main_area, bg="#020617")
        action_frame.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.btn_executar = tk.Button(action_frame, text="🎙️ INICIAR PERÍCIA AUDIOVISUAL", command=self.iniciar_analise, bg="#b45309", activebackground="#d97706", fg="white", font=("Segoe UI", 12, "bold"), pady=12, cursor="hand2", state=tk.DISABLED)
        self.btn_executar.pack(side=tk.LEFT, fill=tk.X, expand=True)

        self.lbl_status = tk.Label(action_frame, text="Status: Aguardando arquivo...", bg="#020617", fg="#64748b", font=("Segoe UI", 10))
        self.lbl_status.pack(side=tk.LEFT, padx=20)

    def selecionar_arquivo(self):
        caminho = filedialog.askopenfilename(filetypes=[("Arquivos de Áudio/Vídeo", "*.mp4 *.mp3 *.wav *.mpeg *.avi *.mov")])
        if caminho:
            # Verifica tamanho do arquivo (limite local antes de estourar a API)
            tamanho_mb = os.path.getsize(caminho) / (1024 * 1024)
            if tamanho_mb > 500:
                messagebox.showwarning("Aviso de Tamanho", "O arquivo é maior que 500MB. O processamento na nuvem pode demorar bastante.")
                
            self.caminho_arquivo = caminho
            nome_arquivo = os.path.basename(caminho)
            self.lbl_arquivo.config(text=f"✅ {nome_arquivo} ({tamanho_mb:.1f} MB)", fg="#10b981")
            self.btn_executar.config(state=tk.NORMAL)

    def atualizar_status(self, msg, cor="#eab308"):
        self.lbl_status.config(text=msg, fg=cor)
        self.root.update_idletasks()

    def processar_midia(self):
        try:
            comando_usuario = self.txt_instrucao.get(1.0, tk.END).strip()
            if not comando_usuario: raise Exception("Digite uma instrução para o Perito (ex: 'Transcreva o áudio').")
            
            client = genai.Client(api_key=API_KEY_LOCAL.strip())
            filtros = [
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
            ]

            # 1. Faz o Upload Seguro do Arquivo
            self.atualizar_status("⏳ Fazendo upload criptografado para a nuvem da Google... (Isso pode demorar dependendo do tamanho)", "#3b82f6")
            arquivo_nuvem = client.files.upload(file=self.caminho_arquivo)
            
            # 2. Aguarda processamento nos servidores do Google
            self.atualizar_status("⏳ Arquivo enviado. Aguardando processamento do vídeo/áudio no servidor...", "#eab308")
            while True:
                f_info = client.files.get(name=arquivo_nuvem.name)
                if str(f_info.state).upper() == "ACTIVE": break
                if "FAILED" in str(f_info.state).upper(): raise Exception("O servidor recusou ou falhou ao tentar processar este formato de mídia.")
                time.sleep(5)

            # 3. Análise Pericial
            self.atualizar_status("🎙️ Arquivo pronto. O Perito M.A está assistindo/ouvindo e redigindo o Laudo...", "#b45309")
            
            instrucao_sistema = """
            Você é o M.A | PERITO AUDIOVISUAL FORENSE.
            Sua missão é extrair dados, transcrever áudios (degravação) ou relatar ações visuais contidas em arquivos de mídia judiciais.
            
            >>> TRAVA ABSOLUTA ANTI-ALUCINAÇÃO (TOLERÂNCIA ZERO) <<<
            1. É ESTRITAMENTE PROIBIDO inventar falas, ruídos, ações ou nomes que não estejam audíveis ou visíveis no arquivo.
            2. Se o áudio estiver ruidoso, confuso ou inaudível, você OBRIGATORIAMENTE deve inserir a tag [ÁUDIO ININTELIGÍVEL]. NÃO tente adivinhar a palavra.
            3. Se você não conseguir identificar quem está falando, chame de [Interlocutor 1], [Interlocutor 2], etc.
            4. Seja cirúrgico, frio, técnico e literal.
            """
            
            config_perito = types.GenerateContentConfig(
                system_instruction=instrucao_sistema, 
                temperature=0.0, # ZERO CRIATIVIDADE. APENAS TRANSCREVA O QUE EXISTE.
                safety_settings=filtros
            )
            
            conteudo_midia = types.Part.from_uri(file_uri=f_info.uri, mime_type=f_info.mime_type)
            
            resposta = client.models.generate_content(model='gemini-2.5-flash', contents=[conteudo_midia, comando_usuario], config=config_perito)
            
            texto_laudo = resposta.text.strip() if hasattr(resposta, 'text') and resposta.text else "Erro: A IA não retornou resultados visíveis."

            # 4. DELEÇÃO OBRIGATÓRIA DA NUVEM (Política de Privacidade)
            self.atualizar_status("🧹 Destruindo arquivo da nuvem (Limpando rastros)...", "#3b82f6")
            client.files.delete(name=arquivo_nuvem.name)

            # 5. Exibe Resultado
            def _ui_sucesso():
                self.txt_resultado.delete(1.0, tk.END)
                self.txt_resultado.insert(tk.END, texto_laudo)
                self.btn_selecionar.config(state=tk.NORMAL)
                self.btn_executar.config(state=tk.NORMAL, text="🎙️ INICIAR NOVA PERÍCIA")
                self.atualizar_status("✅ Perícia concluída! (Arquivo destruído da nuvem com sucesso por segurança)", "#10b981")
            self.root.after(0, _ui_sucesso)

        except Exception as e:
            def _ui_erro():
                self.btn_selecionar.config(state=tk.NORMAL)
                self.btn_executar.config(state=tk.NORMAL, text="🎙️ TENTAR NOVAMENTE")
                self.atualizar_status(f"❌ Erro na perícia.", "#ef4444")
                messagebox.showerror("Erro M.A", f"Falha durante a perícia:\n{str(e)}")
            self.root.after(0, _ui_erro)
            
            # Tenta apagar o arquivo se o erro ocorreu depois do upload
            try:
                if 'arquivo_nuvem' in locals() and arquivo_nuvem:
                    client.files.delete(name=arquivo_nuvem.name)
            except:
                pass

    def iniciar_analise(self):
        self.btn_selecionar.config(state=tk.DISABLED)
        self.btn_executar.config(state=tk.DISABLED, text="⏳ PROCESSANDO MÍDIA...")
        self.txt_resultado.delete(1.0, tk.END)
        
        threading.Thread(target=self.processar_midia, daemon=True).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = MAPeritoAudiovisual(root)
    root.mainloop()