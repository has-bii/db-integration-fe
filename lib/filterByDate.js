export default function filterByDate(array, startDate, endDate) {
  const startDateObj = startDate.length !== 0 ? new Date(startDate) : null;
  const endDateObj = endDate.length !== 0 ? new Date(endDate) : null;

  console.log(startDateObj);
  console.log(endDateObj);

  let temp = JSON.parse(JSON.stringify(array));

  if (startDateObj)
    temp = array.filter((item) => {
      const dateItem = new Date(item.date);
      return dateItem >= startDateObj;
    });

  if (endDateObj)
    temp = temp.filter((item) => {
      const dateItem = new Date(item.date);
      return dateItem <= endDateObj;
    });

  return temp;
}
