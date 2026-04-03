// Get data from localStorage
export function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Save data to localStorage
export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Delete data from localStorage
export function deleteData(key) {
  localStorage.removeItem(key);
}