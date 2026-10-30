(() => {
  const data = window.HK_MORTGAGE_DATA;
  if (!data) {
    document.body.innerHTML = "Dashboard data is missing.";
    return;
  }

  const state = {
    language: "zh",
    trendMode: "applications",
    stressMode: "equal",
    lagMode: "hibor_3m_pct->new_applications_received",
  };

  const palette = {
    ink: "#17211f",
    muted: "#63706c",
    line: "#cfd6d2",
    teal: "#087c6b",
    coral: "#e25b43",
    gold: "#c89524",
    blue: "#356ca5",
    violet: "#7257a2",
  };

  const labels = {
    pre_hiking: { zh: "加息前", en: "Pre-hiking" },
    hiking: { zh: "加息期", en: "Hiking cycle" },
    post_hiking: { zh: "加息后", en: "Post-hiking" },
  };

  const modeLabels = {
    applications: {
      key: "new_applications_received",
      zh: "按揭申请宗数",
      en: "Mortgage applications",
      color: palette.teal,
    },
    approvals: {
      key: "new_loans_approved_count",
      zh: "按揭批核宗数",
      en: "Mortgage approvals",
      color: palette.blue,
    },
    transactions: {
      key: "residential_transactions",
      zh: "住宅成交宗数",
      en: "Residential transactions",
      color: palette.gold,
    },
    equity: {
      key: "negative_equity_count",
      zh: "负资产按揭宗数",
      en: "Negative-equity cases",
      color: palette.violet,
    },
  };

  const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const decimalFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const percentFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  function svgNode(tag, attributes = {}, text = "") {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
    if (text !== "") node.textContent = text;
    return node;
  }

  function clearSvg(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  function valid(value) {
    return value !== null && value !== undefined && Number.isFinite(Number(value));
  }

  function extent(values, padding = 0.08) {
    const clean = values.filter(valid).map(Number);
    const min = Math.min(...clean);
    const max = Math.max(...clean);
    const span = max - min || 1;
    return [min - span * padding, max + span * padding];
  }

  function scale(value, domainMin, domainMax, rangeMin, rangeMax) {
    return rangeMin + ((value - domainMin) / (domainMax - domainMin || 1)) * (rangeMax - rangeMin);
  }

  function pathFor(rows, key, x, y) {
    let path = "";
    let started = false;
    rows.forEach((row, index) => {
      if (!valid(row[key])) {
        started = false;
        return;
      }
      path += `${started ? "L" : "M"} ${x(index).toFixed(2)} ${y(Number(row[key])).toFixed(2)} `;
      started = true;
    });
    return path.trim();
  }

  function addPeriodBands(svg, rows, x, top, bottom) {
    const colors = {
      pre_hiking: "rgba(53, 108, 165, 0.055)",
      hiking: "rgba(226, 91, 67, 0.07)",
      post_hiking: "rgba(8, 124, 107, 0.055)",
    };
    let startIndex = 0;
    rows.forEach((row, index) => {
      const next = rows[index + 1];
      if (!next || next.cycle_period !== row.cycle_period) {
        svg.appendChild(svgNode("rect", {
          x: x(startIndex),
          y: top,
          width: Math.max(1, x(index) - x(startIndex) + 2),
          height: bottom - top,
          fill: colors[row.cycle_period] || "transparent",
        }));
        startIndex = index + 1;
      }
    });
  }

  function addAxes(svg, config) {
    const { width, height, pad, x, rows, yTicks, yScale, yLabel, xLabel, yFormatter } = config;
    yTicks.forEach((tick) => {
      const y = yScale(tick);
      svg.appendChild(svgNode("line", {
        x1: pad.left,
        x2: width - pad.right,
        y1: y,
        y2: y,
        class: "grid-line",
      }));
      svg.appendChild(svgNode("text", {
        x: pad.left - 10,
        y: y + 4,
        "text-anchor": "end",
        class: "axis-text",
      }, yFormatter ? yFormatter(tick) : decimalFormat.format(tick)));
    });
    const tickIndexes = [0, Math.floor((rows.length - 1) / 2), rows.length - 1];
    tickIndexes.forEach((index) => {
      svg.appendChild(svgNode("text", {
        x: x(index),
        y: height - pad.bottom + 23,
        "text-anchor": index === 0 ? "start" : index === rows.length - 1 ? "end" : "middle",
        class: "axis-text",
      }, rows[index].period));
    });
    if (yLabel) {
      svg.appendChild(svgNode("text", {
        x: pad.left,
        y: 17,
        class: "axis-label",
      }, yLabel));
    }
    if (xLabel) {
      svg.appendChild(svgNode("text", {
        x: width - pad.right,
        y: height - 6,
        "text-anchor": "end",
        class: "axis-label",
      }, xLabel));
    }
  }

  function attachTooltip(svg, tooltip, rows, width, height, render) {
    const guide = svg.querySelector(".hover-guide");
    svg.addEventListener("mousemove", (event) => {
      const bounds = svg.getBoundingClientRect();
      const xSvg = ((event.clientX - bounds.left) / bounds.width) * width;
      const usableLeft = 58;
      const usableRight = width - 18;
      const ratio = Math.max(0, Math.min(1, (xSvg - usableLeft) / (usableRight - usableLeft)));
      const index = Math.round(ratio * (rows.length - 1));
      const x = usableLeft + ratio * (usableRight - usableLeft);
      if (guide) {
        guide.setAttribute("x1", x);
        guide.setAttribute("x2", x);
        guide.style.opacity = "1";
      }
      tooltip.innerHTML = render(rows[index], index);
      tooltip.style.left = `${(x / width) * 100}%`;
      tooltip.style.top = `${Math.max(18, event.clientY - bounds.top - 8)}px`;
      tooltip.style.opacity = "1";
    });
    svg.addEventListener("mouseleave", () => {
      if (guide) guide.style.opacity = "0";
      tooltip.style.opacity = "0";
    });
  }

  function renderLanguage() {
    document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-zh][data-en]").forEach((element) => {
      element.textContent = element.dataset[state.language];
    });
    document.getElementById("languageToggle").textContent = state.language === "zh" ? "EN" : "中文";
  }

  function renderKpis() {
    const latest = data.monthly[data.monthly.length - 1];
    const peak = data.summary.stress_peak;
    const zh = state.language === "zh";
    const cards = [
      {
        label: zh ? "峰值压力指数" : "Peak stress index",
        value: decimalFormat.format(peak.index_equal),
        detail: peak.period,
      },
      {
        label: zh ? "2025 年末 3M HIBOR" : "3M HIBOR at end-2025",
        value: `${percentFormat.format(latest.hibor_3m_pct)}%`,
        detail: zh ? "月均水平" : "monthly average",
      },
      {
        label: zh ? "月度批核宗数" : "Monthly approvals",
        value: numberFormat.format(latest.new_loans_approved_count),
        detail: zh ? "2025 年 12 月" : "December 2025",
      },
      {
        label: zh ? "负资产按揭" : "Negative-equity cases",
        value: numberFormat.format(latest.negative_equity_count),
        detail: zh ? "季度最新值" : "latest quarterly value",
      },
      {
        label: zh ? "住宅成交量" : "Residential transactions",
        value: numberFormat.format(latest.residential_transactions),
        detail: zh ? "土地注册处月度统计" : "monthly Land Registry",
      },
    ];
    document.getElementById("kpiGrid").innerHTML = cards.map((card) => `
      <article class="kpi">
        <div class="kpi-label">${card.label}</div>
        <strong class="kpi-value">${card.value}</strong>
        <div class="kpi-detail">${card.detail}</div>
      </article>
    `).join("");
    document.getElementById("heroIndexValue").textContent = decimalFormat.format(peak.index_equal);
  }

  function bestLag(driver, outcome) {
    return data.bestLags.find((row) => row.driver === driver && row.outcome === outcome);
  }

  function renderFindings() {
    const rateApplication = bestLag("hibor_3m_pct", "new_applications_received");
    const applicationTransaction = bestLag("new_applications_received", "residential_transactions");
    const transactionApplication = bestLag("residential_transactions", "new_applications_received");
    const rateEquity = bestLag("hibor_3m_pct", "negative_equity_count");
    const zh = state.language === "zh";
    const applicationDrop = Math.round((1 - 9369.8 / 12543.6) * 100);
    document.getElementById("findingRate").textContent = zh
      ? `3M HIBOR 与申请宗数的同期相关系数为 ${rateApplication.correlation.toFixed(2)}；加息期平均申请量比加息前低约 ${applicationDrop}%。这支持“利率上行伴随需求收缩”，但不构成因果识别。`
      : `The contemporaneous correlation between 3M HIBOR and applications is ${rateApplication.correlation.toFixed(2)}; average applications in the hiking window are about ${applicationDrop}% below the pre-hiking window. This supports co-movement, not causal identification.`;
    document.getElementById("findingLag").textContent = zh
      ? `申请与成交量的最高相关出现在滞后 ${applicationTransaction.lag_months} 个月（r=${applicationTransaction.correlation.toFixed(2)}）；反向检验为 ${transactionApplication.lag_months} 个月（r=${transactionApplication.correlation.toFixed(2)}），更像同步循环而非稳定单向传导。`
      : `Applications and transactions peak at a ${applicationTransaction.lag_months}-month lag (r=${applicationTransaction.correlation.toFixed(2)}); the reverse test gives ${transactionApplication.lag_months} months (r=${transactionApplication.correlation.toFixed(2)}), consistent with a synchronous cycle rather than a stable one-way transmission.`;
    document.getElementById("findingEquity").textContent = zh
      ? `HIBOR 与负资产宗数的最强相关出现在 ${rateEquity.lag_months} 个月滞后（r=${rateEquity.correlation.toFixed(2)}）。负资产按季度公布，且价格/估值共同趋势可能放大相关。`
      : `The strongest HIBOR/negative-equity relationship appears at a ${rateEquity.lag_months}-month lag (r=${rateEquity.correlation.toFixed(2)}). Negative equity is quarterly and shared valuation trends may amplify the correlation.`;
  }

  function renderCycle() {
    const descriptions = {
      pre_hiking: {
        zh: "低利率、申请量高，但成交增速波动大",
        en: "Low rates and high demand with volatile transaction growth",
      },
      hiking: {
        zh: "利率快速抬升，申请与成交同步收缩",
        en: "Rapid rate increase with simultaneous demand and transaction contraction",
      },
      post_hiking: {
        zh: "利率高位，负资产规模达到历史峰值",
        en: "High rates coincide with the peak in negative-equity cases",
      },
    };
    document.getElementById("cycleTrack").innerHTML = data.periods.map((row, index) => `
      <article class="cycle-item ${index === 0 ? "active" : ""}">
        <span>${data.summary.cycle_periods[row.cycle_period].start} — ${data.summary.cycle_periods[row.cycle_period].end}</span>
        <strong>${labels[row.cycle_period][state.language]}</strong>
        <small>${descriptions[row.cycle_period][state.language]}</small>
      </article>
    `).join("");
  }

  function renderHero() {
    const svg = document.getElementById("heroChart");
    clearSvg(svg);
    const rows = data.monthly;
    const width = 760;
    const height = 360;
    const pad = { left: 38, right: 18, top: 35, bottom: 34 };
    const x = (index) => scale(index, 0, rows.length - 1, pad.left, width - pad.right);
    const y = (value) => scale(value, 0, 1, height - pad.bottom, pad.top);
    const specs = [
      {
        key: "hibor_3m_pct",
        color: palette.coral,
        transform: (row) => row.hibor_3m_pct / 6,
      },
      {
        key: "negative_equity_count",
        color: palette.violet,
        transform: (row) => Math.log1p(row.negative_equity_count) / Math.log1p(42000),
      },
      {
        key: "residential_transactions_3m_pct",
        color: palette.teal,
        transform: (row) => Math.max(0, Math.min(1, 0.5 - row.residential_transactions_3m_pct / 100)),
      },
    ];
    addPeriodBands(svg, rows, x, pad.top, height - pad.bottom);
    [0, 0.25, 0.5, 0.75, 1].forEach((tick) => {
      svg.appendChild(svgNode("line", {
        x1: pad.left,
        x2: width - pad.right,
        y1: y(tick),
        y2: y(tick),
        class: "grid-line",
      }));
    });
    specs.forEach((spec) => {
      let path = "";
      let started = false;
      rows.forEach((row, index) => {
        const value = spec.transform(row);
        if (!Number.isFinite(value)) {
          started = false;
          return;
        }
        path += `${started ? "L" : "M"} ${x(index).toFixed(2)} ${y(value).toFixed(2)} `;
        started = true;
      });
      svg.appendChild(svgNode("path", {
        d: path,
        class: "chart-path",
        stroke: spec.color,
        "stroke-width": spec.key === "negative_equity_count" ? 3 : 2,
      }));
    });
    svg.appendChild(svgNode("text", {
      x: pad.left,
      y: 18,
      class: "axis-label",
    }, state.language === "zh" ? "标准化方向" : "directionally indexed"));
    svg.appendChild(svgNode("text", {
      x: width - pad.right,
      y: height - 5,
      "text-anchor": "end",
      class: "axis-text",
    }, "2018 → 2025"));
  }

  function renderTrend() {
    const svg = document.getElementById("trendChart");
    clearSvg(svg);
    const rows = data.monthly;
    const width = 1120;
    const height = 440;
    const pad = { left: 66, right: 78, top: 35, bottom: 54 };
    const mode = modeLabels[state.trendMode];
    const y1 = extent(rows.map((row) => row.hibor_3m_pct), 0.12);
    const y2 = extent(rows.map((row) => row[mode.key]), 0.12);
    const x = (index) => scale(index, 0, rows.length - 1, pad.left, width - pad.right);
    const leftScale = (value) => scale(value, y1[0], y1[1], height - pad.bottom, pad.top);
    const rightScale = (value) => scale(value, y2[0], y2[1], height - pad.bottom, pad.top);
    addPeriodBands(svg, rows, x, pad.top, height - pad.bottom);
    addAxes(svg, {
      width,
      height,
      pad,
      x,
      rows,
      yTicks: [0, 1, 2, 3, 4, 5, 6],
      yScale: leftScale,
      yLabel: "3M HIBOR (%)",
      yFormatter: (tick) => `${tick}%`,
    });
    [0, 1, 2, 3, 4].forEach((tick) => {
      const value = y2[0] + (tick / 4) * (y2[1] - y2[0]);
      svg.appendChild(svgNode("text", {
        x: width - pad.right + 10,
        y: rightScale(value) + 4,
        class: "axis-text",
        fill: mode.color,
      }, numberFormat.format(value)));
    });
    svg.appendChild(svgNode("path", {
      d: pathFor(rows, "hibor_3m_pct", x, leftScale),
      class: "chart-path",
      stroke: palette.coral,
      "stroke-width": 3,
    }));
    svg.appendChild(svgNode("path", {
      d: pathFor(rows, mode.key, x, rightScale),
      class: "chart-path",
      stroke: mode.color,
      "stroke-width": 3,
    }));
    svg.appendChild(svgNode("text", {
      x: pad.left,
      y: 18,
      class: "axis-label",
      fill: palette.coral,
    }, "3M HIBOR (%)"));
    svg.appendChild(svgNode("text", {
      x: width - pad.right,
      y: 18,
      "text-anchor": "end",
      class: "axis-label",
      fill: mode.color,
    }, mode[state.language]));
    svg.appendChild(svgNode("line", {
      x1: pad.left,
      x2: width - pad.right,
      y1: 24,
      y2: 24,
      class: "hover-guide",
    }));
    document.getElementById("trendSubtitle").textContent = state.language === "zh"
      ? "红线为利率（左轴）；另一条线为当前市场活动指标（右轴）。"
      : "Red shows rates on the left axis; the selected market-activity series appears on the right axis.";
    attachTooltip(
      svg,
      document.getElementById("trendTooltip"),
      rows,
      width,
      height,
      (row) => `<strong>${row.period}</strong>3M HIBOR: ${percentFormat.format(row.hibor_3m_pct)}%<br>${mode[state.language]}: ${numberFormat.format(row[mode.key])}`
    );
  }

  function renderStress() {
    const svg = document.getElementById("stressChart");
    clearSvg(svg);
    const rows = data.monthly.filter((row) => valid(row.stress_index_equal));
    const width = 760;
    const height = 390;
    const pad = { left: 55, right: 22, top: 36, bottom: 52 };
    const x = (index) => scale(index, 0, rows.length - 1, pad.left, width - pad.right);
    const y = (value) => scale(value, 38, 64, height - pad.bottom, pad.top);
    addPeriodBands(svg, rows, x, pad.top, height - pad.bottom);
    addAxes(svg, {
      width,
      height,
      pad,
      x,
      rows,
      yTicks: [40, 45, 50, 55, 60],
      yScale: y,
      yLabel: state.language === "zh" ? "压力指数（0–100）" : "Stress index (0–100)",
      yFormatter: (tick) => String(tick),
    });
    const specs = [
      {
        key: "stress_index_equal",
        label: state.language === "zh" ? "等权" : "Equal",
        color: palette.teal,
      },
      {
        key: "stress_index_rate_dominant",
        label: state.language === "zh" ? "利率主导" : "Rate-led",
        color: palette.coral,
      },
      {
        key: "stress_index_borrower_dominant",
        label: state.language === "zh" ? "借款人主导" : "Borrower-led",
        color: palette.violet,
      },
    ];
    specs.forEach((spec) => {
      const selected = spec.key === `stress_index_${state.stressMode}`;
      svg.appendChild(svgNode("path", {
        d: pathFor(rows, spec.key, x, y),
        class: "chart-path",
        stroke: spec.color,
        "stroke-width": selected ? 4 : 1.7,
        "stroke-dasharray": selected ? "" : "5 5",
        opacity: selected ? 1 : 0.45,
      }));
    });
    svg.appendChild(svgNode("text", {
      x: pad.left,
      y: 18,
      class: "axis-label",
    }, specs.find((item) => item.key === `stress_index_${state.stressMode}`).label));
    svg.appendChild(svgNode("line", {
      x1: pad.left,
      x2: width - pad.right,
      y1: 26,
      y2: 26,
      class: "hover-guide",
    }));
    attachTooltip(
      svg,
      document.getElementById("stressTooltip"),
      rows,
      width,
      height,
      (row) => `<strong>${row.period}</strong>Equal: ${decimalFormat.format(row.stress_index_equal)}<br>Rate-led: ${decimalFormat.format(row.stress_index_rate_dominant)}<br>Borrower-led: ${decimalFormat.format(row.stress_index_borrower_dominant)}`
    );
  }

  function renderPeriodTable() {
    const zh = state.language === "zh";
    const headers = zh
      ? ["阶段", "HIBOR", "月均申请", "压力指数"]
      : ["Window", "HIBOR", "Avg. applications", "Stress"];
    const rows = data.periods.map((row) => `
      <div class="period-row">
        <div>
          <strong>${labels[row.cycle_period][state.language]}</strong>
          <small>${data.summary.cycle_periods[row.cycle_period].start} — ${data.summary.cycle_periods[row.cycle_period].end}</small>
        </div>
        <span>${percentFormat.format(row.hibor_3m_pct)}%<small>3M avg.</small></span>
        <span>${numberFormat.format(row.new_applications_received)}<small>${zh ? "宗 / 月" : "cases / month"}</small></span>
        <span>${decimalFormat.format(row.stress_index_equal)}<small>0–100</small></span>
      </div>
    `).join("");
    document.getElementById("periodTable").innerHTML = `
      <div class="period-row header">${headers.map((item) => `<span>${item}</span>`).join("")}</div>
      ${rows}
    `;
  }

  function renderBubble() {
    const svg = document.getElementById("bubbleChart");
    clearSvg(svg);
    const rows = data.monthly.filter((row) => valid(row.stress_index_equal) && valid(row.negative_equity_count));
    const width = 760;
    const height = 430;
    const pad = { left: 58, right: 28, top: 36, bottom: 58 };
    const xDomain = extent(rows.map((row) => row.approval_to_application_ratio_pct), 0.1);
    const yDomain = extent(rows.map((row) => row.hibor_3m_pct), 0.12);
    const x = (value) => scale(value, xDomain[0], xDomain[1], pad.left, width - pad.right);
    const y = (value) => scale(value, yDomain[0], yDomain[1], height - pad.bottom, pad.top);
    [50, 60, 70, 80, 90, 100]
      .filter((tick) => tick >= xDomain[0] && tick <= xDomain[1])
      .forEach((tick) => {
        svg.appendChild(svgNode("line", {
          x1: x(tick),
          x2: x(tick),
          y1: pad.top,
          y2: height - pad.bottom,
          class: "grid-line",
        }));
        svg.appendChild(svgNode("text", {
          x: x(tick),
          y: height - pad.bottom + 22,
          "text-anchor": "middle",
          class: "axis-text",
        }, `${tick}%`));
      });
    [0, 1, 2, 3, 4, 5, 6].forEach((tick) => {
      svg.appendChild(svgNode("line", {
        x1: pad.left,
        x2: width - pad.right,
        y1: y(tick),
        y2: y(tick),
        class: "grid-line",
      }));
      svg.appendChild(svgNode("text", {
        x: pad.left - 10,
        y: y(tick) + 4,
        "text-anchor": "end",
        class: "axis-text",
      }, `${tick}%`));
    });
    rows.forEach((row) => {
      const colors = {
        pre_hiking: palette.blue,
        hiking: palette.coral,
        post_hiking: palette.teal,
      };
      const radius = 4 + Math.sqrt(row.negative_equity_count / 41000) * 13;
      const circle = svgNode("circle", {
        cx: x(row.approval_to_application_ratio_pct),
        cy: y(row.hibor_3m_pct),
        r: radius,
        fill: colors[row.cycle_period],
        "fill-opacity": 0.28,
        stroke: colors[row.cycle_period],
        "stroke-width": 1.6,
      });
      circle.dataset.period = row.period;
      svg.appendChild(circle);
    });
    svg.appendChild(svgNode("text", {
      x: width - pad.right,
      y: height - 8,
      "text-anchor": "end",
      class: "axis-label",
    }, state.language === "zh" ? "批核 / 申请比例" : "Approval / application ratio"));
    svg.appendChild(svgNode("text", {
      x: pad.left,
      y: 18,
      class: "axis-label",
    }, "3M HIBOR"));
    const tooltip = document.getElementById("bubbleTooltip");
    svg.addEventListener("mousemove", (event) => {
      const target = event.target;
      if (!(target instanceof SVGElement) || !target.dataset.period) {
        tooltip.style.opacity = "0";
        return;
      }
      const row = rows.find((item) => item.period === target.dataset.period);
      const bounds = svg.getBoundingClientRect();
      tooltip.innerHTML = `<strong>${row.period}</strong>${labels[row.cycle_period][state.language]}<br>HIBOR: ${percentFormat.format(row.hibor_3m_pct)}%<br>${state.language === "zh" ? "批核/申请" : "Approval/application"}: ${percentFormat.format(row.approval_to_application_ratio_pct)}%<br>${state.language === "zh" ? "负资产" : "Negative equity"}: ${numberFormat.format(row.negative_equity_count)}`;
      tooltip.style.left = `${event.clientX - bounds.left}px`;
      tooltip.style.top = `${event.clientY - bounds.top}px`;
      tooltip.style.opacity = "1";
    });
    svg.addEventListener("mouseleave", () => tooltip.style.opacity = "0");
  }

  function renderLag() {
    const svg = document.getElementById("lagChart");
    clearSvg(svg);
    const rows = data.lagProfiles[state.lagMode];
    const width = 760;
    const height = 390;
    const pad = { left: 72, right: 28, top: 38, bottom: 54 };
    const x = (value) => scale(value, -12, 12, pad.left, width - pad.right);
    const yDomain = extent(rows.map((row) => row.correlation), 0.16);
    const y = (value) => scale(value, yDomain[0], yDomain[1], height - pad.bottom, pad.top);
    [-12, -9, -6, -3, 0, 3, 6, 9, 12].forEach((tick) => {
      svg.appendChild(svgNode("line", {
        x1: x(tick),
        x2: x(tick),
        y1: pad.top,
        y2: height - pad.bottom,
        class: "grid-line",
      }));
      svg.appendChild(svgNode("text", {
        x: x(tick),
        y: height - pad.bottom + 23,
        "text-anchor": "middle",
        class: "axis-text",
      }, tick === 0 ? "0" : `t${tick > 0 ? "+" : ""}${tick}`));
    });
    svg.appendChild(svgNode("line", {
      x1: pad.left,
      x2: width - pad.right,
      y1: y(0),
      y2: y(0),
      stroke: palette.ink,
      "stroke-width": 1.2,
    }));
    const best = rows.reduce(
      (current, row) => Math.abs(row.correlation) > Math.abs(current.correlation) ? row : current,
      rows[0],
    );
    rows.forEach((row) => {
      const barWidth = 9;
      const yTop = Math.min(y(0), y(row.correlation));
      const barHeight = Math.abs(y(row.correlation) - y(0));
      svg.appendChild(svgNode("rect", {
        x: x(row.lag_months) - barWidth / 2,
        y: yTop,
        width: barWidth,
        height: barHeight,
        fill: row === best ? palette.coral : palette.blue,
        opacity: row === best ? 1 : 0.55,
      }));
    });
    svg.appendChild(svgNode("text", {
      x: pad.left,
      y: 18,
      class: "axis-label",
    }, state.language === "zh" ? "相关系数" : "Correlation"));
    svg.appendChild(svgNode("text", {
      x: width - pad.right,
      y: height - 8,
      "text-anchor": "end",
      class: "axis-label",
    }, state.language === "zh" ? "滞后月数（正值表示左侧变量领先）" : "Lag months (positive = first variable leads)"));
    svg.appendChild(svgNode("text", {
      x: x(best.lag_months),
      y: Math.max(24, y(best.correlation) - 12),
      "text-anchor": "middle",
      class: "axis-label",
      fill: palette.coral,
    }, `r = ${best.correlation.toFixed(2)}`));
    const tooltip = document.getElementById("lagTooltip");
    svg.addEventListener("mousemove", (event) => {
      const bounds = svg.getBoundingClientRect();
      const xSvg = ((event.clientX - bounds.left) / bounds.width) * width;
      const ratio = (xSvg - pad.left) / (width - pad.right - pad.left);
      const lag = Math.max(-12, Math.min(12, Math.round(-12 + ratio * 24)));
      const row = rows.find((item) => item.lag_months === lag);
      if (!row) return;
      tooltip.innerHTML = `<strong>t${row.lag_months >= 0 ? "+" : ""}${row.lag_months}</strong>r = ${row.correlation.toFixed(3)}`;
      tooltip.style.left = `${event.clientX - bounds.left}px`;
      tooltip.style.top = `${event.clientY - bounds.top}px`;
      tooltip.style.opacity = "1";
    });
    svg.addEventListener("mouseleave", () => tooltip.style.opacity = "0");
  }

  function heatColor(value) {
    const neutral = [239, 241, 238];
    const target = value < 0 ? [226, 91, 67] : [8, 124, 107];
    const amount = Math.min(1, Math.abs(value)) * 0.82;
    const channels = neutral.map(
      (channel, index) => Math.round(channel + (target[index] - channel) * amount),
    );
    return `rgb(${channels.join(",")})`;
  }

  function correlationLabel(key) {
    const map = {
      hibor_3m_pct: "3M HIBOR",
      new_applications_received: state.language === "zh" ? "申请宗数" : "Applications",
      new_loans_approved_count: state.language === "zh" ? "批核宗数" : "Approvals",
      approval_to_application_ratio_pct: state.language === "zh" ? "批核/申请" : "Approval ratio",
      residential_transactions: state.language === "zh" ? "住宅成交" : "Transactions",
      negative_equity_count: state.language === "zh" ? "负资产宗数" : "Negative equity",
      unemployment_rate_pct: state.language === "zh" ? "失业率" : "Unemployment",
      cpi_yoy_pct: state.language === "zh" ? "CPI 同比" : "CPI YoY",
    };
    return map[key] || key;
  }

  function renderHeatmap() {
    const svg = document.getElementById("heatmapChart");
    clearSvg(svg);
    const matrix = data.correlationMatrix;
    const height = 570;
    const left = 195;
    const top = 84;
    const cell = 52;
    matrix.labels.forEach((key, rowIndex) => {
      svg.appendChild(svgNode("text", {
        x: left - 14,
        y: top + rowIndex * cell + cell / 2 + 4,
        "text-anchor": "end",
        class: "axis-text",
      }, correlationLabel(key)));
      svg.appendChild(svgNode("text", {
        x: left + rowIndex * cell + cell / 2,
        y: top - 18,
        "text-anchor": "start",
        class: "axis-text",
        transform: `rotate(-42 ${left + rowIndex * cell + cell / 2} ${top - 18})`,
      }, correlationLabel(key)));
    });
    matrix.values.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        const rect = svgNode("rect", {
          x: left + columnIndex * cell + 2,
          y: top + rowIndex * cell + 2,
          width: cell - 4,
          height: cell - 4,
          fill: heatColor(value),
          stroke: "#ffffff",
          "stroke-width": 1,
        });
        rect.dataset.row = matrix.labels[rowIndex];
        rect.dataset.column = matrix.labels[columnIndex];
        rect.dataset.value = value;
        svg.appendChild(rect);
        svg.appendChild(svgNode("text", {
          x: left + columnIndex * cell + cell / 2,
          y: top + rowIndex * cell + cell / 2 + 4,
          "text-anchor": "middle",
          class: "axis-text",
          fill: Math.abs(value) > 0.52 ? "#ffffff" : palette.ink,
          "pointer-events": "none",
        }, value.toFixed(2)));
      });
    });
    svg.appendChild(svgNode("text", {
      x: left,
      y: height - 24,
      class: "axis-label",
    }, state.language === "zh"
      ? "蓝绿色 = 正相关；珊瑚色 = 负相关"
      : "Teal = positive; coral = negative"));
    const tooltip = document.getElementById("heatmapTooltip");
    svg.addEventListener("mousemove", (event) => {
      const target = event.target;
      if (!(target instanceof SVGElement) || !target.dataset.value) {
        tooltip.style.opacity = "0";
        return;
      }
      const bounds = svg.getBoundingClientRect();
      tooltip.innerHTML = `<strong>${correlationLabel(target.dataset.row)} × ${correlationLabel(target.dataset.column)}</strong>r = ${Number(target.dataset.value).toFixed(3)}`;
      tooltip.style.left = `${event.clientX - bounds.left}px`;
      tooltip.style.top = `${event.clientY - bounds.top}px`;
      tooltip.style.opacity = "1";
    });
    svg.addEventListener("mouseleave", () => tooltip.style.opacity = "0");
  }

  function renderAll() {
    renderLanguage();
    renderKpis();
    renderFindings();
    renderCycle();
    renderHero();
    renderTrend();
    renderStress();
    renderPeriodTable();
    renderBubble();
    renderLag();
    renderHeatmap();
  }

  function downloadCsv() {
    const rows = data.monthly;
    const headers = Object.keys(rows[0]);
    const escape = (value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return `"${text.replaceAll('"', '""')}"`;
    };
    const csv = "\uFEFF" + [
      headers.join(","),
      ...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
    ].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "hk-mortgage-risk-monthly-data.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  document.getElementById("languageToggle").addEventListener("click", () => {
    state.language = state.language === "zh" ? "en" : "zh";
    renderAll();
  });
  document.getElementById("downloadCsv").addEventListener("click", downloadCsv);
  document.getElementById("trendMode").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.trendMode = button.dataset.mode;
    document.querySelectorAll("#trendMode button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderTrend();
  });
  document.getElementById("stressMode").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.stressMode = button.dataset.mode;
    document.querySelectorAll("#stressMode button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderStress();
  });
  document.getElementById("lagMode").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.lagMode = button.dataset.mode;
    document.querySelectorAll("#lagMode button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderLag();
  });
  window.addEventListener("resize", () => {
    renderHero();
    renderTrend();
    renderStress();
    renderBubble();
    renderLag();
    renderHeatmap();
  });

  renderAll();
})();
