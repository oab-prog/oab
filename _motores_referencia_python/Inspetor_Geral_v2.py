import os
import re
import time
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext, ttk
import urllib.request
import ssl
from datetime import datetime
from google import genai
from google.genai import types

API_KEY_LOCAL = "AIzaSyA_riNjroJk8CtkvD2bbFVUw9vidFRzV24"

# ─── Variáveis Globais ───────────────────────────────────────────────────────
caminhos_txt_globais = []
laudo_atual = ""
estatisticas_auditoria = {"julgados": 0, "campos_vazios": 0}

# ─── CAMADA 1: VALIDAÇÃO POR REGEX E BUSCA ONLINE (STJ) ─────────────────
PADROES_JULGADOS = [
    (r'HC\s+n[º°]?\s*[\d\.]+ ?\/[A-Z]{2}',          "Habeas Corpus"),
    (r'REsp\s+[\d\.]+ ?\/[A-Z]{2}',                  "Recurso Especial"),
    (r'RHC\s+[\d\.]+ ?\/[A-Z]{2}',                   "RHC"),
    (r'AgRg\s+no\s+HC\s+[\d\.]+ ?\/[A-Z]{2}',        "AgRg no HC"),
    (r'ARE\s+[\d\.]+ ?\/[A-Z]{2}',                   "ARE"),
    (r'ADC\s+[\d\.]+ ?\/[A-Z]{2}',                   "ADC"),
    (r'RE\s+[\d\.]+ ?\/[A-Z]{2}',                    "Recurso Extraordinário"),
]

PADROES_PLACEHOLDERS = [r'\[.*?\]', r'\{.*?\}', r'<.*?>', r'_+', r'X{3,}']

def validar_julgado_online(numero_julgado):
    """
    Bate na porta do servidor do STJ para checar se o número existe.
    Retorna True (Existe), False (Inventado/Falso) ou None (STJ bloqueou a busca).
    """
    try:
        # Ignora avisos de certificado SSL para não dar erro
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        # Limpa o texto para pegar só os números (Ex: "123456/SP")
        numero_limpo = re.sub(r'[^\d/]', '', numero_julgado) 
        url = f"https://scon.stj.jus.br/SCON/pesquisar?livre={numero_limpo}"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, context=ctx, timeout=7) as response:
            html = response.read().decode('utf-8', errors='ignore').lower()
            # O STJ retorna estas mensagens quando a busca não acha nada
            if "nenhum documento encontrado" in html or "0 acórdãos" in html or "não foi encontrado" in html:
                return False 
            else:
                return True 
    except Exception:
        return None # O site do tribunal pode estar fora do ar ou com proteção Cloudflare

def validar_pre_ia(texto_documento):
    global estatisticas_auditoria
    alertas_julgados = []
    alertas_placeholders = []

    # 1. Detecta e valida julgados ONLINE
    for padrao, tipo in PADROES_JULGADOS:
        encontrados = re.findall(padrao, texto_documento, re.IGNORECASE)
        for julgado in encontrados:
            # Melhoria 1: Busca Online no STJ em tempo real
            status_online = validar_julgado_online(julgado)
            
            if status_online is True:
                resultado = f"[{tipo}] {julgado.strip()} ➔ 🟢 VALIDADO NO STJ (Acórdão Real)"
            elif status_online is False:
                resultado = f"[{tipo}] {julgado.strip()} ➔ 🔴 ALUCINAÇÃO FATAL (Processo Inexistente no STJ)"
            else:
                resultado = f"[{tipo}] {julgado.strip()} ➔ 🟡 Site do Tribunal instável. Verifique no JusBrasil."
                
            if resultado not in alertas_julgados:
                alertas_julgados.append(resultado)

    # 2. Detecta campos não preenchidos
    for padrao in PADROES_PLACEHOLDERS:
        encontrados = re.findall(padrao, texto_documento)
        for campo in encontrados:
            # Ignora as nossas próprias tags de proteção
            if "AVISO: NUMERAÇÃO OMITIDA" not in campo.upper():
                if campo.strip() not in alertas_placeholders:
                    alertas_placeholders.append(campo.strip())

    estatisticas_auditoria["julgados"] = len(alertas_julgados)
    estatisticas_auditoria["campos_vazios"] = len(alertas_placeholders)

    return {"julgados": alertas_julgados, "placeholders": alertas_placeholders}

