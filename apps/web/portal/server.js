// Minimal JSON API server for mock pagination/filtering
// Run: node server.js  (serves /api/* and static /)
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(__dirname);

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  if (pathname.startsWith('/api/')) return handleApi(pathname, query, res);

  // static files
  let filePath = path.join(root, pathname === '/' ? '/index.html' : pathname);
  if (!filePath.startsWith(root)) { res.statusCode = 403; return res.end('Forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('Not Found'); }
    res.setHeader('Content-Type', contentType(filePath));
    res.end(data);
  });
});

function contentType(fp){
  if (fp.endsWith('.html')) return 'text/html; charset=utf-8';
  if (fp.endsWith('.css')) return 'text/css; charset=utf-8';
  if (fp.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (fp.match(/\.(png|jpg|jpeg|gif)$/)) return 'image/png';
  return 'text/plain; charset=utf-8';
}

function send(res, obj){ res.setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(obj)); }

function handleApi(pathname, q, res){
  if (pathname === '/api/health') return send(res, { ok: true, service: 'doctor-web' });

  if (pathname === '/api/patients'){
    const all = mockPatients();
    const page = parseInt(q.page||'1');
    const size = 8;
    const filtered = all.filter(p=>
      (!q.q || p.name.includes(q.q)) &&
      (q.status?.includes('全部') || p.statusText === q.status) &&
      (q.disease?.includes('全部') || p.diagnosis === q.disease)
    );
    return send(res, paginate(filtered, page, size));
  }

  if (pathname === '/api/consultations'){
    const tab = q.tab || 'all';
    let items = mockConsultations();
    if (tab !== 'all') items = items.filter(i=>i.status===tab);
    const page = parseInt(q.page||'1');
    return send(res, paginate(items, page, 6));
  }

  if (pathname === '/api/appointments'){
    const page = parseInt(q.page||'1');
    return send(res, paginate(mockAppointments(), page, 6));
  }

  if (pathname === '/api/reports'){
    const page = parseInt(q.page||'1');
    return send(res, paginate(mockReports(), page, 10));
  }

  if (pathname === '/api/records'){
    return send(res, { items: mockRecords() });
  }

  if (pathname === '/api/radiation'){
    const items = mockRadiation();
    const year = new Date().getFullYear();
    const yearDose = items.filter(e=>new Date(e.t).getFullYear()===year).reduce((s,e)=>s+e.dose,0);
    return send(res, { items, yearDose, count: items.filter(e=>new Date(e.t).getFullYear()===year).length });
  }

  res.statusCode = 404; res.end('Not Found');
}

function paginate(items, page, size){
  const pages = Math.max(1, Math.ceil(items.length/size));
  const start = (page-1)*size; const end = start+size;
  return { items: items.slice(start, end), page, pages, total: items.length };
}

function mockPatients(){
  return [
    { name:'金小天', age:65, gender:'女', phone:'138****7890', diagnosis:'高血压', lastVisit:'2026-01-20', status:'good', statusText:'良好', avatar:'images/patient1.png' },
    { name:'张女士', age:58, gender:'女', phone:'139****1234', diagnosis:'糖尿病', lastVisit:'2026-01-19', status:'warning', statusText:'需关注', avatar:'images/patient2.png' },
    { name:'李先生', age:72, gender:'男', phone:'136****5678', diagnosis:'心脏病', lastVisit:'2026-01-18', status:'good', statusText:'良好', avatar:'images/patient3.png' },
    { name:'王女士', age:55, gender:'女', phone:'137****9012', diagnosis:'高血压', lastVisit:'2026-01-17', status:'good', statusText:'良好', avatar:'images/patient1.png' },
    { name:'赵先生', age:68, gender:'男', phone:'135****3456', diagnosis:'糖尿病', lastVisit:'2026-01-16', status:'warning', statusText:'需关注', avatar:'images/patient2.png' },
    { name:'刘女士', age:61, gender:'女', phone:'138****2222', diagnosis:'心脏病', lastVisit:'2026-01-15', status:'danger', statusText:'危急', avatar:'images/patient3.png' },
    { name:'周先生', age:50, gender:'男', phone:'137****3333', diagnosis:'高血压', lastVisit:'2026-01-15', status:'good', statusText:'良好', avatar:'images/patient1.png' },
    { name:'吴女士', age:62, gender:'女', phone:'136****4444', diagnosis:'糖尿病', lastVisit:'2026-01-14', status:'warning', statusText:'需关注', avatar:'images/patient2.png' },
    { name:'陈先生', age:47, gender:'男', phone:'135****5555', diagnosis:'心脏病', lastVisit:'2026-01-13', status:'good', statusText:'良好', avatar:'images/patient3.png' },
  ];
}

