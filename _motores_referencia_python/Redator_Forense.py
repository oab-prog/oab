import os
import json
import re
import time
import threading
import datetime
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext, ttk
import docx
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from google import genai
from google.genai import types

# ==========================================
# CONFIGURAÇÃO DA CHAVE
# ==========================================
API_KEY_LOCAL = os.getenv("GEMINI_API_KEY") 

# Variáveis Globais de Controle
texto_peca_atual = ""
caminhos_txt_globais = []

# ==========================================
# ESCUDO 2.0 — saneamento recursivo de valores em JSON
# ==========================================
_PADRAO_JURIS_ESCUDO = re.compile(
    r'(?i)\b(?:HC|REsp|RHC|AgRg|AREsp|Apelação|Agravo|AI|Processo n[º°]?\s*)\s*[\d\.\-\/]+\/[A-Z]{2}\b'
)

def aplicar_escudo_no_json(dados):
    if isinstance(dados, dict):
        return {k: aplicar_escudo_no_json(v) for k, v in dados.items()}
    if isinstance(dados, list):
        return [aplicar_escudo_no_json(item) for item in dados]
    if isinstance(dados, str):
        return _PADRAO_JURIS_ESCUDO.sub(
            "[AVISO: NUMERAÇÃO OMITIDA - BUSQUE NA INTEGRA NO JUSBRASIL]", dados
        )
    return dados


def _peca_json_para_texto_exibicao(dados_peca):
    """Monta o texto da interface a partir do JSON blindado (sem depender de markdown de código)."""
    nome = dados_peca.get("peca_processual_identificada") or ""
    corpo = dados_peca.get("texto_peca_completo") or ""
    blocos = []
    if nome:
        blocos.append(nome.strip())
    if corpo:
        blocos.append(corpo.strip())
    return "\n\n".join(blocos) if blocos else "INFORMAÇÃO NÃO ENCONTRADA"


