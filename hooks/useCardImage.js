// hooks/useCardImage.js
import { useMemo } from "react";

export default function useCardImage(card, size = "normal") {
  return useMemo(() => {
    if (!card) {
      return "/images/card-placeholder.png"; // Usa un placeholder local
    }

    // 1. Si tenemos URL directa de DB, la priorizamos
    const directUrl =
      size === "small"
        ? card.image_url_small || card.commander_image_small
        : size === "large"
        ? card.image_url_large || card.commander_image
        : card.image_url_normal ||
          card.commander_image_normal ||
          card.commander_image;

    if (directUrl) {
      return upgradeScryfallUrl(directUrl, size);
    }

    // 2. Si tenemos scryfall_id, generamos URL optimizada
    if (card.scryfall_id) {
      return `https://api.scryfall.com/cards/${card.scryfall_id}?format=image&version=${size}`;
    }

    // 3. Fallback final → placeholder local
    return "/images/card-placeholder.png";
  }, [card, size]);
}

// Normaliza URLs de Scryfall (convierte /small/ a /normal/)
function upgradeScryfallUrl(url, size) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (
      (u.hostname === "cards.scryfall.io" ||
        u.hostname === "img.scryfall.com") &&
      u.pathname.includes("/small/")
    ) {
      u.pathname = u.pathname.replace("/small/", `/${size}/`);
      return u.toString();
    }
  } catch {}
  return url;
}
