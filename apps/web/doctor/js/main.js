// Lightweight page controller + seeded mock data for each module
let apiAvailable = false; // whether minimal API is available

document.addEventListener('DOMContentLoaded', function () {
  // Nav switching
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  navItems.forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      navItems.forEach((n) => n.classList.remove('active'));
      pages.forEach((p) => p.classList.remove('active'));
      this.classList.add('active');
      const pageName = this.dataset.page;
      const targetPage = document.getElementById(`${pageName}-page`);
      if (targetPage) targetPage.classList.add('active');
    });
  });

  // Logout
  const logoutBtn = document.querySelector('.logout-btn');
  logoutBtn && logoutBtn.addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) alert('退出登录成功');
  });

  // Search
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-input');
  if (searchBtn && searchInput) {
    const doSearch = () => {
      const k = searchInput.value.trim();
      if (k) alert(`搜索: ${k}`);
    };
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && doSearch());
  }

  // Global delegated handlers
  document.body.addEventListener('click', function (e) {
    const reply = e.target.closest('.reply-btn');
    if (reply) return alert('回复功能开发中...');
    const start = e.target.closest('.start-btn:not(.disabled)');
    if (start) return alert('开始咨询功能开发中...');
    const action = e.target.closest('.action-btn');
    if (action && action.dataset.name) return alert(`查看患者: ${action.dataset.name}`);
  });

  // Seed mock data (or API if可用)
  bootstrapData();

  // Tabs for consultations (auto API fallback)
  document.querySelectorAll('#consultations-page .tab-btn').forEach((btn) => {
    btn.addEventListener('click', async function () {
      document.querySelectorAll('#consultations-page .tab-btn').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      const tab = this.dataset.filter;
      if (apiAvailable) {
        await loadConsultationsFromApi(1, tab);
      } else {
        loadConsultations(tab);
      }
    });
  });

  // Settings: theme segmented control
  // restore theme preference
  const savedTheme = localStorage.getItem('theme-mode');
  if (savedTheme && savedTheme !== 'auto') document.documentElement.setAttribute('data-theme', savedTheme);

  document.querySelectorAll('.seg-btn[data-theme]').forEach((b) => {
    b.addEventListener('click', function () {
      document.querySelectorAll('.seg-btn[data-theme]').forEach((x) => x.classList.remove('active'));
      this.classList.add('active');
      const mode = this.dataset.theme;
      if (mode === 'auto') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem('theme-mode', mode);
    });
  });

  // Settings: brand palette
  document.querySelectorAll('.brand-opt').forEach((b) => {
    b.addEventListener('click', function () {
      const map = {
        emerald: ['#10b981', '#059669', 'rgba(16,185,129,0.14)'],
        blue: ['#2563eb', '#1d4ed8', 'rgba(37,99,235,0.12)'],
        violet: ['#7c3aed', '#6d28d9', 'rgba(124,58,237,0.12)'],
      };
      const v = map[this.dataset.brand];
      if (v) {
        const root = document.documentElement;
        root.style.setProperty('--brand', v[0]);
        root.style.setProperty('--brand-600', v[1]);
        root.style.setProperty('--brand-soft', v[2]);
        localStorage.setItem('brand', JSON.stringify(v));
      }
    });
  });

  // Settings: toggles just log
  const notifyToggle = document.getElementById('notify-toggle');
  notifyToggle && notifyToggle.addEventListener('change', () => console.log('notify:', notifyToggle.checked));
  const genBtn = document.getElementById('gen-report-btn');
  genBtn && genBtn.addEventListener('click', appendOneFakeReport);

  // Drug interaction mock
  const drugBtn = document.getElementById('check-drug-btn');
  drugBtn && drugBtn.addEventListener('click', checkDrugInteractions);

  // apply saved brand palette if exists
  try{ const saved = localStorage.getItem('brand'); if(saved){ const [b,b6,bs] = JSON.parse(saved); const root=document.documentElement; root.style.setProperty('--brand', b); root.style.setProperty('--brand-600', b6); root.style.setProperty('--brand-soft', bs); } }catch{}
});

