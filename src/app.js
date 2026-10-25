import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);
const palette = { cream: '#f5f3ec', mint: '#a9d4b8', lilac: '#bbaed4', orange: '#edb58a', yellow: '#eddaa1', blue: '#acd0dd', white: '#faf9ef', dark: '#637c75' };
const stateText = { good: '順利推進', watch: '需要協作', blocked: '目前卡關' };
const stateColor = { good: palette.mint, watch: palette.orange, blocked: '#d87b6b' };
const replyTemplates = [
 ['收到，安排處理', '已收到您的訊息，我會安排負責窗口確認，並於今天下班前回報處理進度。'],
 ['請補充資訊', '為了加快處理，請協助補充問題發生時間、影響範圍與相關紀錄，謝謝。'],
 ['邀請協作討論', '建議今天安排 15 分鐘跨單位討論，先釐清卡點、負責人與預計完成時間。請回覆方便的時段。'],
 ['確認交付時間', '請協助確認最早可交付時間，並提供可先交付的替代方案，方便我們調整後續排程。']
];
const people = [
 ['林專員', '專案協調', '201'], ['陳工程師', '現場執行', '202'], ['許專員', '品質驗證', '203'], ['王研究員', '研發設計', '301'], ['李專員', '行政統籌', '302'], ['周專員', '採購協調', '401'], ['黃專員', '運輸調度', '402']
];
function unit(id, name, owner, progress, quality, state, issue, next, deliverable) {
 return { id, name, owner, progress, quality, state, issue, next, deliverable, members: [owner, (owner + 1) % people.length] };
}
const scenarios = [
 {
  name: '曙光・智慧製造計畫', subtitle: '把每一次協作，組成更好的明天。', caption: '製造示範 · 第 3 / 6 週 · 所有窗口皆為虛構', qualityLabel: '整體良率',
  units: [
   unit('ops1','01 組裝產線',0,82,98.2,'good','本週無重大阻礙。','完成最後一批組裝，交由品質中心抽驗。','原型機 120 台'),
   unit('ops2','02 精密加工',1,56,91.8,'blocked','主軸感測器缺料，影響第二批加工排程。','採購確認替代料件，下午安排小量試產。','精密零件 360 組'),
   unit('quality','品質驗證中心',2,71,96.4,'watch','測試規格等待研發確認，尚有 8 項待複驗。','14:00 前確認公差規格，完成複驗清單。','驗證報告 v2'),
   unit('rd','研發設計中心',3,88,99.2,'good','核心設計已通過，等待驗證回饋。','發布圖面 v3，回覆品質中心測試規格。','設計圖面 v3'),
   unit('admin','專案行政中心',4,94,100,'good','本週簽核已完成。','彙整里程碑報告與下階段資源需求。','里程碑報告'),
   unit('supply','採購資源站',5,63,95.1,'blocked','感測器交期延後，替代供應商待確認。','取得替代料報價與交期，回覆加工產線。','感測器 24 組'),
   unit('port','港口物流中心',6,76,98.5,'watch','貨櫃待海關文件補件，預估延後半天。','補齊貨運文件並調整末端配送車次。','出貨批次 B-02')
  ],
  messages: [
   {unit:'supply',subject:'感測器交期異動，需要確認替代料',text:'原供應商通知感測器交期延後 2 天，第二批加工可能受影響。替代供應商可提供 24 組，請協助確認是否進行小量驗證。',time:'10:42'},
   {unit:'quality',subject:'測試規格 v2：8 項公差待確認',text:'本輪驗證已完成 71%，其中 8 項需要研發確認公差範圍。收到規格後即可安排複驗，請協助回覆確認。',time:'09:25'},
   {unit:'port',subject:'貨櫃 B-02 補件與配送安排',text:'到港貨櫃尚缺一份貨運文件，預估影響半天。請協助補齊附件，我們將同步協調下午配送車次。',time:'08:50'}
  ],
  resources: [['主軸感測器','採購資源站','缺料','24 組','待確認','精密加工'],['鋁合金外殼','港口物流中心','在途','120 件','今天 16:00','組裝產線'],['測試治具','研發設計中心','已到貨','8 組','已簽收','品質驗證中心']],
  phases: [['需求定義','第 1 週','done'],['原型開發','第 2 週','done'],['整合與驗證','第 3–4 週','current'],['量產交付','第 5–6 週','']],
 },
 {
  name: '竹光・智慧校園計畫', subtitle: '讓教室裡的好點子，走進每一天。', caption: '校園示範 · 第 4 / 6 週 · 非校務即時資料', qualityLabel: '驗收通過率',
  units: [
   unit('ops1','01 數位共備教室',0,90,99,'good','教材共備按進度完成。','邀請教師完成下一輪試教與回饋。','共備教案 12 份'),
   unit('ops2','02 智慧教室',1,68,94,'watch','兩間教室仍在等待平板設定。','資訊窗口完成設定後安排班級測試。','平板 60 台'),
   unit('quality','教學驗證中心',2,58,89,'blocked','無線網路涵蓋仍有死角，影響試教。','下午進行訊號量測，調整基地台位置。','試教回饋報告'),
   unit('rd','課程研發中心',3,86,98,'good','課程架構已完成。','完成差異化學習單與教學影片。','課程模組 6 組'),
   unit('admin','校務行政中心',4,92,100,'good','設備採購簽核完成。','確認研習名單與校內推廣時程。','推廣與研習計畫'),
   unit('supply','設備資源站',5,74,96,'watch','充電車待到貨，暫用分組充電方案。','追蹤配送並準備設備點交清冊。','充電車 2 台'),
   unit('port','校外合作窗口',6,85,99,'good','合作單位已確認研習支援。','彙整講師需求，安排交通與設備。','研習支援 2 場')
  ],
  messages: [
   {unit:'quality',subject:'試教網路出現死角，請協助量測',text:'今天的試教在教室後排出現斷線狀況，影響分組活動。請資訊窗口協助量測訊號，並確認改善方式。',time:'11:10'},
   {unit:'supply',subject:'充電車配送時間待確認',text:'設備商已安排出貨，仍待確認到校時間。可先採分組充電，請協助確認設備暫放位置與點交窗口。',time:'10:05'},
   {unit:'rd',subject:'邀請參與差異化教材共備',text:'課程架構已完成，邀請各領域教師一起討論差異化學習單。請回覆方便時段，我們將整理共備議程。',time:'09:00'}
  ],
  resources: [['無線基地台','設備資源站','缺料','2 台','明天 09:00','教學驗證中心'],['平板充電車','設備資源站','在途','2 台','待確認','智慧教室'],['教學材料包','校外合作窗口','已到貨','60 份','已簽收','數位共備教室']],
  phases: [['需求盤點','第 1 週','done'],['課程共備','第 2–3 週','done'],['設備與試教','第 4–5 週','current'],['成果分享','第 6 週','']]
 }
];
let scenarioIndex = 0, selectedId = null, selectedMail = 0, toastTimer;
const drafts = new Map();
const data = () => scenarios[scenarioIndex];
const getUnit = (id) => data().units.find(u => u.id === id);
const avg = (key) => data().units.reduce((sum,u) => sum + u[key],0) / data().units.length;
const urgentUnits = () => [...data().units].sort((a,b) => ({blocked:0,watch:1,good:2}[a.state] - {blocked:0,watch:1,good:2}[b.state]) || a.progress - b.progress).slice(0,3);
const mailAddress = (u) => `${u.id}@example.com`;
function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 3500); }
function showModal(id) { $('drawer').close(); for (const d of document.querySelectorAll('dialog[open]')) d.close(); $(id).showModal(); }
for (const button of document.querySelectorAll('[data-close]')) button.onclick = () => $(button.dataset.close).close();
for (const dialog of document.querySelectorAll('dialog.modal')) dialog.addEventListener('click', (e) => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close(); } });
function renderHUD() {
 $('projectName').textContent = data().name; $('projectSubtitle').textContent = data().subtitle; $('sampleCaption').textContent = data().caption;
 const progress = Math.round(avg('progress')); $('overallProgress').innerHTML = `${progress}<small>%</small>`; $('overallBar').style.width = `${progress}%`;
 $('qualityLabel').textContent = data().qualityLabel; $('overallYield').textContent = `${avg('quality').toFixed(1)}%`;
 const blocked = data().units.filter(u => u.state === 'blocked').length; $('blockerCount').textContent = `${blocked} 件`;
 $('progressNote').textContent = `${data().units.length} 個單位協作中`; $('projectStatus').textContent = blocked ? '優先排除卡點' : '穩定推進';
 const focus = urgentUnits()[0]; $('focusTitle').textContent = focus.name; $('focusText').textContent = focus.issue; $('focusButton').onclick = () => openUnit(focus.id);
 $('mailCount').textContent = $('dockCount').textContent = data().messages.length;
 updateMapData();
}

