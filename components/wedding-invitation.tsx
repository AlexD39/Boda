"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays, Check, ChevronDown, Clock3, Copy, Download, Gift,
  Heart, MapPin, Menu, MessageCircle, Music2, Pause, Pencil, Play,
  Shirt, Sparkles, X,
} from "lucide-react";

type Config = {
  partner1: string; partner2: string; date: string; venue: string; address: string;
  story: string; dressCode: string; giftText: string; whatsapp: string; audioUrl: string;
};

type Rsvp = { id: number; guestName: string; attendance: string; guests: number; dietary: string; message: string; createdAt: string };

const defaults: Config = {
  partner1: "Isabella", partner2: "Santiago", date: "2027-05-22T17:00:00-06:00",
  venue: "Hacienda San Gabriel", address: "Camino de los Olivos 18, Querétaro, Qro.",
  story: "Después de tantos caminos compartidos, elegimos uno para siempre. Queremos celebrar este nuevo capítulo rodeados de las personas que más amamos.",
  dressCode: "Formal · tonos claros y azules bienvenidos",
  giftText: "Su presencia es nuestro mejor regalo. Si desean tener un detalle con nosotros, habrá una mesa de sobres el día del evento.",
  whatsapp: "525500000000", audioUrl: "",
};

function useCountdown(date: string) {
  const calculate = () => {
    const distance = Math.max(0, new Date(date).getTime() - Date.now());
    return {
      días: Math.floor(distance / 86400000),
      horas: Math.floor((distance / 3600000) % 24),
      minutos: Math.floor((distance / 60000) % 60),
    };
  };
  const [left, setLeft] = useState(calculate);
  useEffect(() => { setLeft(calculate()); const timer = setInterval(() => setLeft(calculate()), 30000); return () => clearInterval(timer); }, [date]);
  return left;
}

function MusicButton({ audioUrl }: { audioUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const context = useRef<AudioContext | null>(null);
  const timers = useRef<number[]>([]);

  function stopDemo() {
    timers.current.forEach(window.clearTimeout); timers.current = [];
    context.current?.close(); context.current = null;
  }
  function playDemo() {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx(); context.current = ctx;
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 440];
    notes.forEach((frequency, i) => {
      const timer = window.setTimeout(() => {
        if (!context.current) return;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = "sine"; osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.15);
        osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 1.2);
      }, i * 680); timers.current.push(timer);
    });
    timers.current.push(window.setTimeout(() => setPlaying(false), notes.length * 680 + 800));
  }
  function toggle() {
    if (playing) { audio.current?.pause(); stopDemo(); setPlaying(false); return; }
    if (audioUrl) { if (!audio.current) audio.current = new Audio(audioUrl); audio.current.play(); audio.current.onended = () => setPlaying(false); }
    else playDemo();
    setPlaying(true);
  }
  useEffect(() => () => stopDemo(), []);
  return (
    <button className={`music-pill ${playing ? "is-playing" : ""}`} onClick={toggle} aria-label={playing ? "Pausar música" : "Reproducir música"}>
      <span className="music-icon">{playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}</span>
      <span><small>NUESTRA CANCIÓN</small>{playing ? "Reproduciendo…" : "Dale play"}</span>
      <span className="equalizer" aria-hidden="true"><i/><i/><i/></span>
    </button>
  );
}

