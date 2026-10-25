"use client";

import { jsPDF } from "jspdf";

type PdfConfig = {
  partner1: string;
  partner2: string;
  date: string;
  venue: string;
};

async function imageAsDataUrl(path: string) {
  const blob = await fetch(path).then((response) => response.blob());
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function downloadInvitationPdf(config: PdfConfig, guest: string, seats: number, invitationUrl: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const width = 148;
  const height = 210;
  const florals = await imageAsDataUrl("/assets/wedding-florals.png");

  doc.addImage(florals, "PNG", 0, 0, width, height);
  doc.setFillColor(255, 253, 248);
  doc.roundedRect(14, 16, 120, 178, 3, 3, "F");
  doc.setDrawColor(185, 154, 91);
  doc.setLineWidth(0.35);
  doc.roundedRect(18, 20, 112, 170, 2, 2, "S");

  doc.setTextColor(20, 42, 70);
  doc.setFont("times", "italic");
  doc.setFontSize(24);
  doc.text(`${config.partner1} & ${config.partner2}`, width / 2, 43, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setCharSpace(1.1);
  doc.text("TENEMOS EL HONOR DE INVITARTE", width / 2, 28, { align: "center" });
  doc.setCharSpace(0);

  // Tarjeta que asoma del sobre.
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(192, 201, 213);
  doc.roundedRect(35, 55, 78, 65, 2, 2, "FD");
  doc.setFont("times", "italic");
  doc.setFontSize(15);
  doc.text(guest, width / 2, 76, { align: "center", maxWidth: 64 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const date = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(new Date(config.date));
  doc.text(date, width / 2, 90, { align: "center" });
  doc.setFontSize(7);
  doc.text(config.venue, width / 2, 98, { align: "center", maxWidth: 62 });

  // Sobre azul, pliegues y sello dorado.
  doc.setFillColor(28, 62, 112);
  doc.setDrawColor(20, 47, 86);
  doc.roundedRect(25, 105, 98, 52, 2, 2, "FD");
  doc.setFillColor(40, 78, 132);
  doc.triangle(25, 105, 123, 105, 74, 140, "F");
  doc.setDrawColor(102, 139, 187);
  doc.line(25, 157, 65, 127);
  doc.line(123, 157, 83, 127);
  doc.setFillColor(185, 154, 91);
  doc.circle(74, 137, 7, "F");
  doc.setTextColor(255, 253, 248);
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.text(`${config.partner1.charAt(0)}&${config.partner2.charAt(0)}`, 74, 139.5, { align: "center" });

  doc.setTextColor(20, 42, 70);
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.text(`${seats} ${seats === 1 ? "lugar reservado" : "lugares reservados"} para ti`, width / 2, 170, { align: "center" });
  doc.setFillColor(20, 62, 112);
  doc.roundedRect(39, 177, 70, 10, 5, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.textWithLink("ABRIR INVITACIÓN DIGITAL", width / 2, 183.3, { align: "center", url: invitationUrl });

  const safeName = guest.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`Invitacion-${safeName || "Boda"}.pdf`);
}
