"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Gift, Heart, MapPin, MessageCircle, Pause, Play, Shirt } from "lucide-react";
import { defaultInvitationConfig, normalizeInvitationConfig, type InvitationConfig } from "../lib/invitation-config";

type MusicProvider = { kind: "spotify" | "youtube" | "audio" | "demo"; embedUrl?: string };

function getMusicProvider(value: string): MusicProvider {
  const url = value.trim();
  if (!url) return { kind: "demo" };
  const spotify = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (spotify) return { kind: "spotify", embedUrl: `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}?theme=0` };
  try {
    const parsed = new URL(url);
    let id = "";
    if (parsed.hostname.includes("youtu.be")) id = parsed.pathname.split("/")[1] || "";
    if (parsed.hostname.includes("youtube.com")) id = parsed.searchParams.get("v") || parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] || "";
    if (id) return { kind: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
  } catch { /* A relative audio URL is valid. */ }
  return { kind: "audio" };
}

function useCountdown(date: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const distance = Math.max(0, new Date(date).getTime() - now);
  return { días: Math.floor(distance / 86400000), horas: Math.floor((distance / 3600000) % 24), minutos: Math.floor((distance / 60000) % 60) };
}

function MusicButton({ audioUrl }: { audioUrl: string }) {
  const provider = getMusicProvider(audioUrl);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const context = useRef<AudioContext | null>(null);
  const timers = useRef<number[]>([]);
  function stopDemo() { timers.current.forEach(window.clearTimeout); timers.current = []; context.current?.close(); context.current = null; }
  function playDemo() { const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; const ctx = new AudioCtx(); context.current = ctx; const notes = [261.63,329.63,392,523.25,392,329.63,293.66,440]; notes.forEach((frequency,i) => { const timer=window.setTimeout(()=>{ if(!context.current)return; const osc=ctx.createOscillator(); const gain=ctx.createGain(); osc.type="sine"; osc.frequency.value=frequency; gain.gain.setValueAtTime(.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.09,ctx.currentTime+.05); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+1.15); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+1.2); },i*680); timers.current.push(timer); }); timers.current.push(window.setTimeout(()=>setPlaying(false),notes.length*680+800)); }
  function toggle() {
    if (provider.kind === "spotify" || provider.kind === "youtube") { document.getElementById("musica")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (playing) { audio.current?.pause(); stopDemo(); setPlaying(false); return; }
    if (provider.kind === "audio") { if (!audio.current) audio.current = new Audio(audioUrl); void audio.current.play(); audio.current.onended = () => setPlaying(false); } else playDemo();
    setPlaying(true);
  }
  useEffect(() => () => stopDemo(), []);
  const platform = provider.kind === "spotify" ? "Spotify" : provider.kind === "youtube" ? "YouTube" : playing ? "Reproduciendo…" : "Dale play";
  return <button className={`music-pill ${playing ? "is-playing" : ""}`} onClick={toggle} aria-label="Escuchar nuestra canción"><span className="music-icon">{playing ? <Pause size={17}/> : <Play size={17} fill="currentColor"/>}</span><span><small>NUESTRA CANCIÓN</small>{platform}</span><span className="equalizer" aria-hidden="true"><i/><i/><i/></span></button>;
}

function MusicSection({ audioUrl }: { audioUrl: string }) {
  const provider = getMusicProvider(audioUrl);
  if (!audioUrl || provider.kind === "demo") return null;
  return <section className="music-section section" id="musica"><div><p className="eyebrow">LA BANDA SONORA DE NUESTRA HISTORIA</p><h2>Nuestra <i>canción</i></h2><p>Hay canciones que guardan una historia entera. Esta es la nuestra.</p></div><div className={`music-embed ${provider.kind}`}>{provider.kind === "spotify" && <iframe src={provider.embedUrl} title="Nuestra canción en Spotify" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"/>}{provider.kind === "youtube" && <iframe src={provider.embedUrl} title="Nuestra canción en YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>}{provider.kind === "audio" && <audio src={audioUrl} controls preload="metadata"/>}</div></section>;
}

