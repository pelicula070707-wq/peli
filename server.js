require('dotenv').config();

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─────────────────────────────────────────────
   HTML DE LA PÁGINA COMPLETA
───────────────────────────────────────────── */
const PAGE = String.raw`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Barber & Co. — Reservas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Josefin+Sans:wght@200;300;400&display=swap" rel="stylesheet">
<style>
/* ── reset ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

/* ── tokens ── */
:root{
  --g:#c9a84c; --g2:#e8c97a; --g3:#8a6f32;
  --b0:#05050a; --b1:#0c0c12; --b2:#12121a; --b3:#1a1a24; --b4:#22222e;
  --c:#f5f0e8; --c2:#d4c9b0; --m:#88889a; --f:#55556a;
  --br:rgba(201,168,76,.14); --bs:rgba(255,255,255,.04);
  --serif:'Cormorant Garamond',serif;
  --sans:'Josefin Sans',sans-serif;
  --ease:cubic-bezier(.25,.46,.45,.94);
}

body{background:var(--b0);color:var(--c);font-family:var(--sans);font-weight:300;line-height:1.7;overflow-x:hidden}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--g3)}

/* ── helpers ── */
.serif{font-family:var(--serif)}
.gold{color:var(--g)}
.tag{font-size:9px;letter-spacing:6px;text-transform:uppercase;color:var(--g);font-family:var(--sans);font-weight:200}
.wrap{max-width:1180px;margin:0 auto;padding:0 36px}
.vline{width:1px;height:56px;background:linear-gradient(to bottom,transparent,var(--g),transparent);margin:0 auto}
.hline{width:72px;height:1px;background:linear-gradient(to right,transparent,var(--g),transparent)}
section{padding:110px 0}

/* ── nav ── */
nav{position:fixed;inset:0 0 auto;z-index:200;transition:background .4s,border .4s}
nav.solid{background:rgba(5,5,10,.95);backdrop-filter:blur(18px);border-bottom:1px solid var(--br)}
.nav-wrap{display:flex;align-items:center;justify-content:space-between;padding:22px 36px;max-width:1400px;margin:0 auto}
.logo{font-family:var(--serif);font-size:21px;letter-spacing:3px;color:var(--c);text-decoration:none}
.logo em{color:var(--g);font-style:normal}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{font-size:10px;font-weight:200;letter-spacing:4px;text-transform:uppercase;color:var(--m);text-decoration:none;transition:color .3s}
.nav-links a:hover{color:var(--g)}
.nav-btn{padding:9px 22px;border:1px solid var(--g);color:var(--g) !important;transition:background .3s,color .3s !important}
.nav-btn:hover{background:var(--g) !important;color:var(--b0) !important}

/* ── hero ── */
#hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;
  background:
    radial-gradient(ellipse 70% 55% at 62% 38%,rgba(201,168,76,.07) 0%,transparent 62%),
    radial-gradient(ellipse 40% 70% at 8% 82%,rgba(201,168,76,.04) 0%,transparent 52%),
    linear-gradient(155deg,#0e0e18 0%,#05050a 55%,#09090f 100%)}
.hero-grid{position:absolute;inset:0;
  background-image:linear-gradient(rgba(201,168,76,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.035) 1px,transparent 1px);
  background-size:76px 76px;
  -webkit-mask-image:radial-gradient(ellipse at center,transparent 15%,black 68%);
  mask-image:radial-gradient(ellipse at center,transparent 15%,black 68%)}
.hero-inner{position:relative;z-index:2;padding:130px 36px 0;max-width:1400px;margin:0 auto}
.h-pre{font-size:10px;letter-spacing:9px;text-transform:uppercase;color:var(--g);margin-bottom:22px;opacity:0;animation:up .8s .3s forwards}
.h-t1{font-family:var(--serif);font-size:clamp(60px,8.5vw,124px);font-weight:300;line-height:.93;letter-spacing:-1.5px;color:var(--c);margin-bottom:6px;opacity:0;animation:up .8s .5s forwards}
.h-t1 i{font-style:italic;color:var(--g)}
.h-t2{font-family:var(--serif);font-size:clamp(36px,4.8vw,72px);font-weight:300;line-height:1;letter-spacing:-1px;color:var(--f);margin-bottom:38px;opacity:0;animation:up .8s .7s forwards}
.h-desc{font-size:12px;font-weight:200;letter-spacing:2px;color:var(--m);max-width:340px;line-height:2.1;margin-bottom:46px;opacity:0;animation:up .8s .9s forwards}
.h-btns{display:flex;align-items:center;gap:30px;opacity:0;animation:up .8s 1.1s forwards}
.btn-g{display:inline-block;padding:15px 38px;background:var(--g);color:var(--b0);font-family:var(--sans);font-size:10px;font-weight:400;letter-spacing:4px;text-transform:uppercase;text-decoration:none;transition:background .35s,transform .35s,box-shadow .35s}
.btn-g:hover{background:var(--g2);transform:translateY(-2px);box-shadow:0 14px 42px rgba(201,168,76,.22)}
.btn-t{display:inline-flex;align-items:center;gap:10px;font-size:10px;font-weight:200;letter-spacing:4px;text-transform:uppercase;color:var(--c2);text-decoration:none;transition:color .3s}
.btn-t::after{content:'→';transition:transform .3s}
.btn-t:hover{color:var(--g)} .btn-t:hover::after{transform:translateX(5px)}

/* ── stats ── */
#stats{padding:0;background:var(--b2);border-top:1px solid var(--br);border-bottom:1px solid var(--br)}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr)}
.stat{padding:46px 28px;text-align:center;border-right:1px solid var(--bs)}
.stat:last-child{border-right:none}
.stat-n{font-family:var(--serif);font-size:50px;font-weight:300;color:var(--g);line-height:1;display:block}
.stat-l{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--m);margin-top:7px;display:block}

/* ── servicios ── */
#servicios{background:var(--b1)}
.sec-head{text-align:center;margin-bottom:72px}
.sec-title{font-family:var(--serif);font-size:clamp(40px,4.8vw,68px);font-weight:300;color:var(--c);margin:14px 0;letter-spacing:-1px}
.sec-desc{font-size:13px;font-weight:200;letter-spacing:.5px;color:var(--m);max-width:460px;margin:0 auto}
.srv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--bs);border:1px solid var(--bs)}
.srv{background:var(--b2);padding:46px 38px;position:relative;overflow:hidden;transition:background .4s}
.srv::after{content:'';position:absolute;bottom:0;left:0;width:100%;height:2px;background:var(--g);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.srv:hover{background:var(--b3)} .srv:hover::after{transform:scaleX(1)}
.srv-icon{font-size:26px;margin-bottom:18px;display:block}
.srv-name{font-family:var(--serif);font-size:24px;font-weight:400;color:var(--c);margin-bottom:10px}
.srv-desc{font-size:12px;font-weight:200;color:var(--m);line-height:1.85;margin-bottom:22px}
.srv-price{font-family:var(--serif);font-size:30px;color:var(--g);font-weight:300}
.srv-price span{font-family:var(--sans);font-size:10px;font-weight:200;letter-spacing:2px;color:var(--m);margin-left:4px}

/* ── equipo ── */
#equipo{background:var(--b0)}
.team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:38px}
.member{text-align:center}
.avatar{width:130px;height:130px;border-radius:50%;margin:0 auto 22px;background:var(--b3);border:2px solid var(--br);display:flex;align-items:center;justify-content:center;font-size:44px;transition:border-color .4s}
.member:hover .avatar{border-color:var(--g)}
.m-name{font-family:var(--serif);font-size:24px;font-weight:400;color:var(--c);margin-bottom:4px}
.m-role{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--g);margin-bottom:10px}
.m-bio{font-size:12px;color:var(--m);line-height:1.85}

/* ── reservas ── */
#reservas{background:var(--b1);position:relative;overflow:hidden}
#reservas::before{content:'';position:absolute;top:-180px;right:-180px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,.05) 0%,transparent 70%);pointer-events:none}
.res-layout{display:grid;grid-template-columns:1fr 1.5fr;gap:72px;align-items:start}
.res-info h2{font-family:var(--serif);font-size:clamp(36px,3.8vw,58px);color:var(--c);margin:14px 0 22px;line-height:1.08}
.res-info h2 i{font-style:italic;color:var(--g)}
.res-info p{font-size:12px;font-weight:200;letter-spacing:.5px;color:var(--m);line-height:2.1;margin-bottom:38px}
.contacts{display:flex;flex-direction:column;gap:18px}
.ci{display:flex;align-items:center;gap:14px;font-size:12px;font-weight:200;letter-spacing:.5px;color:var(--c2)}
.ci-icon{width:34px;height:34px;border:1px solid var(--br);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}

/* ── form ── */
.form-box{background:var(--b2);border:1px solid var(--bs);padding:46px;position:relative}
.form-box::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,var(--g),transparent)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.fg{margin-bottom:22px}
.fg label{display:block;font-size:9px;font-weight:300;letter-spacing:4px;text-transform:uppercase;color:var(--g);margin-bottom:9px}
.fg input,.fg select,.fg textarea{
  width:100%;background:var(--b3);border:none;border-bottom:1px solid rgba(201,168,76,.2);
  color:var(--c);font-family:var(--sans);font-size:13px;font-weight:200;letter-spacing:.5px;
  padding:13px 14px;outline:none;transition:border-color .35s,background .35s;
  -webkit-appearance:none;appearance:none}
.fg select{
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' fill='none'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%23c9a84c' stroke-width='1.4'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 14px center;cursor:pointer}
.fg select option{background:var(--b3)}
.fg textarea{resize:vertical;min-height:82px}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-bottom-color:var(--g);background:var(--b4)}
.fg input::placeholder,.fg textarea::placeholder{color:var(--f)}
.btn-send{width:100%;padding:17px;background:transparent;border:1px solid var(--g);color:var(--g);font-family:var(--sans);font-size:11px;font-weight:300;letter-spacing:5px;text-transform:uppercase;cursor:pointer;transition:all .4s var(--ease);position:relative;overflow:hidden}
.btn-send::before{content:'';position:absolute;inset:0;background:var(--g);transform:translateX(-100%);transition:transform .4s var(--ease);z-index:0}
.btn-send span{position:relative;z-index:1;transition:color .4s}
.btn-send:hover::before{transform:translateX(0)} .btn-send:hover span{color:var(--b0)}
.btn-send:disabled{opacity:.45;cursor:not-allowed;pointer-events:none}
#msg{margin-top:18px;padding:14px 18px;font-size:12px;letter-spacing:.5px;border-left:2px solid;display:none;animation:fadeIn .4s}
#msg.ok{display:block;color:#7ec97e;border-color:#7ec97e;background:rgba(126,201,126,.06)}
#msg.err{display:block;color:#e07070;border-color:#e07070;background:rgba(224,112,112,.06)}

/* ── footer ── */
footer{background:var(--b2);border-top:1px solid var(--bs);padding:56px 0 28px}
.foot-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:56px;margin-bottom:46px}
.f-brand{font-family:var(--serif);font-size:26px;letter-spacing:2px;color:var(--c);margin-bottom:6px}
.f-brand em{color:var(--g);font-style:normal}
.f-tag{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--g3);margin-bottom:18px}
.f-desc{font-size:12px;font-weight:200;color:var(--f);line-height:1.95}
.f-col h4{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--g);margin-bottom:18px}
.f-col ul{list-style:none} .f-col li{margin-bottom:9px}
.f-col a{font-size:12px;font-weight:200;color:var(--f);text-decoration:none;letter-spacing:.5px;transition:color .3s}
.f-col a:hover{color:var(--c2)}
.f-col p{font-size:12px;font-weight:200;color:var(--f);margin-bottom:7px}
.foot-bottom{padding-top:28px;border-top:1px solid var(--bs);display:flex;justify-content:space-between}
.f-copy{font-size:10px;color:var(--f);letter-spacing:2px}

/* ── anims ── */
@keyframes up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.rev{opacity:0;transform:translateY(28px);transition:opacity .7s,transform .7s}
.rev.in{opacity:1;transform:translateY(0)}

/* ── responsive ── */
@media(max-width:920px){
  .nav-links{display:none}
  .wrap{padding:0 22px}
  .stats-row{grid-template-columns:repeat(2,1fr)}
  .srv-grid,.team-grid{grid-template-columns:1fr}
  .res-layout{grid-template-columns:1fr;gap:46px}
  .foot-grid{grid-template-columns:1fr;gap:36px}
  .row2{grid-template-columns:1fr}
  .form-box{padding:30px 22px}
}
@media(max-width:560px){
  section{padding:80px 0}
  .foot-bottom{flex-direction:column;gap:10px}
}
</style>
</head>
<body>

<!-- NAV -->
<nav id="nav">
  <div class="nav-wrap">
    <a href="#" class="logo">BARBER <em>&</em> CO.</a>
    <ul class="nav-links">
      <li><a href="#servicios">Servicios</a></li>
      <li><a href="#equipo">Equipo</a></li>
      <li><a href="#reservas">Reservas</a></li>
      <li><a href="#reservas" class="nav-btn">Reservar</a></li>
    </ul>
  </div>
</nav>

<!-- HERO -->
<section id="hero">
  <div class="hero-bg"></div>
  <div class="hero-grid"></div>
  <div class="hero-inner">
    <p class="h-pre">Est. 2018 &nbsp;·&nbsp; Santiago, Chile</p>
    <h1 class="h-t1">The <i>Art</i></h1>
    <p class="h-t2">of Grooming.</p>
    <p class="h-desc">Donde la tradición del barbero clásico se encuentra con la elegancia moderna. Cada visita, una experiencia.</p>
    <div class="h-btns">
      <a href="#reservas" class="btn-g">Reservar Ahora</a>
      <a href="#servicios" class="btn-t">Ver Servicios</a>
    </div>
  </div>
</section>

<!-- STATS -->
<div id="stats">
  <div class="stats-row">
    <div class="stat rev"><span class="stat-n" data-n="2800">0</span><span class="stat-l">Clientes Satisfechos</span></div>
    <div class="stat rev"><span class="stat-n" data-n="6">0</span><span class="stat-l">Años de Experiencia</span></div>
    <div class="stat rev"><span class="stat-n" data-n="3">0</span><span class="stat-l">Maestros Barberos</span></div>
    <div class="stat rev"><span class="stat-n" data-n="7">0</span><span class="stat-l">Servicios Premium</span></div>
  </div>
</div>

<!-- SERVICIOS -->
<section id="servicios">
  <div class="wrap">
    <div class="sec-head rev">
      <p class="tag">Lo que ofrecemos</p>
      <div class="vline" style="margin:14px auto"></div>
      <h2 class="sec-title">Nuestros Servicios</h2>
      <p class="sec-desc">Cada servicio ejecutado con precisión artesanal y los mejores productos del mercado.</p>
    </div>
    <div class="srv-grid">
      <div class="srv rev"><span class="srv-icon">✂️</span><h3 class="srv-name">Corte de Cabello</h3><p class="srv-desc">Corte personalizado adaptado a tu estructura facial y estilo de vida. Incluye lavado y secado.</p><div class="srv-price">$15.000 <span>CLP</span></div></div>
      <div class="srv rev"><span class="srv-icon">🪒</span><h3 class="srv-name">Corte + Barba</h3><p class="srv-desc">La combinación perfecta. Corte preciso más diseño y perfilado de barba con navaja recta.</p><div class="srv-price">$22.000 <span>CLP</span></div></div>
      <div class="srv rev"><span class="srv-icon">🌿</span><h3 class="srv-name">Arreglo de Barba</h3><p class="srv-desc">Perfilado, diseño y tratamiento de barba con aceites naturales y técnica de navaja.</p><div class="srv-price">$12.000 <span>CLP</span></div></div>
      <div class="srv rev"><span class="srv-icon">💈</span><h3 class="srv-name">Afeitado Clásico</h3><p class="srv-desc">Experiencia tradicional con toalla caliente, crema artesanal y navaja de acero inoxidable.</p><div class="srv-price">$18.000 <span>CLP</span></div></div>
      <div class="srv rev"><span class="srv-icon">🎨</span><h3 class="srv-name">Coloración</h3><p class="srv-desc">Coloración profesional, mechas o decoloración. Consultamos antes del servicio sin costo adicional.</p><div class="srv-price">$35.000 <span>CLP</span></div></div>
      <div class="srv rev"><span class="srv-icon">👑</span><h3 class="srv-name">Combo Completo</h3><p class="srv-desc">Corte + barba + afeitado + tratamiento capilar. La experiencia Barber & Co. completa.</p><div class="srv-price">$45.000 <span>CLP</span></div></div>
    </div>
  </div>
</section>

<!-- EQUIPO -->
<section id="equipo">
  <div class="wrap">
    <div class="sec-head rev">
      <p class="tag">Quiénes somos</p>
      <div class="vline" style="margin:14px auto"></div>
      <h2 class="sec-title">Nuestro Equipo</h2>
      <p class="sec-desc">Maestros barberos con años de experiencia y pasión por el oficio.</p>
    </div>
    <div class="team-grid">
      <div class="member rev"><div class="avatar">👨‍🦱</div><h3 class="m-name">Rodrigo Vega</h3><p class="m-role">Fundador &amp; Master Barber</p><p class="m-bio">15 años perfeccionando el arte del corte clásico. Especialista en degradados y estilos vintage.</p></div>
      <div class="member rev"><div class="avatar">👨‍🦲</div><h3 class="m-name">Felipe Mora</h3><p class="m-role">Barber &amp; Color Specialist</p><p class="m-bio">Experto en coloración masculina y técnicas modernas. Transforma tendencias en estilos únicos.</p></div>
      <div class="member rev"><div class="avatar">🧔</div><h3 class="m-name">Sebastián Cruz</h3><p class="m-role">Beard Specialist</p><p class="m-bio">El maestro de las barbas. Desde diseños precisos hasta el afeitado clásico con toalla caliente.</p></div>
    </div>
  </div>
</section>

<!-- RESERVAS -->
<section id="reservas">
  <div class="wrap">
    <div class="res-layout">
      <div class="res-info">
        <p class="tag">Agenda tu visita</p>
        <div class="hline" style="margin:14px 0"></div>
        <h2>Reserva<br><i>tu hora</i></h2>
        <p>Asegura tu lugar con anticipación. Recibirás un correo de confirmación con todos los detalles de tu reserva.</p>
        <div class="contacts">
          <div class="ci"><span class="ci-icon">📍</span><span>Av. Providencia 1234, Santiago</span></div>
          <div class="ci"><span class="ci-icon">🕐</span><span>Lun–Vie 10:00–20:00 &nbsp;·&nbsp; Sáb 10:00–17:00</span></div>
          <div class="ci"><span class="ci-icon">📞</span><span>+56 9 1234 5678</span></div>
          <div class="ci"><span class="ci-icon">✉️</span><span>contacto@barberandco.cl</span></div>
        </div>
      </div>
      <div class="form-box rev">
        <form id="form">
          <div class="row2">
            <div class="fg"><label for="nombre">Nombre *</label><input type="text" id="nombre" name="nombre" placeholder="Juan Pérez" required></div>
            <div class="fg"><label for="email">Correo *</label><input type="email" id="email" name="email" placeholder="juan@ejemplo.com" required></div>
          </div>
          <div class="row2">
            <div class="fg"><label for="tel">Teléfono *</label><input type="tel" id="tel" name="telefono" placeholder="+56 9 1234 5678" required></div>
            <div class="fg">
              <label for="srv">Servicio *</label>
              <select id="srv" name="servicio" required>
                <option value="" disabled selected>Selecciona…</option>
                <option value="corte">Corte de Cabello — $15.000</option>
                <option value="corte_barba">Corte + Barba — $22.000</option>
                <option value="barba">Arreglo de Barba — $12.000</option>
                <option value="afeitado">Afeitado Clásico — $18.000</option>
                <option value="coloracion">Coloración — $35.000</option>
                <option value="tratamiento">Tratamiento Capilar — $20.000</option>
                <option value="combo">Combo Completo — $45.000</option>
              </select>
            </div>
          </div>
          <div class="row2">
            <div class="fg"><label for="fecha">Fecha *</label><input type="date" id="fecha" name="fecha" required></div>
            <div class="fg">
              <label for="hora">Hora *</label>
              <select id="hora" name="hora" required>
                <option value="" disabled selected>Selecciona…</option>
                <option>10:00</option><option>10:30</option><option>11:00</option><option>11:30</option>
                <option>12:00</option><option>12:30</option><option>13:00</option><option>13:30</option>
                <option>14:00</option><option>14:30</option><option>15:00</option><option>15:30</option>
                <option>16:00</option><option>16:30</option><option>17:00</option><option>17:30</option>
                <option>18:00</option><option>18:30</option><option>19:00</option><option>19:30</option>
              </select>
            </div>
          </div>
          <div class="fg"><label for="nota">Comentarios</label><textarea id="nota" name="comentarios" placeholder="Preferencias, alergias, etc…"></textarea></div>
          <button type="submit" class="btn-send" id="btn"><span>Confirmar Reserva</span></button>
          <div id="msg" role="alert"></div>
        </form>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="f-brand">BARBER <em>&</em> CO.</div>
        <div class="f-tag">The Art of Grooming</div>
        <p class="f-desc">Desde 2018 ofreciendo la mejor experiencia de barbería premium en Santiago. Tradición, calidad y estilo en cada visita.</p>
      </div>
      <div class="f-col">
        <h4>Servicios</h4>
        <ul>
          <li><a href="#servicios">Corte de Cabello</a></li>
          <li><a href="#servicios">Corte + Barba</a></li>
          <li><a href="#servicios">Afeitado Clásico</a></li>
          <li><a href="#servicios">Coloración</a></li>
          <li><a href="#servicios">Combo Completo</a></li>
        </ul>
      </div>
      <div class="f-col">
        <h4>Contacto</h4>
        <p>📍 Av. Providencia 1234</p>
        <p>📞 +56 9 1234 5678</p>
        <p>✉️ contacto@barberandco.cl</p>
        <br>
        <h4>Horario</h4>
        <p>Lun–Vie: 10:00–20:00</p>
        <p>Sábado: 10:00–17:00</p>
        <p>Domingo: Cerrado</p>
      </div>
    </div>
    <div class="foot-bottom">
      <p class="f-copy">© 2024 Barber & Co. Todos los derechos reservados.</p>
      <p class="f-copy">Santiago, Chile</p>
    </div>
  </div>
</footer>

<script>
// ── nav scroll ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 55), {passive:true});

// ── smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a =>
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
  })
);

// ── reveal on scroll ──
const ro = new IntersectionObserver((entries) => {
  entries.forEach((e,i) => {
    if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('in'), i*75); ro.unobserve(e.target); }
  });
},{threshold:.1});
document.querySelectorAll('.rev').forEach(el => ro.observe(el));

// ── date min ──
document.getElementById('fecha').min = new Date().toISOString().split('T')[0];

// ── number counters ──
const co = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.n, dur = 1800, step = target/(dur/16);
    let cur = 0;
    const t = setInterval(()=>{
      cur += step;
      if(cur >= target){ el.textContent = target.toLocaleString('es-CL'); clearInterval(t); }
      else el.textContent = Math.floor(cur).toLocaleString('es-CL');
    },16);
    co.unobserve(el);
  });
},{threshold:.6});
document.querySelectorAll('[data-n]').forEach(el => co.observe(el));

// ── form ──
const form = document.getElementById('form');
const btn  = document.getElementById('btn');
const msg  = document.getElementById('msg');

function showMsg(text, type){ msg.textContent = text; msg.className = type; }

form.addEventListener('submit', async e => {
  e.preventDefault();

  const data = {
    nombre:      form.nombre.value.trim(),
    email:       form.email.value.trim(),
    telefono:    form.telefono.value.trim(),
    servicio:    form.servicio.value,
    fecha:       fmtDate(form.fecha.value),
    hora:        form.hora.value,
    comentarios: form.comentarios.value.trim()
  };

  if(!data.nombre||!data.email||!data.telefono||!data.servicio||!data.fecha||!data.hora){
    showMsg('Por favor completa todos los campos obligatorios.','err'); return;
  }

  btn.disabled = true;
  btn.querySelector('span').textContent = 'Enviando…';
  msg.className = '';

  try {
    const r = await fetch('/api/reservar',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const d = await r.json();
    if(d.success){ showMsg('✓ ' + d.message,'ok'); form.reset(); }
    else showMsg(d.message||'Error al procesar la reserva.','err');
  } catch(_){
    showMsg('Error de conexión. Por favor intenta nuevamente.','err');
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Confirmar Reserva';
  }
});

function fmtDate(s){
  if(!s) return '';
  const [y,m,d] = s.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return +d+' de '+meses[+m-1]+' de '+y;
}
</script>
</body>
</html>`;

