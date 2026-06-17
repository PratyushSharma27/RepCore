export type FaqGroup = {
  title: string;
  items: { q: string; a: string }[];
};

export const faqGroups: FaqGroup[] = [
  {
    title: "Shipping",
    items: [
      {
        q: "How fast do you ship?",
        a: "Orders ship within 1-3 business days. Standard delivery usually lands in 3-7 business days after dispatch.",
      },
      {
        q: "Where do you ship?",
        a: "We currently offer fast Pan India shipping through tracked courier partners.",
      },
      {
        q: "Is shipping free?",
        a: "Free shipping on orders above ₹500. Orders below ₹500 ship at a flat ₹99 rate.",
      },
    ],
  },
  {
    title: "Returns & Warranty",
    items: [
      {
        q: "What's your return policy?",
        a: "60-day no-questions returns on unused gear. Start a return from your order email.",
      },
      {
        q: "Do products have a warranty?",
        a: "Every RepCore product is quality checked before dispatch and backed by our commitment to quality.",
      },
      {
        q: "What if my item arrives damaged?",
        a: "Email support@repcore.co with a photo within 7 days and we'll help resolve it quickly.",
      },
    ],
  },
  {
    title: "Product",
    items: [
      {
        q: "Are resistance bands latex-free?",
        a: "Our standard bands use natural latex. A latex-free TPE version is in development.",
      },
      {
        q: "Is the shaker dishwasher safe?",
        a: "Yes — top rack only. Hand-wash the mixer ball for longest life.",
      },
      {
        q: "How loud is the mini massage gun?",
        a: "Below 45 dB on speed 1 — about the volume of a quiet conversation.",
      },
    ],
  },
];
