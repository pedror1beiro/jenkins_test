const API_BASE = "";

async function callApi(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const text = await res.text();
  try { return JSON.stringify(JSON.parse(text), null, 2); }
  catch { return text; }
}

document.getElementById("btnHealth").addEventListener("click", async () => {
  document.getElementById("outHealth").textContent = "A chamar...";
  document.getElementById("outHealth").textContent = await callApi("/api/health");
});

document.getElementById("btnDbTime").addEventListener("click", async () => {
  document.getElementById("outDbTime").textContent = "A chamar...";
  document.getElementById("outDbTime").textContent = await callApi("/api/db-time");
});