// Bootstrap via API if present
async function bootstrapData(){
  try{
    const ok = await pingApi();
    if(ok){
      apiAvailable = true;
      bindPatientFilters();
      await Promise.all([
        loadPatientsFromApi(),
        loadConsultationsFromApi(),
        loadAppointmentsFromApi(),
        loadReportsFromApi(),
        loadRecordsFromApi(),
        loadRadiationFromApi(),
      ]);
      return;
    }
  }catch(err){ console.warn('bootstrap error', err); }
  // fallback mocks
  loadPatients();
  loadConsultations();
  loadAppointments();
  loadReports();
  loadRecords();
  loadRadiation();
}

async function pingApi(){
  try{ const r = await fetch('/api/health'); return r.ok; }catch{ return false; }
}

// Patients
function loadPatients() {
  const tbody = document.querySelector('#patients-page tbody');
  if (!tbody) return;
  const patients = [
    { name: '金小天', age: 65, gender: '女', phone: '138****7890', diagnosis: '高血压', lastVisit: '2026-01-20', status: 'good', statusText: '良好', avatar: 'images/patient1.png' },
    { name: '张女士', age: 58, gender: '女', phone: '139****1234', diagnosis: '糖尿病', lastVisit: '2026-01-19', status: 'warning', statusText: '需关注', avatar: 'images/patient2.png' },
    { name: '李先生', age: 72, gender: '男', phone: '136****5678', diagnosis: '心脏病', lastVisit: '2026-01-18', status: 'good', statusText: '良好', avatar: 'images/patient3.png' },
    { name: '王女士', age: 55, gender: '女', phone: '137****9012', diagnosis: '高血压', lastVisit: '2026-01-17', status: 'good', statusText: '良好', avatar: 'images/patient1.png' },
    { name: '赵先生', age: 68, gender: '男', phone: '135****3456', diagnosis: '糖尿病', lastVisit: '2026-01-16', status: 'warning', statusText: '需关注', avatar: 'images/patient2.png' },
  ];
  tbody.innerHTML = '';
  patients.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="patient-cell">
          <img src="${p.avatar}" alt="患者" class="table-avatar">
          <span>${p.name}</span>
        </div>
      </td>
      <td>${p.age}岁</td>
      <td>${p.gender}</td>
      <td>${p.phone}</td>
      <td>${p.diagnosis}</td>
      <td>${p.lastVisit}</td>
      <td><span class="status-badge status-${p.status}">${p.statusText}</span></td>
      <td><button class="action-btn" data-name="${p.name}">查看</button></td>`;
    tbody.appendChild(tr);
  });
}

// API with pagination/filters
async function loadPatientsFromApi(page=1,q='',status='全部状态',disease='全部疾病'){
  const tbody = document.querySelector('#patients-page tbody');
  const pager = document.getElementById('patients-pagination');
  if(!tbody) return;
  const res = await fetch(`/api/patients?page=${page}&q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&disease=${encodeURIComponent(disease)}`);
  const data = await res.json();
  tbody.innerHTML = data.items.map(p=>`
    <tr>
      <td><div class="patient-cell"><img src="${p.avatar}" class="table-avatar"><span>${p.name}</span></div></td>
      <td>${p.age}岁</td><td>${p.gender}</td><td>${p.phone}</td>
      <td>${p.diagnosis}</td><td>${p.lastVisit}</td>
      <td><span class="status-badge status-${p.status}">${p.statusText}</span></td>
      <td><button class="action-btn" data-name="${p.name}">查看</button></td>
    </tr>`).join('');
  renderPagination(pager, data.page, data.pages, n=>loadPatientsFromApi(n,q,status,disease));
}

// Consultations
function loadConsultations(filter = 'all') {
  const el = document.getElementById('consultation-list');
  if (!el) return;
  const items = [
    { name: '张女士', avatar: 'images/patient1.png', text: '医生您好，我最近血压有点高...', time: '5分钟前', status: 'unreplied' },
    { name: '李先生', avatar: 'images/patient2.png', text: '请问这个药需要饭前还是饭后吃？', time: '15分钟前', status: 'inprogress' },
    { name: '王女士', avatar: 'images/patient3.png', text: '体检报告出来了，麻烦帮我看看', time: '30分钟前', status: 'resolved' },
    { name: '赵先生', avatar: 'images/patient2.png', text: '今天有点心悸，需要线下就诊吗？', time: '1小时前', status: 'unreplied' },
  ];
  const data = filter === 'all' ? items : items.filter((i) => i.status === filter);
  el.innerHTML = data
    .map(
      (i) => `
      <div class="list-item consultation-item">
        <img src="${i.avatar}" class="patient-avatar" alt="患者">
        <div class="consultation-info">
          <div class="patient-name">${i.name}</div>
          <div class="consultation-message">${i.text}</div>
          <div class="consultation-time">${i.time}</div>
        </div>
        <button class="reply-btn">回复</button>
      </div>`
    )
    .join('');
}

async function loadConsultationsFromApi(page=1,tab='all'){
  const el = document.getElementById('consultation-list');
  const pager = document.getElementById('consultation-pagination');
  if(!el) return;
  const res = await fetch(`/api/consultations?page=${page}&tab=${tab}`);
  const data = await res.json();
  el.innerHTML = data.items.map(i=>`
    <div class="list-item consultation-item">
      <img src="${i.avatar}" class="patient-avatar">
      <div class="consultation-info">
        <div class="patient-name">${i.name}</div>
        <div class="consultation-message">${i.text}</div>
        <div class="consultation-time">${i.time}</div>
      </div>
      <button class="reply-btn">回复</button>
    </div>`).join('');
  renderPagination(pager, data.page, data.pages, n=>loadConsultationsFromApi(n,tab));
}

// Appointments
function loadAppointments() {
  const list = document.getElementById('appointment-list');
  if (!list) return;
  const appts = [
    { time: '09:00', dur: '30分钟', name: '金小天', type: '复诊 · 高血压', startable: true },
    { time: '10:00', dur: '30分钟', name: '赵女士', type: '初诊 · 糖尿病咨询', startable: true },
    { time: '14:00', dur: '30分钟', name: '孙先生', type: '复诊 · 心脏病', startable: false },
  ];
  list.innerHTML = appts
    .map(
      (a) => `
      <div class="appointment-item">
        <div class="appointment-time">
          <div class="time">${a.time}</div>
          <div class="duration">${a.dur}</div>
        </div>
        <div class="appointment-info">
          <div class="patient-name">${a.name}</div>
          <div class="appointment-type">${a.type}</div>
        </div>
        <button class="start-btn ${a.startable ? '' : 'disabled'}">${a.startable ? '开始' : '未到时间'}</button>
      </div>`
    )
    .join('');
}

async function loadAppointmentsFromApi(page=1){
  const list = document.getElementById('appointment-list');
  const pager = document.getElementById('appointment-pagination');
  if(!list) return;
  const res = await fetch(`/api/appointments?page=${page}`);
  const data = await res.json();
  list.innerHTML = data.items.map(a=>`
    <div class="appointment-item">
      <div class="appointment-time"><div class="time">${a.time}</div><div class="duration">${a.dur}</div></div>
      <div class="appointment-info"><div class="patient-name">${a.name}</div><div class="appointment-type">${a.type}</div></div>
      <button class="start-btn ${a.startable ? '' : 'disabled'}">${a.startable ? '开始' : '未到时间'}</button>
    </div>`).join('');
  renderPagination(pager, data.page, data.pages, n=>loadAppointmentsFromApi(n));
}

// Reports
function loadReports() {
  const tbody = document.getElementById('reports-tbody');
  if (!tbody) return;
  const rows = [
    ['RPT-202601-001', '张女士', '血常规', 'WBC 6.4', '3.5-9.5', '正常', '2026-01-20 09:21'],
    ['RPT-202601-002', '李先生', '血糖', 'FPG 7.1', '3.9-6.1', '偏高', '2026-01-19 15:08'],
    ['RPT-202601-003', '王女士', '肝功', 'ALT 22', '7-40', '正常', '2026-01-18 11:33'],
  ];
  tbody.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>
        <td>${r[3]}</td><td>${r[4]}</td>
        <td><span class="status-badge ${r[5] === '正常' ? 'status-good' : 'status-warning'}">${r[5]}</span></td>
        <td>${r[6]}</td>
        <td><button class="action-btn">下载</button></td>
      </tr>`
    )
    .join('');
}