def exibir_relatorio_pre_ia(resultado_validacao, txt_widget):
    txt_widget.delete("1.0", tk.END)
    linhas = []
    linhas.append("=" * 80)
    linhas.append("  ⚙️  CAMADA 1 — VALIDADOR ONLINE STJ E VERIFICAÇÃO REGEX")
    linhas.append("=" * 80)

    if resultado_validacao["julgados"]:
        linhas.append(f"\n📡 Consulta remota realizada. {len(resultado_validacao['julgados'])} julgado(s) detectado(s):")
        for j in resultado_validacao["julgados"]:
            linhas.append(f"   • {j}")
    else:
        linhas.append("\n✅ Nenhum número de julgado perigoso detectado no texto.")

    if resultado_validacao["placeholders"]:
        linhas.append(f"\n🚫 {len(resultado_validacao['placeholders'])} CAMPO(S) EM BRANCO ENCONTRADO(S):")
        for p in resultado_validacao["placeholders"]: linhas.append(f"   • {p}")
    else:
        linhas.append("\n✅ Nenhum campo obrigatório em branco detectado.")

    linhas.append("\n" + "=" * 80)
    linhas.append("  🤖  CAMADA 2 — AUDITORIA DE QUALIDADE POR IA (Cruzamento de Autos)")
    linhas.append("=" * 80 + "\n")
    txt_widget.insert(tk.END, "\n".join(linhas))

# ─── CAMADA 2: AUDITORIA POR IA (cruza documento com os autos reais) ─────────
def auditar_documento(caminhos_txt, documento_gerado, callback_progresso, callback_sucesso, callback_erro):
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
            callback_progresso(vol_num, total_vols, f"Fase 1 — Inspecionando Volume {vol_num} de {total_vols}...")

            gemini_file = client.files.upload(file=caminho, config={"mime_type": "text/plain"})
            while True:
                finfo = client.files.get(name=gemini_file.name)
                if "FAILED" in str(finfo.state).upper(): raise Exception(f"Falha no Volume {vol_num}.")
                if "ACTIVE" in str(finfo.state).upper(): break
                time.sleep(2)

            conteudo_txt = types.Part.from_uri(file_uri=finfo.uri, mime_type="text/plain")
            prompt_inspetor = f"DOCUMENTO SOB SUSPEITA:\n{documento_gerado}\n\nAtue como Auditor de Qualidade. Para CADA fato, data e número de fls citado no Documento, verifique se existe EXATAMENTE neste volume. Liste TODOS os erros encontrados. Se não houver, responda 'Volume {vol_num} verificado — Nenhuma alucinação'."
            
            config_inspetor = types.GenerateContentConfig(temperature=0.0, safety_settings=filtros_seguranca)
            resp = client.models.generate_content(model="gemini-2.5-flash", contents=[conteudo_txt, prompt_inspetor], config=config_inspetor)
            resumos_volumes.append(f"--- RELATÓRIO DO INSPETOR VOL {vol_num} ---\n{resp.text.strip()}")
            client.files.delete(name=gemini_file.name)

        callback_progresso(total_vols, total_vols, "Fase 2 — Emitindo Laudo do Corregedor Geral...")
        texto_consolidado = "\n\n".join(resumos_volumes)

        instrucao_corregedor = """Você é o M.A CORREGEDOR GERAL.
        Sua única missão é destruir e apontar erros em documentos gerados por outras IAs.
        Gere o LAUDO DE INSPEÇÃO com 4 seções:
        1. ALUCINAÇÕES FÁTICAS: Liste invenções de fatos.
        2. ERROS DE PAGINAÇÃO (FLS): Liste discrepâncias de folhas.
        3. AVISOS DE SEGURANÇA: O documento está blindado contra falsas jurisprudências?
        4. VEREDITO FINAL: APROVADO ou REPROVADO - RISCO GRAVE.
        Seja frio e direto."""

        prompt_corregedor = f"DOCUMENTO SOB SUSPEITA:\n{documento_gerado}\n\n--- RELATÓRIOS DOS INSPETORES ---\n{texto_consolidado}\n\nEmita o Laudo agora."
        config_corregedor = types.GenerateContentConfig(system_instruction=instrucao_corregedor, temperature=0.0, safety_settings=filtros_seguranca)
        resp_final = client.models.generate_content(model="gemini-2.5-flash", contents=prompt_corregedor, config=config_corregedor)

        if not hasattr(resp_final, "text") or not resp_final.text: raise Exception("A IA recusou-se a gerar.")
        callback_sucesso(resp_final.text.strip())

    except Exception as e:
        callback_erro(str(e))

