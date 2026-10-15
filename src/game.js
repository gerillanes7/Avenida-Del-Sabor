import { createBackend } from "./backend.js";
import "./style.css";

const backend = createBackend();

(() => {
"use strict";
const TW = 64, TH = 32, WH = 104, WT = .22, DOOR_Y = 3;
const DIRS = [[1,0],[0,1],[-1,0],[0,-1]];
const OL = "#5b3b2b", OLI = "rgba(110,72,48,.7)";
const cv = document.getElementById("game");
let ctx = cv.getContext("2d");

/* ---------- data ---------- */
const DISHES = [
  {id:"pizza",   name:"Pizza",       lvl:1, price:18, cook:4,   xp:4},
  {id:"ensalada",name:"Ensalada",    lvl:1, price:12, cook:3,   xp:3},
  {id:"burger",  name:"Hamburguesa", lvl:2, price:24, cook:5,   xp:5},
  {id:"spaghetti",name:"Espagueti",  lvl:3, price:30, cook:5.5, xp:6},
  {id:"sushi",   name:"Sushi",       lvl:4, price:38, cook:6,   xp:7},
  {id:"pastel",  name:"Pastel",      lvl:5, price:45, cook:6,   xp:8},
];
const FLOORS = {
  ajedrez:  {name:"Baldosa",        price:0,   a:"#f6ecd6", b:"#d9a886"},
  terracota:{name:"Terracota",      price:250, a:"#efd2a8", b:"#e3c095"},
  madera:   {name:"Parqué",         price:300, a:"#dcab76", b:"#cf9c68", planks:true},
  alfombra: {name:"Alfombra rosa",  price:350, a:"#eab0a6", b:"#e5a89e", carpet:"#f5ccc3"},
  real:     {name:"Alfombra salvia",price:450, a:"#7fa595", b:"#789e8e", carpet:"#f0c96a", carpet2:"#f6efd8"},
  menta:    {name:"Menta",          price:250, a:"#ddeedd", b:"#cfe5cf"},
};
const WALLS = {
  ladrillo:{name:"Ladrillo",       price:0,   base:"#de9a7a", trim:"#fff5e4", brick:true},
  blanco:  {name:"Crema",          price:200, base:"#f7ecd6", trim:"#fffaf0", panel:"#e9cfa6"},
  crema:   {name:"Durazno y madera", price:250, base:"#f4c7a6", trim:"#fff5e4", panel:"#a8714a"},
  menta:   {name:"Salvia",         price:250, base:"#c4dcbc", trim:"#f4fbef", panel:"#7f9f7a"},
  cielo:   {name:"Celeste",        price:250, base:"#c6e0e2", trim:"#f2fbfb"},
};
const LAND = [{n:11, price:700},{n:13, price:1800},{n:15, price:3600},{n:17, price:6000}];
const ROOM = [{n:11, price:1200},{n:13, price:3000},{n:15, price:6000},{n:17, price:9000}];
const ITEMS = {
  mesa:    {name:"Mesa con mantel", cat:"muebles", price:120, decor:1, kind:"table"},
  mesaM:   {name:"Mesa de madera",  cat:"muebles", price:160, decor:2, kind:"table"},
  silla:   {name:"Silla de madera", cat:"muebles", price:50,  decor:0, kind:"chair", col:["#9a6538","#7c4c27","#673e1f"]},
  sillaB:  {name:"Silla blanca",    cat:"muebles", price:60,  decor:1, kind:"chair", col:["#ffffff","#e3e3ea","#d2d2dc"]},
  sillaR:  {name:"Silla roja",      cat:"muebles", price:70,  decor:1, kind:"chair", col:["#e48a6e","#c9735a","#b0634c"]},
  estufa:  {name:"Estufa",          cat:"cocina",  price:400, decor:0, kind:"stove"},
  planta:  {name:"Planta",          cat:"deco",    price:80,  decor:3, kind:"deco"},
  lampara: {name:"Farol",           cat:"deco",    price:120, decor:4, kind:"deco"},
  florero: {name:"Florero",         cat:"deco",    price:150, decor:5, kind:"deco"},
  palmera: {name:"Palmera",         cat:"deco",    price:220, decor:6, kind:"deco"},
  refresco:{name:"Máquina de refrescos", cat:"deco", price:380, decor:7, kind:"deco"},
  rocola:  {name:"Rocola",          cat:"deco",    price:450, decor:9, kind:"deco"},
  acuario: {name:"Acuario",         cat:"deco",    price:500, decor:10,kind:"deco"},
  arcade:  {name:"Maquinita",       cat:"deco",    price:520, decor:10,kind:"deco"},
  fuente:  {name:"Fuente",          cat:"deco",    price:650, decor:13,kind:"deco"},
  chimenea:{name:"Chimenea",        cat:"deco",    price:700, decor:14,kind:"deco"},
  sofa:    {name:"Sofá rojo",       cat:"deco",    price:320, decor:6, kind:"deco", rot:true},
  estatua: {name:"Estatua",         cat:"deco",    price:420, decor:8, kind:"deco"},
  piano:   {name:"Piano de cola",   cat:"deco",    price:950, decor:17,kind:"deco"},
  globos:  {name:"Globos",          cat:"deco",    price:110, decor:3, kind:"deco"},
  mesaP:   {name:"Mesa de terraza", cat:"jardin",  price:140, decor:2, kind:"table"},
  banca:   {name:"Banca de parque", cat:"jardin",  price:150, decor:3, kind:"deco", rot:true},
  seto:    {name:"Seto con flores", cat:"jardin",  price:70,  decor:2, kind:"deco"},
  arbol:   {name:"Árbol frutal",    cat:"jardin",  price:200, decor:5, kind:"deco"},
  cerca:   {name:"Cerca blanca",    cat:"jardin",  price:40,  decor:1, kind:"deco", rot:true},
  cuerda:  {name:"Cordón dorado",   cat:"jardin",  price:90,  decor:2, kind:"deco", rot:true},
  piramide:{name:"Pirámide",        cat:"jardin",  price:1500,decor:24,kind:"deco"},
};
const STAFF_PRICE = {chef:[0,450,900], waiter:[0,300,700]};

const SKINS = ["#ffe3c8","#f8cfa8","#e9b48a","#c99068","#a0704e","#ffdcb6"];
const HAIRS = ["#6b4630","#4a3326","#a8673a","#e8c27a","#d97b4f","#f4ead6","#9a9488","#c96f5a","#7a5a8a"];
const SHIRTS = ["#e9a65a","#7fb3a3","#e48a6e","#c9c45c","#a7c6e0","#f2d27a","#a990c4","#f4efe0","#8fae6a","#d9775f","#eea2a0"];
const PANTS = ["#6b7a8f","#5b4a3e","#8a6e52","#7a8a5a","#9a7f6a","#4f5f6f","#c9a57c"];
const HATS = [null,null,null,null,null,null,"cap","beanie","bow","ears","fedora","lucky"];
const HAIRSTYLES = ["bob","bob","bob","short","short","spiky","long","afro","pony"];
const NAMES = ["Lola","Tito","Nat","Ronny","Ana","Beto","Coco","Dani","Fer","Gabi","Juli","Leo","Maru","Nico","Pau","Rosi","Sami","Tomi","Vale","Zoe","Brian","Martín","Evan","Colin","Brandon","Steven"];

/* ---------- state ---------- */
let S, occ = [], N = 9, LOT = 9, uid = 1;
let customers = [], staff = [], orders = [], fx = [];
let mode = "play", held = null, tab = "muebles", hover = null;
let spawnT = 3, saveT = 0, time = 0;
let meId = null, account = null, readOnly = false, visiting = null, home = null, cloudT = 0, cloudDirty = false, pushing = false, others = [];
const cam = {zoom:1, px:0, py:0, scale:1, ox:0, oy:0};

function defaults(){
  return {coins:900, xp:0, level:1, pop:50, N:9, floor:"ajedrez", wall:"blanco",
    ownF:["ajedrez"], ownW:["ladrillo","blanco"], chefs:1, waiters:1, served:0, helpSeen:false,
    items:[
      {t:"estufa",x:2,y:0,r:1},{t:"estufa",x:3,y:0,r:1},{t:"refresco",x:5,y:0,r:1},{t:"planta",x:0,y:0,r:0},
      {t:"rocola",x:7,y:0,r:1},{t:"lampara",x:8,y:0,r:0},{t:"planta",x:0,y:7,r:0},
      {t:"mesaM",x:4,y:4,r:0},{t:"mesaM",x:5,y:4,r:0},{t:"mesaM",x:6,y:4,r:0},
      {t:"silla",x:4,y:3,r:1},{t:"silla",x:5,y:3,r:1},{t:"silla",x:6,y:3,r:1},
      {t:"silla",x:4,y:5,r:3},{t:"silla",x:5,y:5,r:3},{t:"silla",x:6,y:5,r:3},
      {t:"mesa",x:2,y:7,r:0},{t:"mesa",x:3,y:7,r:0},
      {t:"sillaB",x:2,y:6,r:1},{t:"sillaB",x:3,y:6,r:1},{t:"sillaB",x:2,y:8,r:3},{t:"sillaB",x:3,y:8,r:3},
      {t:"palmera",x:8,y:8,r:0},{t:"florero",x:8,y:6,r:0},{t:"arcade",x:8,y:2,r:0},
    ]};
}
function load(data){
  let s = null;
  if (data && data.S) s = data.S;
  if (!s) { try { const raw = localStorage.getItem("ciudad-sabrosa-v1"); if (raw) s = JSON.parse(raw); } catch(e) {} }
  applyState(s);
}
function applyState(s){
  S = Object.assign(defaults(), s && typeof s === "object" ? s : {});
  if (!Array.isArray(S.items)) S.items = [];
  S.N = Math.min(17, Math.max(9, Math.floor(+S.N) || 9));
  S.chefs = Math.min(3, Math.max(1, Math.floor(+S.chefs) || 1)); S.waiters = Math.min(3, Math.max(1, Math.floor(+S.waiters) || 1));
  S.lot = Math.min(17, Math.max(+S.lot || 0, S.N, 9));
  customers = []; orders = []; held = null;
  S.items = S.items.filter(it => it && ITEMS[it.t] && Number.isInteger(it.x) && Number.isInteger(it.y) && it.x >= 0 && it.y >= 0 && it.x < S.lot && it.y < S.lot).map(it => ({t:it.t, x:it.x, y:it.y, r:it.r||0, id:uid++, coins:0, coinT:0}));
  if (!FLOORS[S.floor]) S.floor = "ajedrez";
  if (!WALLS[S.wall]) S.wall = "ladrillo";
  S.lot = Math.max(S.lot || 0, S.N, 9); N = S.N; LOT = S.lot; rebuildOcc();
  staff = [];
  for (let i=0;i<S.chefs;i++) addStaff("chef");
  for (let i=0;i<S.waiters;i++) addStaff("waiter");
}
function serialize(){
  return {S:Object.assign({}, S, {items:S.items.map(i => ({t:i.t,x:i.x,y:i.y,r:i.r}))})};
}
function save(){
  if (visiting) return;   // a visited restaurant is someone else's: never saved here
  S.savedAt = Date.now();
  try { localStorage.setItem("ciudad-sabrosa-v1", JSON.stringify(serialize().S)); } catch(e) {}
  cloudDirty = true;
}

/* ---------- grid ---------- */
/* LOT = land the player owns (placeable, walkable); N = the walled restaurant room inside it */
function rebuildOcc(){ occ = new Array(LOT*LOT).fill(null); for (const it of S.items) if (it.x<LOT && it.y<LOT) occ[it.y*LOT+it.x] = it; }
function itemAt(x,y){ return (x<0||y<0||x>=LOT||y>=LOT) ? null : occ[y*LOT+x]; }
function inside(x,y){ return x>=0 && y>=0 && x<LOT && y<LOT; }
function walkable(x,y){ if (x===-1 && y===DOOR_Y) return true; return inside(x,y) && !itemAt(x,y); }
function kind(it){ return ITEMS[it.t].kind; }
function decorScore(){ let d=0; for (const it of S.items) d += ITEMS[it.t].decor; return d; }
function stoves(){ return S.items.filter(i => kind(i)==="stove"); }
function seatTable(ch){ const d = DIRS[ch.r]; const t = itemAt(ch.x+d[0], ch.y+d[1]); return t && kind(t)==="table" ? t : null; }

function findPath(sx, sy, isGoal){
  sx = Math.round(sx); sy = Math.round(sy);
  if (isGoal(sx,sy)) return [];
  const key = (x,y) => (x+2)*64 + (y+2);
  const prev = new Map(); prev.set(key(sx,sy), null);
  const q = [[sx,sy]];
  while (q.length){
    const [x,y] = q.shift();
    for (const [dx,dy] of DIRS){
      const nx = x+dx, ny = y+dy, k = key(nx,ny);
      if (prev.has(k)) continue;
      if (x===-1 && !(nx===0 && ny===DOOR_Y)) continue;
      const goal = isGoal(nx,ny);
      if (!goal && !walkable(nx,ny)) continue;
      prev.set(k, [x,y]);
      if (goal){
        const p = [[nx,ny]]; let c = [x,y];
        while (c && !(c[0]===sx && c[1]===sy)){ p.unshift(c); c = prev.get(key(c[0],c[1])); }
        return p;
      }
      q.push([nx,ny]);
    }
  }
  return null;
}
const adjTo = (tx,ty) => (x,y) => walkable(x,y) && inside(x,y) && Math.abs(x-tx)+Math.abs(y-ty)===1;

/* ---------- entities ---------- */
function randLook(){
  const pick = a => a[Math.floor(Math.random()*a.length)];
  return {skin:pick(SKINS), hair:pick(HAIRS), style:pick(HAIRSTYLES), shirt:pick(SHIRTS), pants:pick(PANTS), shoes:pick(["#5b3b2b","#f4efe0","#8a6248","#d9775f","#6b7a8f"]),
    hat:pick(HATS), hatCol:pick(SHIRTS), band:pick(["#a990c4","#d9775f","#5e8c7c"]), outfit:pick(["tank","tank","tee"]), bottom:pick(["shorts","shorts","pants"]), print:pick([null,"star","stripe","heart"]), printCol:pick(SHIRTS), name:pick(NAMES)};
}
function staffLook(role){
  const look = randLook();
  if (role === "chef"){ Object.assign(look, {hat:"chef", outfit:"chef", bottom:"pants", shirt:"#ffffff", pants:"#3b3b44", shoes:"#5b3b2b"}); if (look.style === "afro") look.style = "short"; }
  else Object.assign(look, {hat:"cap", hatCol:"#5e8c7c", outfit:"apron", bottom:"pants", shirt:"#f4efe0", pants:"#6b7a8f", shoes:"#5b3b2b"});
  return look;
}
function addStaff(role){
  staff.push({role, x:0, y:DOOR_Y, path:[], face:[1,0], look:staffLook(role), state:"idle", order:null, t:0, walk:0, wanderT:2+Math.random()*3});
}
function moveEnt(e, dt, speed){
  if (!e.path.length){ e.moving = false; return true; }
  const [tx,ty] = e.path[0];
  const dx = tx-e.x, dy = ty-e.y, d = Math.hypot(dx,dy), step = speed*dt;
  // face along the dominant axis only: a diagonal like (+1,-1) would read as "toward the camera" and show the face while walking away
  if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02) e.face = Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
  if (d <= step){ e.x = tx; e.y = ty; e.path.shift(); }
  else { e.x += dx/d*step; e.y += dy/d*step; }
  e.moving = true; e.walk += dt*9;
  if (!e.path.length){ e.moving = false; return true; }
  return false;
}
function unlockedDishes(){ return DISHES.filter(d => d.lvl <= S.level); }
function freeSeats(){ return S.items.filter(i => kind(i)==="chair" && !i.res && seatTable(i)); }

function spawnCustomer(){
  const seats = freeSeats();
  if (!seats.length || !stoves().length) return;
  // prefer seats closer to the door
  seats.sort((a,b) => (Math.abs(a.x)+Math.abs(a.y-DOOR_Y)) - (Math.abs(b.x)+Math.abs(b.y-DOOR_Y)) + (Math.random()-.5)*6);
  for (const seat of seats){
    const c = {x:LANE_IN, y:DOOR_Y + (Math.random()<.5 ? -8 : 8), path:[], face:[0,1], look:randLook(), state:"walkin", seat, walk:0, t:0, mood:null};
    const p = findPath(-1, DOOR_Y, (x,y) => x===seat.x && y===seat.y);
    if (!p) continue;
    c.path = [[LANE_IN, DOOR_Y], [-1, DOOR_Y]].concat(p); seat.res = c; customers.push(c);
    return;
  }
}
function leave(c, angry){
  const sat = c.seat && c.seat.res === c && (c.state === "seated" || c.state === "waiting" || c.state === "eating") && S.items.includes(c.seat);
  if (c.seat && c.seat.res === c && !sat) c.seat.res = null;
  c.rise = sat ? .45 : 0;   // stand up from the chair before walking out
  if (c.order) c.order.cancel = true;
  c.state = "leave"; c.mood = angry ? "angry" : "happy"; c.t = 2.5;
  c.path = exitPath(c);
  if (angry){ S.pop = Math.max(0, S.pop-4); toast(`${c.look.name} se fue sin comer`); }
}

function exitPath(c){
  const tail = [[LANE_OUT, DOOR_Y], [LANE_OUT, Math.random()<.5 ? edgeLo() : edgeHi()]];
  if (c.x < -.5) return [[LANE_OUT, c.y], tail[1]];
  return (findPath(c.x, c.y, (x,y) => x===-1 && y===DOOR_Y) || [[-1,DOOR_Y]]).concat(tail);
}
function updateCustomer(c, dt){
  switch (c.state){
    case "walkin":
      if (!c.seat || !S.items.includes(c.seat) || !seatTable(c.seat)) { leave(c,false); break; }
      if (moveEnt(c, dt, 1.9)){
        c.x = c.seat.x; c.y = c.seat.y; c.state = "seated"; c.t = 1.2;
        c.face = DIRS[c.seat.r].slice();
      }
      break;
    case "seated":
      c.t -= dt;
      if (c.t <= 0){
        const menu = unlockedDishes();
        const dish = menu[Math.floor(Math.random()*menu.length)];
        c.order = {cust:c, dish, stage:"queue", cancel:false, stove:null};
        orders.push(c.order);
        c.state = "waiting"; c.pat = c.maxPat = 50 + decorScore()*0.3;
      }
      break;
    case "waiting":
      c.pat -= dt;
      if (c.pat <= 0) leave(c, true);
      break;
    case "eating":
      c.t -= dt;
      if (c.t <= 0){
        const table = seatTable(c.seat);
        const d = c.order.dish;
        const pay = Math.round(d.price * (1 + decorScore()/80) * (0.75 + 0.5*Math.max(0,c.pat/c.maxPat)));
        if (table){ table.coins += pay; table.coinT = 0; }
        else S.coins += pay;
        gainXp(d.xp);
        S.pop = Math.min(100, S.pop + 1.5); S.served++;
        c.order = null;
        leave(c, false);
      }
      break;
    case "leave":
      c.t -= dt;
      if (c.rise > 0){
        c.rise -= dt;
        if (c.rise <= 0 && c.seat && c.seat.res === c) c.seat.res = null;
        if (c.rise > 0 && c.seat && S.items.includes(c.seat)) break;
      }
      if (moveEnt(c, dt, 2.1) && c.x <= -1) c.dead = true;
      break;
  }
}

function stoveAccess(st){ const d = DIRS[st.r]; return walkable(st.x+d[0], st.y+d[1]) && inside(st.x+d[0], st.y+d[1]) ? [st.x+d[0], st.y+d[1]] : null; }

function updateStaff(e, dt, chefIndex){
  if (e.role === "chef"){
    const st = stoves()[chefIndex];
    if (!st){ moveEnt(e, dt, 2.4); return; }
    e.stove = st;
    const acc = stoveAccess(st);
    const atGoal = acc ? (e.x===acc[0] && e.y===acc[1]) : adjTo(st.x,st.y)(e.x,e.y);
    if (!atGoal){
      if (!e.path.length){
        const p = acc ? findPath(e.x, e.y, (x,y) => x===acc[0] && y===acc[1]) : findPath(e.x, e.y, adjTo(st.x,st.y));
        if (p) e.path = p;
      }
      moveEnt(e, dt, 2.4);
      return;
    }
    e.moving = false;
    e.face = [Math.sign(st.x-e.x), Math.sign(st.y-e.y)];
    if (!e.order){
      if (st.cooking || orders.some(o => o.stove===st && o.stage==="ready")) return;
      const o = orders.find(o => o.stage==="queue" && !o.cancel);
      if (o){ o.stage = "cooking"; o.stove = st; e.order = o; e.t = o.dish.cook; st.cooking = o; }
    } else {
      e.t -= dt;
      const o = e.order;
      if (o.cancel){ st.cooking = null; e.order = null; removeOrder(o); return; }
      o.progress = 1 - e.t/o.dish.cook;
      if (e.t <= 0){ o.stage = "ready"; st.cooking = null; e.order = null; }
    }
  } else {
    if (!e.order){
      const o = orders.find(o => o.stage==="ready");
      if (o){
        if (o.cancel){ removeOrder(o); return; }
        const p = findPath(e.x, e.y, adjTo(o.stove.x, o.stove.y));
        if (p){ o.stage = "fetch"; e.order = o; e.path = p; e.state = "fetch"; }
      } else {
        e.wanderT -= dt;
        if (e.wanderT <= 0 && !e.path.length){
          e.wanderT = 3 + Math.random()*4;
          const st = stoves()[0];
          if (st && Math.abs(e.x-st.x)+Math.abs(e.y-st.y) > 3){
            const p = findPath(e.x, e.y, (x,y) => walkable(x,y) && inside(x,y) && Math.abs(x-st.x)+Math.abs(y-st.y)===2 && !(x===e.x&&y===e.y));
            if (p) e.path = p;
          }
        }
        moveEnt(e, dt, 2.2);
      }
      return;
    }
    const o = e.order;
    if (o.cancel){ e.order = null; e.state = "idle"; removeOrder(o); return; }
    if (moveEnt(e, dt, 2.8)){
      if (e.state === "fetch"){
        if (!adjTo(o.stove.x,o.stove.y)(e.x,e.y)){ e.path = findPath(e.x,e.y,adjTo(o.stove.x,o.stove.y)) || []; return; }
        o.stage = "carry"; e.state = "carry";
        const s = o.cust.seat;
        const p = findPath(e.x, e.y, adjTo(s.x, s.y));
        if (!p){ o.stage = "ready"; e.order = null; e.state = "idle"; leave(o.cust,false); return; }
        e.path = p;
        if (!p.length) deliver(e);
      } else if (e.state === "carry"){
        const s = o.cust.seat;
        if (!adjTo(s.x,s.y)(e.x,e.y)){ e.path = findPath(e.x,e.y,adjTo(s.x,s.y)) || []; if (!e.path.length) deliver(e); return; }
        deliver(e);
      }
    }
  }
}
function deliver(e){
  const o = e.order;
  e.face = [Math.sign(o.cust.seat.x-e.x), Math.sign(o.cust.seat.y-e.y)];
  removeOrder(o);
  const c = o.cust;
  if (c.state === "waiting"){ c.state = "eating"; c.t = 6; c.order = o; o.stage = "served"; }
  e.order = null; e.state = "idle"; e.wanderT = 1.5;
}
function removeOrder(o){ const i = orders.indexOf(o); if (i>=0) orders.splice(i,1); }

function gainXp(n){
  if (visiting) return;
  S.xp += n;
  while (S.xp >= xpNeed(S.level)){
    S.xp -= xpNeed(S.level); S.level++; S.coins += 150;
    const d = DISHES.find(d => d.lvl === S.level);
    toast(`¡Nivel ${S.level}! +150 monedas` + (d ? ` · Nuevo plato: ${d.name}` : ""), true);
  }
}
function xpNeed(l){ return 30 + l*l*20; }

/* ---------- simulation ---------- */
function update(dt){
  time += dt;
  for (const f of fx){ f.t += dt; } fx = fx.filter(f => f.t < 1.4);
  for (const it of S.items) if (it.coins > 0){ it.coinT += dt; if (it.coinT > 35) collect(it, true); }
  updateStreet(dt);
  cloudT += dt; if (cloudT > 20){ cloudT = 0; pushCloud(); }
  if (mode !== "play") return;
  spawnT -= dt;
  if (spawnT <= 0){
    spawnCustomer();
    spawnT = Math.max(2.2, 10 - S.pop/12 - decorScore()/15) * (0.7 + Math.random()*0.6);
  }
  for (const c of customers) updateCustomer(c, dt);
  customers = customers.filter(c => !c.dead);
  let ci = 0;
  for (const e of staff){ if (e.role==="chef") updateStaff(e, dt, ci++); else updateStaff(e, dt); }
  saveT += dt; if (saveT > 4){ saveT = 0; save(); }
}
function collect(it, auto){
  const p = tileCenter(it.x, it.y);
  fx.push({x:p.x, y:p.y-40, text:"+"+it.coins, t:0});
  S.coins += it.coins; it.coins = 0; it.coinT = 0;
  if (!auto) save();
}

/* ---------- drawing helpers ---------- */
const FONT = () => getComputedStyle(document.body).fontFamily;
function tileCenter(gx, gy){ return {x:(gx-gy)*TW/2, y:(gx+gy+1)*TH/2}; }
function P(cx, cy, a, b, z){ return [cx + (a-b)*TW/2, cy + (a+b)*TH/2 - z]; }
function poly(pts, fill, stroke, lw){
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath(); if (fill){ ctx.fillStyle = fill; ctx.fill(); }
  if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
function box(cx, cy, ox, oy, dx, dy, z0, z1, top, left, right, noOutline){
  const x0=ox-dx, x1=ox+dx, y0=oy-dy, y1=oy+dy, o = noOutline ? null : OLI;
  poly([P(cx,cy,x0,y1,z0),P(cx,cy,x1,y1,z0),P(cx,cy,x1,y1,z1),P(cx,cy,x0,y1,z1)], left, o);
  poly([P(cx,cy,x1,y0,z0),P(cx,cy,x1,y1,z0),P(cx,cy,x1,y1,z1),P(cx,cy,x1,y0,z1)], right, o);
  poly([P(cx,cy,x0,y0,z1),P(cx,cy,x1,y0,z1),P(cx,cy,x1,y1,z1),P(cx,cy,x0,y1,z1)], top, o);
}
function cyl(cx, cy, ox, oy, r, z0, z1, top, side){
  const [x, y] = P(cx, cy, ox, oy, 0);
  const rx = r*Math.SQRT2*TW/2, ry = r*Math.SQRT2*TH/2;
  ctx.fillStyle = side; ctx.strokeStyle = OLI; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(x, y-z0, rx, ry, 0, 0, Math.PI); ctx.lineTo(x-rx, y-z1); ctx.ellipse(x, y-z1, rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = top; ctx.beginPath(); ctx.ellipse(x, y-z1, rx, ry, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
}
function circle(x, y, r, fill, stroke, lw){ ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); if (fill){ ctx.fillStyle = fill; ctx.fill(); } if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw||1; ctx.stroke(); } }
function ell(x, y, rx, ry, fill, rot, stroke, lw){ ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot||0, 0, Math.PI*2); if (fill){ ctx.fillStyle = fill; ctx.fill(); } if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw||1; ctx.stroke(); } }
function roundRect(x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function fs(pathFn, fill, stroke, lw){ pathFn(); if (fill){ ctx.fillStyle = fill; ctx.fill(); } if (stroke !== null){ ctx.strokeStyle = stroke || OL; ctx.lineWidth = lw || 1.4; ctx.stroke(); } }
function shade(hex, f){
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round((n>>16)*f)), g = Math.min(255, Math.round(((n>>8)&255)*f)), b = Math.min(255, Math.round((n&255)*f));
  return "#" + ((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1);
}
/* a flat panel lying on one visible face of a box (a = along face, z = height) */
function faceQuad(face, a0, a1, z0, z1, fill, stroke){ poly([face(a0,z0),face(a1,z0),face(a1,z1),face(a0,z1)], fill, stroke); }

/* ---------- dishes ---------- */
function drawDish(id, x, y, s){
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(0, 2, 10, 5, "#ffffff", 0, "#9aa3ad", .8);
  switch (id){
    case "pizza": ell(0,0,8,4,"#f2b44a"); ell(0,-.5,6.5,3.2,"#e0452f"); for (const [a,b] of [[-3,-1],[2,-1.5],[0,1],[3.5,.6]]) ell(a,b,1.3,.8,"#7a1d12"); ell(-1,0,2,1,"#ffe9a8"); break;
    case "ensalada": ell(0,-1,7,4.5,"#e9f2f7"); for (const [a,b,c] of [[-3,-2,"#4caf50"],[2,-2.5,"#7cc95a"],[0,-3,"#3e9a43"],[3,-1,"#e53935"],[-2,-.5,"#ff9800"]]) ell(a,b,2.6,1.6,c); break;
    case "burger": ell(0,0,6.5,2.2,"#c98536"); ctx.fillStyle="#5a2d16"; ctx.fillRect(-6.5,-3.5,13,2.8); ctx.fillStyle="#4caf50"; ctx.fillRect(-7,-4.5,14,1.4); ctx.beginPath(); ctx.ellipse(0,-5,6.5,4,0,Math.PI,0); ctx.fillStyle="#e3a34a"; ctx.fill(); ell(-2,-7,.6,.4,"#fff3c4"); ell(2,-6.5,.6,.4,"#fff3c4"); break;
    case "spaghetti": ell(0,-1,7,3.6,"#f3d27a"); ctx.strokeStyle="#e0b84f"; ctx.lineWidth=.8; for (let i=0;i<4;i++){ ctx.beginPath(); ctx.ellipse(0,-1,6-i*1.4,3-i*.7,0,0,Math.PI*2); ctx.stroke(); } ell(0,-2,3,1.6,"#c8341f"); ell(-1,-2.5,.9,.6,"#7a2a1a"); break;
    case "sushi": for (const a of [-5,0,5]){ ell(a,-1,2.4,1.4,"#ffffff"); ctx.fillStyle="#1f2a20"; ctx.fillRect(a-2.4,-1,4.8,2.2); ell(a,-1.2,1.2,.7,"#ff7043"); } break;
    case "pastel": ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(5,2); ctx.lineTo(6,-5); ctx.lineTo(-5,-7); ctx.closePath(); ctx.fillStyle="#f6c1d6"; ctx.fill(); ctx.fillStyle="#fff4f8"; ctx.fillRect(-6,-7,11,2); circle(0,-9,1.8,"#e53945"); break;
  }
  ctx.restore();
}

/* ---------- characters (big-headed chibi, dark outline) ---------- */
/* slim storybook figure: round head with a bob-style hair cap, tank top or tee, shorts, thin limbs (about 2.6 heads tall) */
const HS = .68, HY = -43;   // head scale and head center height
function drawPerson(x, y, e, opt){
  const L = e.look, carry = opt && opt.carry, onSeat = !!(opt && opt.sit);
  // per-person animation clock: walking eases in and out, sitting down and standing up blend over about half a second
  if (e.seed === undefined) e.seed = Math.random()*100;
  const dt = Math.min(.1, Math.max(0, time - (e.animT ?? time))); e.animT = time;
  const mvT = e.moving ? 1 : 0;
  e.mv = e.mv === undefined ? mvT : e.mv + (mvT - e.mv)*Math.min(1, dt*9);
  if (!onSeat) e.sitK = 0;
  else { const tgt = opt.rise ? 0 : 1, k = e.sitK ?? 0; e.sitK = k + Math.sign(tgt-k)*Math.min(Math.abs(tgt-k), dt/.45); }
  const sk = e.sitK, sm = sk*sk*(3-2*sk), mv = e.mv;
  const f = e.face || [1,0];
  const front = (f[0]+f[1]) >= 0;
  const flip = (f[0]-f[1]) < 0 ? -1 : 1;
  const ph = Math.sin(e.walk)*mv;
  const bob = Math.abs(Math.cos(e.walk))*1.6*mv;
  const breath = Math.sin(time*2.3 + e.seed)*.5*(1-mv);
  const eating = e.state === "eating" && sm > .9;
  const LW = 1, skin = L.skin, low = L.pants, pants = L.bottom === "pants";
  ctx.save(); ctx.translate(x, y);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (sm < 1) ell(0, 0, 9, 3.5, `rgba(120,90,60,${.22*(1-sm)})`);
  // screen direction the person faces; seated, the thighs point this way and the body settles back into the chair
  const ul = Math.hypot(f[0]-f[1], (f[0]+f[1])*.5) || 1, ux = (f[0]-f[1])/ul, uy = (f[0]+f[1])*.5/ul;
  ctx.translate(-ux*2.5*sm, -uy*2.5*sm - (2*sm + 3.5*Math.sin(Math.PI*sk)) - bob);
  // hair that hangs behind the shoulders
  if (front && (L.style === "long" || L.style === "pony")){
    ctx.save(); ctx.translate(0, HY + breath*.6); ctx.scale(HS, HS);
    if (L.style === "long") fs(() => roundRect(-15, -4, 30, 32, 10), L.hair, OL, LW/HS);
    else fs(() => { ctx.beginPath(); ctx.ellipse(-flip*15, 8 + Math.sin(e.walk*2)*mv, 6, 11, -flip*.3 + ph*.15, 0, Math.PI*2); }, L.hair, OL, LW/HS);
    ctx.restore();
  }
  // legs as hip-knee-foot strokes, blended between the walk cycle and the seated pose
  const lerp = (a,b,t) => a + (b-a)*t;
  const stroke2 = (pts, col, w) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.lineWidth = w+1.4; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); };
  const legs = () => {
    for (const s of [-1,1]){
      const sw = ph*s, up = Math.max(0, sw);
      const dangle = Math.sin(time*2.6 + e.seed + s*1.3)*(e.state === "waiting" || e.state === "seated" ? .9 : .3);
      const hip = [s*2.5, -16];
      const kStand = [s*2.5 + sw*1.5*flip + up*1.1*flip, -8.5 - up*1.6], fStand = [s*2.5 + sw*2.8*flip, -1 - up*2.6];
      const kSit = [hip[0] + ux*6.5, hip[1] + uy*6.5 + .5], fSit = [kSit[0] + ux*.8 + dangle*.5, kSit[1] + 10.5 + dangle*.3];
      const knee = [lerp(kStand[0],kSit[0],sm), lerp(kStand[1],kSit[1],sm)];
      const foot = [lerp(fStand[0],fSit[0],sm), lerp(fStand[1],fSit[1],sm)];
      stroke2([hip, knee, foot], pants ? low : skin, 3.1);
      // seated, the shorts cover the upper thigh that now points at the camera
      if (!pants && sm > 0) stroke2([hip, [lerp(hip[0],knee[0],.6*sm), lerp(hip[1],knee[1],.6*sm)]], low, 4.2);
      fs(() => { ctx.beginPath(); ctx.ellipse(foot[0] + flip*.9, foot[1] - .3, 2.8, 1.8, 0, 0, Math.PI*2); }, L.shoes, OL, LW);
    }
  };
  const legsFirst = !(front && sm > .5);
  if (legsFirst) legs();
  // shorts / trousers top
  fs(() => { ctx.beginPath(); ctx.moveTo(-6.4,-22); ctx.lineTo(6.4,-22); ctx.lineTo(7,-14.5); ctx.lineTo(.7,-14.5); ctx.lineTo(0,-16.5); ctx.lineTo(-.7,-14.5); ctx.lineTo(-7,-14.5); ctx.closePath(); }, low, OL, LW);
  if (!legsFirst) legs();
  // upper body sways with each step and breathes when still
  ctx.save(); ctx.translate(0, -18); ctx.rotate(ph*.035*flip); ctx.translate(0, 18 + breath*.35);
  const torso = () => { ctx.beginPath(); ctx.moveTo(-6.2,-21); ctx.lineTo(-6.6,-31.5); ctx.quadraticCurveTo(-6.6,-34.5,-3.6,-34.5); ctx.lineTo(3.6,-34.5); ctx.quadraticCurveTo(6.6,-34.5,6.6,-31.5); ctx.lineTo(6.2,-21); ctx.closePath(); };
  fs(torso, L.shirt, OL, LW);
  if (front){
    if (L.outfit === "tank"){ fs(() => { ctx.beginPath(); ctx.moveTo(-3.6,-34.5); ctx.quadraticCurveTo(0,-29.5,3.6,-34.5); ctx.closePath(); }, skin, OL, .8); }
    else { ell(0, -34.4, 2.4, 1.4, skin); }
    if (L.outfit === "apron"){
      fs(() => roundRect(-5, -28, 10, 11, 2), "#5e8c7c", OL, .9);
      ctx.strokeStyle = "#5e8c7c"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3.5,-28); ctx.lineTo(-2.5,-34); ctx.moveTo(3.5,-28); ctx.lineTo(2.5,-34); ctx.stroke();
      fs(() => roundRect(-2.4, -25, 4.8, 3.4, 1), "#7fb3a3", OL, .6);
    } else if (L.outfit === "chef"){
      for (const [a,b] of [[-2,-30],[-2,-25.5],[2,-30],[2,-25.5]]) circle(a,b,.8,"#b9ad98");
      fs(() => roundRect(-4,-35.5,8,2.4,1), "#d9775f", OL, .6);
    } else if (L.print === "stripe"){ ctx.save(); torso(); ctx.clip(); ctx.fillStyle = L.printCol; ctx.fillRect(-8,-30,16,2); ctx.fillRect(-8,-26,16,2); ctx.restore(); fs(torso, null, OL, LW); }
    else if (L.print === "heart"){ ctx.fillStyle = L.printCol; const hx = flip*1.2, hy2 = -27; ctx.beginPath(); ctx.moveTo(hx,hy2+2.6); ctx.bezierCurveTo(hx-4,hy2-.6,hx-2,hy2-4,hx,hy2-1.3); ctx.bezierCurveTo(hx+2,hy2-4,hx+4,hy2-.6,hx,hy2+2.6); ctx.fill(); }
    else if (L.print === "star"){ ctx.fillStyle = L.printCol; star(flip*1.2, -27, 2.8, 1.2); ctx.fill(); }
  }
  // arms: shoulder-elbow-hand strokes; swing when walking, rest on the lap when seated, lift a fork when eating, stir when cooking
  const bite = eating ? Math.max(0, Math.sin(time*3.2 + e.seed)) : 0;
  for (const s of [-1,1]){
    const sx = s*6.6, sy = -32.5;
    let hand;
    if (carry) hand = [s*4.3, -26];
    else if (opt && opt.cook && s === flip) hand = [s*5 + Math.cos(time*7)*1.8, -27 + Math.sin(time*7)*1.2];
    else {
      const sw = -ph*s*2.4*flip;
      const stand = [s*7.6 + sw, -21.3 + Math.abs(sw)*.25];
      const lap = [s*4.6, -20];
      hand = [lerp(stand[0], lap[0], sm), lerp(stand[1], lap[1], sm)];
      if (s === flip && bite > 0){ hand = [lerp(hand[0], flip*2.4, bite), lerp(hand[1], -34.5, bite)]; }
    }
    const elbow = [lerp(sx, hand[0], .5) + s*1.4, lerp(sy, hand[1], .5) + 1];
    stroke2([[sx,sy], elbow, hand], skin, 2.3);
    circle(hand[0], hand[1], 1.8, skin, OL, .8);
    if (s === flip && bite > .05){ ctx.strokeStyle = "#9aa3ad"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(hand[0], hand[1]); ctx.lineTo(hand[0]-flip*2, hand[1]-3.5); ctx.stroke(); }
    if (L.outfit !== "tank") fs(() => { ctx.beginPath(); ctx.ellipse(sx, sy+1, 2.6, 3, s*.2, 0, Math.PI*2); }, L.outfit === "apron" ? "#f4efe0" : L.shirt, OL, .9);
  }
  // head: nods with each step, chews while eating
  ctx.save(); ctx.translate(0, HY + breath*.25 - bite*.6); ctx.rotate(ph*.05*flip + (eating ? Math.sin(time*6.4+e.seed)*.03 : 0)); ctx.scale(HS, HS);
  drawHead(L, e, front, flip, LW/HS);
  ctx.restore();
  if (carry) drawDish(carry, 0, -27, 1);
  ctx.restore();
  ctx.restore();
}
function drawHead(L, e, front, flip, lw){
  const hy = 0, fx = flip*2;
  ctx.lineWidth = lw;
  if (front) for (const s of [-1,1]) fs(() => { ctx.beginPath(); ctx.ellipse(s*13.5+fx*.5, hy+4, 3, 3.8, 0, 0, Math.PI*2); }, L.skin, OL, lw);
  drawHairBlob(L, hy, front, flip, lw);
  if (front){
    fs(() => { ctx.beginPath(); ctx.ellipse(fx, hy+4, 12, 10.5, 0, 0, Math.PI*2); }, L.skin, null);
    ctx.fillStyle = L.hair;
    if (L.style === "bob" || L.style === "short"){
      // straight bangs, as in the reference
      ctx.beginPath(); ctx.moveTo(-13+fx, hy-9); ctx.lineTo(13+fx, hy-9); ctx.lineTo(13+fx, hy+.5); ctx.quadraticCurveTo(fx, hy+2.5, -13+fx, hy+.5); ctx.closePath(); ctx.fill();
    } else if (L.style === "spiky"){ ctx.beginPath(); ctx.moveTo(-13+fx,hy-1); for (let i=0;i<5;i++){ ctx.lineTo(-10+fx+i*5.5, hy+3); ctx.lineTo(-7.5+fx+i*5.5, hy-3); } ctx.lineTo(13+fx,hy-1); ctx.lineTo(13+fx,hy-8); ctx.lineTo(-13+fx,hy-8); ctx.closePath(); ctx.fill(); }
    else if (L.style !== "afro"){ ctx.beginPath(); ctx.moveTo(-13+fx, hy+2); ctx.quadraticCurveTo(-8+fx-flip*3, hy-10, 2*flip+fx, hy-3); ctx.quadraticCurveTo(7*flip+fx, hy-8, 13*flip+fx, hy+1); ctx.lineTo(13*flip+fx, hy-8); ctx.lineTo(-13*flip+fx, hy-8); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.ellipse(fx, hy-6, 13, 6, 0, 0, Math.PI*2); ctx.fill(); }
    for (const s of [-1,1]){
      const ex = fx + s*4.4 + flip*.8, ey = hy+5;
      if (e.mood === "angry"){ ctx.strokeStyle = OL; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(ex-2.5, ey-4-s*.8); ctx.lineTo(ex+2.5, ey-4+s*.8); ctx.stroke(); }
      if ((time + (e.seed||0)) % 3.9 < .13) { ctx.strokeStyle = "#4a3326"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(ex-2, ey); ctx.lineTo(ex+2, ey); ctx.stroke(); }
      else circle(ex, ey, 2.1, "#4a3326");
    }
    ell(fx-8, hy+9, 2.4, 1.3, "rgba(232,130,110,.4)"); ell(fx+8, hy+9, 2.4, 1.3, "rgba(232,130,110,.4)");
    ctx.strokeStyle = "#7a4030"; ctx.lineWidth = 1.5; ctx.beginPath();
    if (e.mood === "angry") ctx.arc(fx+flip, hy+12.5, 2.2, 1.15*Math.PI, 1.85*Math.PI);
    else if (e.state === "eating"){ ell(fx+flip, hy+10.5, 1.7, 1.4+Math.abs(Math.sin(time*8)), "#7a4030"); }
    else ctx.arc(fx+flip, hy+8.5, 2.2, .2*Math.PI, .8*Math.PI);
    ctx.stroke();
  }
  if (!front && L.style === "long") fs(() => roundRect(-14, hy, 28, 26, 9), L.hair, OL, lw);
  if (!front && L.style === "pony") fs(() => { ctx.beginPath(); ctx.ellipse(0, hy+13, 6, 9, 0, 0, Math.PI*2); }, L.hair, OL, lw);
  drawHat(L, hy, front, flip);
}
function drawHairBlob(L, hy, front, flip){
  if (L.style === "afro"){ fs(() => { ctx.beginPath(); ctx.arc(0, hy-3, 19, 0, Math.PI*2); }, L.hair); return; }
  if (L.style === "bob"){ fs(() => roundRect(-16.5, hy-15, 33, 28, 13), L.hair); return; }
  fs(() => { ctx.beginPath(); ctx.ellipse(0, hy-1, 15.5, 15, 0, 0, Math.PI*2); }, L.hair);
  if (L.style === "spiky" && !front){ ctx.fillStyle = L.hair; ctx.beginPath(); for (let i=0;i<5;i++){ ctx.moveTo(-12+i*6, hy-10); ctx.lineTo(-9+i*6, hy-20); ctx.lineTo(-6+i*6, hy-10); } ctx.fill(); }
}
function star(x, y, R, r){ ctx.beginPath(); for (let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i%2 ? r : R; ctx.lineTo(x+Math.cos(a)*rr, y+Math.sin(a)*rr); } ctx.closePath(); }
function drawHat(L, hy, front, flip){
  const c = L.hatCol;
  switch (L.hat){
    case "chef":
      fs(() => { ctx.beginPath(); ctx.moveTo(-10,hy-10); ctx.lineTo(-10,hy-17); ctx.lineTo(10,hy-17); ctx.lineTo(10,hy-10); ctx.closePath(); }, "#ffffff");
      for (const [a,b,r] of [[-7,-22,7],[7,-22,7],[0,-27,8.5]]) fs(() => { ctx.beginPath(); ctx.arc(a, hy+b, r, 0, Math.PI*2); }, "#ffffff");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(-9, hy-21, 18, 8);
      break;
    case "tophat":
      fs(() => { ctx.beginPath(); ctx.ellipse(0, hy-12, 17, 5, 0, 0, Math.PI*2); }, "#4a3a30");
      fs(() => roundRect(-10.5, hy-36, 21, 25, 2), "#5a4636");
      ctx.fillStyle = L.band || "#a990c4"; ctx.fillRect(-10.5, hy-17, 21, 4);
      ell(-4, hy-31, 2, 4, "rgba(255,255,255,.18)");
      break;
    case "ears":
      for (const s of [-1,1]){ fs(() => { ctx.beginPath(); ctx.ellipse(s*6, hy-23, 4.2, 12, s*.18, 0, Math.PI*2); }, "#ffffff"); ell(s*6, hy-22, 2, 8, "#f7b6c8", s*.18); }
      break;
    case "cap":
      fs(() => { ctx.beginPath(); ctx.arc(0, hy-4, 15, Math.PI, 0); ctx.closePath(); }, c);
      if (front) fs(() => { ctx.beginPath(); ctx.ellipse(flip*8, hy-4, 11, 3.2, 0, 0, Math.PI*2); }, shade(c,.8));
      circle(0, hy-19, 2, shade(c,.7));
      break;
    case "beanie":
      fs(() => { ctx.beginPath(); ctx.arc(0, hy-5, 15, Math.PI, 0); ctx.closePath(); }, c);
      fs(() => roundRect(-15.5, hy-8, 31, 6, 2.5), shade(c,.82));
      fs(() => { ctx.beginPath(); ctx.arc(0, hy-21, 4, 0, Math.PI*2); }, "#ffffff");
      break;
    case "bow":
      fs(() => { ctx.beginPath(); ctx.moveTo(7,hy-12); ctx.lineTo(0,hy-18); ctx.lineTo(1,hy-6); ctx.closePath(); ctx.moveTo(7,hy-12); ctx.lineTo(14,hy-18); ctx.lineTo(13,hy-6); ctx.closePath(); }, c);
      fs(() => { ctx.beginPath(); ctx.arc(7, hy-12, 2.4, 0, Math.PI*2); }, shade(c,.75));
      break;
    case "fedora":
      fs(() => { ctx.beginPath(); ctx.ellipse(0, hy-11, 19, 5.5, 0, 0, Math.PI*2); }, "#c9735a");
      fs(() => { ctx.beginPath(); ctx.moveTo(-11,hy-12); ctx.lineTo(-9,hy-26); ctx.quadraticCurveTo(0,hy-22,9,hy-26); ctx.lineTo(11,hy-12); ctx.closePath(); }, "#d9775f");
      ctx.fillStyle = "#5b3b2b"; ctx.fillRect(-10.5, hy-16, 21, 3.5);
      break;
    case "lucky":
      fs(() => { ctx.beginPath(); ctx.ellipse(0, hy-11, 18, 5, 0, 0, Math.PI*2); }, "#8fa84c");
      fs(() => { ctx.beginPath(); ctx.moveTo(-10,hy-12); ctx.lineTo(-8,hy-34); ctx.lineTo(8,hy-34); ctx.lineTo(10,hy-12); ctx.closePath(); }, "#8fae5a");
      ctx.fillStyle = "#4a3a30"; ctx.fillRect(-9.5, hy-19, 19, 4.5);
      fs(() => roundRect(-3.5, hy-20, 7, 6.5, 1), "#f0c96a");
      break;
  }
}
function nameTag(x, y, name){
  ctx.font = "600 10px " + FONT(); ctx.textAlign = "center";
  const w = ctx.measureText(name).width + 10;
  ctx.fillStyle = "rgba(255,250,240,.92)"; roundRect(x - w/2, y - 10, w, 13, 6.5); ctx.fill(); ctx.strokeStyle = "rgba(138,98,72,.7)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "#5b3b2b"; ctx.fillText(name, x, y);
}