let scene, camera, renderer, controls;
const groups = new Map(), unitLabels = new Map(), lights = new Map(), animatedFlows = [], vehicles = [], zoneLabels = [];
let selectionRing, elapsed=0, previous=0, animationPaused=matchMedia('(prefers-reduced-motion: reduce)').matches;
const materials = new Map();
function mat(color) { if (!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.82})); return materials.get(color); }
function mesh(geo,color,parent,x=0,y=0,z=0) { const m=new THREE.Mesh(geo,mat(color)); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; }
function box(w,h,d,color,parent,x=0,y=0,z=0) { return mesh(new THREE.BoxGeometry(w,h,d),color,parent,x,y,z); }
function cylinder(r1,r2,h,color,parent,x=0,y=0,z=0) { return mesh(new THREE.CylinderGeometry(r1,r2,h,20),color,parent,x,y,z); }
function ball(r,color,parent,x=0,y=0,z=0) { return mesh(new THREE.SphereGeometry(r,12,8),color,parent,x,y,z); }
function tree(x,z,scale=1) { const g=new THREE.Group(); scene.add(g); g.position.set(x,.45,z); g.scale.setScalar(scale); cylinder(.075,.11,.8,'#baac8e',g,0,.4); ball(.5,'#b6caa1',g,0,1.15); ball(.38,'#c4d5ae',g,.22,1.35,-.08); }
function person(x,z,color=palette.lilac) { const g=new THREE.Group();scene.add(g);g.position.set(x,.44,z);cylinder(.12,.16,.4,color,g,0,.38);ball(.13,'#eed4b7',g,0,.73);box(.09,.27,.1,'#6c7e79',g,-.075,.13);box(.09,.27,.1,'#6c7e79',g,.075,.13); }
function building(id,x,z,w,d,h,color,style='office') {
 const g=new THREE.Group();g.position.set(x,.43,z);g.userData.unit=id;scene.add(g);groups.set(id,g);
 box(w+.4,.18,d+.4,'#e0e2d3',g,0,.09);box(w,h,d,color,g,0,h/2+.18);box(w+.16,.17,d+.16,palette.white,g,0,h+.25);
 if(style==='office') {
  for(let row=0;row<Math.floor(h/.62);row++) for(let col=0;col<3;col++) {
   box(w/4-.13,.31,.045,'#749b9a',g,(col-1)*w/3,.65+row*.62,d/2+.026);
   box(.045,.31,d/4-.13,'#88abaa',g,w/2+.026,.65+row*.62,(col-1)*d/3);
  }
  box(.6,.8,.06,'#648a88',g,0,.58,d/2+.05);box(w*.7,.13,.7,palette.white,g,0,1.04,d/2+.3);
  box(.7,.4,.7,'#e1e3d6',g,w*.2,h+.52,0);box(.5,.07,.5,'#b7c6ba',g,w*.2,h+.76,0);
 } else {
  for(let i=0;i<3;i++)box(.6,.52,.06,'#8ba9a3',g,(i-1)*w/3,1.25,d/2+.04);
  box(.8,.9,.07,'#829b8f',g,0,.6,d/2+.05);
  for(let i=0;i<2;i++)cylinder(.18,.23,.65,'#e7e5d8',g,(i-.5)*1.3,h+.64,-.5);
 }
 const lamp=ball(.13,'#d87b6b',g,w/2-.3,h+.51,d/2-.3);lamp.material=new THREE.MeshStandardMaterial({color:'#db7767',emissive:'#d34737',emissiveIntensity:.5});lights.set(id,lamp);
 const label=document.createElement('button');label.className='map-label';label.dataset.unit=id;label.onclick=()=>openUnit(id);$('labels').append(label);unitLabels.set(id,{element:label,anchor:new THREE.Vector3(x,h+1.3,z),height:h});
 return g;
}
function machine(parent,x,z,color) {
 box(1,.13,.8,'#c8ccc1',parent,x,.32,z);box(.8,.65,.65,color,parent,x,.68,z);box(.3,.26,.06,'#657e78',parent,x, .82,z+.35);box(1.12,.09,.23,'#e8e8dc',parent,x,.5,z+.5);cylinder(.035,.035,.3,'#83958c',parent,x+.25,1.15,z);ball(.07,'#e9c879',parent,x+.25,1.33,z);
}
function createFlow(a,b,color,height=4) {
 const ga=groups.get(a),gb=groups.get(b);const start=new THREE.Vector3(ga.position.x,2.6,ga.position.z),end=new THREE.Vector3(gb.position.x,2.6,gb.position.z);
 const curve=new THREE.CubicBezierCurve3(start,new THREE.Vector3(start.x,height,start.z),new THREE.Vector3(end.x,height,end.z),end);
 const m=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.028,5,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.28}));scene.add(m);
 const particles=[];for(let i=0;i<3;i++) { const p=ball(.075,color,scene);p.castShadow=false;particles.push(p); }animatedFlows.push({curve,particles});
}
function makeTruck(offset,color) {
 const g=new THREE.Group();scene.add(g);box(1.1,.65,.65,color,g,-.2,.8);box(.48,.5,.65,palette.white,g,.57,.7);box(.04,.22,.53,'#89a6aa',g,.82,.82);box(1.65,.13,.63,'#8f9e91',g,0,.4);
 for(const x of [-.55,.52])for(const z of [-.35,.35]) { const tire=cylinder(.16,.16,.12,'#64746b',g,x,.31,z);tire.rotation.x=Math.PI/2; }
 vehicles.push({g,kind:'truck',offset});
}
function makeShip(offset,color) {
 const g=new THREE.Group();scene.add(g);const hull=new THREE.Shape();hull.moveTo(-1.7,-.5);hull.lineTo(.95,-.5);hull.lineTo(1.65,0);hull.lineTo(.95,.5);hull.lineTo(-1.7,.5);hull.closePath();
 const hullMesh=mesh(new THREE.ExtrudeGeometry(hull,{depth:.35,bevelEnabled:true,bevelThickness:.1,bevelSize:.1,bevelSegments:1}),palette.white,g);hullMesh.rotation.x=-Math.PI/2;hullMesh.position.y=.35;
 box(2.5,.1,.83,'#b9c2ae',g,-.2,.78);box(.45,.7,.7,palette.white,g,-1.1,1.12);box(.1,.18,.5,'#7d999a',g,-.85,1.3);for(let i=0;i<3;i++)box(.45,.43,.62,i%2?palette.lilac:color,g,i*.51-.55,1.05);
 vehicles.push({g,kind:'ship',offset});
}
function initWorld() {
 scene=new THREE.Scene();scene.background=new THREE.Color(palette.cream);
 renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(palette.cream);
 camera=new THREE.OrthographicCamera(-25,25,20,-20,.1,180);camera.position.set(34,34,34);
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableRotate=false;controls.enableDamping=false;controls.screenSpacePanning=true;controls.minZoom=.6;controls.maxZoom=2.5;controls.mouseButtons.LEFT=THREE.MOUSE.PAN;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;controls.touches.ONE=THREE.TOUCH.PAN;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;controls.update();
 scene.add(new THREE.HemisphereLight('#ffffff','#c0c7a9',1.8));const sun=new THREE.DirectionalLight('#fff5df',2.1);sun.position.set(-14,25,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:.5,far:70});sun.shadow.normalBias=.05;sun.shadow.bias=-.0002;sun.shadow.radius=4;scene.add(sun);
 const floor=box(200,.1,200,palette.cream,scene,0,-.72);floor.castShadow=false;floor.material=new THREE.ShadowMaterial({color:'#5d6b52',opacity:.12});
 box(31,.75,22,'#dedecd',scene,0,-.08);box(30.9,.16,21.9,'#eaebdc',scene,0,.36);
 // Three programmatic districts share the campus project's box/material-cache pattern.
 box(20,.09,6.3,'#e4e0ed',scene,-3,.49,-6.4);box(17,.08,9.5,'#e0eadb',scene,-4.5,.49,3);box(5.5,.09,14,'#eee6d1',scene,8,.49,-.5);
 box(5.3,.19,21.5,'#bbd9dc',scene,12.7,.47,0);box(.35,.17,21.6,'#f4edda',scene,9.9,.58,0);
 for(let i=0;i<18;i++) { const wave=box(.04,.015,1+(i%3)*.5,'#d6e8e4',scene,10.5+(i%4)*1.15,.58,-9+Math.floor(i/4)*4);wave.castShadow=false; }
 // A complete road loop; animated vehicles follow its rounded corners.
 const roadColor='#c4c9bd';box(27,.03,1.5,roadColor,scene,-1,.57,-2.1);box(27,.03,1.5,roadColor,scene,-1,.57,8.5);box(1.5,.03,12.1,roadColor,scene,-13.75,.57,3.2);box(1.5,.03,12.1,roadColor,scene,8.5,.57,3.2);
 for(let i=0;i<22;i++)for(const z of [-2.1,8.5])box(.55,.012,.06,'#f4f2e7',scene,-13+i,.599,z);
 for(let i=0;i<9;i++)for(const x of [-13.75,8.5])box(.06,.012,.5,'#f4f2e7',scene,x,.599,-1+i);
 for(let i=0;i<5;i++)box(.12,.014,1.2,palette.white,scene,1+i*.25,.603,-2.1);
 building('rd',-7,-6.6,3.7,3.4,3.1,palette.lilac);building('admin',-.8,-6.6,3.8,3.2,3.9,palette.yellow);
 building('supply',6.4,-6.3,3.7,3.4,2.15,palette.orange,'warehouse');
 building('ops1',-8,2.5,4,3.5,1.75,palette.mint,'warehouse');building('ops2',-1.9,2.5,3.5,3.5,1.9,palette.orange,'warehouse');building('quality',3.3,2.5,3,3.5,2.4,palette.blue);
 const port=building('port',7,5.6,2.4,2.2,1.5,palette.blue,'warehouse');box(2,.12,4,'#e7ddc3',port,2,.1,0);
 for(const id of ['ops1','ops2']) { const g=groups.get(id);for(let i=0;i<3;i++)machine(g,(i-1)*1.15,2.75,id==='ops1'?palette.mint:palette.orange);box(4.1,.13,.7,'#bcc5ba',g,0,.2,3.2); }
 // Rooftop solar modules, cooling fans, freight crane, pallets and tiny city life.
 for(let i=0;i<4;i++) { const panel=box(.6,.07,1,'#7b9ca6',groups.get('rd'),(i-1.5)*.72,3.65,0);panel.rotation.z=-.12; }
 box(.25,4.1,.25,palette.yellow,scene,9,2.6,-.3);box(3.2,.2,.22,palette.yellow,scene,10,4.6,-.3);box(.03,2,.03,'#9ba996',scene,11.4,3.6,-.3);box(.35,.2,.35,palette.dark,scene,11.4,2.6,-.3);
 for(let i=0;i<5;i++)box(1.25,.7,.7,i%2?palette.lilac:palette.orange,scene,7.8,.94,-.9+i*.92);
 for(const [x,z,s]of[[-12,-8,1.1],[-11,-4,1],[-3.6,-8.7,.8],[2.6,-8.9,1],[-11,6.5,.8],[-5.6,6.5,1],[-4.4,6.5,.8],[.5,6.8,.9],[4.7,6.9,.9],[-11,-9.2,.8],[-12,0,1]])tree(x,z,s);
 for(const [x,z,c]of[[-5.2,-3.6,palette.lilac],[-3,-3.6,palette.orange],[2,-4,palette.mint],[-6,7,palette.blue],[5,7,palette.orange],[5.5,0,palette.lilac],[-11,0,palette.yellow]])person(x,z,c);
 // Park benches and planters.
 for(const x of [-5,1]) {box(1.4,.12,.4,'#c4b599',scene,x,.82,7.2);box(.12,.35,.4,'#a3afa0',scene,x-.5,.63,7.2);box(.12,.35,.4,'#a3afa0',scene,x+.5,.63,7.2);}
 createFlow('rd','ops2','#bba2da',6);createFlow('admin','quality','#e2ba74',6);createFlow('supply','ops2','#dca181',5);createFlow('quality','rd','#82b8a5',6.3);createFlow('port','ops1','#8dbbc8',5);
 makeTruck(0,palette.orange);makeTruck(.42,palette.lilac);makeTruck(.72,palette.mint);makeShip(0,palette.orange);makeShip(.53,palette.mint);
 selectionRing=new THREE.Mesh(new THREE.RingGeometry(2.2,2.3,64),new THREE.MeshBasicMaterial({color:'#65977b',side:THREE.DoubleSide,transparent:true,opacity:.85}));selectionRing.rotation.x=-Math.PI/2;selectionRing.position.y=.66;selectionRing.visible=false;scene.add(selectionRing);
 for(const [text,x,z] of [['01 / 核心作業區',-7,8.8],['02 / 研發與行政中心',-5,-10.1],['03 / 物流與外部資源',11,9.4]]) { const el=document.createElement('div');el.className='zone-label';el.textContent=text;$('labels').append(el);zoneLabels.push({element:el,anchor:new THREE.Vector3(x,.7,z)}); }
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let start=null;
 const hits=(e)=>{ const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects([...groups.values()],true);};
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.isPrimary)start={x:e.clientX,y:e.clientY,id:e.pointerId};});
 renderer.domElement.addEventListener('pointerup',e=>{if(!start||e.pointerId!==start.id)return;const distance=Math.hypot(e.clientX-start.x,e.clientY-start.y);start=null;if(distance>6)return;const hit=hits(e)[0];if(hit){let node=hit.object;while(node&&!node.userData.unit)node=node.parent;if(node)openUnit(node.userData.unit);}});
 renderer.domElement.addEventListener('pointercancel',()=>start=null);
 renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons)return;renderer.domElement.style.cursor=hits(e).length?'pointer':'grab';});
 renderer.domElement.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const v=new THREE.Vector3(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,0,e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0);camera.position.add(v);controls.target.add(v);}if(e.key==='+'||e.key==='=')zoom(1.15);if(e.key==='-')zoom(1/1.15);if(e.key==='Home')resetView();});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('loading').hidden=false;$('loading').textContent='3D 顯示已中斷，請重新開啟 HTML。協作單位與報告仍可使用。';});
 new ResizeObserver(resize).observe($('viewport'));resize();updatePauseButton();requestAnimationFrame(animate);$('loading').hidden=true;$('world').dataset.ready='true';
}
function resize() {if(!renderer)return;const w=$('viewport').clientWidth,h=$('viewport').clientHeight;renderer.setSize(w,h,false);const aspect=w/h;const span=aspect<1?38/aspect:28;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();}
function zoom(factor) {if(!camera)return;camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.6,2.5);camera.updateProjectionMatrix();}
function resetView() {if(!camera)return;camera.position.set(34,34,34);controls.target.set(0,0,0);camera.zoom=1;camera.updateProjectionMatrix();controls.update();}
function locateUnit(id) {
 selectedId=id;const g=groups.get(id);if(!g)return;selectionRing.visible=true;selectionRing.position.set(g.position.x,.67,g.position.z);
 const offset=new THREE.Vector3().subVectors(camera.position,controls.target);controls.target.set(g.position.x,0,g.position.z);camera.position.copy(controls.target).add(offset);controls.update();updateMapData();
}
function updateMapData() {
 for(const u of data().units){const label=unitLabels.get(u.id);if(label){label.element.innerHTML=`<i class="dot ${u.state==='good'?'mint':u.state==='watch'?'orange':'red'}"></i>${u.name}`;label.element.dataset.state=u.state;label.element.setAttribute('aria-label',`${u.name}，${stateText[u.state]}，完成 ${u.progress}%`);label.element.classList.toggle('selected',u.id===selectedId);}const light=lights.get(u.id);if(light){light.visible=u.state==='blocked';}}
}
function projectLabel(item,w,h) { const p=item.anchor.clone().project(camera);const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;item.element.style.left=`${x}px`;item.element.style.top=`${y}px`;item.element.style.visibility=p.z<1&&p.z>-1&&x>20&&x<w-20&&y>18&&y<h-10?'visible':'hidden'; }
function animate(now) {
 requestAnimationFrame(animate);const delta=previous?Math.min((now-previous)/1000,.05):0;previous=now;if(!animationPaused&&!document.hidden)elapsed+=delta;
 for(const {curve,particles} of animatedFlows)particles.forEach((p,i)=>p.position.copy(curve.getPoint((elapsed*.12+i/3)%1)));
 // A closed rounded road curve prevents trucks from jumping at corners.
 for(const v of vehicles){if(v.kind==='truck'){const p=roadPath.getPointAt((elapsed*.023+v.offset)%1),t=roadPath.getTangentAt((elapsed*.023+v.offset)%1);v.g.position.set(p.x,.39,p.z);v.g.rotation.y=Math.atan2(-t.z,t.x);}else{const s=(elapsed*.024+v.offset)%1,z=-9+s*18;v.g.position.set(v.offset?14:11.6,.05,z);v.g.rotation.y=-Math.PI/2;v.g.position.y+=Math.sin(elapsed*1.6+v.offset)*.045;}}
 for(const lamp of lights.values())if(lamp.visible){lamp.material.emissiveIntensity=.3+(Math.sin(elapsed*3)+1)*.7;lamp.scale.setScalar(.9+(Math.sin(elapsed*3)+1)*.14);}
 if(selectionRing)selectionRing.material.opacity=.55+Math.sin(elapsed*2)*.2;
 if(renderer){camera.updateMatrixWorld();const w=$('viewport').clientWidth,h=$('viewport').clientHeight;for(const item of unitLabels.values())projectLabel(item,w,h);for(const item of zoneLabels)projectLabel(item,w,h);renderer.render(scene,camera);}
}
const roadPath=new THREE.CatmullRomCurve3([[-12.9,0,-2.1],[0,0,-2.1],[7.7,0,-2.1],[8.5,0,-1.3],[8.5,0,7.7],[7.7,0,8.5],[0,0,8.5],[-12.9,0,8.5],[-13.75,0,7.7],[-13.75,0,-1.3]].map(p=>new THREE.Vector3(...p)),true,'centripetal',.2);
function updatePauseButton(){$('pauseMotion').textContent=animationPaused?'▶':'Ⅱ';$('pauseMotion').setAttribute('aria-label',animationPaused?'播放動畫':'暫停動畫');$('pauseMotion').setAttribute('aria-pressed',String(animationPaused));document.body.classList.toggle('motion-off',animationPaused);}

