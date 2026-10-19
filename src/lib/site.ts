export const site = {
  name: "MIRKA with love",
  tagline: "Wearable art, since 2017",
  email: "mirkawithlove@gmail.com",
  phoneDisplay: "+381 61 198 1332",
  phoneTel: "+381611981332",
  whatsapp: "https://wa.me/381611981332",
  viber: "viber://chat?number=%2B381611981332",
  instagram: "https://www.instagram.com/mirka_withlove/",
  facebook: "https://www.facebook.com/prodajatorbi93/",
  shops: [
    {
      name: "MIRKA atelje",
      address: "Balkanska 26, Kruševac",
    },
    {
      name: "Just Machine",
      address: "Kneginje Zorke 81, Beograd",
    },
  ],
};

export function whatsappHref(text?: string) {
  if (!text) return site.whatsapp;
  return `${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
