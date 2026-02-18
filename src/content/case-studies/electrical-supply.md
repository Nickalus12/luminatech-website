---
title: "Multi-Branch Electrical Supply Company Automates P21 Reporting"
slug: "electrical-supply"
industry: "Electrical Supply"
services: ["Reporting", "Integration", "Managed Support"]
metrics:
  reportTime: { before: "3 days", after: "15 min", improvement: "99%" }
  visibility: { before: "Monthly", after: "Real-time", improvement: "instant" }
  decisions: { before: "Gut feel", after: "Data-driven", improvement: "transformed" }
summary: "A 6-branch electrical supply distributor was spending 3 days every month manually compiling reports from P21 data exports. Automated SSRS reports and a Power BI dashboard replaced the entire process and gave leadership real-time visibility for the first time."
date: 2026-01-15
featured: false
---

## The Challenge

A multi-branch electrical supply distributor with six locations, 200+ employees, and $45M in annual revenue had a reporting problem that was costing them far more than they realized.

Every month, their operations team spent three full days exporting data from P21 into Excel, manually consolidating numbers across all six branches, formatting reports for the executive team, and double-checking the math. The process involved 14 separate P21 data exports, 8 Excel workbooks, and manual copy-paste between them.

The problems went deeper than wasted time:

- **Stale data:** By the time reports reached leadership, the numbers were 3-5 days old
- **Inconsistency:** Different branches used different export methods, creating discrepancies
- **No drill-down:** Executives couldn't ask follow-up questions without requesting another round of exports
- **Key metrics missing:** Inventory turns, fill rate by branch, and rep productivity were tracked on whiteboards -- not in any system

Their IT team (one person) had tried building SSRS reports but hit a wall with P21's database schema. The views they needed didn't exist, and they didn't have the SQL expertise to write the complex cross-branch queries required.

## The Solution

We took a phased approach -- quick wins first to build confidence, then the larger dashboard project.

**Phase 1: Core SSRS Reports (Week 1-2)**
Built seven automated SSRS reports that replaced the manual Excel process:

1. **Executive Summary** -- Revenue, margin, order volume, and fill rate across all branches, with drill-down by branch, product category, and date range
2. **Branch Comparison** -- Side-by-side metrics for all six locations with trend lines
3. **Inventory Turns by Category** -- Identifies slow-moving and dead stock across all warehouses
4. **Sales Rep Scorecard** -- Individual rep performance: orders, revenue, margin, activity
5. **Accounts Receivable Aging** -- AR by branch with payment trend analysis and collections priority
6. **Purchase Order Analysis** -- Vendor performance: lead times, fill rates, cost trends
7. **Customer Profitability** -- True profitability by customer including cost-to-serve metrics

All reports are scheduled to run automatically and land in managers' inboxes every morning before they arrive at work.

**Phase 2: Power BI Dashboard (Week 3-4)**
Connected Power BI directly to the P21 SQL Server database through a set of optimized views I wrote specifically for their data structure. The dashboard gives leadership:

- Real-time revenue and margin tracking across all branches
- Interactive drill-downs (click a branch to see its products; click a product to see its customers)
- Trend analysis with 12-month rolling comparisons
- Inventory health scorecard with automated reorder alerts
- Mobile-friendly layout for checking numbers on the road

**Phase 3: Managed Support (Ongoing)**
Signed a Standard retainer ($1,100/mo) for ongoing report maintenance, new report requests, and quarterly optimization reviews. This gives them a dedicated P21 reporting expert on call without the cost of a full-time hire.

## The Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Monthly reporting time | 3 days (72 hrs) | 15 minutes (review only) | **-99%** |
| Data freshness | 3-5 days old | Real-time | **Instant** |
| Report consistency errors | 5-8 per month | 0 (automated) | **-100%** |
| Number of manual Excel exports | 14 per month | 0 | **Eliminated** |
| Executive visibility | Monthly snapshot | Real-time dashboard | **Transformed** |
| Slow-moving inventory identified | Not tracked | $320K identified | **New insight** |
| Dead stock liquidated (first 90 days) | -- | $85K recovered | **New revenue** |

## Timeline

- **Week 1-2:** SSRS report development, SQL view creation, automated scheduling
- **Week 3-4:** Power BI dashboard build, data validation, user training
- **Week 5:** Go-live, monitoring, and optimization
- **Ongoing:** Monthly retainer for maintenance and new report development

## Total Investment

- Initial project: $18,000 (SSRS reports + Power BI dashboard + training)
- Ongoing retainer: $1,100/month (10 hours, priority response)
- First-year total: $31,200

ROI in the first 90 days: $85K recovered from dead stock identification alone. The 3 days of staff time recovered every month represents an additional $36K+ in annual productivity.

## Client Testimonial

> "We tried two other consulting firms before finding Lumina. Their team was the first group that actually understood how we use P21 day-to-day. They didn't just fix the problem -- they showed us three other things we didn't know we were doing wrong. The dead stock report alone paid for the whole project in the first quarter."
>
> -- **IT Director, Multi-Branch Electrical Supply**
