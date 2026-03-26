import os
import time
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext, ttk
from google import genai
from google.genai import types
import re # O motor do Escudo Anti-Alucinação

API_KEY_LOCAL = "AIzaSyA_riNjroJk8CtkvD2bbFVUw9vidFRzV24" 

# ==========================================
# O ESCUDO DE CÓDIGO (REGEX) - A PORTA DE AÇO
# ==========================================
def escudo_anti_alucinacao(texto):
    # ✅ Padrão robusto atualizado com raw string e barra simples no \b
    padrao_jurisprudencia = r'(?i)\b(?:HC|Habeas Corpus|REsp|Recurso Especial|RHC|AgRg|AREsp|Processo)\s*(?:n[º°]?\s*)?[\d\.\-\/]+\/[A-Z]{2}\b'
    texto_limpo = re.sub(padrao_jurisprudencia, "[AVISO: NUMERACAO OMITIDA]", texto)
    return texto_limpo

def gerar_prompt_em_lote(caminhos_txt, papel, cliente, callback_progresso, callback_sucesso, callback_erro):
    try:
        client = genai.Client(api_key=API_KEY_LOCAL.strip())
        filtros_seguranca = [
            types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
        ]

        resumos_volumes = []
        total_vols = len(caminhos_txt)

        for idx, caminho in enumerate(caminhos_txt):
            vol_num = idx + 1
            callback_progresso(vol_num, total_vols, f"Fase 1: Lendo Volume {vol_num} de {total_vols}...")
            
            gemini_file = client.files.upload(file=caminho, config={'mime_type': 'text/plain'})
            while True:
                f_info = client.files.get(name=gemini_file.name)
                if "FAILED" in str(f_info.state).upper(): raise Exception(f"Falha ao processar Vol {vol_num}.")
                if "ACTIVE" in str(f_info.state).upper(): break
                time.sleep(2)
            
            conteudo_txt = types.Part.from_uri(file_uri=f_info.uri, mime_type='text/plain')
            
            prompt_detetive = f"Atuando na {papel.upper()} de {cliente.upper()}.\nLeia este volume. Extraia imparcialmente: 1) Provas materiais, 2) Depoimentos cruciais, 3) Nulidades, 4) Datas. OBRIGATÓRIO citar fls exatas."
            config_detetive = types.GenerateContentConfig(temperature=0.1, safety_settings=filtros_seguranca)
            response_detetive = client.models.generate_content(model='gemini-2.5-flash', contents=[conteudo_txt, prompt_detetive], config=config_detetive)
            
            resumos_volumes.append(f"--- RESUMO VOLUME {vol_num} ---\n{response_detetive.text.strip()}\n")
            client.files.delete(name=gemini_file.name)

        callback_progresso(total_vols, total_vols, "Fase 2: Cruzando dados e gerando Estratégia Mestra...")
        texto_consolidado = "\n".join(resumos_volumes)

        # ✅ MUDANÇA DE POSTURA: Cria um mapa passivo em vez de dar ordens imperativas
        instrucao_sistema_mestre = """
        Você é o 'Diretor Estratégico'. 
        Sua missão é GERAR UM MAPA DE FOCOS ESTRATÉGICOS para guiar a leitura do programa Auditor.
        
        >>> REGRA DE OURO (FIM DO CONFLITO DE INSTRUÇÕES) <<<
        NÃO DÊ ORDENS ou comandos diretos de formatação (Ex: "Elabore uma estratégia", "Crie um documento"). 
        A sua resposta deve ser passiva, listando apenas os pontos que merecem atenção.
        
        Use esta estrutura passiva de tópicos:
        1. Fatos e Provas a focar: (liste os pontos e as fls.)
        2. Contradições a explorar: (liste os depoimentos/provas conflitantes)
        3. Nulidades em potencial: (liste leis ou atos falhos da contraparte)
        
        >>> TRAVA ABSOLUTA ANTI-ALUCINAÇÃO <<<
        PROIBIDO inventar fatos, nomes, locais, processos ou crimes que não estejam nos autos.
        """
        
        prompt_mestre = f"Atuação: {papel.upper()}. Cliente: {cliente.upper()}.\n\nDados rastreados:\n{texto_consolidado}\n\nGere o Mapa de Focos Estratégicos."

        config_mestre = types.GenerateContentConfig(temperature=0.15, safety_settings=filtros_seguranca)
        response_final = client.models.generate_content(model='gemini-2.5-flash', contents=[prompt_mestre], config=config_mestre)

        texto_ia = response_final.text.strip()

        # ✅ O CARIMBO MATEMÁTICO: Anexa o aviso à força via Python
        aviso_obrigatorio = "\n\n[AVISO DE SISTEMA: Este direcionamento focado não exclui a necessidade do Auditor realizar a varredura completa e padrão nos autos em busca de outras nulidades, provas ou contradições não mapeadas nesta estratégia.]"
        texto_com_carimbo = texto_ia + aviso_obrigatorio

        # APLICAÇÃO DA PORTA DE AÇO (REGEX)
        texto_blindado = escudo_anti_alucinacao(texto_com_carimbo)

        callback_sucesso(texto_blindado)

    except Exception as e:
        callback_erro(str(e))

