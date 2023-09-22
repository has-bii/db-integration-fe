function sortByDateAsc(array) {
  // Use the Array.sort() method to sort the array by date
  array.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // Compare the dates and return the result
    return dateA - dateB;
  });
}

function sortByDateDesc(array) {
  // Use the Array.sort() method to sort the array by date
  array.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // Compare the dates and return the result
    return dateB - dateA;
  });
}

export { sortByDateAsc, sortByDateDesc };
