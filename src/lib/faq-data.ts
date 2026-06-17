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
        a: "Orders placed before 2pm ET ship same day. Standard delivery lands in 2–5 business days.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes — we ship to 38 countries. Duties and taxes are calculated at checkout.",
      },
      {
        q: "Is shipping free?",
        a: "Free standard shipping on all US orders over $50.",
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
        a: "Every RepCore tool ships with a lifetime defect warranty. If it breaks under normal training, we replace it.",
      },
      {
        q: "What if my item arrives damaged?",
        a: "Email support@repcore.co with a photo within 7 days and we'll overnight a replacement.",
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