/* ---------- items ---------- */
function sameTable(it, dx, dy){ const n = itemAt(it.x+dx, it.y+dy); return !!(n && n.t === it.t && it.x !== undefined && S.items.includes(n) && S.items.includes(it)); }
function drawItem(it, cx, cy, ghost){
  const t = it.t;
  switch (t){
    case "mesa": case "mesaM": {
      const jl = sameTable(it,-1,0), jr = sameTable(it,1,0), jt = sameTable(it,0,-1), jb = sameTable(it,0,1);
      const x0 = jl ? -.5 : -.44, x1 = jr ? .5 : .44, y0 = jt ? -.5 : -.44, y1 = jb ? .5 : .44;
      const ox = (x0+x1)/2, oy = (y0+y1)/2, dx = (x1-x0)/2, dy = (y1-y0)/2;
      if (t === "mesa"){
        if (!jr && !jb) box(cx,cy,.3,.3,.04,.04,0,12,"#c9c9d2","#b3b3bd","#a1a1ab");
        box(cx,cy,ox,oy,dx,dy,8,22,"#ffffff","#ececf3","#f6f6fa", true);
        // outline only the outer edges of the joined tabletop
        ctx.strokeStyle = OLI; ctx.lineWidth = 1;
        const E = (a,b,z) => P(cx,cy,a,b,z);
        const seg = (p,q) => { ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); };
        if (!jb){ seg(E(x0,y1,22),E(x1,y1,22)); seg(E(x0,y1,8),E(x1,y1,8)); }
        if (!jr){ seg(E(x1,y0,22),E(x1,y1,22)); seg(E(x1,y0,8),E(x1,y1,8)); }
        if (!jt) seg(E(x0,y0,22),E(x1,y0,22));
        if (!jl) seg(E(x0,y0,22),E(x0,y1,22));
        if (!jb && !jl) seg(E(x0,y1,8),E(x0,y1,22));
        if (!jr && !jt) seg(E(x1,y0,8),E(x1,y0,22));
        if (!jr && !jb) seg(E(x1,y1,8),E(x1,y1,22));
        // hem stripe
        ctx.strokeStyle = "rgba(226,64,58,.6)"; ctx.lineWidth = 1.5;
        if (!jb) seg(E(x0,y1,11),E(x1,y1,11));
        if (!jr) seg(E(x1,y0,11),E(x1,y1,11));
        if (!jl && !jt) { const p = P(cx,cy,0,0,22); circle(p[0], p[1]-3, 2.4, "#f3d27a", OLI); }
      } else {
        for (const [a,b] of [[-.36,-.36],[.36,-.36],[-.36,.36],[.36,.36]]){
          if ((a<0 && jl) || (a>0 && jr) || (b<0 && jt) || (b>0 && jb)) continue;
          box(cx,cy,a,b,.045,.045,0,19,"#6d4325","#593419","#4a2b14");
        }
        box(cx,cy,ox,oy,dx,dy,19,24,"#a8733f","#7f532c","#6d4626", true);
        ctx.strokeStyle = "rgba(90,55,25,.35)"; ctx.lineWidth = 1;
        for (const k of [-.15,.15]){ const p = P(cx,cy,x0,k,24), q = P(cx,cy,x1,k,24); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); }
        ctx.strokeStyle = OLI; const E = (a,b,z) => P(cx,cy,a,b,z); const seg = (p,q) => { ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); };
        if (!jb){ seg(E(x0,y1,24),E(x1,y1,24)); seg(E(x0,y1,19),E(x1,y1,19)); }
        if (!jr){ seg(E(x1,y0,24),E(x1,y1,24)); seg(E(x1,y0,19),E(x1,y1,19)); }
        if (!jt) seg(E(x0,y0,24),E(x1,y0,24));
        if (!jl) seg(E(x0,y0,24),E(x0,y1,24));
      }
      drawTableExtras(it, cx, cy, t === "mesa" ? 22 : 24);
      break;
    }
    case "silla": case "sillaB": case "sillaR": {
      const col = ITEMS[t].col, d = DIRS[it.r];
      const bx = -d[0]*.19, by = -d[1]*.19, tx = d[0] ? .045 : .21, ty = d[1] ? .045 : .21;
      const back = () => {
        box(cx,cy,bx,by,tx,ty,15,38,col[0],col[1],col[2]);
        // rounded crest rail
        const a = P(cx,cy,bx-(d[1]?.21:0),by-(d[0]?.21:0),38), b = P(cx,cy,bx+(d[1]?.21:0),by+(d[0]?.21:0),38);
        fs(() => { ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.quadraticCurveTo((a[0]+b[0])/2, (a[1]+b[1])/2-9, b[0], b[1]); ctx.closePath(); }, col[0], OLI, 1);
        if (t === "silla"){ ctx.strokeStyle = "rgba(60,30,10,.45)"; ctx.lineWidth = 1.2; for (const k of [-.08,.08]){ const p = P(cx,cy,bx+(d[1]?k:0),by+(d[0]?k:0),18), q = P(cx,cy,bx+(d[1]?k:0),by+(d[0]?k:0),35); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); } }
      };
      const backFront = (d[0]+d[1]) < 0;
      const legC = t === "silla" ? "#5a3519" : t === "sillaB" ? "#c9c9d2" : "#9a5644";
      for (const [a,b] of [[-.16,-.16],[.16,-.16],[-.16,.16],[.16,.16]]) box(cx,cy,a,b,.03,.03,0,13,legC,shade(legC,.85),shade(legC,.75));
      if (!backFront) back();
      box(cx,cy,0,0,.22,.22,12,16,col[0],col[1],col[2]);
      if (it.res && it.res.state !== "walkin" && (it.res.state !== "leave" || it.res.rise > 0)){
        const s = P(cx,cy,d[0]*.06,d[1]*.06,0); drawPerson(s[0], s[1], it.res, {sit:true, rise:it.res.state === "leave"});
      }
      if (backFront) back();
      break;
    }
    case "estufa": {
      box(cx,cy,0,0,.43,.43,0,32,"#7a6656","#ece4d0","#dacfb6");
      ctx.fillStyle = "#e9edf2"; poly([P(cx,cy,-.43,.43,32),P(cx,cy,.43,.43,32),P(cx,cy,.43,.43,28),P(cx,cy,-.43,.43,28)], "#f6efdd", OLI);
      poly([P(cx,cy,.43,-.43,32),P(cx,cy,.43,.43,32),P(cx,cy,.43,.43,28),P(cx,cy,.43,-.43,28)], "#e6dcc4", OLI);
      if (it.r===1 || it.r===0){
        const face = it.r===1 ? (a,z)=>P(cx,cy,a,.43,z) : (a,z)=>P(cx,cy,.43,-a,z);
        faceQuad(face, -.3, .3, 5, 22, "#6b5444", OL);
        faceQuad(face, -.23, .23, 8, 18, it.cooking ? "#f0b070" : "#56606c");
        const h1 = face(-.24,24.5), h2 = face(.24,24.5); ctx.strokeStyle="#f4f6f8"; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(...h1); ctx.lineTo(...h2); ctx.stroke();
        for (const k of [-.25,-.08,.08,.25]){ const p = face(k,30); circle(p[0],p[1],1.4,"#6b5444"); }
      }
      for (const [a,b] of [[-.18,-.18],[.18,.18],[-.18,.18],[.18,-.18]]){
        const p = P(cx,cy,a,b,32); ell(p[0],p[1],8,4,"#5a4636"); ctx.strokeStyle = it.cooking ? "#e88a60" : "#6a707a"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(p[0],p[1],5,2.5,0,0,Math.PI*2); ctx.stroke();
      }
      if (it.cooking){
        cyl(cx,cy,-.15,.1,.17,32,42,"#8a929c","#bfc6cf");
        for (let i=0;i<3;i++){ const k=((time*.8+i/3)%1); const p=P(cx,cy,-.15,.1,46+k*26); circle(p[0]+Math.sin(time*2+i)*4, p[1], 3+k*4, `rgba(255,255,255,${.7*(1-k)})`); }
        const p = P(cx,cy,0,0,64); const pr = it.cooking.progress||0;
        ctx.fillStyle="#5b3b2b"; roundRect(p[0]-20,p[1]-4,40,8,4); ctx.fill(); ctx.fillStyle="#7bd36a"; roundRect(p[0]-18,p[1]-2,Math.max(1,36*pr),4,2); ctx.fill();
      }
      const ready = orders.filter(o => o.stove===it && (o.stage==="ready" || o.stage==="fetch"));
      if (ready.length){ const p = P(cx,cy,.12,-.05,34); drawDish(ready[0].dish.id, p[0], p[1]-Math.abs(Math.sin(time*4))*2, 1); }
      break;
    }
    case "planta":
      cyl(cx,cy,0,0,.16,0,14,"#5a3418","#c4663a");
      for (const [a,b,z,r,c] of [[0,0,26,9,"#8fa84c"],[-.1,.08,21,7,"#a9be5a"],[.1,-.05,22,7,"#2f7a30"],[.05,.1,31,6,"#c2d06e"],[-.06,-.1,30,6,"#46a040"]]){ const p=P(cx,cy,a,b,z); circle(p[0],p[1],r,c,OLI); }
      break;
    case "palmera": {
      cyl(cx,cy,0,0,.2,0,14,"#5a3418","#b35a30");
      const base = P(cx,cy,0,0,14);
      for (let i=0;i<7;i++){ ctx.fillStyle = i%2 ? "#8a5a2c" : "#a06b38"; ctx.strokeStyle = OLI; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(base[0]-3+Math.sin(i*.6)*1.2, base[1]-i*8-8, 6, 8); ctx.fill(); ctx.stroke(); }
      const top = [base[0]+1, base[1]-62];
      const sway = Math.sin(time*1.2)*.05;
      for (let i=0;i<7;i++){ const a = i/7*Math.PI*2 + sway; ell(top[0]+Math.cos(a)*14, top[1]+Math.sin(a)*6+4, 16, 4.5, i%2?"#8fa84c":"#8fae5a", a, OLI); }
      circle(top[0], top[1], 4, "#6b4a2a");
      break;
    }
    case "lampara": {
      const b = P(cx,cy,0,0,0);
      if (!ghost){ const g = ctx.createRadialGradient(b[0],b[1]-60,2,b[0],b[1]-60,60); g.addColorStop(0,"rgba(255,226,140,.5)"); g.addColorStop(1,"rgba(255,226,140,0)"); ctx.fillStyle=g; ctx.fillRect(b[0]-60,b[1]-120,120,120); }
      cyl(cx,cy,0,0,.12,0,6,"#2b2b30","#3d3d44");
      ctx.fillStyle="#2b2b30"; ctx.fillRect(b[0]-2,b[1]-62,4,58);
      ctx.beginPath(); ctx.moveTo(b[0]-9,b[1]-58); ctx.lineTo(b[0]+9,b[1]-58); ctx.lineTo(b[0]+6,b[1]-74); ctx.lineTo(b[0]-6,b[1]-74); ctx.closePath(); ctx.fillStyle="#ffe08a"; ctx.fill(); ctx.strokeStyle="#2b2b30"; ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b[0]-9,b[1]-74); ctx.lineTo(b[0],b[1]-82); ctx.lineTo(b[0]+9,b[1]-74); ctx.closePath(); ctx.fillStyle="#2b2b30"; ctx.fill();
      break;
    }
    case "florero":
      box(cx,cy,0,0,.17,.17,0,24,"#f4efe6","#ddd5c6","#e8e1d4");
      box(cx,cy,0,0,.21,.21,24,27,"#ffffff","#e3dccd","#ece6da");
      cyl(cx,cy,0,0,.09,27,40,"#3e6fb0","#4a86d0");
      for (const [a,b,z,c] of [[0,0,52,"#eea2a0"],[-.08,.05,48,"#f3d27a"],[.08,-.04,49,"#e88a78"],[.05,.08,46,"#c86bf0"],[-.05,-.08,50,"#ffffff"]]){ const p=P(cx,cy,a,b,z); ctx.strokeStyle="#8fa84c"; ctx.lineWidth=1.2; const s=P(cx,cy,0,0,40); ctx.beginPath(); ctx.moveTo(s[0],s[1]); ctx.lineTo(p[0],p[1]); ctx.stroke(); circle(p[0],p[1],4,c,OLI); }
      break;
    case "refresco": {
      const face = frontFace(cx, cy, it.r, .3, .26);
      box(cx,cy,0,0,.3,.26,0,60,"#5f8f80","#6f9f8f","#557f72");
      if (face){
        faceQuad(face, -.24, .24, 36, 56, "#ffffff", OLI);
        const c = face(0,46); ctx.fillStyle = "#6f9f8f"; ctx.font = "700 11px " + FONT(); ctx.textAlign = "center"; ctx.save(); ctx.translate(c[0], c[1]); ctx.transform(1, it.r===1 ? .5 : -.5, 0, 1, 0, 0); ctx.fillText("Sabrosa", 0, 4); ctx.restore();
        faceQuad(face, -.24, .06, 10, 32, "#6b5444", OL);
        for (let i=0;i<4;i++){ const k = -.2 + i*.07; const p = face(k, 28), q = face(k, 14); ctx.strokeStyle = ["#f0c96a","#9cbf6a","#8fb8d0","#eaa060"][i]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); }
        faceQuad(face, .1, .22, 20, 30, "#ece4d0", OL);
        faceQuad(face, -.22, .22, 3, 7, "#4a3a30");
      }
      break;
    }
    case "arcade": {
      const face = frontFace(cx, cy, it.r, .28, .25);
      box(cx,cy,0,0,.28,.25,0,62,"#e9b85a","#f0c46a","#d6a24c");
      if (face){
        faceQuad(face, -.22, .22, 36, 54, "#4a3a30", OL);
        const hue = (time*60)%360; faceQuad(face, -.18, .18, 39, 51, `hsl(${hue},70%,55%)`);
        const p1 = face(-.1,45), p2 = face(.08,43); circle(p1[0],p1[1],2.5,"#ffffff"); circle(p2[0],p2[1],2,"#f0c96a");
        faceQuad(face, -.24, .24, 26, 33, "#6b5444", OL);
        const j = face(-.1,33); ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(j[0],j[1]); ctx.lineTo(j[0],j[1]-6); ctx.stroke(); circle(j[0],j[1]-7,2.4,"#d9775f",OL);
        for (const k of [.06,.15]){ const b = face(k,31); circle(b[0],b[1],1.8,"#f0c96a",OL); }
        faceQuad(face, -.22, .22, 56, 61, "#f0c96a", OL);
      }
      break;
    }
    case "chimenea": {
      const face = frontFace(cx, cy, it.r, .4, .4);
      box(cx,cy,0,0,.4,.4,0,52,"#b4583d","#c46447","#9e4d35");
      box(cx,cy,0,0,.44,.44,52,57,"#e8d9c4","#d6c6ae","#c9b89f");
      box(cx,cy,0,0,.2,.16,57,96,"#b4583d","#c46447","#9e4d35");
      if (face){
        ctx.strokeStyle = "rgba(80,30,15,.35)"; ctx.lineWidth = 1;
        for (let z=8; z<52; z+=8){ const p = face(-.4,z), q = face(.4,z); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); }
        const a = face(-.24,0), b = face(.24,0), c = face(.24,26), d = face(-.24,26), m = face(0,36);
        ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.quadraticCurveTo(m[0], m[1], d[0], d[1]); ctx.closePath(); ctx.fillStyle = "#1d1410"; ctx.fill(); ctx.strokeStyle = OL; ctx.stroke();
        const f0 = face(0,4);
        for (let i=0;i<3;i++){ const k = Math.sin(time*9+i*2)*1.5; ell(f0[0]+(i-1)*6, f0[1]-8-k, 4.5-i%2, 9+k, i===1?"#f3d27a":"#ff7b2e"); }
        ell(f0[0], f0[1]-5, 3, 5, "#fff3b0");
      }
      if (!ghost && mode === "play"){ const top = P(cx,cy,0,0,96); for (let i=0;i<2;i++){ const k=((time*.4+i/2)%1); circle(top[0]+Math.sin(time+i)*5, top[1]-k*30, 4+k*5, `rgba(220,220,225,${.5*(1-k)})`); } }
      break;
    }
    case "sofa": case "banca": {
      const d = DIRS[it.r], long = d[0] ? [ .2, .44] : [.44, .2];
      const sofa = t === "sofa";
      const C = sofa ? ["#d9775f","#c9735a","#b0634c"] : ["#b9834e","#966537","#7d532c"];
      const back = () => box(cx,cy,-d[0]*.2,-d[1]*.2, d[0]?.05:.44, d[1]?.05:.44, sofa?14:12, sofa?36:30, C[0],C[1],C[2]);
      const backFront = (d[0]+d[1]) < 0;
      if (sofa) box(cx,cy,0,0,long[0],long[1],0,6,"#5a2f16","#4a2510","#3e1f0c");
      else for (const s of [-1,1]) box(cx,cy,d[0]?0:s*.36,d[0]?s*.36:0,.05,.05,0,12,"#7a6656","#6b5444","#5a4636");
      if (!backFront) back();
      box(cx,cy,0,0,long[0],long[1],sofa?6:12,sofa?16:15,C[0],C[1],C[2]);
      if (sofa) for (const s of [-1,1]) box(cx,cy,d[0]?0:s*.4,d[0]?s*.4:0,d[0]?.2:.05,d[0]?.05:.2,16,25,C[0],C[1],C[2]);
      if (!sofa){ ctx.strokeStyle = "rgba(60,30,10,.4)"; ctx.lineWidth = 1; for (const k of [-.07,.07]){ const a = P(cx,cy,d[0]?k:-.44,d[0]?-.44:k,15), b = P(cx,cy,d[0]?k:.44,d[0]?.44:k,15); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); } }
      if (backFront) back();
      break;
    }
    case "mesaP": {
      cyl(cx,cy,0,0,.07,0,18,"#e9e9ef","#c9c9d2");
      cyl(cx,cy,0,0,.42,17,21,"#f0b070","#d99a5a");
      const p = P(cx,cy,0,0,21);
      ctx.strokeStyle = "#fff4d6"; ctx.lineWidth = 1.5;
      for (let i=0;i<8;i++){ const a = i/8*Math.PI*2; ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.lineTo(p[0]+Math.cos(a)*16, p[1]+Math.sin(a)*8); ctx.stroke(); }
      ell(p[0], p[1], 19, 9.5, null, 0, "#fff4d6", 2); ell(p[0], p[1], 3, 1.5, "#fff4d6");
      drawTableExtras(it, cx, cy, 21);
      break;
    }
    case "seto": {
      box(cx,cy,0,0,.45,.45,0,22,"#a9be5a","#8fa84c","#7f9a44");
      for (const [a,b] of [[-.25,-.25],[.25,-.25],[0,0],[-.25,.25],[.25,.25]]){ const p = P(cx,cy,a,b,24); circle(p[0], p[1], 9, "#c2d06e", OLI); }
      for (const [a,b] of [[-.2,.1],[.15,-.15],[.1,.25]]){ const p = P(cx,cy,a,b,30); circle(p[0], p[1], 2, "#eea2a0"); }
      break;
    }
    case "estatua": {
      box(cx,cy,0,0,.3,.3,0,20,"#e3e0d8","#cfcbc1","#bdb9ae");
      box(cx,cy,0,0,.34,.34,20,24,"#f1eee7","#dcd8ce","#cac5ba");
      const b = P(cx,cy,0,0,24);
      fs(() => roundRect(b[0]-9, b[1]-22, 18, 22, 7), "#c9ccd4", OLI, 1);
      fs(() => { ctx.beginPath(); ctx.arc(b[0], b[1]-32, 12, 0, Math.PI*2); }, "#d4d7de", OLI, 1);
      fs(() => { ctx.beginPath(); ctx.moveTo(b[0]+8, b[1]-18); ctx.lineTo(b[0]+16, b[1]-40); ctx.lineTo(b[0]+19, b[1]-39); ctx.lineTo(b[0]+11, b[1]-17); ctx.closePath(); }, "#c9ccd4", OLI, 1);
      star(b[0]+18, b[1]-44, 6, 2.6); ctx.fillStyle = "#f0c96a"; ctx.fill(); ctx.strokeStyle = OLI; ctx.stroke();
      ell(b[0]-4, b[1]-31, 1.3, 2, "#8a8f9a"); ell(b[0]+4, b[1]-31, 1.3, 2, "#8a8f9a");
      break;
    }
    case "piano": {
      for (const [a,b] of [[-.3,-.25],[.3,-.25],[0,.3]]) box(cx,cy,a,b,.04,.04,0,14,"#4a3a30","#3e3028","#33271f");
      box(cx,cy,0,0,.44,.36,14,26,"#4a3a30","#5a4636","#24252e");
      const k = (a,z) => P(cx,cy,a,.36,z);
      faceQuad(k, -.4, .4, 18, 23, "#f8f8f4", OLI);
      for (let i=0;i<9;i++){ const p = k(-.36+i*.09, 23), q = k(-.36+i*.09, 20.5); ctx.strokeStyle = "#4a3a30"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); }
      poly([P(cx,cy,-.44,-.36,26),P(cx,cy,.44,-.36,26),P(cx,cy,.3,-.1,52)], "#5a4636", OL);
      ctx.strokeStyle = "#9aa3ad"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...P(cx,cy,.1,0,26)); ctx.lineTo(...P(cx,cy,.25,-.15,48)); ctx.stroke();
      if (!ghost && mode === "play"){ const kk = (time*.6)%1; const p = P(cx,cy,0,0,60); ctx.fillStyle = `rgba(43,26,16,${1-kk})`; ctx.font = "bold 13px " + FONT(); ctx.fillText("♫", p[0]-10+Math.sin(time*2)*6, p[1]-kk*28); }
      break;
    }
    case "globos": {
      box(cx,cy,0,0,.08,.08,0,6,"#9aa3ad","#7e8794","#6c7480");
      const base = P(cx,cy,0,0,6);
      const cols = ["#d9775f","#8fb8d0","#f0c96a","#eea2a0","#9cbf6a"];
      for (let i=0;i<5;i++){
        const a = (i-2)*9 + Math.sin(time*1.5+i)*2, h = 62 + (i%2)*10 + Math.sin(time*2+i*1.7)*2;
        ctx.strokeStyle = "rgba(60,60,70,.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.quadraticCurveTo(base[0]+a*.3, base[1]-h*.5, base[0]+a, base[1]-h); ctx.stroke();
        fs(() => { ctx.beginPath(); ctx.ellipse(base[0]+a, base[1]-h-9, 8, 10, 0, 0, Math.PI*2); }, cols[i], OLI, 1);
        ell(base[0]+a-3, base[1]-h-12, 2, 3, "rgba(255,255,255,.55)");
      }
      break;
    }
    case "piramide": {
      const lv = [[.47,0,11],[.39,11,22],[.31,22,33],[.23,33,44],[.15,44,55]];
      for (const [r,z0,z1] of lv) box(cx,cy,0,0,r,r,z0,z1,"#e4c27a","#c9a35a","#b48f4b");
      box(cx,cy,0,0,.1,.1,55,66,"#d9b46a","#bf9a52","#a88546");
      const s = (a,z) => P(cx,cy,a,.47,z);
      for (let z=0; z<44; z+=11){ const p = s(-.05, z), q = s(-.05, z+11); ctx.strokeStyle = "rgba(90,60,20,.45)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); }
      break;
    }
    case "arbol": {
      cyl(cx,cy,0,0,.2,0,8,"#7a4a2a","#9a6236");
      const b = P(cx,cy,0,0,8);
      ctx.fillStyle = "#7a4a26"; ctx.strokeStyle = OLI; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(b[0]-4, b[1]-34, 8, 34); ctx.fill(); ctx.stroke();
      for (const [a,bb,r,col] of [[0,-58,22,"#8fa84c"],[-14,-46,15,"#a9be5a"],[14,-46,15,"#7f9a44"],[-7,-70,14,"#c2d06e"],[8,-68,13,"#a9be5a"]]) circle(b[0]+a, b[1]+bb, r, col, OLI);
      for (const [a,bb] of [[-8,-52],[10,-60],[2,-72]]) circle(b[0]+a, b[1]+bb, 2.6, "#d9775f");
      break;
    }
    case "cerca": case "cuerda": {
      const along = it.r % 2 === 0 ? [0,1] : [1,0];
      const pt = (k,z) => P(cx,cy,along[0]*k,along[1]*k,z);
      if (t === "cerca"){
        for (let i=0;i<5;i++){ const k = -.4 + i*.2; box(cx,cy,along[0]*k,along[1]*k,.035,.035,0,22,"#ffffff","#e6e6ee","#d4d4de"); const tp = pt(k,22); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(tp[0]-3,tp[1]); ctx.lineTo(tp[0],tp[1]-4); ctx.lineTo(tp[0]+3,tp[1]); ctx.fill(); }
        for (const z of [7,16]){ ctx.strokeStyle = "#f4f4f8"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...pt(-.48,z)); ctx.lineTo(...pt(.48,z)); ctx.stroke(); ctx.strokeStyle = OLI; ctx.lineWidth = .8; ctx.stroke(); }
      } else {
        for (const k of [-.4,.4]){ cyl(cx,cy,along[0]*k,along[1]*k,.07,0,3,"#f0c96a","#c9963c"); box(cx,cy,along[0]*k,along[1]*k,.025,.025,3,26,"#f0c96a","#d9a520","#c9963c"); const tp = pt(k,28); circle(tp[0], tp[1], 3, "#f0c96a", OLI); }
        const a = pt(-.4,24), b = pt(.4,24); ctx.strokeStyle = "#c9735a"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo((a[0]+b[0])/2, (a[1]+b[1])/2+12, b[0], b[1]); ctx.stroke();
      }
      break;
    }
    case "rocola": {
      box(cx,cy,0,0,.3,.24,0,40,"#c9735a","#b0634c","#9a5644");
      const top = P(cx,cy,0,0,40); ctx.beginPath(); ctx.ellipse(top[0],top[1]-2,20,14,0,Math.PI,0); ctx.fillStyle="#d9775f"; ctx.fill(); ctx.strokeStyle="#f5b82e"; ctx.lineWidth=3; ctx.stroke();
      const hue = (time*80)%360; ctx.strokeStyle=`hsl(${hue},90%,65%)`; ctx.lineWidth=2.5; ctx.beginPath(); ctx.ellipse(top[0],top[1]-2,14,9,0,Math.PI,0); ctx.stroke();
      const f = (a,z)=>P(cx,cy,a,.24,z);
      poly([f(-.22,8),f(.22,8),f(.22,30),f(-.22,30)],"#5b3b2b"); for (let i=0;i<4;i++){ const a=f(-.18+i*.12,12), b=f(-.18+i*.12,26); ctx.strokeStyle=`hsl(${(hue+i*60)%360},85%,60%)`; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
      if (!ghost && mode==="play"){ const k=(time*.5)%1; ctx.fillStyle=`rgba(43,26,16,${1-k})`; ctx.font="bold 14px "+FONT(); ctx.fillText("♪", top[0]+10+Math.sin(time*3)*5, top[1]-20-k*30); }
      break;
    }
    case "acuario": {
      box(cx,cy,0,0,.42,.3,0,14,"#7a4a2a","#5f3a20","#4f301a");
      const fx2=(a,b,z)=>P(cx,cy,a,b,z);
      poly([fx2(-.42,.3,14),fx2(.42,.3,14),fx2(.42,.3,44),fx2(-.42,.3,44)],"rgba(110,190,235,.55)","#3a6f95");
      poly([fx2(.42,-.3,14),fx2(.42,.3,14),fx2(.42,.3,44),fx2(.42,-.3,44)],"rgba(90,170,220,.55)","#3a6f95");
      poly([fx2(-.42,-.3,44),fx2(.42,-.3,44),fx2(.42,.3,44),fx2(-.42,.3,44)],"rgba(190,230,250,.6)","#3a6f95");
      for (let i=0;i<3;i++){ const k=Math.sin(time*(.8+i*.3)+i*2); const p=fx2(k*.3, .1-i*.15, 22+i*7); ell(p[0],p[1],4,2.4,["#eaa060","#f3d27a","#eea2a0"][i]); ctx.beginPath(); const dir=Math.cos(time*(.8+i*.3)+i*2)>0?-1:1; ctx.moveTo(p[0]+dir*3,p[1]); ctx.lineTo(p[0]+dir*7,p[1]-3); ctx.lineTo(p[0]+dir*7,p[1]+3); ctx.closePath(); ctx.fill(); }
      const w=fx2(-.2,.1,16); ctx.strokeStyle="#8fa84c"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(w[0],w[1]); ctx.quadraticCurveTo(w[0]+Math.sin(time)*3,w[1]-10,w[0]-2,w[1]-20); ctx.stroke();
      break;
    }
    case "fuente": {
      cyl(cx,cy,0,0,.42,0,12,"#8fd0f0","#b8b0a3");
      const c = P(cx,cy,0,0,12);
      ctx.strokeStyle="rgba(255,255,255,.6)"; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(c[0],c[1],12+Math.sin(time*2)*3,6+Math.sin(time*2)*1.5,0,0,Math.PI*2); ctx.stroke();
      cyl(cx,cy,0,0,.07,12,34,"#d6cfc2","#c4bcae");
      cyl(cx,cy,0,0,.2,34,38,"#8fd0f0","#c4bcae");
      const top = P(cx,cy,0,0,46);
      for (let i=0;i<6;i++){ const k=((time*1.2+i/6)%1); const a=i/6*Math.PI*2; circle(top[0]+Math.cos(a)*k*18, top[1]+Math.sin(a)*k*7-10*Math.sin(k*Math.PI)+k*20, 2, `rgba(160,215,245,${1-k*.6})`); }
      break;
    }
  }
}
function drawTableExtras(it, cx, cy, top){
      for (const c of customers) if (c.seat && seatTable(c.seat)===it && (c.state==="waiting" || c.state==="eating")){
        const d = DIRS[c.seat.r]; const p = P(cx,cy,-d[0]*.22,-d[1]*.22,top);
        if (c.state === "eating") drawDish(c.order.dish.id, p[0], p[1], .95);
        else ell(p[0], p[1]+2, 9, 4.5, "#ffffff", 0, "#9aa3ad", .8);
      }
      if (it.coins > 0){
        const p = P(cx,cy,.05,.05,top), n = Math.min(6, 1+Math.floor(it.coins/15));
        const bounce = Math.abs(Math.sin(time*3))*2;
        for (let i=0;i<n;i++) ell(p[0]+(i%2?3:-2), p[1]-i*2.5-bounce, 6, 3, i%2?"#e8a817":"#f0c96a", 0, "#9a6408", .8);
        ell(p[0]+8, p[1]-n*2.5-bounce-2, 5, 3, "#7fd35a", .3, "#2f6d1c", .8);
      }
}
/* the face a machine shows to the camera, or null when it faces the back walls */
function frontFace(cx, cy, r, dx, dy){
  if (r === 1) return (a,z) => P(cx,cy,a,dy,z);
  if (r === 0) return (a,z) => P(cx,cy,dx,-a,z);
  return null;
}

