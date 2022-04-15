export const ISCHIA_DATA = {
  lat: 40.727256,
  mlat: 40.717256,
  lng: 13.907813,
};

export const GENERAL_SETTINGS = {
  icons: {
    'store-icon': 'Supermarket',
    'pharmacy-icon': 'Farmacia',
  },
  types: {
    low: 'Verde',
    high: 'Rosso',
    medium: 'Giallo',
  },
  typesColors: {
    low: 'green',
    high: '#dc582a',
    medium: '#ffc845',
  },
};

export const gradeToColor = (grade) => {
  if (grade.match(/^(low|medium|high)$/i))
    return GENERAL_SETTINGS.typesColors[grade];
};
