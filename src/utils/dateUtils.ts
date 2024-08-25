export function checkExpiredRates(date: Date) {
  const today = new Date();

  const inputYear = date.getFullYear();
  const inputMonth = date.getMonth();
  const inputDay = date.getDate();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  if (inputYear < currentYear) {
    return true;
  } else if (inputYear === currentYear) {
    if (inputMonth < currentMonth) {
      return true;
    } else if (inputMonth === currentMonth) {
      if (inputDay < currentDay) {
        return true;
      }
    }
  }

  return false;
}