/* ---------- world render ---------- */
/* street layout (runs along the left wall): asphalt gx ∈ [ST0, ST1], sidewalk gx ∈ [ST1, SW1] */
const ST0 = -9.2, ST1 = -5.4, SW1 = -1.9, LANE_IN = -3.1, LANE_OUT = -4.2, LEN = 18;
/* visible tile range, refreshed every frame so the ground always reaches the screen edges */
const view = {a0:-20, a1:30, b0:-20, b1:30};
const edgeLo = () => Math.min(view.b0 - 3, -LEN), edgeHi = () => Math.max(view.b1 + 3, N + LEN);
function updateView(){
  const dpr = window.devicePixelRatio || 1, W = cv.width/dpr, H = cv.height/dpr;
  let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
  for (const [sx,sy] of [[0,0],[W,0],[0,H],[W,H]]){
    const wx = (sx - cam.ox)/cam.scale, wy = (sy - cam.oy)/cam.scale;
    const a = (wy/(TH/2) + wx/(TW/2))/2, b = (wy/(TH/2) - wx/(TW/2))/2;
    a0 = Math.min(a0,a); a1 = Math.max(a1,a); b0 = Math.min(b0,b); b1 = Math.max(b1,b);
  }
  view.a0 = Math.floor(a0) - 3; view.a1 = Math.ceil(a1) + 3; view.b0 = Math.floor(b0) - 3; view.b1 = Math.ceil(b1) + 6;
}
function hash(x, y){ let h = (x*374761393 + y*668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
let scen = null, scenN = 0;
let peds = [], cars = [], pedT = 1, carT = 2;
function scenery(){
  if (scen && scenN === LOT) return scen;
  scenN = LOT; const N = LOT;
  let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
  scen = {tufts:[], props:[
    {k:"tree", x:5.5, y:-3.4}, {k:"tree", x:N-1.5, y:-3.6}, {k:"bush", x:-1.2, y:-2.2},
    {k:"tree", x:N+1.6, y:1}, {k:"bush", x:N+1.2, y:Math.floor(N/2)}, {k:"tree", x:N+1.8, y:N-1}, {k:"bush", x:N+1, y:N+1},
    {k:"tree", x:1, y:N+1.8}, {k:"bush", x:Math.floor(N/2)+1, y:N+1.2}, {k:"flowers", x:N+.9, y:3}, {k:"flowers", x:3, y:N+.9},
    {k:"lamp", x:N+.9, y:N-3}, {k:"lamp", x:N-3, y:N+.9},
    {k:"billboard", x:-1.3, y:N+1.4}, {k:"garden", x:.4, y:-6.6},
  ]};
  for (let i=0;i<260;i++){ const a = -1.6 + rnd()*(N+9), b = -LEN + rnd()*(N+2*LEN); if (a>-1.2 && b>-1.2 && a<N+.9 && b<N+.9) continue; if (a > N+7 || b > N+7 || (b < -8 && a > 0)) continue; scen.tufts.push([a,b,rnd()]); }
  return scen;
}
function drawGround(){
  const sc = scenery(), L0 = view.b0, L1 = view.b1, A0 = Math.min(view.a0, ST0-8), A1 = Math.max(view.a1, LOT+4);
  const quad = (a0,a1,b0,b1,fill,stroke) => poly([P(0,0,a0,b0,0),P(0,0,a1,b0,0),P(0,0,a1,b1,0),P(0,0,a0,b1,0)], fill, stroke);
  quad(SW1, A1, L0, L1, "#cbd46e");
  quad(A0, ST0-3, L0, L1, "#c2cc66");
  // far sidewalk across the street
  quad(ST0-3, ST0, L0, L1, "#eadcbc");
  ctx.strokeStyle = "rgba(170,140,95,.45)"; ctx.lineWidth = 1;
  for (let b=Math.floor(L0); b<L1; b+=1){ ctx.beginPath(); ctx.moveTo(...P(0,0,ST0-3,b,0)); ctx.lineTo(...P(0,0,ST0,b,0)); ctx.stroke(); }
  quad(ST0-3.12, ST0-3, L0, L1, "#c9b48a");
  // asphalt, curbs and lane markings
  quad(ST0, ST1, L0, L1, "#8f8b72");
  quad(ST0, ST0+.18, L0, L1, "#f6eedb"); quad(ST1, ST1+.18, L0, L1, "#f6eedb");
  ctx.strokeStyle = "#f6efd8"; ctx.lineWidth = 2.5;
  const mid = (ST0+ST1)/2;
  for (let b=Math.floor(L0/1.4)*1.4; b<L1; b+=1.4){ ctx.beginPath(); ctx.moveTo(...P(0,0,mid,b,0)); ctx.lineTo(...P(0,0,mid,b+.7,0)); ctx.stroke(); }
  // zebra crossing in front of the door
  for (let a=ST0+.45; a<ST1-.3; a+=.62) quad(a, a+.32, DOOR_Y-.9, DOOR_Y+.9, "#f6efd8");
  // curbside grass strip
  ctx.strokeStyle = "#a3b24c"; ctx.lineWidth = 1.3;
  for (let b=Math.floor(L0); b<L1; b+=.5){ if (hash(Math.floor(b*2), 3) < .55) continue; const p = P(0,0,ST1+.35,b,0); ctx.beginPath(); ctx.moveTo(p[0]-2,p[1]); ctx.lineTo(p[0]-1,p[1]-4); ctx.moveTo(p[0]+1,p[1]); ctx.lineTo(p[0]+2,p[1]-5); ctx.stroke(); }
  // sidewalk pavers
  quad(ST1+.18, SW1, L0, L1, "#eadcbc");
  ctx.strokeStyle = "rgba(170,140,95,.45)"; ctx.lineWidth = 1;
  for (let b=Math.floor(L0); b<L1; b+=1){ ctx.beginPath(); ctx.moveTo(...P(0,0,ST1+.18,b,0)); ctx.lineTo(...P(0,0,SW1,b,0)); ctx.stroke(); }
  for (const a of [ST1+1.3, ST1+2.4]){ ctx.beginPath(); ctx.moveTo(...P(0,0,a,L0,0)); ctx.lineTo(...P(0,0,a,L1,0)); ctx.stroke(); }
  quad(SW1-.12, SW1, L0, L1, "#c9b48a");
  // grass tufts, placed per tile so they continue forever
  ctx.lineWidth = 1.5;
  for (let a=Math.floor(A0); a<A1; a++) for (let b=Math.floor(L0); b<L1; b++){
    if (a >= ST0-3 && a < SW1) continue;
    if (a >= -1 && b >= -1 && a <= LOT && b <= LOT) continue;
    const h = hash(a, b); if (h > .3) continue;
    const p = P(0,0,a+hash(b,a)*.8,b+h*2.5,0);
    ctx.strokeStyle = h > .15 ? "#a3b24c" : "#e3e69e";
    ctx.beginPath(); ctx.moveTo(p[0]-3,p[1]); ctx.lineTo(p[0]-1,p[1]-5); ctx.moveTo(p[0],p[1]); ctx.lineTo(p[0]+1,p[1]-6); ctx.moveTo(p[0]+3,p[1]); ctx.lineTo(p[0]+3.5,p[1]-4); ctx.stroke();
  }
  // stone terrace around the restaurant
  const m = .75;
  poly([P(0,0,-m,-m,0),P(0,0,LOT+m,-m,0),P(0,0,LOT+m,LOT+m,0),P(0,0,-m,LOT+m,0)], "#e9d9b4", "#c9b48a");
  ctx.strokeStyle = "rgba(170,140,95,.4)"; ctx.lineWidth = 1;
  for (let i=0;i<=LOT;i++){ ctx.beginPath(); ctx.moveTo(...P(0,0,i,LOT,0)); ctx.lineTo(...P(0,0,i,LOT+m,0)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(...P(0,0,LOT,i,0)); ctx.lineTo(...P(0,0,LOT+m,i,0)); ctx.stroke(); }
  // path from the sidewalk to the door
  quad(SW1, -.75, DOOR_Y+.1, DOOR_Y+.9, "#efe2c4", "#c9b48a");
  // everything outside behind the walls, depth-sorted: props, cars, passers-by, customers on their way in or out
  const list = [];
  for (const p of sc.props) if (p.x < 0 || p.y < 0) list.push({d:p.x+p.y+1, f:() => drawProp(p)});
  for (let k=Math.floor(view.b0/4.5); k*4.5<view.b1; k++){
    const lamp = {k:"pole", x:ST1+.45, y:k*4.5+.5}; list.push({d:lamp.x+lamp.y+1, f:() => drawProp(lamp)});
    const lamp2 = {k:"pole", x:ST0-.45, y:k*4.5+2.75}; list.push({d:lamp2.x+lamp2.y+1, f:() => drawProp(lamp2)});
    for (const off of [1.6, 3.1]){ const bo = {k:"bollard", x:SW1+.2, y:k*4.5+off}; list.push({d:bo.x+bo.y+1, f:() => drawProp(bo)}); }
    const tr = {k: hash(k,7) > .5 ? "tree" : "bush", x:ST0-4.6, y:k*4.5+1.5}; list.push({d:tr.x+tr.y+1, f:() => drawProp(tr)});
  }
  for (const c of cars) list.push({d:c.x+c.y+1, f:() => drawCar(c)});
  for (const e of peds.concat(customers)) if (e.x < 0) list.push({d:e.x+e.y+1.01, f:() => { const c = tileCenter(e.x, e.y); drawPerson(c.x, c.y, e); }});
  list.sort((a,b) => a.d - b.d);
  for (const l of list) l.f();
  // sagging power lines between the utility poles
  ctx.strokeStyle = "rgba(91,59,43,.55)"; ctx.lineWidth = 1;
  for (const [gx, off] of [[ST1+.45, .5], [ST0-.45, 2.75]]) for (let k=Math.floor(view.b0/4.5)-1; k*4.5<view.b1; k++){
    for (const dz of [0, 7]){
      const a = P(0,0,gx,k*4.5+off,0), b = P(0,0,gx,(k+1)*4.5+off,0);
      const A = [a[0]-11, a[1]-104+dz], B = [b[0]-11, b[1]-104+dz];
      ctx.beginPath(); ctx.moveTo(...A); ctx.quadraticCurveTo((A[0]+B[0])/2, (A[1]+B[1])/2+14, ...B); ctx.stroke();
    }
  }
}
function drawProp(p){
  const c = tileCenter(p.x, p.y);
  if (p.k === "tree"){
    const pink = hash(Math.floor(p.x*3), Math.floor(p.y*3)) > .72;
    const C = pink ? ["#f4b39a","#eea084","#fcd2bd"] : ["#bccb5c","#a9ba4e","#dfe58f"];
    ell(c.x+6, c.y+2, 24, 10, "rgba(120,90,60,.2)");
    ctx.fillStyle = "#a8774f"; ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(c.x-4, c.y); ctx.lineTo(c.x-3, c.y-36); ctx.lineTo(c.x+3, c.y-36); ctx.lineTo(c.x+4, c.y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c.x, c.y-28); ctx.lineTo(c.x+9, c.y-40); ctx.stroke();
    for (const [a,b,r,i] of [[-14,-48,15,1],[14,-50,15,1],[0,-62,20,0],[-9,-74,13,0],[10,-72,13,0]]) circle(c.x+a, c.y+b, r, C[i], OL, 1.2);
    for (const [a,b,r] of [[-4,-70,6],[-16,-52,5],[6,-62,5]]) circle(c.x+a, c.y+b, r, C[2]);
  } else if (p.k === "bush"){
    for (const [a,b,r,col] of [[-9,-8,10,"#a9ba4e"],[8,-8,10,"#a9ba4e"],[0,-14,12,"#bccb5c"]]) circle(c.x+a, c.y+b, r, col, OL, 1.1);
    circle(c.x-2, c.y-17, 4, "#dfe58f");
  } else if (p.k === "pole"){
    ell(c.x+4, c.y+1, 8, 3.5, "rgba(120,90,60,.22)");
    ctx.fillStyle = "#b08a62"; ctx.strokeStyle = OL; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.rect(c.x-2.5, c.y-112, 5, 112); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.rect(c.x-22, c.y-106, 30, 4); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.rect(c.x-18, c.y-98, 22, 3.5); ctx.fill(); ctx.stroke();
    fs(() => roundRect(c.x+3, c.y-82, 9, 14, 2), "#c9c2ae", OL, 1);
    ell(c.x-9, c.y-92, 4, 2.4, "#f6efd8", 0, OL, 1);
  } else if (p.k === "bollard"){
    fs(() => roundRect(c.x-2.5, c.y-13, 5, 13, 2.5), "#b8774f", OL, 1);
    ctx.fillStyle = "#f6efd8"; ctx.fillRect(c.x-2.5, c.y-10, 5, 1.6);
  } else if (p.k === "flowers"){
    for (let i=0;i<6;i++){ const a = (i-2.5)*6, b = (i%2)*4; ctx.strokeStyle = "#8fa84c"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(c.x+a, c.y+b); ctx.lineTo(c.x+a, c.y+b-9); ctx.stroke(); circle(c.x+a, c.y+b-10, 3, ["#eea2a0","#f3d27a","#e88a78"][i%3], OLI); }
  } else if (p.k === "lamp"){
    ctx.fillStyle = "#6b5444"; ctx.fillRect(c.x-2, c.y-60, 4, 60); circle(c.x, c.y-64, 7, "#fff1b0", "#6b5444", 2);
  } else if (p.k === "streetlamp"){
    ell(c.x, c.y, 7, 3.5, "rgba(120,90,60,.22)");
    ctx.fillStyle = "#8a6248"; ctx.strokeStyle = OL; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(c.x-2, c.y-70, 4, 70); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c.x, c.y-70); ctx.quadraticCurveTo(c.x-4, c.y-80, c.x-14, c.y-76); ctx.lineWidth = 3; ctx.strokeStyle = "#8a6248"; ctx.stroke();
    ell(c.x-15, c.y-74, 6, 3, "#fff3b8", 0, OL, 1);
    const g = ctx.createRadialGradient(c.x-15, c.y-70, 1, c.x-15, c.y-70, 26); g.addColorStop(0, "rgba(255,240,170,.45)"); g.addColorStop(1, "rgba(255,240,170,0)"); ctx.fillStyle = g; ctx.fillRect(c.x-41, c.y-96, 52, 52);
  } else if (p.k === "billboard"){
    const a = (u,z) => P(c.x, c.y, 0, u, z);
    for (const u of [-.55,.55]){ const s = a(u,0), t = a(u,40); ctx.strokeStyle = "#7a6656"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(...s); ctx.lineTo(...t); ctx.stroke(); }
    faceQuad(a, -1.05, 1.05, 36, 92, "#2b2d38", OL);
    faceQuad(a, -.95, .95, 41, 87, "#ffe9a8");
    // poster: a smiling chef and the restaurant name
    const h = a(.45, 66); circle(h[0], h[1], 11, "#ffdcbf", OL, 1.2); ell(h[0]-3.5, h[1]+1, 1.6, 2.4, OL); ell(h[0]+3.5, h[1]-2.5, 1.6, 2.4, OL);
    for (const [dx,dy,r] of [[-5,-13,6],[5,-17,6],[0,-19,7]]) circle(h[0]+dx, h[1]+dy, r, "#ffffff", OL, 1);
    ctx.save(); const t = a(-.35, 64); ctx.translate(t[0], t[1]); ctx.transform(1, -.5, 0, 1, 0, 0);
    ctx.textAlign = "center"; ctx.font = "700 13px " + FONT(); ctx.lineWidth = 3; ctx.strokeStyle = "#ffffff"; ctx.fillStyle = "#d9775f";
    ctx.strokeText("¡Ven a", 0, -6); ctx.fillText("¡Ven a", 0, -6); ctx.strokeText("comer!", 0, 9); ctx.fillText("comer!", 0, 9);
    ctx.restore();
  } else if (p.k === "garden"){
    const q = (a0,a1,b0,b1,fill,stroke) => poly([P(c.x,c.y,a0,b0,0),P(c.x,c.y,a1,b0,0),P(c.x,c.y,a1,b1,0),P(c.x,c.y,a0,b1,0)], fill, stroke);
    q(-.6, 3.6, -.6, 2.6, "#cfc6b5", "#a99f8c");
    for (let i=0;i<4;i++) for (let j=0;j<3;j++){
      const ox = i, oy = j;
      q(ox-.42, ox+.42, oy-.42, oy+.42, "#7a4a2a", OL);
      const p2 = P(c.x, c.y, ox, oy, 0), kind2 = (i*3+j) % 3;
      if (kind2 === 0){ for (const [dx,dy] of [[-6,0],[6,0],[0,-4]]){ circle(p2[0]+dx, p2[1]+dy-5, 4.5, "#a9be5a", OLI); } }
      else if (kind2 === 1){ circle(p2[0], p2[1]-8, 7, "#8fa84c", OLI); circle(p2[0]-3, p2[1]-7, 2.4, "#d9775f"); circle(p2[0]+3, p2[1]-10, 2.4, "#d9775f"); }
      else { for (const dx of [-5,0,5]){ ctx.strokeStyle = "#8fa84c"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p2[0]+dx, p2[1]); ctx.lineTo(p2[0]+dx, p2[1]-9); ctx.stroke(); ell(p2[0]+dx, p2[1]+1, 2.4, 1.4, "#eaa060"); } }
    }
    const lp = P(c.x, c.y, 3.6, -.6, 0); ctx.fillStyle = "#6b5444"; ctx.fillRect(lp[0]-1.5, lp[1]-40, 3, 40); circle(lp[0], lp[1]-43, 5, "#fff1b0", "#6b5444", 1.5);
  }
}

/* ---------- passers-by and traffic ---------- */
function updateStreet(dt){
  pedT -= dt;
  if (pedT <= 0 && peds.length < 10){
    pedT = 1.2 + Math.random()*2.4;
    const fwd = Math.random() < .5, lane = fwd ? LANE_IN : LANE_OUT;
    const y0 = fwd ? edgeLo() : edgeHi(), y1 = fwd ? edgeHi() : edgeLo();
    peds.push({x:lane + (Math.random()-.5)*.3, y:y0, path:[[lane, y1]], face:[0, fwd?1:-1], look:randLook(), walk:Math.random()*6, moving:true, speed:1+Math.random()*.5});
  }
  for (const p of peds) if (moveEnt(p, dt, p.speed)) p.dead = true;
  peds = peds.filter(p => !p.dead);
  carT -= dt;
  if (carT <= 0){
    carT = 4 + Math.random()*6;
    const fwd = Math.random() < .5, lane = fwd ? ST1-1 : ST0+1;
    const types = ["truck","car","car","van"];
    cars.push({x:lane, y: fwd ? edgeLo()-1 : edgeHi()+1, dir: fwd?1:-1, speed: 3.5+Math.random()*1.5, type: types[Math.floor(Math.random()*types.length)], col:["#d9775f","#8fb8d0","#f0c96a","#9cbf6a","#f4f4f8"][Math.floor(Math.random()*5)]});
  }
  for (const c of cars) c.y += c.dir*c.speed*dt;
  cars = cars.filter(c => c.y > edgeLo()-3 && c.y < edgeHi()+3);
}
function drawCar(c){
  const t = tileCenter(c.x, c.y), cx = t.x, cy = t.y, d = c.dir;
  ell(cx, cy, 30, 14, "rgba(120,90,60,.22)");
  const wheels = () => { for (const k of [-.55,.55]){ const w = P(cx,cy,.36,k,6); ell(w[0], w[1], 4.5, 6, "#4a3a30", 0, OL, 1); circle(w[0], w[1], 2, "#9aa3ad"); } };
  if (c.type === "truck"){
    box(cx,cy,0,0,.36,.95,4,44,"#ffffff","#f2f2f6","#e3e3ea");
    const side = (u,z) => P(cx,cy,.36,u,z);
    faceQuad(side, -.75, .45, 18, 34, "#f0c96a", OL);
    faceQuad(side, -.7, .4, 34, 40, "#d9775f");
    const cabU = d > 0 ? .62 : -.92;
    faceQuad(side, cabU, cabU+.3, 24, 38, "#9fd6ff", OL);
    const s = side(-.15, 26); ctx.save(); ctx.translate(s[0], s[1]); ctx.transform(1, -.5, 0, 1, 0, 0); ctx.fillStyle = "#5b3b2b"; ctx.font = "700 11px " + FONT(); ctx.textAlign = "center"; ctx.fillText("TACOS", 0, 4); ctx.restore();
    wheels();
  } else if (c.type === "van"){
    box(cx,cy,0,0,.36,.85,4,34,c.col,shade(c.col,.9),shade(c.col,.78));
    const side = (u,z) => P(cx,cy,.36,u,z);
    for (const u of [-.6,-.2,.2]) faceQuad(side, u, u+.32, 20, 30, "#9fd6ff", OLI);
    wheels();
  } else {
    box(cx,cy,0,0,.34,.78,4,18,c.col,shade(c.col,.9),shade(c.col,.78));
    const cab = d > 0 ? .08 : -.08;
    box(cx,cy,0,cab,.3,.42,18,30,shade(c.col,1.08),"#9fd6ff","#86c4f0");
    wheels();
  }
}
function drawFloor(){
  const F = FLOORS[S.floor];
  for (let y=0;y<LOT;y++) for (let x=0;x<LOT;x++){
    if (x < N && y < N) continue;
    const c = tileCenter(x,y);
    poly([[c.x, c.y-TH/2],[c.x+TW/2,c.y],[c.x,c.y+TH/2],[c.x-TW/2,c.y]], (x+y)%2 ? "#d4dc7c" : "#cad374", "rgba(120,130,40,.2)");
  }
  for (let y=0;y<N;y++) for (let x=0;x<N;x++){
    const c = tileCenter(x,y);
    let col = (x+y)%2 ? F.b : F.a;
    if (F.planks) col = y%2 ? F.a : F.b;
    const dia = [[c.x, c.y-TH/2],[c.x+TW/2,c.y],[c.x,c.y+TH/2],[c.x-TW/2,c.y]];
    poly(dia, col, F.carpet ? null : F.planks ? "rgba(70,40,20,.35)" : "rgba(0,0,0,.1)");
    if (F.carpet){
      poly([[c.x, c.y-5],[c.x+10,c.y],[c.x,c.y+5],[c.x-10,c.y]], F.carpet);
      if (F.carpet2){ circle(c.x, c.y, 2, F.carpet2); for (const [a,b] of [[0,-16],[32,0],[0,16],[-32,0]]) circle(c.x+a*.5, c.y+b*.5, 1.4, F.carpet2); }
    } else if (F.planks){
      ctx.strokeStyle = "rgba(70,40,20,.25)"; ctx.lineWidth = 1; const s = P(c.x, c.y, (x%3)/3-.2, -.5, 0), e = P(c.x, c.y, (x%3)/3-.2, .5, 0); ctx.beginPath(); ctx.moveTo(...s); ctx.lineTo(...e); ctx.stroke();
    }
  }
  if (F.carpet){ poly([P(0,0,.08,.08,0),P(0,0,N-.08,.08,0),P(0,0,N-.08,N-.08,0),P(0,0,.08,N-.08,0)], null, F.carpet2 || "#e7a2c1", 2); }
  // soft shadow along the back walls
  const sh = (a,b,c2,d) => poly([a,b,c2,d], "rgba(0,0,0,.1)");
  sh(P(0,0,0,0,0),P(0,0,N,0,0),P(0,0,N,.35,0),P(0,0,.35,.35,0));
  sh(P(0,0,0,0,0),P(0,0,.35,.35,0),P(0,0,.35,N,0),P(0,0,0,N,0));
  // doormat
  const d = tileCenter(0, DOOR_Y);
  poly([P(d.x,d.y,-.4,-.35,0),P(d.x,d.y,.15,-.35,0),P(d.x,d.y,.15,.35,0),P(d.x,d.y,-.4,.35,0)], "#b5372f", OLI);
  // floor slab edge
  poly([P(0,0,0,LOT,0),P(0,0,LOT,LOT,0),P(0,0,LOT,LOT,-9),P(0,0,0,LOT,-9)], "#b88f66", OL);
  poly([P(0,0,LOT,0,0),P(0,0,LOT,LOT,0),P(0,0,LOT,LOT,-9),P(0,0,LOT,0,-9)], "#cfa77c", OL);
  if (LOT > N){ ctx.strokeStyle = "rgba(90,70,40,.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...P(0,0,N,0,0)); ctx.lineTo(...P(0,0,N,N,0)); ctx.lineTo(...P(0,0,0,N,0)); ctx.stroke(); }
  // land for sale, shown while decorating
  const nextLand = LAND.find(l => l.n > LOT);
  if (mode === "deco" && nextLand){
    const n = nextLand.n;
    ctx.setLineDash([6,5]); ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 2;
    poly([P(0,0,LOT,0,0),P(0,0,n,0,0),P(0,0,n,n,0),P(0,0,0,n,0),P(0,0,0,LOT,0),P(0,0,LOT,LOT,0)], "rgba(255,255,255,.12)", "rgba(255,255,255,.85)", 2);
    ctx.setLineDash([]);
    const sp = P(0,0,(LOT+n)/2,(LOT+n)/2,0);
    ctx.fillStyle = "#7a4a26"; ctx.fillRect(sp[0]-2, sp[1]-34, 4, 34);
    ctx.fillStyle = "#ffffff"; roundRect(sp[0]-30, sp[1]-56, 60, 26, 4); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#d9775f"; ctx.font = "700 11px " + FONT(); ctx.textAlign = "center"; ctx.fillText("SE VENDE", sp[0], sp[1]-45); ctx.fillStyle = "#2f6d1c"; ctx.fillText(nextLand.price + " $", sp[0], sp[1]-34);
  }
}
/* wall coordinates: side R runs along gy=0, side L along gx=0; u = distance along the wall, h = height, w = depth into the wall (outward) */
function wallPt(side, u, h, w){ w = w || 0; return side==="R" ? P(0,0,u,-w,h) : P(0,0,-w,u,h); }
function drawWalls(){
  const W = WALLS[S.wall];
  for (const side of ["L","R"]){
    const base = side==="L" ? shade(W.base,.88) : W.base;
    const q = (u0,u1,h0,h1,fill,stroke) => poly([wallPt(side,u0,h0),wallPt(side,u1,h0),wallPt(side,u1,h1),wallPt(side,u0,h1)], fill, stroke);
    q(0, N, 0, WH, base);
    if (W.brick){
      ctx.strokeStyle = "rgba(70,30,20,.28)"; ctx.lineWidth = 1;
      for (let h=8; h<WH; h+=8){ const a=wallPt(side,0,h), b=wallPt(side,N,h); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
        for (let u=(h/8)%2?0.25:0; u<N; u+=.5){ const p=wallPt(side,u,h), p2=wallPt(side,u,h+8); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...p2); ctx.stroke(); } }
    }
    if (W.panel){ q(0, N, 0, 36, side==="L" ? shade(W.panel,.88) : W.panel); q(0, N, 34, 38, W.trim, OLI); }
    q(0, N, 0, 7, "#4a2f1e");
    // windows with awnings
    for (let i=1;i<N-1;i+=3){
      if (side==="L" && i<=DOOR_Y+1 && i+1>=DOOR_Y) continue;
      q(i+.08, i+.92, 40, 88, W.trim, OLI);
      const g = ctx.createLinearGradient(0, wallPt(side,i,84)[1], 0, wallPt(side,i,44)[1]); g.addColorStop(0,"#8fd0ff"); g.addColorStop(1,"#e4f5ff");
      q(i+.16, i+.84, 44, 84, g, OLI);
      ctx.strokeStyle = W.trim; ctx.lineWidth = 3; const a=wallPt(side,i+.5,44), b=wallPt(side,i+.5,84); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
      const c=wallPt(side,i+.16,64), e=wallPt(side,i+.84,64); ctx.beginPath(); ctx.moveTo(...c); ctx.lineTo(...e); ctx.stroke();
      for (let k=0;k<4;k++) q(i+.08+k*.21, i+.29+k*.21, 88, 97, k%2 ? "#f6efd8" : "#6f9c8a", OL);
    }
    // framed pictures between windows
    for (let i=2.5;i<N-1;i+=3){
      if (side==="L" && Math.abs(i-DOOR_Y-.5) < 1.6) continue;
      q(i-.28, i+.28, 50, 76, "#6b4426", OLI);
      q(i-.22, i+.22, 54, 72, side==="L" ? "#fbe7b4" : "#cfe8ff");
      const m = wallPt(side, i, 58), m2 = wallPt(side, i-.12, 58), m3 = wallPt(side, i+.15, 66);
      ctx.fillStyle = side==="L" ? "#d9775f" : "#8fae5a"; ctx.beginPath(); ctx.moveTo(m2[0],m2[1]); ctx.lineTo(m3[0],m3[1]); ctx.lineTo(m[0]+(side==="L"?-6:6), m[1]); ctx.closePath(); ctx.fill();
    }
  }
  // neon sign on the right wall
  const ns = wallPt("R", N-1.6, 78);
  ctx.save(); ctx.translate(ns[0], ns[1]); ctx.transform(1, .5, 0, 1, 0, 0);
  ctx.fillStyle = "#fffaf0"; roundRect(-34,-13,68,24,8); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#d9775f"; ctx.font = "700 14px " + FONT(); ctx.textAlign = "center"; ctx.fillText("Sabrosa", 0, 4);
  ctx.restore();
  // wall thickness: top caps and visible end faces (dollhouse cut)
  const W2 = WALLS[S.wall];
  for (const side of ["L","R"]){
    poly([wallPt(side,-WT,WH,WT),wallPt(side,N,WH,WT),wallPt(side,N,WH,0),wallPt(side,0,WH,0)], "#5e8c7c", OL);
    poly([wallPt(side,-WT,WH,WT),wallPt(side,N,WH,WT),wallPt(side,N,WH+5,WT*.5),wallPt(side,-WT*.5,WH+5,WT*.5)], "#4f7a6b", OL);
    ctx.strokeStyle = "rgba(255,250,240,.35)"; ctx.lineWidth = 1; for (let u=.5; u<N; u+=1){ ctx.beginPath(); ctx.moveTo(...wallPt(side,u,WH,0)); ctx.lineTo(...wallPt(side,u,WH+5,WT*.5)); ctx.stroke(); }
  }
  poly([wallPt("R",N,0,0),wallPt("R",N,0,WT),wallPt("R",N,WH,WT),wallPt("R",N,WH,0)], shade(W2.base,.75), OLI);
  poly([wallPt("L",N,0,0),wallPt("L",N,0,WT),wallPt("L",N,WH,WT),wallPt("L",N,WH,0)], shade(W2.base,.65), OLI);
  // door on the left wall
  const q = (u0,u1,h0,h1,fill,stroke) => poly([wallPt("L",u0,h0),wallPt("L",u1,h0),wallPt("L",u1,h1),wallPt("L",u0,h1)], fill, stroke);
  q(DOOR_Y-.06, DOOR_Y+1.06, 0, 80, "#f6f2ea", OLI);
  q(DOOR_Y+.05, DOOR_Y+.95, 0, 74, "#2a1a10");
  q(DOOR_Y+.05, DOOR_Y+.3, 0, 74, "#fbfaf6", OLI);
  q(DOOR_Y+.09, DOOR_Y+.26, 40, 66, "#cfe8ff");
  const kn = wallPt("L", DOOR_Y+.24, 36); circle(kn[0], kn[1], 1.8, "#f0c96a", OL);
  const s = wallPt("L", DOOR_Y+.5, 90);
  ctx.save(); ctx.translate(s[0], s[1]); ctx.transform(1, -.5, 0, 1, 0, 0);
  ctx.fillStyle = mode==="play" ? "#5e8c7c" : "#d9775f"; roundRect(-26,-9,52,16,4); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle="#fff"; ctx.font = "600 10px "+FONT(); ctx.textAlign="center"; ctx.fillText(mode==="play" ? "ABIERTO" : "CERRADO", 0, 3);
  ctx.restore();
}

function bubble(x, y, dish, frac, kind2){
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#fffaf0"; ctx.strokeStyle = "#8a6248"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  circle(-7, 18, 3, "#ffffff", "#8a6248", 1.2); circle(-10, 24, 1.8, "#fffaf0", "#8a6248", 1);
  if (kind2 === "angry"){
    circle(-4,-1,6,"#6b7280"); circle(4,-2,7,"#6b7280"); circle(0,3,6,"#6b7280");
    ctx.strokeStyle="#f5b82e"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(1,6); ctx.lineTo(-2,11); ctx.lineTo(2,11); ctx.lineTo(-1,16); ctx.stroke();
  } else if (kind2 === "clock"){
    circle(0, 0, 9, "#eaf3fb", "#3b8ee0", 2); ctx.strokeStyle = "#2b2f38"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-6); ctx.moveTo(0,0); ctx.lineTo(4,2); ctx.stroke();
  } else if (dish){
    drawDish(dish, 0, 3, 1);
    if (frac != null){
      ctx.strokeStyle = frac > .5 ? "#8fae5a" : frac > .25 ? "#f5b82e" : "#d9775f"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 18, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#e48a6e"; ctx.beginPath(); ctx.moveTo(0,7); ctx.bezierCurveTo(-12,-2,-6,-11,0,-4); ctx.bezierCurveTo(6,-11,12,-2,0,7); ctx.fill();
  }
  ctx.restore();
}

function render(){
  const W = cv.width, H = cv.height, dpr = window.devicePixelRatio || 1;
  ctx.setTransform(1,0,0,1,0,0);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#cbd46e"); g.addColorStop(1, "#cbd46e");
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  layoutCam(); updateView();
  ctx.setTransform(dpr*cam.scale, 0, 0, dpr*cam.scale, dpr*cam.ox, dpr*cam.oy);
  ctx.lineJoin = "round";
  drawGround();
  drawFloor();
  drawWalls();
  if (mode === "deco" && held && hover){
    const ok = canPlace(hover.x, hover.y);
    const c = tileCenter(hover.x, hover.y);
    if (inside(hover.x, hover.y)) poly([[c.x, c.y-TH/2],[c.x+TW/2,c.y],[c.x,c.y+TH/2],[c.x-TW/2,c.y]], ok ? "rgba(80,220,100,.45)" : "rgba(230,60,50,.45)", ok ? "#2e8b3a" : "#b0322b");
  }
  if (mode === "deco"){
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 1;
    for (let i=0;i<=LOT;i++){ ctx.beginPath(); ctx.moveTo(...P(0,0,i,0,0)); ctx.lineTo(...P(0,0,i,LOT,0)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(...P(0,0,0,i,0)); ctx.lineTo(...P(0,0,LOT,i,0)); ctx.stroke(); }
  }
  const list = [];
  for (const p of scenery().props) if (p.x >= 0 && p.y >= 0) list.push({d: p.x+p.y+1, k:0, f:() => drawProp(p)});
  for (const it of S.items) list.push({d: it.x+it.y+1, k:0, f:() => { const c = tileCenter(it.x,it.y); drawItem(it, c.x, c.y, false); }});
  const ents = customers.filter(c => !(c.seat && c.seat.res===c && (c.state==="seated"||c.state==="waiting"||c.state==="eating"||(c.state==="leave"&&c.rise>0))));
  for (const e of ents.concat(staff)){
    if (e.x < 0) continue;
    list.push({d: e.x+e.y+1.01, k:1, f:() => {
      const c = tileCenter(e.x, e.y);
      drawPerson(c.x, c.y, e, {carry: e.role==="waiter" && e.order && e.state==="carry" ? e.order.dish.id : null, cook: e.role==="chef" && !!e.order && !e.moving});
    }});
  }
  if (mode === "deco" && held && hover && inside(hover.x,hover.y)){
    list.push({d: hover.x+hover.y+1.02, k:2, f:() => { const c = tileCenter(hover.x,hover.y); ctx.globalAlpha = .7; drawItem({t:held.t, r:held.r, x:hover.x, y:hover.y, coins:0}, c.x, c.y, true); ctx.globalAlpha = 1; }});
  }
  list.sort((a,b) => a.d - b.d || a.k - b.k);
  for (const l of list) l.f();
  // name tags, then bubbles, on top of everything
  for (const e of customers.concat(staff)){
    if (e.x < -.3) continue;
    const p = tileCenter(e.x, e.y), sk = e.seat && e.seat.res === e ? (e.sitK || 0) : 0, seated = sk*sk*(3-2*sk);
    const tall = e.look.hat === "tophat" || e.look.hat === "lucky" || e.look.hat === "ears" ? 14 : e.look.hat === "chef" ? 10 : 0;
    nameTag(p.x, p.y - 60 - 2*seated - tall, e.look.name);
  }
  for (const c of customers){
    const p = tileCenter(c.x, c.y);
    if (c.state==="waiting") bubble(p.x+20, p.y-98, c.order.dish.id, c.pat/c.maxPat);
    else if (c.state==="seated") bubble(p.x+20, p.y-98, null, null, "clock");
    else if (c.state==="leave" && c.t > 0 && c.x >= 0) bubble(p.x+20, p.y-86, null, null, c.mood==="angry" ? "angry" : null);
  }
  for (const f of fx){
    const k = f.t/1.4;
    ctx.globalAlpha = 1-k; ctx.font = "700 18px "+FONT(); ctx.textAlign = "center";
    ctx.lineWidth = 4; ctx.strokeStyle = "#2f6d1c"; ctx.strokeText(f.text, f.x, f.y - k*40); ctx.fillStyle = "#c8f5a8"; ctx.fillText(f.text, f.x, f.y - k*40);
    ctx.globalAlpha = 1;
  }
}
function layoutCam(){
  const dpr = window.devicePixelRatio || 1;
  const W = cv.width/dpr, H = cv.height/dpr;
  const top = 64, bot = mode==="deco" ? 250 : 84;
  const minX = -LOT*TW/2 - 150, maxX = LOT*TW/2 + 40, minY = -WH - 110, maxY = LOT*TH + 40;
  const aw = W - 16, ah = Math.max(120, H - top - bot);
  const fit = Math.min(aw/(maxX-minX), ah/(maxY-minY));
  cam.scale = Math.max(.3, Math.min(1.8, fit)) * cam.zoom;
  cam.ox = W/2 - (minX+maxX)/2*cam.scale + cam.px;
  cam.oy = top + ah/2 - (minY+maxY)/2*cam.scale + cam.py;
}
function screenToTile(sx, sy){
  const wx = (sx - cam.ox)/cam.scale, wy = (sy - cam.oy)/cam.scale;
  const a = wy/(TH/2), b = wx/(TW/2);
  return {x: Math.floor((a+b)/2), y: Math.floor((a-b)/2)};
}

/* ---------- placement ---------- */
function entityOn(x, y){
  for (const e of customers.concat(staff)){
    if (Math.round(e.x)===x && Math.round(e.y)===y) return true;
    if (e.path.length && e.path[0][0]===x && e.path[0][1]===y) return true;
  }
  return false;
}
function canPlace(x, y){
  if (!inside(x,y) || itemAt(x,y)) return false;
  if (x===0 && y===DOOR_Y) return false;
  if (entityOn(x,y)) return false;
  if (held && held.buy && S.coins < ITEMS[held.t].price) return false;
  return true;
}
function autoOrientChair(it){
  if (seatTable(it)) return;
  for (let r=0;r<4;r++){ const d=DIRS[r]; const t=itemAt(it.x+d[0], it.y+d[1]); if (t && kind(t)==="table"){ it.r = r; return; } }
}
function place(x, y){
  if (!canPlace(x,y)){
    if (held.buy && S.coins < ITEMS[held.t].price) toast("No tienes monedas suficientes");
    else if (x===0 && y===DOOR_Y) toast("La entrada debe quedar libre");
    return;
  }
  const it = {t:held.t, x, y, r:held.r, id:uid++, coins:0, coinT:0};
  if (held.buy){ S.coins -= ITEMS[held.t].price; }
  S.items.push(it); rebuildOcc();
  if (kind(it)==="chair") autoOrientChair(it);
  if (kind(it)==="table") for (const [dx,dy] of DIRS){ const c = itemAt(x+dx,y+dy); if (c && kind(c)==="chair" && !c.res) autoOrientChair(c); }
  if (!held.buy){ held = null; }
  save(); refreshUI();
}
function pickUp(it){
  if (kind(it)==="chair" && it.res){ toast("Hay un cliente en esa silla"); return; }
  if (kind(it)==="table" && S.items.some(c => kind(c)==="chair" && c.res && seatTable(c)===it)){ toast("Hay clientes en esa mesa"); return; }
  if (kind(it)==="stove" && (it.cooking || orders.some(o => o.stove===it))){ toast("La estufa está ocupada"); return; }
  if (it.coins > 0) collect(it);
  S.items.splice(S.items.indexOf(it), 1); rebuildOcc();
  held = {t:it.t, r:it.r, buy:false, from:{x:it.x, y:it.y, r:it.r}};
  refreshUI();
}
function returnHeld(){
  if (held && !held.buy && held.from){
    S.items.push({t:held.t, x:held.from.x, y:held.from.y, r:held.from.r, id:uid++, coins:0, coinT:0}); rebuildOcc();
  }
  held = null; refreshUI();
}

/* ---------- input ---------- */
let down = null;
function resize(){
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.round(innerWidth*dpr); cv.height = Math.round(innerHeight*dpr);
}
addEventListener("resize", resize);
cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); down = {x:e.clientX, y:e.clientY, px:cam.px, py:cam.py, moved:false}; });
cv.addEventListener("pointermove", e => {
  hover = screenToTile(e.clientX, e.clientY);
  if (down){
    const dx = e.clientX-down.x, dy = e.clientY-down.y;
    if (Math.hypot(dx,dy) > 8) down.moved = true;
    if (down.moved){ cam.px = down.px + dx; cam.py = down.py + dy; }
  }
});
cv.addEventListener("pointerup", e => {
  const d = down; down = null;
  if (!d || d.moved) return;
  hover = screenToTile(e.clientX, e.clientY);
  click(e.clientX, e.clientY, hover);
});
cv.addEventListener("pointerleave", () => { if (!down) hover = null; });
cv.addEventListener("wheel", e => { e.preventDefault(); cam.zoom = Math.max(.6, Math.min(2.5, cam.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); }, {passive:false});
addEventListener("keydown", e => {
  if (e.key === "r" || e.key === "R") rotateHeld();
  if (e.key === "Escape"){ if (held) cancelHeld(); }
});

function click(sx, sy, t){
  if (visiting) return;
  if (mode === "play"){
    // coins: hit-test the coin stacks
    let best = null, bd = 34;
    for (const it of S.items) if (it.coins > 0){
      const c = tileCenter(it.x, it.y); const px = c.x*cam.scale + cam.ox, py = (c.y - 22)*cam.scale + cam.oy;
      const d = Math.hypot(px-sx, py-sy)/Math.max(.6,cam.scale); if (d < bd){ bd = d; best = it; }
    }
    if (best) collect(best);
    else { const it = itemAt(t.x, t.y); if (it && it.coins > 0) collect(it); }
    return;
  }
  if (held) place(t.x, t.y);
  else { const it = itemAt(t.x, t.y); if (it) pickUp(it); }
}
function rotateHeld(){ if (held){ held.r = (held.r+1)%4; } }
function cancelHeld(){ if (held && !held.buy) returnHeld(); else { held = null; refreshUI(); } }

document.getElementById("rotBtn").onclick = rotateHeld;
document.getElementById("cancelBtn").onclick = cancelHeld;
document.getElementById("sellBtn").onclick = () => {
  if (!held || held.buy) return;
  const v = Math.floor(ITEMS[held.t].price/2); S.coins += v; toast(`Vendiste ${ITEMS[held.t].name} por ${v}`); held = null; save(); refreshUI();
};
document.getElementById("modeBtn").onclick = () => {
  if (mode === "play"){ mode = "deco"; }
  else { if (held) cancelHeld(); mode = "play"; repathAll(); }
  refreshUI();
};
const openShop = t => { tab = t; if (mode === "play"){ mode = "deco"; } refreshUI(); };
document.getElementById("toolDeco").onclick = () => openShop("muebles");
document.getElementById("toolStaff").onclick = () => openShop("personal");
document.getElementById("toolMenu").onclick = () => openShop("menu");
document.getElementById("zin").onclick = () => { cam.zoom = Math.min(2.5, cam.zoom*1.2); };
document.getElementById("zout").onclick = () => { cam.zoom = Math.max(.6, cam.zoom/1.2); if (cam.zoom <= 1){ cam.px = 0; cam.py = 0; } };
document.getElementById("helpBtn").onclick = () => { document.getElementById("help").hidden = false; };
document.getElementById("helpOk").onclick = () => { document.getElementById("help").hidden = true; S.helpSeen = true; save(); };

function repathAll(){
  for (const c of customers){
    if (c.state === "walkin"){ if (!c.seat || !S.items.includes(c.seat) || !seatTable(c.seat)) { leave(c,false); continue; } if (c.x < 0) continue; const p = findPath(c.x,c.y,(x,y)=>x===c.seat.x&&y===c.seat.y); if (p) c.path = p; else leave(c,false); }
    else if (c.state === "leave"){ if (c.x >= 0) c.path = exitPath(c); }
    else if (c.seat && (!S.items.includes(c.seat) || !seatTable(c.seat))) leave(c,false);
  }
  for (const e of staff){
    if (e.role==="waiter" && e.order){ const o=e.order; const tgt = e.state==="fetch" ? o.stove : o.cust.seat; e.path = findPath(e.x,e.y,adjTo(tgt.x,tgt.y)) || []; }
    else e.path = [];
    if (itemAt(Math.round(e.x),Math.round(e.y))){ const p = findPath(e.x,e.y,(x,y)=>walkable(x,y)&&inside(x,y)); if (p&&p.length){ const l=p[p.length-1]; e.x=l[0]; e.y=l[1]; } }
  }
}

/* ---------- shop UI ---------- */
const ICON_SCALE = {arbol:.62, piramide:.72, globos:.62, estatua:.75, piano:.85, palmera:.7, lampara:.66, florero:.9, refresco:.8, arcade:.8, rocola:.9, chimenea:.52, estufa:.95};
const TABS = [["muebles","Muebles"],["cocina","Cocina"],["deco","Decoración"],["jardin","Jardín"],["local","Local"],["personal","Personal"],["menu","Menú"]];
const tabsEl = document.getElementById("tabs"), cardsEl = document.getElementById("cards");
function card(opts){
  const el = document.createElement("button"); el.className = "card"; el.type = "button";
  const ic = document.createElement("canvas"); const dpr = window.devicePixelRatio || 1; ic.width = 72*dpr; ic.height = 72*dpr;
  const x = ic.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0);
  withCtx(x, opts.icon);
  el.appendChild(ic);
  const b = document.createElement("b"); b.textContent = opts.name; el.appendChild(b);
  const s = document.createElement("span"); if (opts.price != null){ const c = document.createElement("i"); c.className="bill"; s.appendChild(c); s.append(String(opts.price)); } else s.textContent = opts.label || ""; el.appendChild(s);
  if (opts.cls) el.classList.add(...opts.cls.split(" ").filter(Boolean));
  el.onclick = opts.onclick;
  cardsEl.appendChild(el);
}
function withCtx(c, fn){ const old = ctx; ctx = c; try { fn && fn(); } finally { ctx = old; } }
function ctxOf(){ return ctx; }

