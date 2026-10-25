"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, Download, ExternalLink, LockKeyhole, Save, Sparkles } from "lucide-react";
import { downloadInvitationPdf } from "../lib/invitation-pdf";

type Config = { partner1:string; partner2:string; date:string; venue:string; address:string; story:string; dressCode:string; giftText:string; whatsapp:string; audioUrl:string };
type Rsvp = { id:number; guestName:string; attendance:string; guests:number; message:string; createdAt:string };

const defaults: Config = { partner1:"Isabella",partner2:"Santiago",date:"2027-05-22T17:00",venue:"Hacienda San Gabriel",address:"Camino de los Olivos 18, Querétaro, Qro.",story:"",dressCode:"Formal",giftText:"",whatsapp:"525500000000",audioUrl:"" };

export default function AdminDashboard() {
  const [pin,setPin]=useState(""); const [unlocked,setUnlocked]=useState(false); const [notice,setNotice]=useState("");
  const [config,setConfig]=useState<Config>(defaults); const [responses,setResponses]=useState<Rsvp[]>([]);
  const [guest,setGuest]=useState("Familia Ramírez"); const [seats,setSeats]=useState(2); const [code,setCode]=useState("familia-ramirez"); const [pdfLoading,setPdfLoading]=useState(false);

  function invitationUrl(){ const url=new URL(window.location.origin); url.searchParams.set("invitado",guest.trim()); url.searchParams.set("pases",String(Math.max(1,seats))); url.searchParams.set("codigo",code.trim()); return url.toString(); }
  async function unlock(){ setNotice("Comprobando…"); const [configResponse,rsvpResponse]=await Promise.all([fetch("/api/config"),fetch("/api/rsvp",{headers:{"x-admin-pin":pin}})]); if(!rsvpResponse.ok){setNotice("NIP incorrecto");return;} const configData=await configResponse.json() as {config?:Config}; const rsvpData=await rsvpResponse.json() as {rsvps?:Rsvp[]}; if(configData.config)setConfig(configData.config); setResponses(rsvpData.rsvps||[]); setUnlocked(true); setNotice(""); }
  async function save(){ setNotice("Guardando cambios…"); const response=await fetch("/api/config",{method:"POST",headers:{"content-type":"application/json","x-admin-pin":pin},body:JSON.stringify(config)}); const data=await response.json() as {error?:string}; if(!response.ok){setNotice(data.error||"No fue posible guardar");return;} setNotice("Cambios guardados"); setTimeout(()=>setNotice(""),2200); }
  async function copyLink(){ await navigator.clipboard.writeText(invitationUrl()); setNotice("Enlace copiado"); setTimeout(()=>setNotice(""),1800); }
  async function makePdf(){ setPdfLoading(true); setNotice("Diseñando PDF…"); try{await downloadInvitationPdf(config,guest,Math.max(1,seats),invitationUrl());setNotice("PDF descargado");}catch{setNotice("No fue posible crear el PDF");}finally{setPdfLoading(false);setTimeout(()=>setNotice(""),2200);} }

  if(!unlocked) return <main className="admin-page"><section className="admin-login"><LockKeyhole/><p className="eyebrow">ACCESO PRIVADO</p><h1>Panel de los novios</h1><p>Este espacio no aparece en la invitación pública. Ingresa el NIP para continuar.</p><input type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&unlock()} placeholder="NIP" autoFocus/><button onClick={unlock}>ENTRAR</button>{notice&&<small>{notice}</small>}<a href="/"><ArrowLeft size={15}/> Volver a la invitación</a></section></main>;

  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">ÁREA PRIVADA</p><h1>{config.partner1} & {config.partner2}</h1></div><a href="/" target="_blank"><ExternalLink size={16}/> Ver invitación</a></header><div className="admin-layout">
    <section className="admin-card editor"><div className="card-title"><Sparkles/><div><span>Contenido</span><h2>Editar invitación</h2></div></div><div className="editor-grid">
      <label>Nombre 1<input value={config.partner1} onChange={e=>setConfig({...config,partner1:e.target.value})}/></label><label>Nombre 2<input value={config.partner2} onChange={e=>setConfig({...config,partner2:e.target.value})}/></label>
      <label>Fecha y hora<input type="datetime-local" value={config.date.slice(0,16)} onChange={e=>setConfig({...config,date:e.target.value})}/></label><label>Lugar<input value={config.venue} onChange={e=>setConfig({...config,venue:e.target.value})}/></label>
      <label className="wide">Dirección<input value={config.address} onChange={e=>setConfig({...config,address:e.target.value})}/></label><label className="wide">Historia<textarea rows={4} value={config.story} onChange={e=>setConfig({...config,story:e.target.value})}/></label>
      <label className="wide">Vestimenta<input value={config.dressCode} onChange={e=>setConfig({...config,dressCode:e.target.value})}/></label><label>WhatsApp<input value={config.whatsapp} onChange={e=>setConfig({...config,whatsapp:e.target.value})}/></label><label>URL de música<input value={config.audioUrl} onChange={e=>setConfig({...config,audioUrl:e.target.value})} placeholder="https://…"/></label>
    </div><button className="save-btn" onClick={save}><Save size={16}/> GUARDAR CAMBIOS</button></section>
    <aside className="admin-side"><section className="admin-card invitation-maker"><p className="eyebrow">INVITACIÓN INDIVIDUAL</p><h2>Personalizar y enviar</h2><label>Invitado o familia<input value={guest} onChange={e=>setGuest(e.target.value)}/></label><div className="maker-row"><label>Número de pases<input type="number" inputMode="numeric" min="1" value={seats} onChange={e=>setSeats(Math.max(1,Number(e.target.value)||1))}/></label><label>Código<input value={code} onChange={e=>setCode(e.target.value)}/></label></div><div className="pdf-envelope"><div className="pdf-card"><small>PARA</small><strong>{guest}</strong><span>{seats} {seats===1?"PASE":"PASES"}</span></div><div className="envelope-flap"/><div className="wax-seal">{config.partner1.charAt(0)}&{config.partner2.charAt(0)}</div></div><button onClick={copyLink}><Copy size={16}/> COPIAR ENLACE</button><button className="secondary" onClick={makePdf} disabled={pdfLoading}><Download size={16}/> {pdfLoading?"CREANDO…":"DESCARGAR PDF"}</button></section>
      <section className="admin-card responses"><h3>Confirmaciones <span>{responses.length}</span></h3>{responses.length===0?<p>Aún no hay respuestas.</p>:responses.map(r=><div className="response-row" key={r.id}><span className={r.attendance}>{r.attendance==="yes"?"Sí":"No"}</span><strong>{r.guestName}</strong><small>{r.guests} asistente(s){r.message?` · ${r.message}`:""}</small></div>)}</section>
    </aside>
  </div>{notice&&<div className="admin-toast"><Check size={15}/>{notice}</div>}</main>;
}
