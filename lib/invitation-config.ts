export type GalleryImage = {
  url: string;
  caption: string;
};

export type InvitationConfig = {
  partner1: string;
  partner2: string;
  date: string;
  venue: string;
  address: string;
  story: string;
  dressCode: string;
  giftTitle: string;
  giftText: string;
  whatsapp: string;
  audioUrl: string;
  galleryImages: GalleryImage[];
};

export const defaultInvitationConfig: InvitationConfig = {
  partner1: "Isabella",
  partner2: "Santiago",
  date: "2027-05-22T17:00:00-06:00",
  venue: "Hacienda San Gabriel",
  address: "Camino de los Olivos 18, Querétaro, Qro.",
  story: "Después de tantos caminos compartidos, elegimos uno para siempre. Queremos celebrar este nuevo capítulo rodeados de las personas que más amamos.",
  dressCode: "Formal · tonos claros y azules bienvenidos",
  giftTitle: "Lo más importante es celebrar juntos",
  giftText: "Su presencia es nuestro mejor regalo. Si desean tener un detalle con nosotros, habrá una mesa de sobres el día del evento.",
  whatsapp: "525500000000",
  audioUrl: "",
  galleryImages: [
    { url: "/assets/rings-sage.png", caption: "Amor en cada detalle" },
    { url: "/assets/bouquet-sage.png", caption: "El comienzo de nuestra historia" },
    { url: "/assets/wedding-florals-sage.png", caption: "Donde sea, pero contigo" },
  ],
};

const upgradedGalleryAssets: Record<string, string> = {
  "/assets/rings.png": "/assets/rings-sage.png",
  "/assets/bouquet.png": "/assets/bouquet-sage.png",
  "/assets/wedding-florals.png": "/assets/wedding-florals-sage.png",
};

export function normalizeInvitationConfig(value?: Partial<InvitationConfig> | null): InvitationConfig {
  const merged = { ...defaultInvitationConfig, ...(value || {}) };
  return {
    ...merged,
    galleryImages: Array.isArray(value?.galleryImages) && value.galleryImages.length
      ? value.galleryImages.filter((image) => image?.url).slice(0, 10).map((image) => {
          const url = String(image.url);
          return { url: upgradedGalleryAssets[url] || url, caption: String(image.caption || "") };
        })
      : defaultInvitationConfig.galleryImages,
  };
}