function makePdf(config: Config, guest: string, seats: number) {
  const pageUrl = window.location.href;
  const clean = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[()\\]/g, "").replace(/[^\x20-\x7E]/g, "");
  const names = `${clean(config.partner1)} & ${clean(config.partner2)}`;
  const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(new Date(config.date));
  const stream = `q 0.96 0.94 0.89 rg 0 0 420 595 re f 0.07 0.17 0.30 rg BT /F2 13 Tf 210 520 Td (${clean("TENEMOS EL HONOR DE INVITARTE")}) Tj ET BT /F1 31 Tf 210 468 Td (${names}) Tj ET 0.65 0.52 0.28 RG 72 442 m 348 442 l S 0.07 0.17 0.30 rg BT /F2 12 Tf 210 402 Td (${clean("Querido/a")}) Tj ET BT /F1 22 Tf 210 368 Td (${clean(guest)}) Tj ET BT /F2 11 Tf 210 330 Td (${clean(date)}) Tj ET BT /F2 11 Tf 210 308 Td (${clean(config.venue)}) Tj ET BT /F2 10 Tf 210 266 Td (${seats} ${seats === 1 ? "lugar reservado" : "lugares reservados"}) Tj ET 0.09 0.25 0.47 rg 105 170 210 48 re f 1 1 1 rg BT /F2 12 Tf 210 190 Td (${clean("ABRIR INVITACION DIGITAL")}) Tj ET 0.07 0.17 0.30 rg BT /F2 8 Tf 210 135 Td (${clean("Toca el boton para confirmar tu asistencia")}) Tj ET Q`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 595] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Annots [7 0 R] /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Type /Annot /Subtype /Link /Rect [105 170 315 218] /Border [0 0 0] /A << /S /URI /URI (${pageUrl.replace(/[()\\]/g, "")}) >> >>`,
  ];
  let pdf = "%PDF-1.4\n"; const offsets: number[] = [0];
  objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const blob = new Blob([pdf], { type: "application/pdf" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
  link.download = `Invitacion-${clean(guest).replace(/\s+/g, "-")}.pdf`; link.click(); URL.revokeObjectURL(link.href);
}

export default function WeddingInvitation() {
  const [config, setConfig] = useState<Config>(defaults);
  const [guest, setGuest] = useState("Familia Ramírez");
  const [seats, setSeats] = useState(2);
  const [code, setCode] = useState("demo");
  const [menu, setMenu] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [draft, setDraft] = useState<Config>(defaults);
  const [responses, setResponses] = useState<Rsvp[]>([]);
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const countdown = useCountdown(config.date);
  const eventDate = useMemo(() => new Date(config.date), [config.date]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGuest(params.get("invitado") || "Familia Ramírez");
    setSeats(Math.max(1, Math.min(12, Number(params.get("pases")) || 2)));
    setCode(params.get("codigo") || "demo");
    if (params.get("admin") === "1") setAdmin(true);
    fetch("/api/config").then(r => r.json() as Promise<{ config?: Config }>).then(data => { if (data.config) { setConfig(data.config); setDraft(data.config); } }).catch(() => undefined);
  }, []);

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("Guardando tu respuesta…");
    const form = new FormData(event.currentTarget);
    const payload = { guestName: form.get("guestName"), attendance: form.get("attendance"), guests: Number(form.get("guests")), dietary: form.get("dietary"), message: form.get("message"), invitationCode: code };
    try {
      const response = await fetch("/api/rsvp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || "No fue posible confirmar");
      setSubmitted(true); setNotice("");
      const answer = payload.attendance === "yes" ? `Sí asistiré con ${payload.guests} persona(s)` : "No podré asistir";
      const text = `Hola ${config.partner1} y ${config.partner2}. Soy ${payload.guestName}. ${answer}. ${payload.message || ""}`;
      window.open(`https://wa.me/${config.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Inténtalo nuevamente"); }
  }

  async function unlockAdmin() {
    const response = await fetch("/api/rsvp", { headers: { "x-admin-pin": pin } });
    if (!response.ok) { setNotice("PIN incorrecto"); return; }
    const data = await response.json() as { rsvps?: Rsvp[] }; setResponses(data.rsvps || []); setUnlocked(true); setNotice("");
  }
  async function saveConfig() {
    setNotice("Guardando cambios…");
    const response = await fetch("/api/config", { method: "POST", headers: { "content-type": "application/json", "x-admin-pin": pin }, body: JSON.stringify(draft) });
    const data = await response.json() as { config?: Config; error?: string };
    if (!response.ok) { setNotice(data.error || "No fue posible guardar"); return; }
    if (data.config) setConfig(data.config); setNotice("Cambios publicados"); setTimeout(() => setNotice(""), 2400);
  }
  function personalizedUrl() {
    const url = new URL(window.location.origin); url.searchParams.set("invitado", guest); url.searchParams.set("pases", String(seats)); url.searchParams.set("codigo", code); return url.toString();
  }

  return (
    <main>
      <nav className="topbar">
        <a href="#inicio" className="monogram" aria-label="Inicio">I<span>&</span>S</a>
        <div className={`navlinks ${menu ? "open" : ""}`}>
          <a href="#historia" onClick={() => setMenu(false)}>Nuestra historia</a><a href="#detalles" onClick={() => setMenu(false)}>Detalles</a><a href="#galeria" onClick={() => setMenu(false)}>Galería</a><a href="#confirmar" onClick={() => setMenu(false)}>Confirmar</a>
        </div>
        <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Abrir menú">{menu ? <X/> : <Menu/>}</button>
      </nav>

      <section className="hero" id="inicio">
        <img src="/assets/wedding-florals.png" alt="Acuarela de flores azules y calas blancas" className="hero-art" />
        <div className="hero-content reveal">
          <p className="eyebrow">NOS CASAMOS</p>
          <h1><span>{config.partner1}</span><b>&</b><span>{config.partner2}</span></h1>
          <div className="gold-line"><Heart size={15} fill="currentColor" /></div>
          <p className="date-line">{eventDate.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}</p>
          <p className="guest-line">Con mucho cariño para<br/><strong>{guest}</strong></p>
          <p className="passes">Hemos reservado {seats} {seats === 1 ? "lugar" : "lugares"} para ti</p>
          <MusicButton audioUrl={config.audioUrl} />
        </div>
        <a href="#historia" className="scroll-cue"><span>DESCUBRE NUESTRA INVITACIÓN</span><ChevronDown size={19}/></a>
      </section>

      <section className="story section" id="historia">
        <div className="story-photo"><img src="/assets/bouquet.png" alt="Ramo de novia con flores blancas y azules"/><span>Desde 2019</span></div>
        <div className="story-copy"><p className="eyebrow">UN SÍ PARA SIEMPRE</p><h2>Nuestra historia<br/><i>apenas comienza</i></h2><p>{config.story}</p><div className="signature">I & S</div></div>
      </section>

      <section className="countdown section">
        <p className="eyebrow">FALTA MUY POCO</p><h2>Para nuestro gran día</h2>
        <div className="count-grid">{Object.entries(countdown).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}</div>
        <p className="save-date">Guarda la fecha · {eventDate.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</p>
      </section>

      <section className="details section" id="detalles">
        <header><p className="eyebrow">TODO LO QUE NECESITAS SABER</p><h2>Detalles del día</h2></header>
        <div className="detail-grid">
          <article><span><CalendarDays/></span><p className="eyebrow">CUÁNDO</p><h3>{eventDate.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</h3><p><Clock3 size={15}/> {eventDate.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })}</p></article>
          <article className="featured"><span><MapPin/></span><p className="eyebrow">DÓNDE</p><h3>{config.venue}</h3><p>{config.address}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`} target="_blank" rel="noreferrer">VER EN EL MAPA</a></article>
          <article><span><Shirt/></span><p className="eyebrow">CÓDIGO DE VESTIMENTA</p><h3>Formal</h3><p>{config.dressCode}</p></article>
        </div>
      </section>

      <section className="gallery section" id="galeria">
        <div className="gallery-heading"><p className="eyebrow">LOS PEQUEÑOS DETALLES</p><h2>Un día para <i>recordar</i></h2></div>
        <figure className="gallery-one"><img src="/assets/rings.png" alt="Anillos de boda con listón azul"/><figcaption>Amor en cada detalle</figcaption></figure>
        <figure className="gallery-two"><img src="/assets/bouquet.png" alt="Ramo de calas blancas"/></figure>
        <blockquote>“Donde sea,<br/>pero contigo.”</blockquote>
      </section>

      <section className="gift section"><Gift/><p className="eyebrow">REGALOS</p><h2>Lo más importante es<br/><i>celebrar juntos</i></h2><p>{config.giftText}</p></section>

      <section className="rsvp section" id="confirmar">
        <div className="rsvp-intro"><p className="eyebrow">¿NOS ACOMPAÑAS?</p><h2>Confirma tu<br/><i>asistencia</i></h2><p>Tu respuesta nos ayudará a preparar cada detalle. Por favor confirma antes del 20 de abril.</p><button className="pdf-btn" onClick={() => makePdf(config, guest, seats)}><Download size={17}/> Descargar mi invitación PDF</button></div>
        {submitted ? <div className="success-card"><span><Check/></span><h3>¡Gracias por responder!</h3><p>Tu confirmación quedó registrada y WhatsApp está listo para avisarnos.</p></div> :
        <form className="rsvp-form" onSubmit={submitRsvp}>
          <label>Nombre completo<input name="guestName" defaultValue={guest} required/></label>
          <fieldset><legend>¿Podrás acompañarnos?</legend><label><input type="radio" name="attendance" value="yes" defaultChecked/><span>Sí, ahí estaré</span></label><label><input type="radio" name="attendance" value="no"/><span>No podré asistir</span></label></fieldset>
          <label>Número de asistentes<select name="guests" defaultValue={seats}>{Array.from({ length: seats }, (_, i) => i + 1).map(n => <option key={n}>{n}</option>)}</select></label>
          <label>Restricciones alimentarias<input name="dietary" placeholder="Opcional"/></label>
          <label>Un mensaje para los novios<textarea name="message" rows={3} placeholder="Escribe algo bonito…"/></label>
          <button type="submit">CONFIRMAR POR WHATSAPP <MessageCircle size={18}/></button>{notice && <p className="form-notice">{notice}</p>}
        </form>}
      </section>

      <footer><div className="footer-mark">{config.partner1.charAt(0)}<span>&</span>{config.partner2.charAt(0)}</div><p>Gracias por ser parte de nuestra historia</p><small>HECHO CON AMOR · 2027</small></footer>
      <button className="admin-fab" onClick={() => setAdmin(true)} aria-label="Panel de novios"><Pencil size={17}/><span>Editar</span></button>

      {admin && <div className="admin-overlay" role="dialog" aria-modal="true"><div className="admin-panel">
        <button className="close-admin" onClick={() => setAdmin(false)}><X/></button>
        {!unlocked ? <div className="unlock"><Sparkles/><p className="eyebrow">PANEL DE LOS NOVIOS</p><h2>Su boda, sus detalles</h2><p>Ingresen el PIN de administración para editar la invitación y revisar confirmaciones.</p><input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" onKeyDown={e => e.key === "Enter" && unlockAdmin()}/><button onClick={unlockAdmin}>ENTRAR</button><small>PIN de demostración: 2027</small>{notice && <p className="form-notice">{notice}</p>}</div> : <div className="editor">
          <p className="eyebrow">PANEL DE LOS NOVIOS</p><h2>Editar invitación</h2>
          <div className="editor-grid">
            <label>Nombre 1<input value={draft.partner1} onChange={e => setDraft({...draft, partner1:e.target.value})}/></label><label>Nombre 2<input value={draft.partner2} onChange={e => setDraft({...draft, partner2:e.target.value})}/></label>
            <label>Fecha y hora<input type="datetime-local" value={draft.date.slice(0,16)} onChange={e => setDraft({...draft, date:e.target.value})}/></label><label>Lugar<input value={draft.venue} onChange={e => setDraft({...draft, venue:e.target.value})}/></label>
            <label className="wide">Dirección<input value={draft.address} onChange={e => setDraft({...draft, address:e.target.value})}/></label><label className="wide">Historia<textarea rows={3} value={draft.story} onChange={e => setDraft({...draft, story:e.target.value})}/></label>
            <label className="wide">Vestimenta<input value={draft.dressCode} onChange={e => setDraft({...draft, dressCode:e.target.value})}/></label><label>WhatsApp<input value={draft.whatsapp} onChange={e => setDraft({...draft, whatsapp:e.target.value})}/></label><label>URL de música<input value={draft.audioUrl} onChange={e => setDraft({...draft, audioUrl:e.target.value})} placeholder="https://…"/></label>
          </div><button className="save-btn" onClick={saveConfig}>GUARDAR CAMBIOS</button>{notice && <p className="form-notice">{notice}</p>}
          <div className="link-maker"><h3>Crear invitación personalizada</h3><div><input value={guest} onChange={e => setGuest(e.target.value)} placeholder="Invitado"/><input type="number" min="1" max="12" value={seats} onChange={e => setSeats(Number(e.target.value))}/><input value={code} onChange={e => setCode(e.target.value)} placeholder="Código"/></div><button onClick={() => navigator.clipboard.writeText(personalizedUrl())}><Copy size={16}/> COPIAR ENLACE</button></div>
          <div className="responses"><h3>Confirmaciones <span>{responses.length}</span></h3>{responses.length === 0 ? <p>Aún no hay respuestas.</p> : responses.map(r => <div className="response-row" key={r.id}><span className={r.attendance}>{r.attendance === "yes" ? "Sí" : "No"}</span><strong>{r.guestName}</strong><small>{r.guests} pase(s) · {r.dietary || "Sin restricciones"}</small></div>)}</div>
        </div>}
      </div></div>}
    </main>
  );
}
