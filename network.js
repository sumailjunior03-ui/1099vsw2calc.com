const CALC_HQ_NETWORK = [
  { domain: "calc-hq.com",              name: "Calc-HQ",                     live: true },
  { domain: "bizdaychecker.com",        name: "BizDayChecker.com",           live: true },
  { domain: "bankcutoffchecker.com",    name: "BankCutoffChecker.com",       live: true },
  { domain: "salaryvsinflation.com",    name: "SalaryVsInflation.com",       live: true },
  { domain: "hourly2salarycalc.com",    name: "Hourly2SalaryCalc.com",       live: true },
  { domain: "payrolldatechecker.com",   name: "PayrollDateChecker.com",      live: true },
  { domain: "1099vsw2calc.com",         name: "1099vsW2Calc.com",            live: true },
  { domain: "freelanceincomecalc.com",  name: "FreelanceIncomeCalc.com",     live: true },
  { domain: "quarterlytaxcalc.com",     name: "QuarterlyTaxCalc.com",        live: true },
  { domain: "totalcompcalc.com",        name: "TotalCompCalc.com",           live: true },
  { domain: "overtimepaycalc.com",      name: "OvertimePayCalc.com",         live: true },
  { domain: "aftertaxsalarycalc.com",   name: "AfterTaxSalaryCalc.com",      live: true }
];

function normalizeDomain(value) {
  return String(value || "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function renderRelatedTools(listElementId) {
  const related = document.getElementById(listElementId);
  if (!related) return;
  related.innerHTML = "";
  const host = normalizeDomain(window.location.hostname);
  let first = true;

  for (const site of CALC_HQ_NETWORK) {
    if (site.live !== true) continue;
    const domain = normalizeDomain(site.domain);
    if (!domain) continue;
    if (domain === "calc-hq.com") continue;
    if (host && domain === host) continue;

    if (!first) {
      const dot = document.createElement("span");
      dot.textContent = "·";
      dot.setAttribute("aria-hidden", "true");
      related.appendChild(dot);
    }

    const link = document.createElement("a");
    link.href = `https://${domain}/`;
    link.rel = "noopener";
    link.textContent = site.name;
    related.appendChild(link);
    first = false;
  }
}

function renderSiteHeaderActiveState() {
  const path = window.location.pathname || "/";
  const current = path === "/" ? "/index.html" : path;
  const links = document.querySelectorAll('.nav a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

window.renderRelatedTools = renderRelatedTools;
window.CALC_HQ_NETWORK = CALC_HQ_NETWORK;

document.addEventListener("DOMContentLoaded", function () {
  renderRelatedTools("relatedTools");
  renderRelatedTools("relatedCalculators");
  renderSiteHeaderActiveState();
});