# ==========================================
# LÓGICA DO REDATOR AUTÔNOMO (MAP-REDUCE)
# ==========================================
def redigir_peca_autonoma(caminhos_txt, papel, cliente, estrategia, callback_progresso, callback_sucesso, callback_erro):
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

        # ==========================================
        # FASE 1: DETETIVES
        # ==========================================
        for idx, caminho in enumerate(caminhos_txt):
            vol_num = idx + 1
            callback_progresso(vol_num, total_vols, f"Fase 1: Pescando provas e andamento no Volume {vol_num} de {total_vols}...")
            
            gemini_file = client.files.upload(file=caminho, config={'mime_type': 'text/plain'})
            while True:
                f_info = client.files.get(name=gemini_file.name)
                if "FAILED" in str(f_info.state).upper():
                    raise Exception(f"Falha ao processar o Volume {vol_num}.")
                if "ACTIVE" in str(f_info.state).upper():
                    break
                time.sleep(2)
            
            conteudo_txt = types.Part.from_uri(file_uri=f_info.uri, mime_type='text/plain')
            
            prompt_detetive = f"Atuando na {papel.upper()} do cliente {cliente.upper()}.\nESTRATÉGIA/DOSSIÊ BASE:\n{estrategia}\n\nLeia este volume. Sua missão é dupla: 1) Extrair trechos, testemunhos, datas e nulidades que sirvam a essa estratégia. 2) Identificar o ANDAMENTO PROCESSUAL ATUAL (ex: o réu acabou de ser preso? o juiz abriu prazo para alegações finais? teve sentença?). OBRIGATÓRIO citar as fls. exatas. Se não houver relevância, responda 'Sem relevância'.\n\n>>> VETO (Zero Hallucination 2.0) <<<\nSe o dado não existir, responda: INFORMAÇÃO NÃO ENCONTRADA"
            
            config_detetive = types.GenerateContentConfig(temperature=0.0, safety_settings=filtros_seguranca)
            response_detetive = client.models.generate_content(
                model='gemini-2.5-flash', contents=[conteudo_txt, prompt_detetive], config=config_detetive
            )
            
            resumos_volumes.append(f"--- MATÉRIA-PRIMA DO VOLUME {vol_num} ---\n{response_detetive.text.strip()}\n")
            client.files.delete(name=gemini_file.name)

        # ==========================================
        # FASE 2: O SÓCIO SÊNIOR
        # ==========================================
        callback_progresso(total_vols, total_vols, "Fase 2: Identificando a Peça Correta e Redigindo o documento...")
        texto_consolidado = "\n".join(resumos_volumes)

        instrucao_sistema_mestre = """
        Você é o M.A | JUS IA EXPERIENCE, atuando como o maior e mais estratégico Advogado Criminalista do Brasil.

        >>> VETO (Zero Hallucination 2.0) <<<
        Se o dado não existir, responda: INFORMAÇÃO NÃO ENCONTRADA

        Sua missão agora tem DOIS PASSOS OBRIGATÓRIOS:
        PASSO 1: Analisar as informações processuais consolidadas para DESCOBRIR QUAL É A PEÇA CABÍVEL neste exato momento para o cliente (Ex: Habeas Corpus, Alegações Finais, Resposta à Acusação, Apelação, Relaxamento de Prisão, etc).
        PASSO 2: REDIGIR A PEÇA PROCESSUAL FINAL completa, baseada estritamente nessa descoberta, na estratégia fornecida e nas provas pescadas.

        >>> ESTRUTURA OBRIGATÓRIA DA PEÇA (conteúdo do campo texto_peca_completo) <<<
        [NOME DA PEÇA IDENTIFICADA EM CAIXA ALTA NA PRIMEIRA LINHA]
        1. ENDEREÇAMENTO: (Deixe espaços com colchetes [ ] se faltar a vara exata).
        2. PREÂMBULO/QUALIFICAÇÃO: (Nome do cliente, já devidamente qualificado...)
        3. DOS FATOS: (Conte a história focada na tese, usando as folhas coletadas).
        4. DO DIREITO: (Desenvolva a tese jurídica, preliminares, mérito. Sempre cite as fls. do processo para provar o que diz).
        5. DOS PEDIDOS: (Faça os requerimentos finais adequados à peça descoberta).
        6. FECHAMENTO: (Termos em que, Pede deferimento. Local, Data. Advogado / OAB).

        >>> SAÍDA OBRIGATÓRIA (JSON) <<<
        Responda SOMENTE um objeto JSON válido, sem markdown, com exatamente estas chaves:
        - "peca_processual_identificada": string (nome da peça em CAIXA ALTA; se impossível determinar com base nos autos, use INFORMAÇÃO NÃO ENCONTRADA)
        - "texto_peca_completo": string (peça integral; parágrafos separados por \\n; sem resumo do raciocínio)

        >>> REGRA DE OURO <<<
        NÃO RESUMA nem explique o seu processo de pensamento. Produza apenas o JSON solicitado.
        """

        prompt_mestre = f"Atuação: {papel.upper()}. Cliente: {cliente.upper()}.\nESTRATÉGIA/DOSSIÊ BASE:\n{estrategia}\n\n--- DADOS COLETADOS NOS AUTOS ---\n{texto_consolidado}\n\nDescubra a peça certa e redija-a completamente agora."

        config_mestre = types.GenerateContentConfig(
            system_instruction=instrucao_sistema_mestre,
            temperature=0.0,
            response_mime_type="application/json",
            safety_settings=filtros_seguranca,
        )

        response_final = client.models.generate_content(
            model='gemini-2.5-flash', contents=[prompt_mestre], config=config_mestre
        )

        if not hasattr(response_final, 'text') or not response_final.text:
            raise Exception("A IA recusou-se a gerar a peça.")

        dados_peca = json.loads(response_final.text)
        dados_peca = aplicar_escudo_no_json(dados_peca)
        texto_final = _peca_json_para_texto_exibicao(dados_peca)
        callback_sucesso(texto_final)

    except Exception as e:
        callback_erro(str(e))

# ==========================================
# EXPORTAÇÃO PARA WORD
# ==========================================
def gerar_peca_word(texto_peca, caminho_salvar):
    try:
        doc = docx.Document()
        for s in doc.sections: 
            s.top_margin = Cm(3); s.bottom_margin = Cm(2)
            s.left_margin = Cm(3); s.right_margin = Cm(2)
        
        paragrafos = texto_peca.split('\n')
        for p_texto in paragrafos:
            if p_texto.strip():
                p = doc.add_paragraph(p_texto.strip())
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                for run in p.runs:
                    run.font.name = 'Arial'
                    run.font.size = Pt(12)

        doc.save(caminho_salvar)
        return True
    except:
        return False

# ==========================================
# INTERFACE GRÁFICA DO REDATOR
# ==========================================
janela = tk.Tk()
janela.title("M.A | Redator Forense Supremo (Autônomo)")
janela.geometry("1100x750")
janela.configure(bg="#020617")

style = ttk.Style()
style.theme_use('clam')