function mockConsultations(){
  return [
    { name:'张女士', avatar:'images/patient1.png', text:'医生您好，我最近血压有点高...', time:'5分钟前', status:'unreplied' },
    { name:'李先生', avatar:'images/patient2.png', text:'请问这个药需要饭前还是饭后吃？', time:'15分钟前', status:'inprogress' },
    { name:'王女士', avatar:'images/patient3.png', text:'体检报告出来了，麻烦帮我看看', time:'30分钟前', status:'resolved' },
    { name:'赵先生', avatar:'images/patient2.png', text:'今天有点心悸，需要线下就诊吗？', time:'1小时前', status:'unreplied' },
    { name:'孙先生', avatar:'images/patient3.png', text:'出院后药物怎么调整？', time:'2小时前', status:'inprogress' },
    { name:'周先生', avatar:'images/patient1.png', text:'头晕两天，血压正常', time:'昨天', status:'resolved' },
  ];
}

function mockAppointments(){
  return [
    { time:'09:00', dur:'30分钟', name:'金小天', type:'复诊 · 高血压', startable:true },
    { time:'10:00', dur:'30分钟', name:'赵女士', type:'初诊 · 糖尿病咨询', startable:true },
    { time:'11:00', dur:'20分钟', name:'周先生', type:'复诊 · 心脏病', startable:true },
    { time:'14:00', dur:'30分钟', name:'孙先生', type:'复诊 · 心脏病', startable:false },
    { time:'15:00', dur:'20分钟', name:'刘女士', type:'复诊 · 糖尿病', startable:false },
  ];
}

function mockReports(){
  const base = [
    ['RPT-202601-001','张女士','血常规','WBC 6.4','3.5-9.5','正常','2026-01-20 09:21'],
    ['RPT-202601-002','李先生','血糖','FPG 7.1','3.9-6.1','偏高','2026-01-19 15:08'],
    ['RPT-202601-003','王女士','肝功','ALT 22','7-40','正常','2026-01-18 11:33'],
    ['RPT-202601-004','赵先生','肾功','Cr 79','59-104','正常','2026-01-18 16:10'],
    ['RPT-202601-005','周先生','血脂','LDL-C 3.4','<3.4','临界','2026-01-17 10:01'],
  ];
  return base.map(r=>({ id:r[0], patient:r[1], item:r[2], result:r[3], ref:r[4], state:r[5], time:r[6] }));
}

function mockRecords(){
  return [
    { title:'复诊 - 高血压管理', sub:'血压较稳定，建议持续监测', time:'2026-01-20' },
    { title:'检验 - 血糖随访', sub:'空腹血糖偏高，优化用药', time:'2026-01-18' },
    { title:'影像 - 胸片', sub:'无明显异常', time:'2026-01-12' },
  ];
}

function mockRadiation(){
  return [
    { t:'2026-01-02 10:12', item:'CT', part:'胸部', dose:3.2, org:'市三院', memo:'随访' },
    { t:'2025-12-20 14:33', item:'DR', part:'胸片', dose:0.1, org:'区人民医院', memo:'咳嗽' },
    { t:'2025-11-05 09:01', item:'核医学', part:'甲状腺扫描', dose:4.6, org:'省医', memo:'检查' },
  ];
}

const PORT = process.env.PORT || 5173;
server.listen(PORT, () => console.log(`doctor-web running at http://localhost:${PORT}`));