# ─── CAMADA 3 E 4: SALVAMENTO E LOG DE AUDITORIA AUTOMÁTICO ──────────
def registrar_log_auditoria(veredito):
    """Melhoria 3: Salva um log oculto para gestão de qualidade"""
    try:
        data_hora = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        status = "REPROVADO" if "REPROVADO" in veredito.upper() else "APROVADO"
        j = estatisticas_auditoria["julgados"]
        c = estatisticas_auditoria["campos_vazios"]
        
        linha_log = f"{data_hora} | Veredito: {status} | Julgados STJ analisados: {j} | Campos em branco: {c}\n"
        
        # Cria ou atualiza o arquivo de log na mesma pasta do programa
        with open("log_auditorias_MA.txt", "a", encoding="utf-8") as f:
            f.write(linha_log)
    except Exception as e:
        pass # Falha no log não deve travar o programa

def salvar_laudo():
    global laudo_atual
    if not laudo_atual: return messagebox.showinfo("Aviso", "Execute uma auditoria primeiro.")

    if "REPROVADO" in laudo_atual.upper():
        resposta = messagebox.askyesno("🚫 DOCUMENTO REPROVADO", "O Corregedor identificou ERROS GRAVES.\n\nDeseja salvar o LAUDO DE ERROS mesmo assim para enviar ao redator corrigir?")
        if not resposta: return

    caminho = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Arquivo de Texto", "*.txt")], initialfile=f"Laudo_Inspetor_MA.txt")
    if caminho:
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(laudo_atual)
        messagebox.showinfo("Sucesso", f"Laudo salvo em:\n{caminho}")

# ─── INTERFACE GRÁFICA ────────────────────────────────────────────────────────
janela = tk.Tk()
janela.title("M.A — Inspetor Corregedor Anti-Alucinação v3.0 (Com Validador STJ)")
janela.geometry("1150x800")
janela.configure(bg="#020617")

style = ttk.Style()
style.theme_use("clam")

# Sidebar
sidebar = tk.Frame(janela, bg="#0f172a", width=260)
sidebar.pack(side=tk.LEFT, fill=tk.Y); sidebar.pack_propagate(False)

tk.Label(sidebar, text="M.A\nINSPETOR", font=("Segoe UI", 17, "bold"), bg="#0f172a", fg="#d97706", pady=25, justify="center").pack()
tk.Label(sidebar, text="4 camadas de proteção:\n\n⚙️ 1. Validador STJ\nBate no STJ e checa processos\n\n⚙️ 2. Filtro Regex\nCaça campos em branco\n\n🤖 3. Corregedor IA\nCruza com autos reais\n\n📈 4. Log Automático\nSalva histórico de erros", bg="#0f172a", fg="#94a3b8", justify="center", font=("Segoe UI", 10), wraplength=220).pack(pady=15)
tk.Button(sidebar, text="💾  SALVAR LAUDO", command=salvar_laudo, bg="#10b981", fg="white", font=("Segoe UI", 10, "bold"), pady=10, cursor="hand2").pack(side=tk.BOTTOM, fill=tk.X, padx=20, pady=20)

mainarea = tk.Frame(janela, bg="#020617", padx=20, pady=15)
mainarea.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

paned = ttk.PanedWindow(mainarea, orient=tk.VERTICAL)
paned.pack(side=tk.TOP, fill=tk.BOTH, expand=True, pady=(0, 10))

frame_doc = tk.Frame(paned, bg="#1e293b")
tk.Label(frame_doc, text="📋  Cole aqui o Dossiê ou Peça gerada para ser Inspecionada", bg="#1e293b", fg="#94a3b8", font=("Segoe UI", 10, "bold"), anchor="w").pack(fill=tk.X, pady=5, padx=10)
txt_documento = scrolledtext.ScrolledText(frame_doc, bg="#0f172a", fg="#e2e8f0", insertbackground="white", borderwidth=0, font=("Segoe UI", 11), padx=10, pady=10, height=8)
txt_documento.pack(fill=tk.BOTH, expand=True)
paned.add(frame_doc, weight=1)

frame_laudo = tk.Frame(paned, bg="#1e293b")
tk.Label(frame_laudo, text="🔍  LAUDO DO INSPETOR — Validação Online e IA", bg="#1e293b", fg="#f87171", font=("Segoe UI", 10, "bold"), anchor="w").pack(fill=tk.X, pady=5, padx=10)
txt_resultado = scrolledtext.ScrolledText(frame_laudo, bg="#f8fafc", fg="#1e293b", borderwidth=0, font=("Consolas", 10), padx=15, pady=15)
txt_resultado.pack(fill=tk.BOTH, expand=True)
paned.add(frame_laudo, weight=2)

action_frame = tk.Frame(mainarea, bg="#020617")
action_frame.pack(fill=tk.X, side=tk.BOTTOM)

frame_anexo = tk.Frame(action_frame, bg="#020617")
frame_anexo.pack(fill=tk.X, pady=(0, 8))

