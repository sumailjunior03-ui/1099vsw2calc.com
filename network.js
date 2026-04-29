/* GA4 - Calc-HQ Network Analytics (single injection point) */
(function(){if(!window.__GA4_LOADED){window.__GA4_LOADED=true;var id="G-W4SWZ1YRS2";var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+id;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag("js",new Date());gtag("config",id);}})();

// network.js — single source of truth for footer related-tools rendering
(function () {
  "use strict";

  window.CALC_HQ_NETWORK = [
    { name: "Calc-HQ",                     url: "https://calc-hq.com",              live: true,  clusters: [] },
    { name: "BizDayChecker.com",           url: "https://bizdaychecker.com",        live: true,  clusters: ["us", "payroll-timing"] },
    { name: "BankCutoffChecker.com",       url: "https://bankcutoffchecker.com",    live: true,  clusters: ["us", "payroll-timing"] },
    { name: "PayrollDateChecker.com",      url: "https://payrolldatechecker.com",   live: true,  clusters: ["us", "payroll-timing"] },
    { name: "1099vsW2Calc.com",            url: "https://1099vsw2calc.com",         live: true,  clusters: ["us", "tax-income"] },
    { name: "FreelanceIncomeCalc.com",     url: "https://freelanceincomecalc.com",  live: true,  clusters: ["us", "tax-income"] },
    { name: "QuarterlyTaxCalc.com",        url: "https://quarterlytaxcalc.com",     live: true,  clusters: ["us", "tax-income"] },
    { name: "SalaryVsInflation.com",       url: "https://salaryvsinflation.com",    live: true,  clusters: ["us", "compensation"] },
    { name: "Hourly2SalaryCalc.com",       url: "https://hourly2salarycalc.com",    live: true,  clusters: ["us", "compensation"] },
    { name: "TotalCompCalc.com",           url: "https://totalcompcalc.com",        live: true,  clusters: ["us", "compensation"] },
    { name: "OvertimePayCalc.com",         url: "https://overtimepaycalc.com",      live: true,  clusters: ["us", "compensation"] },
    { name: "AfterTaxSalaryCalc.com",      url: "https://aftertaxsalarycalc.com",   live: true,  clusters: ["us", "compensation"] },
    { name: "OntarioTakeHomeCalc.com",     url: "https://ontariotakehomecalc.com",  live: true,  clusters: ["ca", "take-home"] },
    { name: "CPPCalc.com",                 url: "https://cppcalc.com",              live: true,  clusters: ["ca", "payroll-deductions"] },
    { name: "EICalc.com",                  url: "https://eicalc.com",               live: true,  clusters: ["ca", "payroll-deductions"] }
  ];

  var FORBIDDEN = [];

  function getCurrentDomain() {
    return window.location.hostname.replace(/^www\./, "").toLowerCase();
  }

  function getHost(url) {
    try { return new URL(url).hostname.replace(/^www\./, "").toLowerCase(); }
    catch (e) { return ""; }
  }

  function getCurrentSite() {
    var domain = getCurrentDomain();
    for (var i = 0; i < window.CALC_HQ_NETWORK.length; i++) {
      if (getHost(window.CALC_HQ_NETWORK[i].url) === domain) return window.CALC_HQ_NETWORK[i];
    }
    return null;
  }

  function renderRelatedTools() {
    var containers = document.querySelectorAll("#relatedTools, .network-links");
    if (!containers.length) return;

    var currentSite = getCurrentSite();
    var currentDomain = getCurrentDomain();
    var currentClusters = currentSite ? currentSite.clusters : [];
    var countryTags = ["us", "ca"];

    var related = window.CALC_HQ_NETWORK.filter(function (site) {
      if (!site || site.live !== true) return false;
      var host = getHost(site.url);
      if (host === "calc-hq.com") return false;
      if (host === currentDomain) return false;
      if (FORBIDDEN.indexOf(host) !== -1) return false;
      if (!currentClusters.length) return false;
      for (var i = 0; i < site.clusters.length; i++) {
        var c = site.clusters[i];
        if (countryTags.indexOf(c) !== -1) continue;
        if (currentClusters.indexOf(c) !== -1) return true;
      }
      return false;
    });

    containers.forEach(function (container) {
      container.innerHTML = "";
      if (!related.length) return;
      related.forEach(function (site, idx) {
        if (idx > 0) container.appendChild(document.createTextNode(" • "));
        var a = document.createElement("a");
        a.href = site.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = site.name;
        container.appendChild(a);
      });
    });
  }

  function loadForbiddenThenRender() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/forbidden-domains.json", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var parsed = JSON.parse(xhr.responseText);
            var list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.forbidden) ? parsed.forbidden : []);
            FORBIDDEN = list.map(function (d) { return String(d).toLowerCase().replace(/^www\./, ""); });
          } catch (e) {}
        }
        renderRelatedTools();
      }
    };
    xhr.onerror = function () { renderRelatedTools(); };
    xhr.send();
  }

  window.renderRelatedTools = renderRelatedTools;

  function init() { loadForbiddenThenRender(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
