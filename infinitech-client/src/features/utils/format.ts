export const format = {
  date: (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }),
  dateTime: (iso: string) =>
    new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
  price: (n: number) => `₼${n.toFixed(2)}`,
};
