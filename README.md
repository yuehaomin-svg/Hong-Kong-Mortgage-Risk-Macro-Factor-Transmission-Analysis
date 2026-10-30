# 🏠 香港住宅按揭风险与宏观因子传导分析
### Hong Kong Mortgage Risk & Macro-Factor Transmission Analysis

> **项目定位 / Project Positioning**
> 本项目并不是单纯的学术计量练习，而是针对高度金融化的香港房地产市场进行的一次**“宏观压力测试与风险归因”**。项目完整走通了从多源异构数据整合、风险指标体系构建、因果传导机制验证，到最终双语数据产品化交付的全链路，为金融机构的风控与信贷策略提供决策支持。
> 
> *This project is not just an academic econometric exercise, but a "macro stress test and risk attribution" for Hong Kong's highly financialized real estate market. It covers the full chain from multi-source data integration, risk index construction, causal transmission validation, to the final bilingual data product delivery, supporting decision-making for financial risk control and credit strategies.*

---

## 💡 业务背景与分析目的 (Business Context & Objectives)

香港按揭贷款的资产质量直接关系到金融系统的稳定。然而，房贷违约（负资产）并非孤立事件，而是受宏观经济、利率周期和市场成交量的多重滞后影响。
*   **业务痛点**：传统的风控往往只看当期的坏账率，属于“事后诸葛亮”。我们需要一套工具，能够提前识别风险积聚的过程。
*   **分析目标**：整合政府部门跨度 8 年的宏观数据，构建“按揭压力指数”，并探究利率、需求与成交之间的领先滞后（Lead-Lag）关系。

---

## 📊 交互式展示与图文总结 (Live Dashboard & Summary)

*   🌐 **[点击查看：项目完整图文分析报告 (Summary Page)](https://yuehaomin-svg.github.io/Hong-Kong-Mortgage-Risk-Macro-Factor-Transmission-Analysis/)**
*   📈 **[点击体验：中英双语交互式管理仪表盘 (Interactive Dashboard)](https://yuehaomin-svg.github.io/Hong-Kong-Mortgage-Risk-Macro-Factor-Transmission-Analysis/dashboard/)**

---

## 🛠️ 核心分析与技术亮点 (Analytical Highlights)

*   **多源数据整合与清洗 (ETL Pipeline)**：
    整合 HKMA（金管局）、土地注册处及政府统计处跨度 **96 个月（8年）** 的异构数据。使用 Python（Pandas）搭建可复现的流水线，统一按揭申请、批核、成交及宏观指标的统计口径，解决时间戳对齐与缺失值处理问题。
*   **风险指标体系构建 (Composite Risk Measurement)**：
    筛选核心宏观与地产指标，构建“住宅按揭压力指数”。通过**敏感性分析（Sensitivity Analysis）**确定各维度权重，精准定位到 **2024 年 7 月为风险峰值（58.7/100）**。
*   **传导机制归因分析 (Lead-Lag Analysis)**：
    不仅看表面相关性，更通过领先滞后分析，剥离表象，验证了“利率上升 → 需求下降 → 成交量萎缩 → 负资产增加”的完整传导链路。量化得出：加息期按揭申请量下降 **25.3%**、成交量下降 **24.3%** 的核心结论。
*   **业务价值落地 (Business Value)**：
    将复杂的计量结果转化为交互式双语仪表盘，帮助风控团队直观看到风险积聚的过程，将事后“看报表”转变为事前的“风险预警”，辅助信贷策略的动态调整。

---

## ⚙️ 技术栈 (Technology Stack)

*   **数据获取与处理**：Python (Pandas, NumPy, Requests)
*   **统计与计量分析**：Statsmodels (时间序列分析, 协整检验, 滞后回归)
*   **可视化与产品化**：Streamlit / Plotly / HTML5 (GitHub Pages)
*   **版本控制**：Git

---