def selecionar_volumes():
    global caminhos_txt_globais
    arquivos = filedialog.askopenfilenames(filetypes=[("Arquivos de Texto (Volumes)", "*.txt")])
    if arquivos:
        caminhos_txt_globais = sorted(list(arquivos))
        lbl_qtd_arquivos.config(text=f"✅ {len(caminhos_txt_globais)} volume(s) anexado(s) com sucesso.", fg="#10b981")
        btn_executar.config(state=tk.NORMAL) # Libera o botão de redigir

def executar_redacao():
    estrategia = txt_estrategia.get(1.0, tk.END).strip()
    cliente = entry_cliente.get().strip()
    papel = var_papel.get()
    
    if not estrategia or not cliente:
        messagebox.showwarning("Aviso", "Preencha o nome do cliente e cole a estratégia base.")
        return
        
    if not caminhos_txt_globais:
        messagebox.showwarning("Aviso", "Por favor, anexe os volumes do processo primeiro.")
        return

    btn_anexar.config(state=tk.DISABLED)
    btn_executar.config(state=tk.DISABLED, text="⏳ IDENTIFICANDO PEÇA E REDIGINDO...", bg="#64748b")
    
    progress_bar.pack(side=tk.LEFT, padx=10)
    progress_bar['maximum'] = len(caminhos_txt_globais)
    progress_bar['value'] = 0
    
    def atualizar_progresso(atual, total, mensagem):
        def _ui_update():
            lbl_status.config(text=mensagem)
            progress_bar['value'] = atual
        janela.after(0, _ui_update)

    def sucesso(texto_peca):
        def _update_ui_sucesso():
            progress_bar.pack_forget() 
            global texto_peca_atual
            texto_peca_atual = texto_peca
            
            txt_resultado.delete(1.0, tk.END)
            txt_resultado.insert(tk.END, texto_peca)
            
            btn_anexar.config(state=tk.NORMAL)
            btn_executar.config(state=tk.NORMAL, text="✒️ REDIGIR NOVA PEÇA", bg="#b91c1c")
            lbl_status.config(text="Status: Peça Processual autônoma redigida com sucesso.", fg="#10b981")
            
        janela.after(0, _update_ui_sucesso)

    def erro(msg):
        def _update_ui_erro():
            progress_bar.pack_forget() 
            btn_anexar.config(state=tk.NORMAL)
            btn_executar.config(state=tk.NORMAL, text="✒️ TENTAR NOVAMENTE", bg="#b91c1c")
            lbl_status.config(text="Status: Erro na redação.", fg="#ef4444")
            messagebox.showerror("Erro", f"Falha ao redigir peça:\n{msg}")
            
        janela.after(0, _update_ui_erro)

    threading.Thread(target=redigir_peca_autonoma, args=(caminhos_txt_globais, papel, cliente, estrategia, atualizar_progresso, sucesso, erro), daemon=True).start()

def salvar_peca():
    if not texto_peca_atual: 
        return messagebox.showinfo("Aviso", "Redija uma peça primeiro.")
    caminho = filedialog.asksaveasfilename(defaultextension=".docx", filetypes=[("Word Document", "*.docx")], initialfile=f"Peca_Criminal_MA_{datetime.datetime.now().strftime('%H%M')}.docx")
    if caminho:
        gerar_peca_word(texto_peca_atual, caminho)
        messagebox.showinfo("Sucesso", "Peça salva em Word com sucesso!")

# --- Layout ---
sidebar = tk.Frame(janela, bg="#0f172a", width=300); sidebar.pack(side=tk.LEFT, fill=tk.Y); sidebar.pack_propagate(False)
tk.Label(sidebar, text="M.A | REDATOR", font=("Segoe UI", 18, "bold"), bg="#0f172a", fg="#f87171", pady=30).pack()
tk.Label(sidebar, text="A Máquina de Vencer.\nIdentifica a peça e escreve.", bg="#0f172a", fg="#cbd5e1", justify="center").pack(pady=10)
tk.Button(sidebar, text="📥 BAIXAR PEÇA (WORD)", command=salvar_peca, bg="#10b981", fg="white", font=("Segoe UI", 10, "bold"), pady=10).pack(side=tk.BOTTOM, fill="x", padx=20, pady=20)

main_area = tk.Frame(janela, bg="#020617", padx=20, pady=20); main_area.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

# 1. Controles Superiores (Cliente e Papel)
top_frame = tk.Frame(main_area, bg="#020617")
top_frame.pack(side=tk.TOP, fill=tk.X, pady=(0, 15))

