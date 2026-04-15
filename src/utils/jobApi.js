const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;
const BASE_URL = "https://api.adzuna.com/v1/api/jobs";

export async function searchJobs({ role = "", location = "", page = 1 }) {
  const country = "in";
  let url = `${BASE_URL}/${country}/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=10`;

  if (role.trim()) url += `&what=${encodeURIComponent(role)}`;
  if (location.trim()) url += `&where=${encodeURIComponent(location)}`;

  const response = await fetch(url);
  if (!response.ok) {
    let errorDetail = "";
    try {
      const errorData = await response.json();
      errorDetail = errorData.error || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }
    console.error("Adzuna API Error:", response.status, errorDetail);
    throw new Error(`Failed to fetch jobs: ${response.status} ${errorDetail}`);
  }
  const data = await response.json();
  return data.results;
}