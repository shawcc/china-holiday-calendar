function formatDate(date) {
  return date.replaceAll("-", ".");
}

function renderYear(data, latestYear) {
  const latest = data.year === latestYear ? '<span class="latest">最新</span>' : "";
  return `
    <article class="year-row">
      <div class="year">
        <strong>${data.year}</strong>
        ${latest}
      </div>
      <div class="summary">
        <span>${data.rest_count} 个休息日</span>
        <span>${data.work_count} 个补班日</span>
        <span>${data.row_count} 条记录</span>
      </div>
      <div class="meta">
        <span>${formatDate(data.published_at)} 发布</span>
        <a href="${data.source_url}" target="_blank" rel="noreferrer">官方通知</a>
      </div>
      <div class="actions">
        <a class="download primary" href="${data.xlsx}" download aria-label="下载 ${data.year} 年 Excel">
          <i data-lucide="download" aria-hidden="true"></i>
          Excel
        </a>
        <a class="download secondary" href="${data.csv}" download aria-label="下载 ${data.year} 年 CSV">CSV</a>
      </div>
    </article>
  `;
}

async function initialize() {
  const response = await fetch("manifest.json", { cache: "no-store" });
  if (!response.ok) throw new Error("无法读取日历清单");
  const manifest = await response.json();
  document.querySelector("#year-list").innerHTML = [...manifest.years]
    .sort((a, b) => b.year - a.year)
    .map(data => renderYear(data, manifest.latest_year))
    .join("");
  window.lucide?.createIcons();
}

window.addEventListener("DOMContentLoaded", () => {
  initialize().catch(error => {
    console.error(error);
    document.querySelector("#year-list").textContent = "文件暂时无法加载";
    window.lucide?.createIcons();
  });
});