function refreshUI(){
  const mb = document.getElementById("modeBtn");
  mb.innerHTML = mode === "play" ? "<b>ABIERTO</b><small>toca para decorar</small>" : "<b>CERRADO</b><small>toca para abrir</small>";
  mb.classList.toggle("open", mode === "play");
  document.getElementById("tray").hidden = mode !== "play" || !!visiting;
  mb.hidden = !!visiting;
  document.getElementById("visitBar").hidden = !visiting;
  document.getElementById("coinStat").hidden = !!visiting;
  if (visiting) document.getElementById("visitName").textContent = `Visitando ${visiting.name}` + (visiting.owner ? ` · chef ${visiting.owner}` : "");
  document.getElementById("drawer").hidden = mode !== "deco";
  const moving = held && !held.buy;
  document.getElementById("rotBtn").hidden = !held;
  document.getElementById("sellBtn").hidden = !moving;
  if (moving) document.getElementById("sellBtn").textContent = `Vender (+${Math.floor(ITEMS[held.t].price/2)})`;
  document.getElementById("cancelBtn").hidden = !held;
  document.getElementById("cancelBtn").textContent = moving ? "Devolver" : "Listo";
  const st = document.getElementById("status");
  if (mode === "deco") st.textContent = held ? (held.buy ? `Toca el piso para colocar: ${ITEMS[held.t].name}` : `Moviendo: ${ITEMS[held.t].name}`) : "Restaurante cerrado · toca un mueble para moverlo";
  else st.textContent = !stoves().length ? "Necesitas una estufa para cocinar" : !freeSeats().length && !customers.length ? "Pon sillas mirando a una mesa" : `Clientes atendidos: ${S.served}`;
  if (mode === "deco") renderShop();
}
function renderShop(){
  tabsEl.innerHTML = "";
  for (const [id,label] of TABS){ const b = document.createElement("button"); b.className = "tab" + (tab===id ? " on" : ""); b.textContent = label; b.type="button"; b.onclick = () => { tab = id; renderShop(); }; tabsEl.appendChild(b); }
  cardsEl.innerHTML = "";
  if (["muebles","cocina","deco","jardin"].includes(tab)){
    for (const [id,def] of Object.entries(ITEMS)) if (def.cat === tab){
      const r = def.kind==="chair" ? 0 : 1;
      card({name:def.name, price:def.price, cls:(held&&held.buy&&held.t===id?"sel ":"") + (S.coins<def.price?"poor":""),
        icon:() => { const sc = ICON_SCALE[id] || 1; ctx.save(); ctx.translate(36, 56); ctx.scale(sc, sc); drawItem({t:id, r, x:0, y:0, coins:0}, 0, 0, true); ctx.restore(); },
        onclick:() => { if (held && !held.buy) returnHeld(); if (S.coins < def.price){ toast("No tienes monedas suficientes"); return; } held = {t:id, r, buy:true}; refreshUI(); }});
    }
    return;
  }
  if (tab === "local"){
    for (const [id,f] of Object.entries(FLOORS)){
      const own = S.ownF.includes(id);
      card({name:"Piso " + f.name, price: own ? null : f.price, label: S.floor===id ? "En uso" : "Usar", cls:(own?"owned ":"") + (S.floor===id?"sel":"") + (!own && S.coins<f.price?" poor":""),
        icon:() => { const C = ctxOf(); for (let y=0;y<3;y++) for (let x=0;x<3;x++){ const cx=36+(x-y)*12, cy=22+(x+y)*6; C.beginPath(); C.moveTo(cx,cy-6); C.lineTo(cx+12,cy); C.lineTo(cx,cy+6); C.lineTo(cx-12,cy); C.closePath(); C.fillStyle = f.planks ? (y%2?f.a:f.b) : ((x+y)%2?f.b:f.a); C.fill(); C.strokeStyle="rgba(0,0,0,.15)"; C.stroke(); } },
        onclick:() => { if (!own){ if (S.coins < f.price) return toast("No tienes monedas suficientes"); S.coins -= f.price; S.ownF.push(id); } S.floor = id; save(); refreshUI(); }});
    }
    for (const [id,w] of Object.entries(WALLS)){
      const own = S.ownW.includes(id);
      card({name:"Pared " + w.name, price: own ? null : w.price, label: S.wall===id ? "En uso" : "Usar", cls:(own?"owned ":"") + (S.wall===id?"sel":"") + (!own && S.coins<w.price?" poor":""),
        icon:() => { const C = ctxOf(); C.fillStyle = w.base; C.fillRect(14,10,44,52); if (w.panel){ C.fillStyle = w.panel; C.fillRect(14,44,44,18); } C.fillStyle = w.trim; C.fillRect(14,8,44,5); C.fillRect(26,20,20,18); C.fillStyle="#bfe6ff"; C.fillRect(28,22,16,14); C.strokeStyle="rgba(120,90,60,.22)"; C.strokeRect(14,8,44,54); },
        onclick:() => { if (!own){ if (S.coins < w.price) return toast("No tienes monedas suficientes"); S.coins -= w.price; S.ownW.push(id); } S.wall = id; save(); refreshUI(); }});
    }
    const land = LAND.find(l => l.n > LOT), room = ROOM.find(r => r.n > N);
    const plusIcon = (col, txt) => () => { const C = ctxOf(); C.fillStyle = col; C.strokeStyle = "#5b3b2b"; C.lineWidth = 2; C.beginPath(); C.moveTo(36,16); C.lineTo(64,32); C.lineTo(36,48); C.lineTo(8,32); C.closePath(); C.fill(); C.stroke(); C.fillStyle = "#ffffff"; C.font = "700 15px sans-serif"; C.textAlign = "center"; C.fillText(txt, 36, 37); };
    if (land) card({name:`Comprar terreno ${land.n}×${land.n}`, price:land.price, cls: S.coins<land.price?"poor":"", icon: plusIcon("#84c860", "+"),
      onclick:() => { if (S.coins < land.price) return toast("No tienes monedas suficientes"); S.coins -= land.price; S.lot = LOT = land.n; rebuildOcc(); cam.px = cam.py = 0; toast(`Compraste terreno: ahora tienes ${LOT}×${LOT} para tu patio`, true); save(); refreshUI(); }});
    else card({name:"Terreno al máximo", price:null, label:`${LOT}×${LOT}`, cls:"owned", icon: plusIcon("#84c860", "✓"), onclick:() => {}});
    if (room) card({name:`Ampliar restaurante a ${room.n}×${room.n}`, price:room.price, cls: (S.coins<room.price || room.n > LOT) ? "poor" : "", label: room.n > LOT ? "Compra terreno" : "", icon: plusIcon("#f0dfba", "+"),
      onclick:() => { if (room.n > LOT) return toast("Primero compra más terreno"); if (S.coins < room.price) return toast("No tienes monedas suficientes"); S.coins -= room.price; S.N = N = room.n; cam.px = cam.py = 0; toast(`Tu restaurante ahora mide ${N}×${N}`, true); save(); refreshUI(); }});
    return;
  }
  if (tab === "personal"){
    for (const role of ["chef","waiter"]){
      const have = role==="chef" ? S.chefs : S.waiters, price = STAFF_PRICE[role][have];
      const fake = {look:staffLook(role), face:[0,1]};
      card({name:(role==="chef"?"Cocinero":"Mesero") + ` (${have}/3)`, price: price!=null ? price : null, label: price==null ? "Equipo completo" : "", cls: price==null ? "owned" : (S.coins<price?"poor":""),
        icon:() => { ctx.save(); ctx.translate(36, 70); ctx.scale(.82, .82); drawPerson(0, 0, fake); ctx.restore(); },
        onclick:() => { if (price==null) return; if (S.coins < price) return toast("No tienes monedas suficientes"); S.coins -= price; if (role==="chef") S.chefs++; else S.waiters++; addStaff(role); toast(role==="chef" ? "Contrataste un cocinero. Necesita su propia estufa." : "Contrataste un mesero", true); save(); refreshUI(); }});
    }
    return;
  }
  if (tab === "menu"){
    for (const d of DISHES){
      const on = d.lvl <= S.level;
      card({name:d.name, price:null, label: on ? `Vale ${d.price}` : `Nivel ${d.lvl}`, cls: on ? "owned" : "locked",
        icon:() => drawDish(d.id, 36, 40, 2.6),
        onclick:() => {}});
    }
  }
}