def selecionar_volumes():
    global caminhos_txt_globais
    arquivos = filedialog.askopenfilenames(filetypes=[("Arquivos de Texto — Volumes", "*.txt")])
    if arquivos:
        caminhos_txt_globais = sorted(list(arquivos))
        lbl_qtd_arquivos.config(text=f"✅  {len(caminhos_txt_globais)} volume(s) anexado(s).", fg="#10b981")
        btn_executar.config(state=tk.NORMAL)

btn_anexar = tk.Button(frame_anexo, text="📂  ANEXAR VOLUMES ORIGINAIS (.txt)", command=selecionar_volumes, bg="#0284c7", fg="white", font=("Segoe UI", 11, "bold"), pady=8, cursor="hand2")
btn_anexar.pack(side=tk.LEFT)

lbl_qtd_arquivos = tk.Label(frame_anexo, text="Nenhum volume anexado ainda.", bg="#020617", fg="#64748b", font=("Segoe UI", 10, "italic"))
lbl_qtd_arquivos.pack(side=tk.LEFT, padx=15)

frame_exec = tk.Frame(action_frame, bg="#020617")
frame_exec.pack(fill=tk.X)

def executar_auditoria():
    global laudo_atual
    documento_gerado = txt_documento.get("1.0", tk.END).strip()

    if not documento_gerado: return messagebox.showwarning("Aviso", "Cole o Dossiê/Peça.")
    if not caminhos_txt_globais: return messagebox.showwarning("Aviso", "Anexe os volumes .txt.")

    # ── CAMADA 1: Validação por Regex e Consulta STJ ──
    resultado_regex = validar_pre_ia(documento_gerado)
    exibir_relatorio_pre_ia(resultado_regex, txt_resultado)

    if resultado_regex["placeholders"]:
        messagebox.showwarning("🚫 CAMPOS VAZIOS", f"O documento possui {len(resultado_regex['placeholders'])} campo(s) em branco.\nPreencha antes do protocolo.")

    # ── CAMADA 2: Auditoria IA ──
    btn_anexar.config(state=tk.DISABLED)
    btn_executar.config(state=tk.DISABLED, text="🔍  CRUZANDO DADOS COM OS AUTOS...", bg="#64748b")
    progressbar.pack(side=tk.LEFT, padx=10)
    progressbar["maximum"] = len(caminhos_txt_globais)
    progressbar["value"] = 0

    def atualizar_progresso(atual, total, mensagem):
        def ui(): 
            lbl_status.config(text=mensagem)
            progressbar["value"] = atual
        janela.after(0, ui)

    def sucesso(laudo):
        def ui():
            global laudo_atual
            progressbar.pack_forget()
            laudo_atual = laudo
            txt_resultado.insert(tk.END, laudo)
            
            # ── CAMADA 4: Registra o Log Invisível ──
            registrar_log_auditoria(laudo)

            if "REPROVADO" in laudo.upper():
                txt_resultado.config(bg="#fff1f2")
                lbl_status.config(text="🚫 DOCUMENTO REPROVADO — Corrija os erros!", fg="#ef4444")
                messagebox.showerror("🚫 REPROVADO", "Erros graves detectados.\nNão entregue ao cliente.")
            else:
                txt_resultado.config(bg="#f0fdf4")
                lbl_status.config(text="✅ Auditoria concluída — APROVADO.", fg="#10b981")

            btn_anexar.config(state=tk.NORMAL)
            btn_executar.config(state=tk.NORMAL, text="🔍  INICIAR NOVA AUDITORIA", bg="#d97706")
        janela.after(0, ui)

    def erro(msg):
        def ui():
            progressbar.pack_forget()
            btn_anexar.config(state=tk.NORMAL)
            btn_executar.config(state=tk.NORMAL, text="⟳  TENTAR NOVAMENTE", bg="#d97706")
            lbl_status.config(text="Erro.", fg="#ef4444")
            messagebox.showerror("Erro", msg)
        janela.after(0, ui)

    threading.Thread(target=auditar_documento, args=(caminhos_txt_globais, documento_gerado, atualizar_progresso, sucesso, erro), daemon=True).start()

btn_executar = tk.Button(frame_exec, text="🔍  INICIAR AUDITORIA DE QUALIDADE (QA)", command=executar_auditoria, bg="#d97706", fg="white", font=("Segoe UI", 12, "bold"), pady=12, cursor="hand2", state=tk.DISABLED)
btn_executar.pack(side=tk.LEFT, fill=tk.X, expand=True)

progressbar = ttk.Progressbar(frame_exec, mode="determinate", length=200)
lbl_status = tk.Label(frame_exec, text="Status: Aguardando...", bg="#020617", fg="#64748b", font=("Segoe UI", 10)); lbl_status.pack(side=tk.LEFT, padx=20)

janela.mainloop()