/* ─────────────────────────────────────────────
   CORREO AL CLIENTE
───────────────────────────────────────────── */
const SERVICIOS = {
  corte:'Corte de Cabello', corte_barba:'Corte + Barba',
  barba:'Arreglo de Barba', afeitado:'Afeitado Clásico',
  coloracion:'Coloración', tratamiento:'Tratamiento Capilar', combo:'Combo Completo'
};

function htmlCliente({nombre, telefono, servicio, fecha, hora, comentarios}){
  const svc = SERVICIOS[servicio] || servicio;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#07070c;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070c;padding:36px 0">
  <tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

    <tr><td style="background:#101018;border-top:3px solid #c9a84c;padding:36px 28px;text-align:center">
      <p style="margin:0;color:#c9a84c;letter-spacing:7px;font-size:10px;text-transform:uppercase;font-family:Arial,sans-serif">Est. 2018</p>
      <h1 style="margin:9px 0 4px;color:#f5f0e8;font-size:32px;letter-spacing:4px">BARBER & CO.</h1>
      <p style="margin:0;color:#777;letter-spacing:3px;font-size:9px;text-transform:uppercase;font-family:Arial,sans-serif">The Art of Grooming</p>
    </td></tr>

    <tr><td style="background:#141420;padding:36px 32px">
      <p style="margin:0 0 6px;color:#c9a84c;font-size:10px;letter-spacing:5px;text-transform:uppercase;font-family:Arial,sans-serif">Reserva Confirmada</p>
      <p style="margin:0 0 14px;color:#d4c9b0;font-size:16px;line-height:1.8">Estimado/a <strong style="color:#f5f0e8">${nombre}</strong>,</p>
      <p style="margin:0 0 28px;color:#888;font-size:13px;line-height:1.85">Tu reserva ha sido confirmada exitosamente. Te esperamos con todo nuestro equipo listo para brindarte la mejor experiencia.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #252530;border-top:2px solid #c9a84c">
        <tr><td style="padding:18px 22px;border-bottom:1px solid #252530">
          <p style="margin:0;color:#555;font-size:9px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif">Servicio</p>
          <p style="margin:5px 0 0;color:#f5f0e8;font-size:15px">${svc}</p>
        </td></tr>
        <tr><td style="padding:18px 22px;border-bottom:1px solid #252530">
          <table width="100%"><tr>
            <td width="50%">
              <p style="margin:0;color:#555;font-size:9px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif">Fecha</p>
              <p style="margin:5px 0 0;color:#f5f0e8;font-size:15px">${fecha}</p>
            </td>
            <td width="50%">
              <p style="margin:0;color:#555;font-size:9px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif">Hora</p>
              <p style="margin:5px 0 0;color:#f5f0e8;font-size:15px">${hora}</p>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:18px 22px${comentarios ? ';border-bottom:1px solid #252530' : ''}">
          <p style="margin:0;color:#555;font-size:9px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif">Teléfono</p>
          <p style="margin:5px 0 0;color:#f5f0e8;font-size:15px">${telefono}</p>
        </td></tr>
        ${comentarios ? `<tr><td style="padding:18px 22px">
          <p style="margin:0;color:#555;font-size:9px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif">Comentarios</p>
          <p style="margin:5px 0 0;color:#c2b89a;font-size:13px;line-height:1.7">${comentarios}</p>
        </td></tr>` : ''}
      </table>

      <p style="margin:26px 0 0;color:#555;font-size:11px;text-align:center;line-height:1.7">
        ¿Necesitas cancelar o cambiar tu hora? Contáctanos con al menos <strong style="color:#c9a84c">24 horas de anticipación</strong>.<br>
        📞 +56 9 1234 5678
      </p>
    </td></tr>

    <tr><td style="background:#07070c;padding:22px;text-align:center">
      <p style="margin:0;color:#333;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">Barber & Co. · Santiago, Chile</p>
    </td></tr>

  </table>
  </td></tr>
  </table>
  </body></html>`;
}

function htmlAdmin({nombre, email, telefono, servicio, fecha, hora, comentarios}){
  const svc = SERVICIOS[servicio] || servicio;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:24px;background:#f0f0f0;font-family:Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-top:4px solid #c9a84c;padding:28px 32px;border-radius:2px">
    <h2 style="margin:0 0 20px;color:#c9a84c;font-size:16px;letter-spacing:2px;text-transform:uppercase">🔔 Nueva Reserva</h2>
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr><td style="padding:9px 0;border-bottom:1px solid #eee;color:#888;font-size:11px;width:120px">Cliente</td><td style="padding:9px 0;border-bottom:1px solid #eee;color:#222;font-size:13px"><strong>${nombre}</strong></td></tr>
      <tr><td style="padding:9px 0;border-bottom:1px solid #eee;color:#888;font-size:11px">Email</td><td style="padding:9px 0;border-bottom:1px solid #eee;color:#222;font-size:13px">${email}</td></tr>
      <tr><td style="padding:9px 0;border-bottom:1px solid #eee;color:#888;font-size:11px">Teléfono</td><td style="padding:9px 0;border-bottom:1px solid #eee;color:#222;font-size:13px">${telefono}</td></tr>
      <tr><td style="padding:9px 0;border-bottom:1px solid #eee;color:#888;font-size:11px">Servicio</td><td style="padding:9px 0;border-bottom:1px solid #eee;color:#222;font-size:13px">${svc}</td></tr>
      <tr><td style="padding:9px 0;border-bottom:1px solid #eee;color:#888;font-size:11px">Fecha</td><td style="padding:9px 0;border-bottom:1px solid #eee;color:#222;font-size:13px"><strong>${fecha}</strong></td></tr>
      <tr><td style="padding:9px 0;border-bottom:1px solid #eee;color:#888;font-size:11px">Hora</td><td style="padding:9px 0;border-bottom:1px solid #eee;color:#222;font-size:13px"><strong>${hora}</strong></td></tr>
      <tr><td style="padding:9px 0;color:#888;font-size:11px">Comentarios</td><td style="padding:9px 0;color:#222;font-size:13px">${comentarios||'—'}</td></tr>
    </table>
  </div>
  </body></html>`;
}