janela = tk.Tk()
janela.title("M.A | Diretor Estratégico (Blindado e Sem Conflitos)")
janela.geometry("800x600")
janela.configure(bg="#020617")

style = ttk.Style()
style.theme_use('clam')

def executar_diretor():
    cliente = entry_cliente.get().strip()
    papel = var_papel.get()
    
    if not cliente: return messagebox.showwarning("Aviso", "Preencha o nome do cliente.")
    caminhos_txt = filedialog.askopenfilenames(filetypes=[("Arquivos de Texto (Volumes)", "*.txt")])
    if not caminhos_txt: return
    caminhos_txt = sorted(list(caminhos_txt))

    btn_executar.config(state=tk.DISABLED, text="⏳ LENDO VOLUMES EM LOTE...", bg="#64748b")
    progress_bar.pack(fill=tk.X, pady=(0, 10))
    progress_bar['maximum'] = len(caminhos_txt)
    progress_bar['value'] = 0
    
    def atualizar_progresso(atual, total, mensagem):
        def _ui_update():
            lbl_status.config(text=mensagem)
            progress_bar['value'] = atual
        janela.after(0, _ui_update)

    def sucesso(texto_prompt):
        def _update_ui_sucesso():
            progress_bar.pack_forget()
            txt_resultado.delete(1.0, tk.END)
            txt_resultado.insert(tk.END, texto_prompt)
            btn_executar.config(state=tk.NORMAL, text="🎯 SELECIONAR TODOS OS VOLUMES E GERAR", bg="#4338ca")
            lbl_status.config(text="Status: Mapa de Focos gerado e blindado com sucesso!", fg="#10b981")
        janela.after(0, _update_ui_sucesso)

    def erro(msg):
        def _update_ui_erro():
            progress_bar.pack_forget()
            btn_executar.config(state=tk.NORMAL, text="🎯 TENTAR NOVAMENTE", bg="#4338ca")
            lbl_status.config(text="Status: Erro.", fg="#ef4444")
            messagebox.showerror("Erro", msg)
        janela.after(0, _update_ui_erro)

    threading.Thread(target=gerar_prompt_em_lote, args=(caminhos_txt, papel, cliente, atualizar_progresso, sucesso, erro), daemon=True).start()

sidebar = tk.Frame(janela, bg="#0f172a", width=250); sidebar.pack(side=tk.LEFT, fill=tk.Y); sidebar.pack_propagate(False)
tk.Label(sidebar, text="M.A | DIRETOR", font=("Segoe UI", 16, "bold"), bg="#0f172a", fg="#6366f1", pady=30).pack()
tk.Label(sidebar, text="Eu leio milhares de\npáginas simultaneamente\n[Proteção Regex Ativa].", bg="#0f172a", fg="#cbd5e1", justify="center").pack(pady=10)

main_area = tk.Frame(janela, bg="#020617", padx=20, pady=20); main_area.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

frame_cliente = tk.Frame(main_area, bg="#020617"); frame_cliente.pack(fill=tk.X, pady=(0, 10))
tk.Label(frame_cliente, text="Nome do Cliente:", bg="#020617", fg="#cbd5e1", font=("Segoe UI", 11, "bold")).pack(side=tk.LEFT, padx=(0, 10))
entry_cliente = tk.Entry(frame_cliente, font=("Segoe UI", 11), bg="#1e293b", fg="white", insertbackground="white"); entry_cliente.pack(side=tk.LEFT, fill=tk.X, expand=True)

frame_papel = tk.Frame(main_area, bg="#020617"); frame_papel.pack(fill=tk.X, pady=(0, 15))
var_papel = tk.StringVar(value="DEFESA")
style.configure("TRadiobutton", background="#020617", foreground="#cbd5e1", font=("Segoe UI", 11))
ttk.Radiobutton(frame_papel, text="Sou a Defesa", variable=var_papel, value="DEFESA", style="TRadiobutton").pack(side=tk.LEFT, padx=10)
ttk.Radiobutton(frame_papel, text="Sou a Acusação (Assistente/MP)", variable=var_papel, value="ACUSAÇÃO", style="TRadiobutton").pack(side=tk.LEFT, padx=10)

btn_executar = tk.Button(main_area, text="🎯 GERAR ESTRATÉGIA MESTRA (COM TRAVA REGEX)", command=executar_diretor, bg="#4338ca", fg="white", font=("Segoe UI", 12, "bold"), pady=12, cursor="hand2")
btn_executar.pack(fill=tk.X, pady=(0, 10))

lbl_status = tk.Label(main_area, text="Status: Aguardando seleção dos volumes...", bg="#020617", fg="#cbd5e1", font=("Segoe UI", 10)); lbl_status.pack(anchor="w")
progress_bar = ttk.Progressbar(main_area, mode='determinate', length=200)

tk.Label(main_area, text="Copie o Direcionamento abaixo e cole no Auditor:", bg="#020617", fg="#94a3b8", font=("Segoe UI", 10)).pack(anchor="w", pady=(15, 5))
txt_resultado = scrolledtext.ScrolledText(main_area, bg="#1e293b", fg="#e2e8f0", borderwidth=0, font=("Segoe UI", 11), padx=10, pady=10)
txt_resultado.pack(fill=tk.BOTH, expand=True)

janela.mainloop()