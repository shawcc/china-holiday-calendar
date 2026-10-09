const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

function formatDate(date) {
  return date.replaceAll("-", ".");
}

function formatRange(dates) {
  if (!dates.length) return "";
  const dayNumbers = dates.map(date => Number(date.slice(-2)));
  const months = [...new Set(dates.map(date => Number(date.slice(5, 7))))];
  if (months.length === 1) {
    const start = dayNumbers[0];
    const end = dayNumbers.at(-1);
    return `${months[0]}月${start}${start === end ? "" : `-${end}`}日`;
  }
  return dates.map(date => `${Number(date.slice(5, 7))}月${Number(date.slice(-2))}日`).join("、");
}

function renderMonths(data) {
  const monthStats = Array.from({ length: 12 }, () => ({ rest: 0, work: 0 }));
  data.holidays.forEach(holiday => {
    holiday.rest_dates.forEach(date => monthStats[Number(date.slice(5, 7)) - 1].rest++);
    holiday.work_dates.forEach(date => monthStats[Number(date.slice(5, 7)) - 1].work++);
  });
  document.querySelector("#month-strip").innerHTML = monthStats.map((stats, index) => `
    <div class="month-cell ${stats.rest ? "has-rest" : ""} ${stats.work ? "has-work" : ""}">
      <strong>${String(index + 1).padStart(2, "0")}</strong>
      <small>${stats.rest ? `${stats.rest} 休` : monthNames[index]}${stats.work ? ` · ${stats.work} 班` : ""}</small>
    </div>
  `).join("");
}

function renderHolidays(data) {
  document.querySelector("#holiday-list").innerHTML = data.holidays.map((holiday, index) => {
    const work = holiday.work_dates.length
      ? `<span class="work-label">补班</span> ${holiday.work_dates.map(formatDate).join("、")}`
      : "无补班";
    return `
      <article class="holiday-item">
        <span class="holiday-index">${String(index + 1).padStart(2, "0")}</span>
        <div class="holiday-content">
          <strong class="holiday-name">${holiday.name}</strong>
          <span class="holiday-dates">放假 ${formatRange(holiday.rest_dates)}<br>${work}</span>
        </div>
      </article>
    `;
  }).join("");
}

async function initialize() {
  const response = await fetch("manifest.json", { cache: "no-store" });
  if (!response.ok) throw new Error("无法读取日历清单");
  const manifest = await response.json();
  const data = manifest.years.find(item => item.year === manifest.latest_year);
  const sourceLinks = [document.querySelector("#header-source"), document.querySelector("#footer-source")];

  document.querySelector("#latest-year").textContent = data.year;
  document.querySelector("#calendar-year").textContent = data.year;
  document.querySelector("#published-at").textContent = formatDate(data.published_at);
  document.querySelector("#row-count").textContent = data.row_count;
  document.querySelector("#rest-count").textContent = data.rest_count;
  document.querySelector("#work-count").textContent = data.work_count;
  document.querySelector("#document-number").textContent = data.document_number;
  document.querySelector("#file-hash").textContent = data.xlsx_sha256;
  document.querySelector("#xlsx-download").href = data.xlsx;
  document.querySelector("#csv-download").href = data.csv;
  sourceLinks.forEach(link => { link.href = data.source_url; });
  renderMonths(data);
  renderHolidays(data);
  window.lucide?.createIcons();
}

window.addEventListener("DOMContentLoaded", () => {
  initialize().catch(error => {
    console.error(error);
    document.querySelector("#holiday-list").textContent = "日历数据暂时无法加载，请稍后重试。";
    window.lucide?.createIcons();
  });
});