function GalleryCarousel({ config }: { config: InvitationConfig }) {
  const images = config.galleryImages.length ? config.galleryImages : defaultInvitationConfig.galleryImages;
  const [slide, setSlide] = useState(0);
  useEffect(() => { if (images.length < 2) return; const timer = window.setInterval(() => setSlide(current => (current + 1) % images.length), 5000); return () => clearInterval(timer); }, [images.length]);
  const currentSlide = slide % images.length;
  const previous = () => setSlide(current => (current - 1 + images.length) % images.length);
  const next = () => setSlide(current => (current + 1) % images.length);
  return <section className="gallery-carousel section" id="galeria"><header><p className="eyebrow">NUESTROS RECUERDOS</p><h2>Una historia en <i>imágenes</i></h2></header><div className="carousel-frame"><div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>{images.map((image,index)=><figure key={`${image.url}-${index}`}><img src={image.url} alt={image.caption || `Recuerdo ${index + 1}`} loading={index === 0 ? "eager" : "lazy"}/>{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}</div>{images.length>1&&<><button className="carousel-arrow previous" onClick={previous} aria-label="Foto anterior"><ChevronLeft/></button><button className="carousel-arrow next" onClick={next} aria-label="Foto siguiente"><ChevronRight/></button></>}<div className="carousel-dots">{images.map((_,index)=><button key={index} onClick={()=>setSlide(index)} className={index===currentSlide?"active":""} aria-label={`Ver foto ${index+1}`}/>)}</div></div></section>;
}

export default function WeddingInvitation() {
  const [config,setConfig]=useState<InvitationConfig>(defaultInvitationConfig); const [guest,setGuest]=useState("Familia Ramírez"); const [seats,setSeats]=useState(2); const [code,setCode]=useState("demo"); const [menu,setMenu]=useState(false); const [notice,setNotice]=useState(""); const [submitted,setSubmitted]=useState(false);
  const countdown=useCountdown(config.date); const eventDate=useMemo(()=>new Date(config.date),[config.date]); const initials=`${config.partner1.trim().charAt(0)||"?"}&${config.partner2.trim().charAt(0)||"?"}`.toUpperCase();
  useEffect(()=>{ async function loadInvitation(){const params=new URLSearchParams(window.location.search);const data:{config?:Partial<InvitationConfig>}=await fetch("/api/config").then(r=>r.json() as Promise<{config?:Partial<InvitationConfig>}>).catch(()=>({}));setGuest(params.get("invitado")||"Familia Ramírez");setSeats(Math.max(1,Number(params.get("pases"))||2));setCode(params.get("codigo")||"demo");setConfig(normalizeInvitationConfig(data.config));}void loadInvitation();},[]);
  async function submitRsvp(event:FormEvent<HTMLFormElement>){ event.preventDefault(); setNotice("Guardando tu respuesta…"); const form=new FormData(event.currentTarget); const payload={guestName:form.get("guestName"),attendance:form.get("attendance"),guests:Number(form.get("guests")),message:form.get("message"),invitationCode:code}; try{const response=await fetch("/api/rsvp",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const result=await response.json() as {error?:string};if(!response.ok)throw new Error(result.error||"No fue posible confirmar");setSubmitted(true);setNotice("");const answer=payload.attendance==="yes"?`Sí asistiré con ${payload.guests} persona(s)`:"No podré asistir";const text=`Hola ${config.partner1} y ${config.partner2}. Soy ${payload.guestName}. ${answer}. ${payload.message||""}`;window.open(`https://wa.me/${config.whatsapp.replace(/\D/g,"")}?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer");}catch(error){setNotice(error instanceof Error?error.message:"Inténtalo nuevamente");} }
  return <main>
    <nav className="topbar"><a href="#inicio" className="monogram" aria-label="Inicio">{config.partner1.charAt(0)}<span>&</span>{config.partner2.charAt(0)}</a><div className={`navlinks ${menu?"open":""}`}><a href="#historia" onClick={()=>setMenu(false)}>Nuestra historia</a><a href="#detalles" onClick={()=>setMenu(false)}>Detalles</a><a href="#galeria" onClick={()=>setMenu(false)}>Galería</a><a href="#confirmar" onClick={()=>setMenu(false)}>Confirmar</a></div><button className="menu-btn" onClick={()=>setMenu(!menu)} aria-label="Abrir menú"><span aria-hidden="true">{menu?"×":"☰"}</span></button></nav>
    <section className="hero" id="inicio"><img src="/assets/wedding-florals.png" alt="Flores azules y calas blancas" className="hero-art"/><div className="hero-content reveal"><p className="eyebrow">NOS CASAMOS</p><h1><span>{config.partner1}</span><b>&</b><span>{config.partner2}</span></h1><div className="gold-line"><Heart size={15} fill="currentColor"/></div><p className="date-line">{eventDate.toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"})}</p><p className="guest-line">Con mucho cariño para<br/><strong>{guest}</strong></p><p className="passes">Hemos reservado {seats} {seats===1?"lugar":"lugares"} para ti</p><MusicButton audioUrl={config.audioUrl}/></div><a href="#historia" className="scroll-cue"><span>DESCUBRE NUESTRA INVITACIÓN</span><ChevronDown size={19}/></a></section>
    <section className="story section" id="historia"><div className="story-photo"><img src={config.galleryImages[0]?.url||"/assets/bouquet.png"} alt={config.galleryImages[0]?.caption||"Recuerdo de los novios"}/><span>Para siempre</span></div><div className="story-copy"><p className="eyebrow">UN SÍ PARA SIEMPRE</p><h2>Nuestra historia<br/><i>apenas comienza</i></h2><p>{config.story}</p><div className="signature">{initials}</div></div></section>
    <MusicSection audioUrl={config.audioUrl}/>
    <section className="countdown section" data-monogram={initials}><p className="eyebrow">FALTA MUY POCO</p><h2>Para nuestro gran día</h2><div className="count-grid">{Object.entries(countdown).map(([label,value])=><div key={label}><strong>{String(value).padStart(2,"0")}</strong><span>{label}</span></div>)}</div><p className="save-date">Guarda la fecha · {eventDate.toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})}</p></section>
    <section className="details section" id="detalles"><header><p className="eyebrow">TODO LO QUE NECESITAS SABER</p><h2>Detalles del día</h2></header><div className="detail-grid"><article><span><CalendarDays/></span><p className="eyebrow">CUÁNDO</p><h3>{eventDate.toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}</h3><p><Clock3 size={15}/>{eventDate.toLocaleTimeString("es-MX",{hour:"numeric",minute:"2-digit"})}</p></article><article className="featured"><span><MapPin/></span><p className="eyebrow">DÓNDE</p><h3>{config.venue}</h3><p>{config.address}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`} target="_blank" rel="noreferrer">VER EN EL MAPA</a></article><article><span><Shirt/></span><p className="eyebrow">CÓDIGO DE VESTIMENTA</p><h3>Formal</h3><p>{config.dressCode}</p></article></div></section>
    <GalleryCarousel config={config}/>
    <section className="gift section"><Gift/><p className="eyebrow">REGALOS</p><h2>{config.giftTitle}</h2><p>{config.giftText}</p></section>
    <section className="rsvp section" id="confirmar"><div className="rsvp-intro"><p className="eyebrow">¿NOS ACOMPAÑAS?</p><h2>Confirma tu<br/><i>asistencia</i></h2><p>Tu respuesta nos ayudará a preparar cada detalle. Por favor confirma antes del 20 de abril.</p></div>{submitted?<div className="success-card"><span><Check/></span><h3>¡Gracias por responder!</h3><p>Tu confirmación quedó registrada y WhatsApp está listo para avisarnos.</p></div>:<form className="rsvp-form" onSubmit={submitRsvp}><label>Nombre completo<input name="guestName" defaultValue={guest} required/></label><fieldset><legend>¿Podrás acompañarnos?</legend><label><input type="radio" name="attendance" value="yes" defaultChecked/><span>Sí, ahí estaré</span></label><label><input type="radio" name="attendance" value="no"/><span>No podré asistir</span></label></fieldset><label>Número de asistentes<input name="guests" type="number" inputMode="numeric" min="1" step="1" defaultValue={seats} required/></label><label>Un mensaje para los novios<textarea name="message" rows={3} placeholder="Escribe algo bonito…"/></label><button type="submit">CONFIRMAR POR WHATSAPP <MessageCircle size={18}/></button>{notice&&<p className="form-notice">{notice}</p>}</form>}</section>
    <footer><div className="footer-mark">{config.partner1.charAt(0)}<span>&</span>{config.partner2.charAt(0)}</div><p>Gracias por ser parte de nuestra historia</p><small>HECHO CON AMOR · {eventDate.getFullYear()}</small></footer>
  </main>;
}
