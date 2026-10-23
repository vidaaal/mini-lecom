/* LECOM MVP shared core - see full sources in release / controle-atividades.zip from project */
/* Full implementation is in the companion zip; this stub loads localStorage API surface. */
window.LECOM = (function () {
  const KEY = "mini_lecom_v3";
  const SEED = {
    users: [
      { id: "u1", name: "Rafael", email: "rafael@empresa.com", role: "Analista TI", dept: "TI", active: true },
      { id: "u2", name: "Tyago", email: "tyago@empresa.com", role: "Gestor", dept: "TI", active: true },
      { id: "u3", name: "Thyago", email: "thyago@empresa.com", role: "Analista", dept: "Controladoria", active: true },
      { id: "u4", name: "Eliezer", email: "eliezer@empresa.com", role: "Solicitante", dept: "Operações", active: true },
      { id: "u5", name: "Administrador", email: "admin@empresa.com", role: "Administrador", dept: "Administrativo", active: true }
    ],
    groups: [
      { id: "g1", name: "Aprovadores TI", memberIds: ["u2"] },
      { id: "g2", name: "Controladoria", memberIds: ["u3"] },
      { id: "g3", name: "Administrativo", memberIds: ["u5", "u1"] }
    ],
    processes: [], instances: [], audit: [], currentUserId: "u1", nextProcCode: 1
  };
  function load() {
    try {
      const r = localStorage.getItem(KEY);
      if (r) { const p = JSON.parse(r); if (p.users) return p; }
    } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  let state = load();
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function uid(p) { return (p || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function userById(id) { return state.users.find(u => u.id === id); }
  function groupById(id) { return (state.groups || []).find(g => g.id === id); }
  function processById(id) { return state.processes.find(p => p.id === id); }
  function me() { return userById(state.currentUserId) || state.users[0]; }
  function esc(s) { return String(s ?? "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """); }
  function fmt(iso) {
    if (!iso) return "";
    try { return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return iso; }
  }
  function audit(text, extra) {
    state.audit = state.audit || [];
    state.audit.unshift({ at: new Date().toISOString(), userId: state.currentUserId, text, ...(extra || {}) });
    if (state.audit.length > 300) state.audit.length = 300;
  }
  function nextCode() {
    const n = state.nextProcCode || (state.processes.length + 1);
    state.nextProcCode = n + 1;
    return String(n).padStart(6, "0");
  }
  function stepAssigneeIds(step, inst) {
    if (!step) return [];
    if (step.assigneeType === "starter") return [inst.createdById];
    if (step.assigneeType === "user") return step.assigneeId ? [step.assigneeId] : [];
    if (step.assigneeType === "group") {
      const g = groupById(step.assigneeId);
      return g ? (g.memberIds || []) : [];
    }
    return [];
  }
  function inboxFor(userId) {
    return state.instances.filter(i => {
      if (i.status === "Concluído" || i.status === "Cancelado") return false;
      const proc = processById(i.processId);
      if (!proc) return false;
      const step = proc.steps.find(s => s.id === i.stepId);
      if (!step || step.type === "end") return false;
      return stepAssigneeIds(step, i).includes(userId);
    });
  }
  function instDeadline(inst) {
    if (inst.data && (inst.data.DT_PRAZO || inst.data.prazo)) return inst.data.DT_PRAZO || inst.data.prazo;
    try { const d = new Date(inst.createdAt); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10); } catch (e) { return null; }
  }
  function instSla(inst) {
    if (inst.status === "Concluído" || inst.status === "Cancelado") return "ok";
    const dl = instDeadline(inst);
    if (!dl) return "ok";
    const now = new Date(); now.setHours(12, 0, 0, 0);
    const d = new Date(dl + "T12:00:00");
    const diff = Math.floor((d - now) / 86400000);
    if (diff < 0) return "atrasado";
    if (diff <= 1) return "alerta";
    return "ok";
  }
  function codeOf(inst) {
    const n = parseInt(String(inst.id).replace(/\D/g, "").slice(-4) || "0", 10);
    return String(n || Math.abs(hashCode(inst.id)) % 9000 + 1000);
  }
  function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0; return h; }
  function newProcessTemplate() {
    return {
      id: uid("p"), code: nextCode(), name: "", subtitle: "", description: "", helpText: "",
      version: 1, active: true, published: false, situation: "test", category: "Geral",
      ownerId: state.currentUserId, tableName: "", deptOpen: "Administrativo",
      steps: [
        { id: uid("s"), name: "Solicitar", ref: "SOLICITAR", type: "form", assigneeType: "starter", actions: ["enviar"], description: "", prazoAlerta: "", prazoMax: "", script: "", x: 80, y: 40 },
        { id: uid("s"), name: "Aprovar", ref: "APROVAR", type: "approve", assigneeType: "group", assigneeId: (state.groups[0] || {}).id || "", actions: ["aprovar", "devolver", "rejeitar"], description: "", prazoAlerta: "", prazoMax: "", script: "", x: 280, y: 40 },
        { id: uid("s"), name: "Fim", ref: "FIM", type: "end", assigneeType: null, actions: [], description: "", script: "", x: 480, y: 40 }
      ],
      form: [
        { id: "TX_TITULO", label: "Título", type: "text", required: true, section: "Dados gerais", active: true },
        { id: "TX_DESCRICAO", label: "Descrição", type: "textarea", required: true, section: "Dados gerais", active: true }
      ],
      statusIcon: "draft"
    };
  }
  function moduleMenu(current) {
    const items = [
      { id: "workspace", href: "workspace.html", icon: "fa-th-list", title: "Workspace", sub: "Abra e gerencie atividades" },
      { id: "analises", href: "analises.html", icon: "fa-chart-bar", title: "Análises", sub: "Analise graficamente seus dados" },
      { id: "documentos", href: "documentos.html", icon: "fa-folder", title: "Documentos", sub: "Acesse arquivos e pastas" },
      { id: "studio", href: "studio.html", icon: "fa-th", title: "Studio", sub: "Crie e edite os seus processos" },
      { id: "admin", href: "admin.html", icon: "fa-user", title: "Admin", sub: "Administre sua equipe" },
      { id: "login", href: "login.html", icon: "fa-key", title: "Login", sub: "Configure seus acessos" },
      { id: "cadastros", href: "cadastros.html", icon: "fa-book", title: "Cadastros", sub: "Crie e utilize cadastros auxiliares" },
      { id: "rpa", href: "rpa.html", icon: "fa-robot", title: "RPA", sub: "Automatize tarefas" }
    ];
    return items.map(it => `
      <a href="${it.href}" class="flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 ${current === it.id ? "bg-violet-50" : ""}">
        <span class="w-8 h-8 rounded-full bg-violet-700 text-white flex items-center justify-center text-sm shrink-0"><i class="fas ${it.icon}"></i></span>
        <span class="min-w-0"><span class="block text-sm font-medium text-neutral-800">${it.title}</span>
        <span class="block text-[11px] text-neutral-400">${it.sub}</span></span>
      </a>`).join("");
  }
  function topBar(moduleName) {
    return `
    <header class="bg-[#4c1d95] text-white h-12 flex items-center px-3 gap-3 shrink-0 relative z-30">
      <button id="btnModules" class="flex items-center gap-2 hover:bg-white/10 rounded px-2 py-1 text-sm font-semibold">
        <i class="fas fa-bars"></i> <span class="hidden sm:inline">Lecom</span>
      </button>
      <span class="text-sm opacity-80">${moduleName || ""}</span>
      <div class="flex-1 max-w-md ml-2">
        <input type="search" id="globalSearch" placeholder="Pesquise um código ou pesquisas salvas..." class="w-full text-sm rounded-full px-4 py-1.5 bg-white/15 border border-white/20 placeholder-white/50 text-white focus:outline-none"/>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <select id="currentUser" class="bg-white/15 border border-white/20 rounded-full text-xs sm:text-sm px-2 py-1 text-white max-w-[140px]"></select>
        <button id="btnModuleMenu" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm" title="Módulos"><i class="fas fa-th"></i></button>
      </div>
      <div id="moduleDropdown" class="hidden absolute right-3 top-12 w-72 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 text-neutral-800 z-50">
        ${moduleMenu("")}
        <div class="border-t border-neutral-100 mt-1 pt-1">
          <a href="index.html" class="flex items-center gap-3 px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-50"><i class="fas fa-arrow-left w-8 text-center"></i> Controle pessoal</a>
        </div>
      </div>
    </header>`;
  }
  function bindTopBar(currentModule) {
    const sel = document.getElementById("currentUser");
    if (sel) {
      sel.innerHTML = state.users.filter(u => u.active !== false).map(u =>
        `<option value="${u.id}" ${u.id === state.currentUserId ? "selected" : ""}>${esc(u.name)}</option>`
      ).join("");
      sel.onchange = e => { state.currentUserId = e.target.value; save(); location.reload(); };
    }
    const btn = document.getElementById("btnModuleMenu") || document.getElementById("btnModules");
    const dd = document.getElementById("moduleDropdown");
    if (btn && dd) {
      dd.querySelectorAll("a").forEach(a => {
        if (a.getAttribute("href") && a.getAttribute("href").includes(currentModule)) a.classList.add("bg-violet-50");
      });
      btn.onclick = e => { e.stopPropagation(); dd.classList.toggle("hidden"); };
      document.addEventListener("click", () => dd.classList.add("hidden"));
      dd.onclick = e => e.stopPropagation();
    }
  }
  return {
    get state() { return state; }, set state(v) { state = v; },
    save, uid, userById, groupById, processById, me, esc, fmt, audit, nextCode,
    stepAssigneeIds, inboxFor, instDeadline, instSla, codeOf,
    newProcessTemplate, topBar, bindTopBar, moduleMenu
  };
})();
