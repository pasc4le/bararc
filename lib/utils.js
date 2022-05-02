export const ISCHIA_DATA = {
  lat: 40.727256,
  mlat: 40.717256,
  lng: 13.907813,
};

export const GENERAL_SETTINGS = {
  icons: {
    "store-icon": "Supermarket",
    "pharmacy-icon": "Farmacia",
    "bar-icon": "Bar",
    "church-icon": "Luogo di Culto",
    "cinema-icon": "Attrazione",
    "harbor-icon": "Porto",
    "hotel-icon": "Hotel",
    "parking-icon": "Parcheggio",
    "restaurant-icon": "Ristorante",
  },
  types: {
    low: "Verde",
    medium: "Giallo",
    high: "Rosso",
  },
  typesColors: {
    low: "#419264",
    high: "#BE2F00",
    medium: "#F6D34B",
  },
};

export const gradeToColor = (grade) => {
  if (!grade) return;
  if (grade.match(/^(low|medium|high)$/i))
    return GENERAL_SETTINGS.typesColors[grade];
};
