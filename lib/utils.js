export const ISCHIA_DATA = {
  lat: 40.729256,
  lng: 13.907813,
};

export const GRADE_DATA = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
};

export const gradeToColor = (grade) => {
  if (grade.match(/^(low|medium|high)$/i)) return GRADE_DATA[grade];
};