/* ---------- toasts & HUD ---------- */
function toast(msg, good){
  const el = document.createElement("div"); el.className = "toast" + (good ? " good" : ""); el.textContent = msg;
  const box = document.getElementById("toasts"); box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.remove(), 3200);
}
let hudT = 0;
function hud(dt){
  hudT -= dt; if (hudT > 0) return; hudT = .2;
  document.getElementById("coins").textContent = Math.floor(S.coins).toLocaleString("es");
  document.getElementById("lvl").textContent = S.level;
  document.getElementById("xpbar").style.width = Math.min(100, S.xp/xpNeed(S.level)*100) + "%";
  document.getElementById("pop").textContent = Math.round(S.pop) + "/100";
  const st = Math.max(1, Math.min(5, 1 + Math.floor(decorScore()/15)));
  const se = document.getElementById("stars"); if (se.dataset.n !== String(st)){ se.dataset.n = st; se.innerHTML = [1,2,3,4,5].map(i => `<b class="${i<=st?"on":""}">★</b>`).join(""); }
  if (mode === "play"){ const st = document.getElementById("status"); st.textContent = !stoves().length ? "Necesitas una estufa para cocinar" : !freeSeats().length && !customers.length ? "Pon sillas mirando a una mesa" : `Clientes atendidos: ${S.served}`; }
}

