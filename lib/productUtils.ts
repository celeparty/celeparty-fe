import { iProductVariant } from "./interfaces/iProduct";

export const getLowestVariantPrice = (variants: iProductVariant[]) => {
  const prices = variants.map((v) => Number(v.price)).filter((p) => !isNaN(p));

  return prices.length > 0 ? Math.min(...prices) : 0;
};
