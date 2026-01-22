export const parseLocalDateString = (value: string) => {
  if (!value) {
    return new Date();
  }
  const datePart = value.includes('T') ? value.slice(0, 10) : value;
  const [year, month, day] = datePart.split('-').map((part) => parseInt(part, 10));
  if (!year || !month || !day) {
    return new Date(value);
  }
  return new Date(year, month - 1, day);
};

export const formatLocalDate = (value: string, locale = 'es-AR') => {
  return parseLocalDateString(value).toLocaleDateString(locale);
};