/* ─────────────────────────────────────────────
   RUTAS
───────────────────────────────────────────── */
app.get('/', (_req, res) => res.send(PAGE));

app.post('/api/reservar', async (req, res) => {
  const { nombre, email, telefono, servicio, fecha, hora, comentarios } = req.body;

  // Validación
  if (!nombre || !email || !telefono || !servicio || !fecha || !hora) {
    return res.status(400).json({ success:false, message:'Por favor completa todos los campos obligatorios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success:false, message:'El formato del correo no es válido.' });
  }

  console.log(`📩 Reserva: ${nombre} | ${servicio} | ${fecha} ${hora}`);

  // Sin SMTP → modo demo
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  SMTP no configurado — modo demo');
    return res.json({ success:true, message:`¡Reserva registrada, ${nombre}! (Modo demo — configura SMTP para recibir correos reales)` });
  }

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls:  { rejectUnauthorized: false }
    });

    // Correo al cliente
    await transport.sendMail({
      from:    `"Barber & Co." <${process.env.SMTP_USER}>`,
      to:      email,
      subject: `✅ Reserva confirmada — ${fecha} a las ${hora}`,
      html:    htmlCliente({ nombre, telefono, servicio, fecha, hora, comentarios })
    });

    // Notificación al barbero (mismo correo del SMTP)
    await transport.sendMail({
      from:    `"Sistema de Reservas" <${process.env.SMTP_USER}>`,
      to:      process.env.SMTP_USER,
      subject: `🔔 Nueva reserva: ${nombre} — ${fecha} ${hora}`,
      html:    htmlAdmin({ nombre, email, telefono, servicio, fecha, hora, comentarios })
    });

    console.log(`✅ Correos enviados a ${email} y ${process.env.SMTP_USER}`);
    res.json({ success:true, message:`¡Reserva confirmada, ${nombre}! Te enviamos un correo de confirmación a ${email}.` });

  } catch (err) {
    console.error('❌ Error SMTP completo:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    let msg = 'Error al enviar el correo de confirmación.';
    if (err.code === 'EAUTH')       msg = 'Error de autenticación: revisa tu usuario y contraseña de aplicación Gmail.';
    if (err.code === 'ECONNECTION') msg = 'No se pudo conectar al servidor de correo.';
    res.status(500).json({ success:false, message: msg + ' Contáctanos directamente al +56 9 1234 5678.' });
  }
});

app.get('/health', (_req, res) => res.json({ ok:true, smtp: !!process.env.SMTP_USER }));

app.listen(PORT, () => {
  console.log('\n  ┌──────────────────────────────────┐');
  console.log('  │      BARBER & CO.  — Online      │');
  console.log('  └──────────────────────────────────┘');
  console.log(`  🚀  http://localhost:${PORT}`);
  console.log(`  📧  SMTP: ${process.env.SMTP_USER ? '✅ ' + process.env.SMTP_USER : '⚠️  no configurado (modo demo)'}`);
  console.log();
});
