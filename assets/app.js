import { SITE_NAME, SITE_DOMAIN, SITE_CANONICAL, RELATED_TOOLS, PARTNERSHIPS_EMAIL } from "./config.js";
import { compare, CONFIG_2025, TAX_YEAR } from "./core-logic.js";

const $ = (id) => document.getElementById(id);

function fmtUSD(n){
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0});
}
function fmtPct(x){
  const v = Number(x);
  if (!Number.isFinite(v)) return "—";
  return (v*100).toFixed(1) + "%";
}

function setText(id, txt){ $(id).textContent = txt; }

function buildFooter(){
  const related = $("relatedTools");
  related.innerHTML = "";
  const currentDomain = window.location.hostname.replace("www.", "");
  const filteredTools = RELATED_TOOLS.filter(function(t) {
    try { return new URL(t.url).hostname.replace("www.", "") !== currentDomain; }
    catch(e) { return true; }
  });
  for (const t of filteredTools){
    const a = document.createElement("a");
    a.href = t.url;
    a.rel = "noopener";
    a.textContent = t.name;
    related.appendChild(a);
    const dot = document.createElement("span");
    dot.textContent = "·";
    dot.setAttribute("aria-hidden","true");
    related.appendChild(dot);
  }
  // Remove trailing dot
  if (related.lastChild) related.removeChild(related.lastChild);

  setText("partnersEmail", PARTNERSHIPS_EMAIL);
  setText("copyrightYear", String(new Date().getFullYear()));
}

function verdictBadge(winner, diff){
  if (winner === "Tie") return {cls:"warn", text:"Tie"};
  if (winner === "W2") return {cls:"good", text:"W‑2 wins"};
  return {cls:"good", text:"1099 wins"};
}

function render(result){
  const w2 = result.w2;
  const c  = result.contractor;
  const diff = result.takeHomeDifference;

  const b = verdictBadge(result.winner, diff);
  const badge = $("badge");
  badge.className = "badge " + b.cls;
  badge.textContent = b.text;

  setText("grossOut", fmtUSD(result.gross));
  setText("w2Take", fmtUSD(w2.takeHome));
  setText("cTake", fmtUSD(c.takeHome));
  setText("diffTake", (diff>=0?"+":"") + fmtUSD(diff));

  $("diffLine").textContent = `${result.winner === "Tie" ? "Same take‑home." : (result.winner + " has higher estimated take‑home")} (${fmtPct(result.differencePctOfGross)} of gross).`;

  // Details table
  const rows = [
    ["W‑2 gross wages", fmtUSD(w2.gross)],
    ["W‑2 taxable income", fmtUSD(w2.taxableIncome)],
    ["W‑2 federal income tax", fmtUSD(w2.incomeTax)],
    ["W‑2 payroll taxes (FICA)", fmtUSD(w2.payrollTax)],
    ["— Social Security (6.2% up to wage base)", fmtUSD(w2.payrollTaxBreakdown.ssTax)],
    ["— Medicare (1.45%)", fmtUSD(w2.payrollTaxBreakdown.medicareTax)],
    ["W‑2 total tax", fmtUSD(w2.totalTax)],
    ["W‑2 effective tax rate", fmtPct(w2.effectiveTaxRate)],
    ["", ""],
    ["1099 gross receipts (v1 assumes net = gross)", fmtUSD(c.gross)],
    ["1099 SE tax base (92.35%)", fmtUSD(c.seTaxBreakdown.seBase)],
    ["1099 self‑employment tax (SS+Medicare)", fmtUSD(c.seTax)],
    ["— SE Social Security (12.4% up to wage base)", fmtUSD(c.seTaxBreakdown.ssPortion)],
    ["— SE Medicare (2.9%)", fmtUSD(c.seTaxBreakdown.medicarePortion)],
    ["1099 SE tax deduction (50% of SE tax)", fmtUSD(c.seTaxBreakdown.seDeduction)],
    ["1099 adjusted gross (gross − SE deduction)", fmtUSD(c.adjustedGross)],
    ["1099 taxable income", fmtUSD(c.taxableIncome)],
    ["1099 federal income tax", fmtUSD(c.incomeTax)],
    ["1099 total tax", fmtUSD(c.totalTax)],
    ["1099 effective tax rate", fmtPct(c.effectiveTaxRate)],
  ];

  const tbody = $("detailBody");
  tbody.innerHTML = "";
  for (const [k,v] of rows){
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    td1.textContent = k;
    td2.textContent = v;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tbody.appendChild(tr);
  }

  // aria-live announce
  $("resultWrap").setAttribute("aria-live","polite");
  $("resultWrap").hidden = false;
}

function validateGross(raw){
  const cleaned = String(raw).replace(/[$,]/g,"").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  return n;
}

function onCalc(e){
  e?.preventDefault?.();
  const gross = validateGross($("gross").value);
  if (gross === null){
    $("resultWrap").hidden = false;
    $("badge").className = "badge bad";
    $("badge").textContent = "Fix input";
    $("grossOut").textContent = "—";
    $("w2Take").textContent = "—";
    $("cTake").textContent = "—";
    $("diffTake").textContent = "—";
    $("diffLine").textContent = "Enter a valid annual gross amount (numbers only).";
    $("detailBody").innerHTML = "";
    return;
  }
  const res = compare(gross, CONFIG_2025);
  render(res);
}

function initMeta(){
  document.title = `${SITE_NAME} (US Federal, ${TAX_YEAR})`;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = SITE_CANONICAL;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = `Estimate and compare 1099 vs W‑2 take‑home pay using US federal rules (${TAX_YEAR} brackets), standard deduction only, and self‑employment tax modeling. No accounts. Runs locally in your browser.`;
}

function init(){
  initMeta();
  buildFooter();

  const form = document.getElementById("calcForm");
  const btn = document.getElementById("calcBtn");
  const gross = document.getElementById("gross");

  if (form && btn && gross){
    form.addEventListener("submit", onCalc);
    btn.addEventListener("click", onCalc);

    // Default example
    gross.value = "100000";
    onCalc();
  }
}

document.addEventListener("DOMContentLoaded", init);