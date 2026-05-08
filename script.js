/* ============================================================
   script.js — ASTRA Portfolio | Shirjan Baral
   ============================================================ */

const API = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

// ─── MINIMAL CURSOR ────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a,button,input,textarea,.about-card,.project-card,.skill-tag,.highlight-item').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); ring.classList.add('hovering'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); ring.classList.remove('hovering'); });
});

// ─── BG CANVAS ─────────────────────────────────────────────────────────────
(function() {
  const c = document.getElementById('bg-canvas');
  const ctx = c.getContext('2d');
  let W, H, t=0;
  const pts = Array.from({length:140}, () => ({
    x: Math.random()*2000, y: Math.random()*2000,
    z: Math.random()*900+100, vz: Math.random()*0.4+0.15
  }));

  function rsz() { W=c.width=innerWidth; H=c.height=innerHeight; }
  rsz(); addEventListener('resize', rsz);

  function proj(x,y,z){ const f=420,s=f/(f+z); return {sx:(x-1000)*s+W/2, sy:(y-1000)*s+H/2, s}; }

  function frame() {
    ctx.clearRect(0,0,W,H);
    t++;
    // bg
    const g=ctx.createRadialGradient(W/2,H*0.4,0,W/2,H*0.4,W*0.9);
    g.addColorStop(0,'rgba(14,10,32,0.97)');
    g.addColorStop(1,'rgba(5,5,8,0.99)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

    // grid
    ctx.save();
    ctx.globalAlpha=0.1; ctx.strokeStyle='#6c63ff'; ctx.lineWidth=0.5;
    const hy=H*0.72, gb=H+80;
    for(let i=0;i<=22;i++){ const x=-W*0.5+(W*2)*i/22; ctx.beginPath(); ctx.moveTo(W/2,hy); ctx.lineTo(x,gb); ctx.stroke(); }
    for(let j=0;j<=10;j++){ const t2=j/10, y=hy+(gb-hy)*t2*t2, xf=0.2+0.8*t2; ctx.beginPath(); ctx.moveTo(W/2+(- W*0.5-W/2)*xf,y); ctx.lineTo(W/2+(W*1.5-W/2)*xf,y); ctx.stroke(); }
    ctx.restore();

    // nebula
    [[W*0.12,H*0.25,350,'rgba(108,99,255,0.07)'],[W*0.88,H*0.65,280,'rgba(255,101,132,0.04)'],[W*0.5,H*0.85,420,'rgba(67,233,123,0.03)']].forEach(([bx,by,br,bc]) => {
      const bg=ctx.createRadialGradient(bx,by,0,bx,by,br);
      bg.addColorStop(0,bc); bg.addColorStop(1,'transparent');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    });

    // stars
    pts.forEach(p => {
      p.z-=p.vz; if(p.z<=0){ p.z=900; p.x=Math.random()*2000; p.y=Math.random()*2000; }
      const {sx,sy,s}=proj(p.x,p.y,p.z);
      if(sx<0||sx>W||sy<0||sy>H) return;
      ctx.beginPath(); ctx.arc(sx,sy,Math.max(0.3,1.5*s),0,Math.PI*2);
      ctx.fillStyle=`rgba(180,170,255,${Math.min(0.9,s*2)})`; ctx.fill();
    });

    requestAnimationFrame(frame);
  }
  frame();
})();

// ─── HERO 3D CANVAS (Orbiting rings around photo) ─────────────────────────
(function() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let t = 0;
  let mouse = { x: 0, y: 0 };

  document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 0.5;
    mouse.y = (e.clientY / innerHeight - 0.5) * 0.5;
  });

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  setTimeout(resize, 50); addEventListener('resize', resize);

  // Orbiting dots config
  const orbits = [
    { radius: 175, count: 6,  speed: 0.008, size: 4,   color: '108,99,255',  offset: 0 },
    { radius: 210, count: 10, speed: -0.005, size: 2.5, color: '255,101,132', offset: 1 },
    { radius: 245, count: 8,  speed: 0.006, size: 3,   color: '67,233,123',  offset: 2 },
  ];

  function draw() {
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    ctx.clearRect(0, 0, W, H);
    t += 0.01;

    // Subtle radial bg glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 280);
    glow.addColorStop(0, 'rgba(108,99,255,0.08)');
    glow.addColorStop(0.5, 'rgba(108,99,255,0.03)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Draw elliptical orbits (tilt effect)
    orbits.forEach(orb => {
      // Draw orbit path
      ctx.beginPath();
      ctx.ellipse(cx, cy, orb.radius, orb.radius * 0.3, mouse.x * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${orb.color},0.08)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw dots on orbit
      for (let i = 0; i < orb.count; i++) {
        const angle = t * orb.speed * 100 + (i / orb.count) * Math.PI * 2 + orb.offset;
        const tilt = 0.3 + mouse.y * 0.2;
        const x = cx + Math.cos(angle) * orb.radius;
        const y = cy + Math.sin(angle) * orb.radius * tilt;
        const depth = (Math.sin(angle) + 1) / 2; // 0 to 1 for depth
        const alpha = 0.3 + depth * 0.7;
        const size = orb.size * (0.5 + depth * 0.8);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${orb.color},${alpha})`;
        ctx.shadowColor = `rgba(${orb.color},0.8)`;
        ctx.shadowBlur = size * 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Rotating arc lines around photo
    for (let i = 0; i < 3; i++) {
      const angle = t * 0.4 + (i / 3) * Math.PI * 2;
      const r = 155;
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle, angle + 0.6);
      ctx.strokeStyle = `rgba(108,99,255,${0.4 + i * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const angle = -t * 0.3 + (i / 3) * Math.PI * 2;
      const r = 162;
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle, angle + 0.4);
      ctx.strokeStyle = `rgba(255,101,132,0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── ABOUT 3D CANVAS (Icosahedron) ────────────────────────────────────────
(function(){
  const canvas=document.getElementById('about-3d');
  const ctx=canvas.getContext('2d');
  let t=0;

  function resize(){ canvas.width=canvas.offsetWidth||400; canvas.height=300; }
  setTimeout(resize,100); addEventListener('resize',resize);

  const phi=(1+Math.sqrt(5))/2;
  const verts=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]].map(([x,y,z])=>{const l=Math.sqrt(x*x+y*y+z*z);return[x/l,y/l,z/l];});
  const edges=[[0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],[2,3],[2,6],[2,10],[2,11],[2,4],[3,4],[3,6],[3,8],[3,9],[4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],[7,8],[7,10],[8,9],[10,11]];

  function rX(v,a){return[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)];}
  function rY(v,a){return[v[0]*Math.cos(a)+v[2]*Math.sin(a),v[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)];}

  function draw(){
    const W=canvas.width||400, H=canvas.height||300, cx=W/2, cy=H/2;
    ctx.clearRect(0,0,W,H); t+=0.007;
    const sc=Math.min(W,H)*0.35;

    const proj=verts.map(v=>{
      let r=rY(v,t*0.7); r=rX(r,t*0.4);
      const z=r[2]+2.5,f=300;
      return[cx+r[0]*f/z*sc/f*f*0.006,cy-r[1]*f/z*sc/f*f*0.006,1/z];
    });

    edges.forEach(([a,b])=>{
      const pa=proj[a],pb=proj[b],depth=(pa[2]+pb[2])/2;
      const g=ctx.createLinearGradient(pa[0],pa[1],pb[0],pb[1]);
      g.addColorStop(0,`rgba(108,99,255,${depth*3})`);
      g.addColorStop(0.5,`rgba(255,101,132,${depth*2})`);
      g.addColorStop(1,`rgba(67,233,123,${depth*3})`);
      ctx.beginPath(); ctx.moveTo(pa[0],pa[1]); ctx.lineTo(pb[0],pb[1]);
      ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.stroke();
    });

    proj.forEach(p=>{
      ctx.beginPath(); ctx.arc(p[0],p[1],Math.min(4,p[2]*18),0,Math.PI*2);
      ctx.fillStyle=`rgba(108,99,255,${Math.min(1,p[2]*5)})`;
      ctx.shadowColor='#6c63ff'; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=0;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── LOAD PROJECTS FROM API ────────────────────────────────────────────────
const COLORS = ['108,99,255','67,233,123','255,101,132'];

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  try {
    const res = await fetch(`${API}/api/projects`);
    const { data } = await res.json();
    if (!data || data.length === 0) { grid.innerHTML = '<div class="loading-projects">No projects yet.</div>'; return; }

    grid.innerHTML = '';
    data.forEach((proj, i) => {
      const card = document.createElement('div');
      card.className = `project-card${i===0?' featured':''} reveal`;
      const canvasId = `proj-c-${i}`;
      card.innerHTML = `
        <div class="proj-num">0${i+1}</div>
        <div class="proj-preview"><canvas id="${canvasId}"></canvas><div class="proj-overlay"></div></div>
        <div class="proj-body">
          <div class="proj-tags">${(proj.tags||[]).map(t=>`<span class="proj-tag">${t}</span>`).join('')}</div>
          <div class="proj-title">${proj.title}</div>
          <p class="proj-desc">${proj.description}</p>
          ${proj.link && proj.link!=='#' ? `<a href="${proj.link}" class="proj-link" target="_blank">View Project ——</a>` : '<span class="proj-link" style="opacity:0.4">Coming Soon</span>'}
        </div>`;
      grid.appendChild(card);
      setTimeout(() => makeCanvas(canvasId, proj.color || COLORS[i%3], COLORS[(i+1)%3]), 200);
      observer.observe(card);
    });
  } catch(e) {
    grid.innerHTML = '<div class="loading-projects">Could not load projects. Make sure server is running.</div>';
    // Fallback static projects
    renderStaticProjects();
  }
}

function renderStaticProjects() {
  const grid = document.getElementById('projects-grid');
  const fallback = [
    {title:'Full-Stack Task Manager',description:'A Django + React task management app with user auth, real-time updates, and a PostgreSQL backend.',tags:['React','Django','PostgreSQL','TypeScript'],color:'108,99,255',featured:true},
    {title:'Nepal Dev Community',description:'Next.js community platform for Nepal devs — blog posts, resource sharing, and a job board. MongoDB + Express API.',tags:['Next.js','Node.js','MongoDB'],color:'67,233,123'},
    {title:'Student Budget Tracker',description:'Mobile-friendly budgeting app built with Next.js and PostgreSQL. Tracks expenses and shows spending insights.',tags:['Next.js','PostgreSQL','TypeScript','Figma'],color:'255,101,132'},
  ];
  grid.innerHTML = '';
  fallback.forEach((proj,i)=>{
    const card=document.createElement('div');
    card.className=`project-card${i===0?' featured':''} reveal`;
    const cid=`proj-fb-${i}`;
    card.innerHTML=`<div class="proj-num">0${i+1}</div><div class="proj-preview"><canvas id="${cid}"></canvas><div class="proj-overlay"></div></div><div class="proj-body"><div class="proj-tags">${proj.tags.map(t=>`<span class="proj-tag">${t}</span>`).join('')}</div><div class="proj-title">${proj.title}</div><p class="proj-desc">${proj.description}</p><span class="proj-link" style="opacity:0.4"> →</span></div>`;
    grid.appendChild(card);
    setTimeout(()=>makeCanvas(cid,proj.color,COLORS[(i+1)%3]),200);
    observer.observe(card);
  });
}

function makeCanvas(id, colorA, colorB) {
  const canvas=document.getElementById(id);
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  let t=0;
  function resize(){ canvas.width=canvas.offsetWidth||400; canvas.height=canvas.offsetHeight||200; }
  setTimeout(resize,50);
  function draw(){
    const W=canvas.width||400, H=canvas.height||200;
    ctx.clearRect(0,0,W,H); t+=0.012;
    const g=ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'#0d0d18'); g.addColorStop(1,'#050508');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    for(let i=0;i<5;i++){
      const r=50+i*35+Math.sin(t+i)*12;
      ctx.beginPath(); ctx.arc(W/2+Math.cos(t*0.6+i)*25, H/2+Math.sin(t*0.4+i)*15, r, 0, Math.PI*2);
      ctx.strokeStyle=`rgba(${colorA},${0.18-i*0.03})`; ctx.lineWidth=1; ctx.stroke();
    }
    ctx.globalAlpha=0.07; ctx.strokeStyle=`rgba(${colorA},1)`; ctx.lineWidth=0.5;
    for(let x=0;x<W;x+=36){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y=0;y<H;y+=36){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.globalAlpha=1;
    for(let i=0;i<8;i++){
      const ang=t*0.5+(i/8)*Math.PI*2, rad=65+Math.sin(t+i*0.7)*25;
      const x=W/2+Math.cos(ang)*rad, y=H/2+Math.sin(ang)*rad*0.55;
      ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(${colorB},0.85)`; ctx.shadowColor=`rgba(${colorB},0.6)`; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ─── CONTACT FORM ──────────────────────────────────────────────────────────
async function submitContact(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('form-status');
  btn.textContent = 'Sending...'; btn.disabled = true;
  status.className = 'form-status'; status.style.display = 'none';

  const body = {
    name: document.getElementById('form-name').value,
    email: document.getElementById('form-email').value,
    subject: document.getElementById('form-subject').value,
    message: document.getElementById('form-message').value
  };

  try {
    const res = await fetch(`${API}/api/contact`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) {
      status.textContent = data.message || 'Message sent!';
      status.className = 'form-status success';
      document.getElementById('contact-form').reset();
    } else {
      status.textContent = data.error || 'Something went wrong.';
      status.className = 'form-status error';
    }
  } catch {
    status.textContent = 'Server not reachable. Please email me directly.';
    status.className = 'form-status error';
  }
  btn.textContent = 'Send Message →'; btn.disabled = false;
}

// ─── SCROLL REVEAL ─────────────────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── INIT ──────────────────────────────────────────────────────────────────
loadProjects();