frame_cliente = tk.Frame(top_frame, bg="#020617")
frame_cliente.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 20))
tk.Label(frame_cliente, text="Nome do Cliente:", bg="#020617", fg="#cbd5e1", font=("Segoe UI", 11, "bold")).pack(side=tk.LEFT)
entry_cliente = tk.Entry(frame_cliente, font=("Segoe UI", 11), bg="#1e293b", fg="white", insertbackground="white")
entry_cliente.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(10, 0))

frame_papel = tk.Frame(top_frame, bg="#020617")
frame_papel.pack(side=tk.LEFT)
tk.Label(frame_papel, text="Atuação:", bg="#020617", fg="#cbd5e1", font=("Segoe UI", 11, "bold")).pack(side=tk.LEFT, padx=(0, 10))
var_papel = tk.StringVar(value="DEFESA")
style.configure("TRadiobutton", background="#020617", foreground="#cbd5e1", font=("Segoe UI", 11))
ttk.Radiobutton(frame_papel, text="Defesa", variable=var_papel, value="DEFESA", style="TRadiobutton").pack(side=tk.LEFT, padx=5)
ttk.Radiobutton(frame_papel, text="Acusação", variable=var_papel, value="ACUSAÇÃO", style="TRadiobutton").pack(side=tk.LEFT, padx=5)

# 2. Ações Inferiores (BOTÕES FIXOS NO RODAPÉ DA TELA)
action_frame = tk.Frame(main_area, bg="#020617")
action_frame.pack(side=tk.BOTTOM, fill=tk.X)

# Botão 1: Anexar (Azul)
frame_anexo = tk.Frame(action_frame, bg="#020617")
frame_anexo.pack(fill=tk.X, pady=(0, 10))
btn_anexar = tk.Button(frame_anexo, text="📁 ANEXAR VOLUMES DO PROCESSO (.txt)", command=selecionar_volumes, bg="#0284c7", fg="white", font=("Segoe UI", 11, "bold"), pady=8, cursor="hand2")
btn_anexar.pack(side=tk.LEFT)
lbl_qtd_arquivos = tk.Label(frame_anexo, text="Nenhum volume anexado ainda.", bg="#020617", fg="#64748b", font=("Segoe UI", 10, "italic"))
lbl_qtd_arquivos.pack(side=tk.LEFT, padx=15)

# Botão 2: Executar (Vermelho) - Começa desativado
btn_executar = tk.Button(action_frame, text="✒️ REDIGIR PEÇA AUTÔNOMA", command=executar_redacao, bg="#b91c1c", fg="white", font=("Segoe UI", 12, "bold"), pady=12, cursor="hand2", state=tk.DISABLED)
btn_executar.pack(side=tk.LEFT, fill=tk.X, expand=True)

progress_bar = ttk.Progressbar(action_frame, mode='determinate', length=200)

lbl_status = tk.Label(action_frame, text="Status: Aguardando...", bg="#020617", fg="#64748b", font=("Segoe UI", 10))
lbl_status.pack(side=tk.LEFT, padx=20)

# 3. Área de Texto (No meio, preenchendo o resto da tela)
paned = ttk.PanedWindow(main_area, orient=tk.VERTICAL)
paned.pack(side=tk.TOP, fill=tk.BOTH, expand=True, pady=(0, 15))

frame_estrategia = tk.Frame(paned, bg="#1e293b")
tk.Label(frame_estrategia, text=" Cole aqui a Estratégia Mestra (Dossiê do Auditor ou Resumo do Diretor):", bg="#1e293b", fg="#94a3b8", font=("Segoe UI", 10, "bold"), anchor="w").pack(fill=tk.X, pady=5)
txt_estrategia = scrolledtext.ScrolledText(frame_estrategia, bg="#0f172a", fg="#fbbf24", borderwidth=0, font=("Segoe UI", 11), padx=10, pady=10, height=5)
txt_estrategia.pack(fill=tk.BOTH, expand=True)
paned.add(frame_estrategia, weight=1)

frame_resultado = tk.Frame(paned, bg="#1e293b")
tk.Label(frame_resultado, text=" Peça Processual Autônoma Gerada:", bg="#1e293b", fg="#94a3b8", font=("Segoe UI", 10, "bold"), anchor="w").pack(fill=tk.X, pady=5)
txt_resultado = scrolledtext.ScrolledText(frame_resultado, bg="#f8fafc", fg="#0f172a", borderwidth=0, font=("Segoe UI", 11), padx=15, pady=15)
txt_resultado.pack(fill=tk.BOTH, expand=True)
paned.add(frame_resultado, weight=3)

janela.mainloop()