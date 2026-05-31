export const allCars = [];

for (let set = 1; set <= 115; set++) {
  const setStr = String(set).padStart(2, "0");

  for (const prefix of ["31", "32", "33"]) {
    allCars.push(`${prefix}${setStr}`);
  }
}