async function loadReportsFromApi(page=1){
  const tbody = document.getElementById('reports-tbody');
  if(!tbody) return;
  const res = await fetch(`/api/reports?page=${page}`);
  const data = await res.json();
  tbody.innerHTML = data.items.map(r=>`
    <tr>
      <td>${r.id}</td><td>${r.patient}</td><td>${r.item}</td>
      <td>${r.result}</td><td>${r.ref}</td>
      <td><span class="status-badge ${r.state==='正常' ? 'status-good':'status-warning'}">${r.state}</span></td>
      <td>${r.time}</td>
      <td><button class="action-btn">下载</button></td>
    </tr>`).join('');
}

function appendOneFakeReport() {
  const tbody = document.getElementById('reports-tbody');
  if (!tbody) return;
  const id = 'RPT-202601-' + String(Math.floor(Math.random() * 900) + 100);
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${id}</td><td>测试患者</td><td>示例项目</td><td>42</td><td>10-50</td><td><span class="status-badge status-good">正常</span></td><td>刚刚</td><td><button class="action-btn">下载</button></td>`;
  tbody.prepend(tr);
}

// Records timeline
function loadRecords() {
  const ul = document.getElementById('records-timeline');
  if (!ul) return;
  const items = [
    { title: '复诊 - 高血压管理', sub: '血压较稳定，建议持续监测', time: '2026-01-20' },
    { title: '检验 - 血糖随访', sub: '空腹血糖偏高，优化用药', time: '2026-01-18' },
    { title: '影像 - 胸片', sub: '无明显异常', time: '2026-01-12' },
  ];
  ul.innerHTML = items
    .map((i) => `<li><div class="tl-title">${i.title} · ${i.time}</div><div class="tl-sub">${i.sub}</div></li>`) 
    .join('');
}

async function loadRecordsFromApi(){
  const ul = document.getElementById('records-timeline');
  if(!ul) return;
  const res = await fetch('/api/records');
  const data = await res.json();
  ul.innerHTML = data.items.map(i=>`<li><div class="tl-title">${i.title} · ${i.time}</div><div class="tl-sub">${i.sub}</div></li>`).join('');
}

// Radiation tracking
function loadRadiation() {
  const tbody = document.getElementById('radiation-tbody');
  const doseEl = document.getElementById('year-dose');
  const cntEl = document.getElementById('exam-count');
  if (!tbody || !doseEl || !cntEl) return;
  const exams = [
    { t: '2026-01-02 10:12', item: 'CT', part: '胸部', dose: 3.2, org: '市三院', memo: '随访' },
    { t: '2025-12-20 14:33', item: 'DR', part: '胸片', dose: 0.1, org: '区人民医院', memo: '咳嗽' },
    { t: '2025-11-05 09:01', item: '核医学', part: '甲状腺扫描', dose: 4.6, org: '省医', memo: '检查' },
  ];
  const year = new Date().getFullYear();
  const yearDose = exams.filter((e) => String(new Date(e.t).getFullYear()) === String(year)).reduce((s, e) => s + e.dose, 0);
  doseEl.textContent = `${yearDose.toFixed(1)} mSv`;
  cntEl.textContent = exams.filter((e) => String(new Date(e.t).getFullYear()) === String(year)).length;
  tbody.innerHTML = exams
    .map((e) => `<tr><td>${e.t}</td><td>${e.item}</td><td>${e.part}</td><td>${e.dose}</td><td>${e.org}</td><td>${e.memo}</td></tr>`)
    .join('');
}

async function loadRadiationFromApi(){
  const tbody = document.getElementById('radiation-tbody');
  const doseEl = document.getElementById('year-dose');
  const cntEl = document.getElementById('exam-count');
  if(!tbody || !doseEl || !cntEl) return;
  const res = await fetch('/api/radiation');
  const data = await res.json();
  doseEl.textContent = `${data.yearDose.toFixed(1)} mSv`;
  cntEl.textContent = data.count;
  tbody.innerHTML = data.items.map(e=>`<tr><td>${e.t}</td><td>${e.item}</td><td>${e.part}</td><td>${e.dose}</td><td>${e.org}</td><td>${e.memo}</td></tr>`).join('');
}

// helpers
function renderPagination(container,page,pages,onClick){
  if(!container) return;
  if(pages<=1){ container.innerHTML=''; return; }
  const mk = (n,label=n,active=false)=>`<button class="page-btn ${active ? 'active':''}" data-page="${n}">${label}</button>`;
  const btns=[]; if(page>1) btns.push(mk(page-1,'上一页'));
  for(let n=1;n<=pages;n++) btns.push(mk(n,n,n===page));
  if(page<pages) btns.push(mk(page+1,'下一页'));
  container.innerHTML = btns.join('');
  container.querySelectorAll('.page-btn').forEach(b=>b.addEventListener('click',()=>onClick(Number(b.dataset.page))));
}

function bindPatientFilters(){
  const q=document.getElementById('patient-q');
  const s=document.getElementById('patient-status');
  const d=document.getElementById('patient-disease');
  if(!(q&&s&&d)) return;
  const refetch=()=>loadPatientsFromApi(1,q.value,s.value,d.value);
  q.oninput = debounce(refetch,300); s.onchange=refetch; d.onchange=refetch;
}

function debounce(fn,wait){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),wait); }; }

// Export helpers (front-end only)
document.addEventListener('DOMContentLoaded',()=>{
  const pdfBtn=document.getElementById('export-pdf-btn');
  const imgBtn=document.getElementById('export-img-btn');
  const target=document.getElementById('reports-section');
  if(!target) return;
  // Lazy import html2canvas & jsPDF from CDN when needed
  async function ensureLibs(){
    if(!window.html2canvas){
      await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
    }
    if(!window.jspdf){
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
    }
  }
  pdfBtn && pdfBtn.addEventListener('click', async()=>{
    await ensureLibs();
    const canvas = await window.html2canvas(target, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p','pt','a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = pageWidth / canvas.width;
    const h = canvas.height * ratio;
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, h);
    pdf.save('健康报告.pdf');
  });
  imgBtn && imgBtn.addEventListener('click', async()=>{
    await ensureLibs();
    const canvas = await window.html2canvas(target, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = '健康报告.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});

function loadScript(src){ return new Promise((resolve,reject)=>{ const s=document.createElement('script'); s.src=src; s.onload=resolve; s.onerror=reject; document.head.appendChild(s); }); }

// Drug interactions (mocked rules)
function checkDrugInteractions() {
  const input = document.getElementById('drug-input');
  const out = document.getElementById('drug-result');
  if (!input || !out) return;
  const names = input.value.split(/[，,]/).map((s) => s.trim()).filter(Boolean);
  if (names.length < 2) {
    out.innerHTML = '<div class="placeholder-text">请输入至少两种药品进行检测</div>';
    return;
  }
  // very simple mocked pairs
  const rules = [
    { pair: ['阿司匹林', '氯吡格雷'], level: '中等', note: '联合用药出血风险增加，注意观察' },
    { pair: ['华法林', '阿莫西林'], level: '轻度', note: '可能影响INR，建议监测' },
    { pair: ['西柚', '阿托伐他汀'], level: '较高', note: '可能升高血药浓度，避免同服' },
  ];
  const res = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i], b = names[j];
      const rule = rules.find((r) => r.pair.includes(a) && r.pair.includes(b));
      res.push({ a, b, level: rule?.level || '未见明显', note: rule?.note || '未检索到已知严重相互作用' });
    }
  }
  out.innerHTML = res
    .map((r) => `<div class="list-item"><div>组合：<b>${r.a}</b> × <b>${r.b}</b></div><div class="meta">风险：${r.level}</div><div style="flex-basis:100%"></div><div style="color:#6b7280">${r.note}</div></div>`) 
    .join('');
}
