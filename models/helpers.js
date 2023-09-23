export default (date, monthOffset = 0) => {
  const rightMonthNumber = 1;
  const rawMonth = date.getMonth() + monthOffset + rightMonthNumber;
  const year = date.getFullYear();
  const month = rawMonth < 10 ? `0${rawMonth}` : `${rawMonth}`;
  return `${year}-${month}`;
};
