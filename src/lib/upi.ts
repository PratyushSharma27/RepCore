import QRCode from "qrcode";

export const REPCORE_UPI_ID = "8750627108@fam";
export const REPCORE_MERCHANT_NAME = "RepCore";

export const buildUpiPaymentLink = ({
  amount,
  orderId,
}: {
  amount: number;
  orderId?: string;
}) => {
  const params = new URLSearchParams({
    pa: REPCORE_UPI_ID,
    pn: REPCORE_MERCHANT_NAME,
    cu: "INR",
    am: amount.toFixed(2),
  });

  if (orderId) {
    params.set("tn", `RepCore order ${orderId}`);
    params.set("tr", orderId);
  }

  return `upi://pay?${params.toString()}`;
};

export const generateUpiQrDataUrl = async (upiLink: string) =>
  QRCode.toDataURL(upiLink, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: {
      dark: "#f5f5f5",
      light: "#111111",
    },
  });

export const createOrderId = () =>
  `RC-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

export const formatInr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