/* ---------- accounts & visits ----------
   Accounts are email + password (Supabase Auth). Each player's restaurant is one row in the `restaurants` table:
   anyone can read it to visit, only its owner can write it (row level security, see supabase/schema.sql).
   Without a configured backend the game keeps working in this browser and the Vecinos button stays hidden. */
const netEl = document.getElementById("net"), netBox = document.getElementById("netBox"), netBtn = document.getElementById("netBtn");
const clip = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
const PENDING = "ciudad-sabrosa-pending";
let authMode = "signup", busy = false, notice = "";
const draft = {name:"Ciudad Sabrosa", owner:"", email:"", pw:""};   // keeps what the player typed across re-renders
function starsOf(st){ let d = 0; for (const it of (st.items || [])) if (it && ITEMS[it.t]) d += ITEMS[it.t].decor; return Math.max(1, Math.min(5, 1 + Math.floor(d/15))); }
function cloudDoc(){
  const st = serialize().S;
  return {name:account.name, owner:account.owner, level:S.level, served:S.served, stars:starsOf(st), S:st};
}
async function initNet(){
  if (!backend) return;
  netBtn.hidden = false;
  backend.onAuth(u => { if ((u && u.id) !== meId) signedIn(u); });
  try { signedIn(await backend.currentUser()); } catch(e) {}
}
async function signedIn(u){
  meId = u ? u.id : null; account = null; readOnly = false; if (meId) draft.pw = "";
  if (!meId){ if (!netEl.hidden) renderNet(); return; }
  try {
    let doc = await backend.getRestaurant(meId);
    if (!doc){
      // finish a sign-up that waited for the email confirmation
      let p = null; try { p = JSON.parse(localStorage.getItem(PENDING) || "null"); } catch(e) {}
      if (p && p.name && p.owner){ account = {name:p.name, owner:p.owner}; await backend.saveRestaurant(meId, cloudDoc()); try { localStorage.removeItem(PENDING); } catch(e) {} toast(`¡Listo! ${p.name} ya está abierto a visitas`, true); }
    } else {
      account = {name:clip(doc.name, 28) || "Mi restaurante", owner:clip(doc.owner, 18)};
      // the account copy wins when it is newer than this browser's save (playing from another device)
      if (doc.S && (doc.S.savedAt || 0) > (S.savedAt || 0)){ if (visiting){ home = doc.S; } else { applyState(doc.S); refreshUI(); } toast("Cargamos tu restaurante desde tu cuenta", true); }
    }
  } catch(e){ notice = "No pudimos conectar con tu cuenta. Inténtalo de nuevo en un rato."; }
  if (!netEl.hidden) renderNet();
}
async function pushCloud(force){
  if (!backend || !meId || !account || visiting || readOnly || pushing || (!cloudDirty && !force)) return;
  pushing = true; cloudDirty = false;
  try { await backend.saveRestaurant(meId, cloudDoc()); }
  catch(e){ cloudDirty = true; }
  finally { pushing = false; }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") pushCloud(); });

function el(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function button(text, cls, fn){ const b = el("button", "btn" + (cls ? " " + cls : ""), text); b.type = "button"; b.onclick = fn; return b; }
function field(label, type, key, opts){ const f = el("label", "field", label), i = el("input"); i.type = type; Object.assign(i, opts || {}); i.value = draft[key]; i.oninput = () => { draft[key] = i.value; }; f.appendChild(i); return [f, i]; }
function openNet(){ netEl.hidden = false; notice = ""; renderNet(); loadOthers(); }
function closeNet(){ netEl.hidden = true; }
netBtn.onclick = openNet;
netEl.addEventListener("click", e => { if (e.target === netEl) closeNet(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !netEl.hidden) closeNet(); });
async function loadOthers(){
  others = null; renderNet();
  try { others = (await backend.listRestaurants(60)).filter(o => o.id !== meId); }
  catch(e){ others = "error"; }
  if (!netEl.hidden) renderNet();
}
async function run(btn, label, fn){
  if (busy) return; busy = true; const old = btn.textContent; btn.disabled = true; btn.textContent = label; notice = "";
  try { await fn(); } catch(e){ notice = authError(e); }
  busy = false; btn.disabled = false; btn.textContent = old; renderNet();
}
function authError(e){
  const m = String(e && (e.message || e.error_description) || "");
  if (/invalid login/i.test(m)) return "El email o la contraseña no coinciden.";
  if (/not confirmed/i.test(m)) return "Primero confirma tu email con el enlace que te enviamos.";
  if (/already registered/i.test(m)) return "Ese email ya tiene cuenta. Entra con tu contraseña.";
  if (/password/i.test(m)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/rate|too many/i.test(m)) return "Demasiados intentos. Espera un momento y vuelve a probar.";
  return "Algo salió mal. Inténtalo de nuevo.";
}
function nameFields(){
  const [f1, i1] = field("Nombre del restaurante", "text", "name", {maxLength:28});
  const [f2, i2] = field("Tu apodo de chef", "text", "owner", {maxLength:18, placeholder:"Por ejemplo: Germán"});
  return {nodes:[f1, f2], read:() => ({name:clip(i1.value, 28), owner:clip(i2.value, 18)})};
}
function renderNet(){
  netBox.innerHTML = "";
  netBox.appendChild(el("h1", null, "Vecinos"));
  if (!meId){
    const tabs = el("div", "seg");
    for (const [m, l] of [["signup","Crear cuenta"],["login","Entrar"]]){ const b = button(l, authMode === m ? "on" : "", () => { authMode = m; notice = ""; renderNet(); }); tabs.appendChild(b); }
    netBox.appendChild(tabs);
    netBox.appendChild(el("p", null, authMode === "signup" ? "Crea tu cuenta para guardar tu restaurante en la nube y que otros jugadores puedan visitarlo." : "Entra para seguir con tu restaurante en este dispositivo."));
    const names = authMode === "signup" ? nameFields() : null;
    if (names) netBox.append(...names.nodes);
    const [fe, ie] = field("Email", "email", "email", {autocomplete:"email"});
    const [fp, ip] = field("Contraseña", "password", "pw", {autocomplete: authMode === "signup" ? "new-password" : "current-password", minLength:6});
    netBox.append(fe, fp);
    const go = button(authMode === "signup" ? "Crear cuenta" : "Entrar", "go", () => run(go, authMode === "signup" ? "Creando…" : "Entrando…", async () => {
      const email = ie.value.trim(), pw = ip.value;
      if (!email || !pw) throw {message:"invalid login"};
      if (authMode === "signup"){
        const n = names.read(); if (!n.name || !n.owner){ notice = "Escribe el nombre del restaurante y tu apodo."; return; }
        try { localStorage.setItem(PENDING, JSON.stringify(n)); } catch(e) {}
        const r = await backend.signUp(email, pw);
        if (!r.user) return; // handled by onAuth once signed in
        if (!r.signedIn){ authMode = "login"; notice = `Te enviamos un email a ${email}. Toca el enlace para confirmar tu cuenta y después entra aquí.`; }
      } else await backend.signIn(email, pw);
    }));
    if (notice) netBox.appendChild(el("p", "note", notice));
    netBox.appendChild(el("div", "actions")).appendChild(go);
  } else if (!account){
    netBox.appendChild(el("p", null, "Ya entraste. Ponle nombre a tu restaurante para abrirlo a visitas."));
    const names = nameFields(); netBox.append(...names.nodes);
    const go = button("Abrir mi restaurante", "go", () => run(go, "Guardando…", async () => {
      const n = names.read(); if (!n.name || !n.owner){ notice = "Escribe el nombre del restaurante y tu apodo."; return; }
      account = n; save();
      try { await backend.saveRestaurant(meId, cloudDoc()); cloudDirty = false; toast(`¡Listo! ${n.name} ya está abierto a visitas`, true); }
      catch(e){ account = null; throw e; }
    }));
    if (notice) netBox.appendChild(el("p", "note", notice));
    const act = el("div", "actions"); act.append(button("Salir", "", () => backend.signOut()), go); netBox.appendChild(act);
  } else {
    const mine = el("div", "row mine"), who = el("div", "who");
    who.append(el("b", null, account.name), el("small", null, `Tu restaurante · chef ${account.owner} · guardado en la nube`));
    mine.appendChild(who);
    if (visiting) mine.appendChild(button("Volver", "go", () => { closeNet(); goHome(); }));
    else mine.appendChild(button("Salir", "", async () => { await pushCloud(true); await backend.signOut(); }));
    netBox.appendChild(mine);
    if (notice) netBox.appendChild(el("p", "note", notice));
  }
  netBox.appendChild(el("h2", null, "Restaurantes de otros jugadores"));
  const list = el("div", "netlist"); netBox.appendChild(list);
  if (others === null) list.appendChild(el("p", "note", "Buscando restaurantes…"));
  else if (others === "error") list.appendChild(el("p", "note", "No pudimos cargar la lista. Inténtalo de nuevo en un rato."));
  else if (!others.length) list.appendChild(el("p", "note", "Todavía no hay otros restaurantes. Invita a tus amigos a jugar y aparecerán aquí."));
  else for (const o of others){
    const row = el("div", "row"), who = el("div", "who");
    who.append(el("b", null, clip(o.name, 28) || "Restaurante"), el("small", null, `chef ${clip(o.owner, 18) || "anónimo"} · nivel ${Math.max(1, Math.floor(+o.level) || 1)} · ${"★".repeat(Math.max(1, Math.min(5, Math.floor(+o.stars) || 1)))}`));
    row.appendChild(who);
    const b = button(visiting && visiting.id === o.id ? "Aquí estás" : "Visitar", "go", () => run(b, "Abriendo…", () => visit(o)));
    row.appendChild(b);
    list.appendChild(row);
  }
  netBox.appendChild(el("div", "actions")).appendChild(button("Cerrar", "", closeNet));
}
async function visit(o){
  const doc = await backend.getRestaurant(o.id);
  if (!doc || !doc.S){ notice = "Ese restaurante ya no está disponible."; return; }
  if (!visiting){ if (held) cancelHeld(); save(); home = serialize().S; pushCloud(true); }
  visiting = {id:o.id, name:clip(doc.name, 28) || "Restaurante", owner:clip(doc.owner, 18)};
  mode = "play";
  applyState(JSON.parse(JSON.stringify(doc.S)));
  cam.px = cam.py = 0; resize();
  closeNet(); refreshUI();
}
function goHome(){
  if (!visiting) return;
  visiting = null; applyState(home); home = null;
  cam.px = cam.py = 0; resize(); refreshUI();
  toast("De vuelta en tu restaurante");
}
document.getElementById("backBtn").onclick = goHome;

/* ---------- main loop ---------- */
let last = performance.now();
function frame(now){
  const dt = Math.min(.05, (now-last)/1000); last = now;
  update(dt); render(); hud(dt);
  requestAnimationFrame(frame);
}
function start(data){
  load(data);
  resize(); refreshUI();
  if (!S.helpSeen) document.getElementById("help").hidden = false;
  requestAnimationFrame(frame);
  initNet();
}
start({});
})();