function openUnit(id) {
 const u=getUnit(id);if(!u)return;for(const d of document.querySelectorAll('dialog.modal[open]'))d.close();locateUnit(id);
 $('drawerContent').innerHTML=`<div class="drawer-head"><div><div class="eyebrow">UNIT DETAILS / 協作單位</div><span class="status-tag">${stateText[u.state]}</span><h2 id="drawerTitle">${u.name}</h2><p class="muted text-xs" style="margin-top:9px">負責窗口：${people[u.owner][0]} · 分機 ${people[u.owner][2]}</p></div><button class="close" id="closeDrawer" aria-label="關閉單位詳情">×</button></div>
 <div class="detail-stats"><div><small class="muted">交付進度</small><strong>${u.progress}<small>%</small></strong><div class="progress-track"><span style="width:${u.progress}%;background:${stateColor[u.state]}"></span></div></div><div><small class="muted">${data().qualityLabel}</small><strong>${u.quality}<small>%</small></strong><div class="progress-track"><span style="width:${u.quality}%"></span></div></div></div>
 <h3>目前卡點</h3><div class="issue">${u.issue}</div><div class="section"><h3>下一步行動</h3><p class="next-action">↗ ${u.next}</p><p class="muted text-xs" style="margin-top:12px">本階段交付：${u.deliverable}</p></div>
 <div class="section"><h3>一起推進的夥伴 <small class="muted">/ ${u.members.length} 人</small></h3>${u.members.map(index=>`<button class="member" data-member="${index}"><span class="avatar">${people[index][0][0]}</span><span>${people[index][0]}<small>${people[index][1]}</small></span><span class="arrow">↗</span></button>`).join('')}<div id="contactDetail"></div></div><p class="sample-note">示範聯絡資料 · 不代表實際校內窗口</p>`;
 $('closeDrawer').onclick=()=>$('drawer').close();
 for(const b of $('drawerContent').querySelectorAll('[data-member]'))b.onclick=()=>{const p=people[Number(b.dataset.member)];$('contactDetail').innerHTML=`<div class="contact-card"><strong>${p[0]}</strong> · ${p[1]}<br>校內分機：${p[2]}<br>示範信箱：${mailAddress(u)}<br><a href="mailto:${mailAddress(u)}?subject=${encodeURIComponent('【'+data().name+'】'+u.name+' 協作討論')}">✉ 一鍵聯絡 · 開啟郵件草稿</a></div>`;};
 if(!$('drawer').open)$('drawer').show();$('closeDrawer').focus();
}
function openUnits() {
 $('unitList').innerHTML=data().units.map(u=>`<button class="unit-item" data-unit="${u.id}"><i class="dot ${u.state==='good'?'mint':u.state==='watch'?'orange':'red'}"></i><span>${u.name}<small>${stateText[u.state]} · ${people[u.owner][0]}</small></span><b>${u.progress}%</b></button>`).join('');
 for(const b of $('unitList').querySelectorAll('[data-unit]'))b.onclick=()=>openUnit(b.dataset.unit);showModal('unitsDialog');
}
function openMail(){renderMail();showModal('mailDialog');}
function renderMail(){
 $('mailList').innerHTML=data().messages.map((m,i)=>`<button class="mail-item ${i===selectedMail?'selected':''}" data-mail="${i}" aria-pressed="${i===selectedMail}"><span class="meta">${m.time} · 範例來信</span><strong>${m.subject}</strong><small>${getUnit(m.unit).name}</small></button>`).join('');
 for(const b of $('mailList').querySelectorAll('[data-mail]'))b.onclick=()=>{selectedMail=Number(b.dataset.mail);renderMail();};
 const m=data().messages[selectedMail],u=getUnit(m.unit),key=`${scenarioIndex}:${selectedMail}`;
 const draft=drafts.get(key)||{to:'',body:'',template:-1};
 $('mailBody').innerHTML=`<span class="status-tag">${stateText[u.state]}</span><h3 style="margin-top:12px;font-size:17px">${m.subject}</h3><p class="mail-sender">${people[u.owner][0]} · ${u.name} · ${mailAddress(u)}</p><p class="mail-message">${m.text}</p><button class="pill" id="locateSender">⌖ 在 3D 地圖定位發信單位</button><div class="section" style="margin-top:22px"><h3>快速回覆</h3><p class="muted text-xs" style="margin-top:6px">選一句起手式，再補上你的安排。</p><div class="pill-row">${replyTemplates.map(([label],i)=>`<button class="pill reply" data-reply="${i}" aria-pressed="${draft.template===i}">${label}</button>`).join('')}</div><label class="field" for="replyTo">收件人</label><input id="replyTo" type="email" placeholder="點選快捷回覆，自動帶入收件人"><label class="field" for="replyDraft">回信草稿</label><textarea id="replyDraft" placeholder="先選擇上方快捷回覆，或在這裡撰寫…"></textarea><div class="draft-actions"><small>草稿暫存於本次開啟期間</small><button class="primary" id="openEmail">開啟郵件草稿 ↗</button></div><p class="sample-note" style="text-align:left">使用虛構 example.com 信箱；此頁面不會寄信。</p></div>`;
 $('replyTo').value=draft.to;$('replyDraft').value=draft.body;
 const save=()=>drafts.set(key,{to:$('replyTo').value,body:$('replyDraft').value,template:-1});$('replyTo').oninput=save;$('replyDraft').oninput=save;
 for(const b of $('mailBody').querySelectorAll('[data-reply]'))b.onclick=()=>{const i=Number(b.dataset.reply);$('replyTo').value=mailAddress(u);$('replyDraft').value=`${people[u.owner][0]}您好：\n\n${replyTemplates[i][1]}\n\n關於「${m.subject}」，我們會持續追蹤，謝謝您的協助。`;
 drafts.set(key,{to:$('replyTo').value,body:$('replyDraft').value,template:i});for(const pill of $('mailBody').querySelectorAll('[data-reply]'))pill.setAttribute('aria-pressed',String(pill===b));};
 $('locateSender').onclick=()=>{$('mailDialog').close();locateUnit(u.id);toast(`已定位 ${u.name}，綠色光圈為發信單位`);};
 $('openEmail').onclick=()=>{if(!$('replyTo').value||!$('replyDraft').value.trim()){toast('請先選擇快捷回覆，或填寫收件人與草稿。');return;}if(!$('replyTo').checkValidity()){ $('replyTo').reportValidity();return; }
 const a=document.createElement('a');a.href=`mailto:${encodeURIComponent($('replyTo').value)}?subject=${encodeURIComponent('Re: '+m.subject)}&body=${encodeURIComponent($('replyDraft').value)}`;a.click();toast('已請系統開啟郵件軟體；確認內容後再自行寄出。');};
}
function openDashboard(){
 const health=Math.round(avg('progress')*.6+avg('quality')*.4);$('dashboardTitle').textContent=data().name;
 $('dashboardContent').innerHTML=`<div class="report-grid"><section class="report-card"><div class="eyebrow">PROJECT HEALTH</div><div class="health-score">${health}<small> / 100</small></div><h3>${data().units.some(u=>u.state==='blocked')?'需要集中火力，排除卡點':'步調穩定，繼續推進'}</h3><p class="health-caption" style="margin-top:9px">完成率 ${Math.round(avg('progress'))}% · ${data().qualityLabel} ${avg('quality').toFixed(1)}%<br>計算方式：平均進度 × 60% ＋平均${scenarioIndex?'驗收率':'良率'} × 40%</p></section><section class="report-card"><div class="eyebrow">MAKE TODAY COUNT</div><h3>今天最急的 3 件事</h3>${urgentUnits().map((u,i)=>`<div class="urgent-row"><span class="priority">0${i+1}</span><span><b>${u.name}</b><small class="muted" style="display:block;margin-top:5px;white-space:normal">${u.next}</small></span><button data-report-unit="${u.id}">前往 ↗</button></div>`).join('')}</section></div>
 <section class="report-card"><h3>階段時間軸 <small class="muted">/ Timeline</small></h3><div class="timeline">${data().phases.map(([name,time,status])=>`<div class="phase ${status}"><b>${status==='done'?'✓ ':status==='current'?'◉ ':''}${name}</b><small>${time}<br>${status==='done'?'已完成':status==='current'?'進行中':'待啟動'}</small></div>`).join('')}</div></section>
 <section class="report-section"><h3>各單位交付狀態矩陣</h3><div class="table-wrap"><table><thead><tr><th>協作單位</th><th>負責窗口</th><th>交付成果</th><th>完成率</th><th>${data().qualityLabel}</th><th>目前狀態</th></tr></thead><tbody>${data().units.map(u=>`<tr><td><button class="text-button" data-report-unit="${u.id}">${u.name} ↗</button></td><td>${people[u.owner][0]}</td><td>${u.deliverable}</td><td>${u.progress}%</td><td>${u.quality}%</td><td><span class="tag ${u.state}">${stateText[u.state]}</span></td></tr>`).join('')}</tbody></table></div></section>
 <section class="report-section"><h3>缺料 / 在途追蹤</h3><div class="table-wrap"><table><thead><tr><th>資源品項</th><th>負責單位</th><th>狀態</th><th>數量</th><th>預估到貨</th><th>影響範圍</th></tr></thead><tbody>${data().resources.map(row=>`<tr>${row.map((v,i)=>`<td>${i===2?`<span class="tag ${v==='缺料'?'blocked':v==='在途'?'watch':'good'}">${v}</span>`:v}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section><p class="sample-note" style="text-align:left;margin-top:22px">此報告使用內建範例。未連接實際專案系統；數值取各單位算術平均，非產量加權結果。</p>`;
 for(const b of $('dashboardContent').querySelectorAll('[data-report-unit]'))b.onclick=()=>openUnit(b.dataset.reportUnit);showModal('dashboard');
}
$('unitsButton').onclick=openUnits;$('mailButton').onclick=$('notifications').onclick=openMail;$('dashboardButton').onclick=openDashboard;
$('switchData').onclick=()=>{scenarioIndex=1-scenarioIndex;selectedMail=0;selectedId=null;$('drawer').close();if(selectionRing)selectionRing.visible=false;resetView();renderHUD();toast(`已切換至${scenarioIndex?'校園':'製造'}範例，所有面板與地圖已同步`);};
$('homeButton').onclick=()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();selectedId=null;if(selectionRing)selectionRing.visible=false;resetView();updateMapData();};
$('brandHome').onclick=e=>{e.preventDefault();$('homeButton').click();};$('zoomIn').onclick=()=>zoom(1.18);$('zoomOut').onclick=()=>zoom(1/1.18);$('resetView').onclick=resetView;
$('pauseMotion').onclick=()=>{animationPaused=!animationPaused;updatePauseButton();};
try{initWorld();}catch(error){console.error(error);$('loading').hidden=false;$('loading').textContent='此裝置無法啟動 3D，請開啟瀏覽器硬體加速。你仍可使用下方協作單位、來信與專案報告。';}
renderHUD();

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('drawer').open)$('drawer').close();});
