# LuminaTech Service Pages Plan
## Based on P21 Capabilities & Real Project Experience

**Version:** 1.0
**Date:** 2026-02-12
**Author:** Service Planning Team
**Reference Projects:** TDP P21 Dev, Extensions, Integrations, Portals

---

## Executive Summary

This document outlines the strategic design for LuminaTech's service offering pages, built around proven P21 development capabilities demonstrated in production implementations. Each service is backed by real case studies, technical depth, and quantifiable results.

### Core Differentiators
- **Battle-Tested Solutions**: Every service backed by production deployments
- **Technical Transparency**: Share actual code patterns and architectures
- **Measurable Results**: Performance improvements (150x faster, 140x fewer API calls)
- **Full-Stack Capability**: DynaChange, N8N, SQL, APIs, Web Portals

---

## Service Page 1: P21 Extensions & DynaChange Development

### Page URL
`/services/p21-extensions-dynachange`

### Hero Section
**Headline:**
"Custom P21 Business Rules That Actually Work in Production"

**Subheadline:**
Turn P21 limitations into competitive advantages. We build DynaChange business rules that automate workflows, enforce validation, and integrate with external systems -- without modifying core P21 code.

**CTA:**
"See Our Production Extensions →"

---

### Value Propositions

**1. Real Extensions in Production**
- PreventEmptyCarrierPickTickets: Blocks pick ticket creation without carrier (prevents ShipLink failures)
- Quote Duplication with Auto-Repricing: Transaction API integration for automatic contract pricing
- Dynamic Bin Routing: Quantity-based warehouse allocation (eaches vs. pallet bins)
- UDF Auto-Population: Eliminate manual data entry with field converters

**2. Development Approach**
- **C# .NET Framework**: Built against P21 Extensions SDK (v4.6.1/4.8)
- **Fail-Safe Patterns**: Never block legitimate operations due to rule errors
- **Database Integration**: Custom tables for configuration and audit trails
- **Multi-Version Support**: Desktop + Web UI compatibility

**3. Types of Rules We Build**
| Rule Type | Use Cases | Typical Timeline |
|-----------|-----------|------------------|
| **Validators** | Block invalid saves, enforce constraints | 1-2 weeks |
| **Converters** | Auto-populate fields, transform data | 1 week |
| **On Event** | Intercept documents, trigger workflows | 2-3 weeks |
| **On Demand** | Button-triggered business processes | 3-4 weeks |

---

### Technical Differentiators Section

**Headline:** "Why Our Extensions Stand Out"

**Architecture Patterns:**
1. **Hybrid API + SQL Approach**
   - Primary: Transaction API (full P21 business logic)
   - Fallback: Direct SQL (reliability when API unavailable)
   - Example: Quote repricing auto-calculates pricing by omitting `unit_price` field

2. **Configuration-Driven Logic**
   - Custom `tdp_config` tables for flexible rule behavior
   - No recompilation for threshold changes
   - Business users can adjust parameters

3. **Comprehensive Audit Trails**
   - Every automated action logged to database
   - Compliance-ready reporting
   - Troubleshooting visibility

**Code Quality:**
- Field alias fallback pattern (handles P21 version differences)
- Database queries use `WITH (NOLOCK)` for read performance
- User-friendly error messages (not technical jargon)
- Logging API integration for diagnostics

---

### Case Study Spotlight

**Title:** "Auto-Repricing Quote Duplication via Transaction API"

**Business Problem:**
Sales team manually re-entered old quotes to get current pricing (time-consuming, error-prone).

**Solution:**
C# business rule that duplicates quotes via P21 Transaction API v2, intentionally omitting `unit_price` to trigger P21's automatic contract pricing calculation.

**Results:**
- ✅ Automatic pricing from current customer contracts
- ✅ Preserves quote structure (ship-to, line items, quantities)
- ✅ Security audit logging (`tdp_quote_conversion_audit` table)
- ✅ One-click operation from Order Entry UI

**Technical Innovation:**
By omitting the `unit_price` field in the Transaction API payload, P21's pricing engine automatically:
- Looks up customer contract pricing
- Falls back to price page pricing
- Applies quantity breaks based on `qty_ordered`

---

### Pricing & Deliverables

**Typical Engagement:**
- **Discovery:** Requirements gathering, P21 environment review (1-2 days)
- **Development:** Rule coding, PLAY testing, validation (1-4 weeks)
- **Deployment:** Production deployment, user training (1 day)
- **Warranty:** 30-day post-deployment support included

**Investment Range:**
- **Simple Rule** (Converter/Validator): $1,500 - $3,000
- **Complex Rule** (On Event, API integration): $4,000 - $8,000
- **Multi-Rule Project**: Custom quote based on scope

**What You Get:**
- Compiled .DLL file ready for deployment
- Installation documentation
- P21 configuration guide (Field Selector setup)
- Source code (C# .csproj)
- SQL scripts for custom tables/stored procedures
- 30-day warranty on defects

---

### Call-to-Action
**Primary CTA:**
"Request Extension Development Quote"

**Secondary CTA:**
"Download: P21 Extensions Architecture Guide" (Lead magnet - PDF with code patterns)

---

## Service Page 2: N8N Integration Services

### Page URL
`/services/n8n-integrations-p21`

### Hero Section
**Headline:**
"Connect P21 to SellerCloud, Rithum, and Any API Without Custom Code"

**Subheadline:**
Visual workflow automation that syncs orders, tracking numbers, and pricing in real-time. No expensive middleware platforms. No vendor lock-in.

**CTA:**
"See Live Integration Examples →"

---

### Value Propositions

**1. Proven Integrations (In Production)**
- **SellerCloud Tracking Sync**: Bi-directional tracking updates (30-min intervals, retry logic)
- **Rithum/ChannelAdvisor Order Sync**: Amazon marketplace order ingestion
- **Address Matching Dashboard**: Detects P21 address truncation vs. source platforms
- **TDP Pricing Portal**: Customer pricing lookup (25-50 item batches)
- **Automation Studio Sync**: Event-driven P21 workflows

**2. Platform Capabilities**
- **N8N Open Source**: No per-connector licensing fees
- **Visual Editor**: Workflows are diagrams, not code
- **Self-Hosted**: Your data stays on your infrastructure
- **100+ Built-in Nodes**: HTTP, SQL, Email, Webhooks, etc.

**3. Integration Patterns**
| Pattern | Use Case | Typical Cost |
|---------|----------|--------------|
| **Scheduled Polling** | Sync tracking every 30 min | $2,000 - $4,000 |
| **Webhook-Triggered** | Real-time order ingestion | $3,000 - $6,000 |
| **Hybrid API + SQL** | Complex data orchestration | $5,000 - $10,000 |
| **CSV Processing** | Bulk product updates | $2,500 - $5,000 |

---

### Performance Breakthrough Section

**Headline:** "We Made Address Audits 150x Faster"

**The Challenge:**
Original N8N workflow made 1,500+ sequential API calls to compare P21 addresses with SellerCloud/Rithum source data. Runtime: **5 hours** with constant timeouts.

**The Solution:**
Applied batch API processing and SQL optimization:
1. **Replaced 1,000 P21 API calls** with 1 SQL query (with JOIN on `address` table)
2. **Batched SellerCloud calls** (50 orders per request)
3. **Batched Rithum calls** (50 orders per request)

**Results:**
- ⚡ **Total API calls:** 1,500+ → 11 (140x reduction)
- ⚡ **Runtime:** 5 hours → <2 minutes (150x faster)
- ✅ **Timeout errors:** Eliminated
- ✅ **Dashboard:** Real-time address truncation detection

**Technical Approach:**
```sql
-- Single SQL query replaces 1,000 API calls
SELECT
    oh.order_no,
    oh.ship2_add1,              -- May be truncated (25 char limit)
    addr.phys_address1,         -- Full address from address table
    LEN(oh.ship2_add1) as addr1_length
FROM oe_hdr oh
LEFT JOIN address addr ON oh.address_id = addr.id
WHERE LEN(oh.ship2_add1) = 25  -- Potential truncation
```

---

### Integration Architecture Showcase

**Visual Diagram:**
```
┌─────────────────────────────────────────────────────┐
│               P21 ERP Database                      │
│           (SQL Server Production)                   │
└───────────┬─────────────────────────┬───────────────┘
            │                         │
            ▼                         ▼
┌─────────────────────┐   ┌─────────────────────────┐
│  P21 eCommerce API  │   │  P21 Security Token API │
│  (GetItemPrice)     │   │  (OAuth2 Auth)          │
└─────────────────────┘   └─────────────────────────┘
            │                         │
            └──────────┬──────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │    N8N Workflows     │
            │  (Automation Hub)    │
            └──────┬──────┬────────┘
                   │      │
        ┌──────────┘      └──────────┐
        │                            │
        ▼                            ▼
┌─────────────────┐      ┌─────────────────────┐
│  SellerCloud    │      │  Rithum/Channel     │
│   REST API      │      │   Advisor API       │
│ (Wayfair/Amazon)│      │  (Amazon Seller)    │
└─────────────────┘      └─────────────────────┘
```

---

### Technical Capabilities

**1. Token Management**
- Centralized token retrieval workflow (reusable across projects)
- Environment-based configuration (PLAY vs. P21 Prod)
- Automatic token refresh

**2. Error Handling**
- `onError: "continueErrorOutput"` on all HTTP nodes
- Exponential backoff retry logic (max 10 attempts)
- Dedicated error workflows with database logging
- Email alerts on failures (SendGrid integration)

**3. Data Transformation**
- **XML ↔ JSON** conversion (P21 eCommerce API)
- **Field mapping** (Rithum → P21 schema)
- **CSV processing** with shadow product filtering
- **Base64 encoding** for file uploads

**4. Monitoring & Reporting**
- HTML dashboards with color-coded status badges
- Progress tracking for bulk operations
- Verification loops with retry logic
- Summary emails with success/failure counts

---

### Case Study: SellerCloud Tracking Sync

**Business Problem:**
Wayfair and Amazon orders processed through SellerCloud needed tracking numbers updated from P21 shipments.

**Solution:**
N8N workflow running every 30 minutes:
1. Query P21 `Complete_Tracking` view (last 35 minutes)
2. Get SellerCloud token via centralized workflow
3. Push tracking to SellerCloud API (`PUT /ShippingStatus/SinglePackage`)
4. Update custom columns (invoice number)
5. **Verification loop:** Wait 1 minute, check if tracking saved correctly
6. Retry up to 10 times if mismatch detected

**Configuration Modes:**
- **Production:** Push to PROD SellerCloud
- **Test (Trial):** Push to TRIAL SellerCloud
- **Verification Only:** READ-ONLY comparison (no writes)

**Results:**
- ✅ Automated tracking sync (no manual entry)
- ✅ Bi-directional verification ensures accuracy
- ✅ Audit trail for compliance
- ✅ 30-minute sync interval (configurable)

---

### Pricing & Deliverables

**Typical Integration Project:**
- **Discovery:** API documentation review, authentication setup (2-3 days)
- **Development:** Workflow building, testing (1-3 weeks)
- **Deployment:** Production deployment, monitoring setup (1 day)
- **Training:** Workflow editing basics for your team (2 hours)

**Investment Range:**
- **Simple Integration** (1-way sync): $2,000 - $4,000
- **Bi-Directional Sync** (verification loops): $4,000 - $7,000
- **Complex Multi-System** (3+ APIs): $8,000 - $15,000
- **Monthly Retainer** (management + changes): $500 - $1,500/mo

**What You Get:**
- N8N workflow JSON export
- API credentials setup guide
- Documentation with workflow diagrams
- Test data and validation queries
- Error handling and retry logic
- 30-day post-deployment support

---

### Call-to-Action
**Primary CTA:**
"Schedule Integration Discovery Call"

**Secondary CTA:**
"Download: N8N Pattern Guide for P21" (Lead magnet - the actual N8N-Pattern-Guide.md)

---

## Service Page 3: Custom Portal Development

### Page URL
`/services/custom-portals-p21`

### Hero Section
**Headline:**
"Customer-Facing Portals That Pull Live Pricing from P21"

**Subheadline:**
Give your customers real-time pricing, availability, and order history without exposing P21. Modern web interfaces that integrate seamlessly with your ERP.

**CTA:**
"See Portal Demo →"

---

### Value Propositions

**1. Portal Capabilities**
- **Pricing Lookup**: Customer-specific contract pricing via P21 GetItemPrice API
- **Availability Check**: Real-time inventory from `inv_loc` table
- **Order History**: Read-only access to customer's past orders
- **Quote Requests**: Form submissions create P21 quotes via Transaction API
- **Account Management**: Ship-to addresses, PO numbers, job names

**2. Technology Stack**
- **Frontend**: Pure HTML/CSS/JavaScript (no framework bloat)
- **API Layer**: N8N workflows or custom Node.js endpoints
- **Authentication**: Customer ID + API token or SSO integration
- **Responsive Design**: Mobile-optimized for warehouse/field use

**3. Integration Methods**
| Method | Use Case | Pros |
|--------|----------|------|
| **P21 eCommerce API** | Pricing, availability | Native P21 support, XML-based |
| **Transaction API v2** | Order creation, quotes | Full business logic, JSON payloads |
| **Direct SQL (Read-Only)** | Reporting, history | Fast, flexible queries |
| **N8N Webhooks** | Form submissions, async processing | Visual workflow, easy changes |

---

### Featured Portal: TDP Pricing Portal

**Overview:**
Web portal for customer service reps to look up customer-specific pricing for 1-25,000 items with real-time availability.

**Features:**
1. **Dual Search Modes**
   - **Quick Search**: 1-25 specific SKUs (instant results)
   - **Bulk Export**: Full catalog pricing (15,000+ items, async job)

2. **Customer Input Fields**
   - Customer ID (required)
   - Warehouse (Birmingham/Vegas)
   - Ship-To ID (optional, dynamic dropdown)
   - SKU Tag Input (comma-separated, paste bulk list)

3. **Performance Optimization**
   - **Batch API Calls**: 25-50 items per request (6.44x faster than single calls)
   - **Keyset Pagination**: Consistent results for large datasets
   - **Progress Tracking**: Real-time percentage display for bulk exports
   - **Job State Management**: N8N workflow static data stores progress

**Technical Architecture:**
```
Pricing Portal (HTML/JS)
        ↓
POST /webhook/tdp-pricing (N8N)
        ↓
Get P21 Token (OAuth2)
        ↓
Build XML Batches (25-50 items)
        ↓
P21 GetItemPrice API (XML request)
        ↓
Parse XML Response
        ↓
Return JSON Results
        ↓
Render Pricing Cards/Table
```

**Performance Metrics:**
| Batch Size | Response Time | Throughput | Recommendation |
|------------|---------------|------------|----------------|
| 25 items | 1,750ms | 14.29 items/sec | ✅ Optimal |
| 50 items | 2,800ms | 17.86 items/sec | ✅ Good |
| 100 items | 5,800ms | 17.24 items/sec | ⚠️ Timeout risk |

---

### Design & UX Showcase

**Visual Design Philosophy:**
- **Dark Theme**: Modern gradient background (`#1a1a2e`, `#16213e`, `#0f3460`)
- **Glassmorphism**: Backdrop blur effects for depth
- **Primary Accent**: `#4a90d9` (professional blue)
- **Smooth Transitions**: 200-300ms animations for polish

**Interactive Elements:**
- **Tag Input System**: Gmail-style recipient tags for SKUs
- **Progress Animations**: Shimmer effect on loading bars
- **Success States**: Bounce animation on completion
- **Responsive Grid**: Mobile-optimized layouts

**Accessibility:**
- Semantic HTML structure
- Label associations with inputs
- Keyboard navigation support
- ARIA attributes for screen readers

---

### Case Study: Dynamic Bin Quantity Routing

**Business Problem:**
Costco.com orders (1-2 units) allocated to BULK pallet bins. Pickers walked across warehouse when inventory existed in nearby EACHES bins.

**Portal Solution:**
Configuration portal for warehouse managers to set quantity thresholds per item:
- `qty < threshold` → Route to EACHES bin
- `qty >= threshold` → Route to PALLET bin

**Architecture:**
- **Frontend**: Web portal for configuration (item ID, threshold, bin IDs)
- **Backend**: SQL tables (`TDP_Bin_Routing_Config`, audit log)
- **Automation**: N8N workflow polls recent pick tickets, calls `p21_move_document_allocation`
- **Alternative**: SQL trigger during pick ticket creation (real-time)

**Database Schema:**
```sql
CREATE TABLE TDP_Bin_Routing_Config (
    config_uid INT IDENTITY(1,1) PRIMARY KEY,
    inv_mast_uid INT NOT NULL,
    item_id VARCHAR(40),
    qty_threshold DECIMAL(19,4),
    eaches_bin VARCHAR(10),
    pallet_bin VARCHAR(10),
    active_flag CHAR(1) DEFAULT 'Y'
)
```

**Results:**
- ✅ Automated bin routing based on order size
- ✅ Configuration without code changes
- ✅ Audit trail for compliance
- ✅ Warehouse efficiency gains (reduced picker travel)

---

### Pricing & Deliverables

**Typical Portal Project:**
- **Discovery:** Requirements gathering, mockup review (3-5 days)
- **Design:** UI/UX design, branding integration (1 week)
- **Development**: Frontend + backend integration (2-4 weeks)
- **Testing**: UAT with real customer data (1 week)
- **Deployment**: Production hosting, SSL setup (2 days)

**Investment Range:**
- **Simple Pricing Portal**: $5,000 - $8,000
- **Full-Featured Portal** (auth, history, quotes): $12,000 - $20,000
- **Custom Configuration Portal**: $8,000 - $15,000
- **Monthly Hosting/Maintenance**: $200 - $500/mo

**What You Get:**
- Responsive web portal (HTML/CSS/JS)
- Backend API integration (N8N or Node.js)
- User authentication system
- Admin configuration interface
- Mobile-optimized design
- SSL certificate and hosting setup
- Training documentation
- 60-day warranty on defects

---

### Call-to-Action
**Primary CTA:**
"Request Portal Development Quote"

**Secondary CTA:**
"View Portal Demo" (Live demo of TDP Pricing Portal)

---

## Service Page 4: ERP Database Optimization

### Page URL
`/services/erp-database-optimization-p21`

### Hero Section
**Headline:**
"Make P21 Reports Load 10x Faster Without Upgrading Hardware"

**Subheadline:**
Slow dashboards and timeouts aren't normal. We optimize SQL Server queries, indexes, and database design to unlock P21's full performance.

**CTA:**
"Get Free Performance Audit →"

---

### Value Propositions

**1. Database Optimization Services**
- **Query Performance Tuning**: Rewrite slow Crystal Reports queries
- **Index Strategy**: Add targeted indexes without over-indexing
- **Keyset Pagination**: Replace offset-based pagination for consistent results
- **View Optimization**: Simplify complex views with materialization
- **Batch Processing**: Reduce transaction log growth

**2. Common P21 Performance Issues**
| Symptom | Root Cause | Our Fix |
|---------|-----------|---------|
| Dashboard timeout (30+ sec) | Missing indexes on filter columns | Add covering indexes |
| Crystal Report fails | Offset pagination at 10,000+ rows | Keyset pagination pattern |
| Slow order entry | Excessive triggers firing | Optimize trigger logic, batch updates |
| Import failures | Transaction log full | Batch processing, checkpoint tuning |

**3. Monitoring & Maintenance**
- Query execution plan analysis
- Index fragmentation monitoring
- Blocking/deadlock detection
- Proactive recommendations

---

### Technical Approach

**1. Performance Audit Process**
- Capture slow query logs (SQL Profiler or Extended Events)
- Analyze execution plans for table scans
- Review index statistics and fragmentation
- Identify missing indexes (DMVs)
- Benchmark current performance

**2. Optimization Patterns**

**A. Keyset Pagination (vs. Offset-Based)**
```sql
-- ❌ SLOW: Offset-based pagination
SELECT * FROM inv_mast
ORDER BY item_id
OFFSET 10000 ROWS FETCH NEXT 100 ROWS ONLY;

-- ✅ FAST: Keyset pagination
DECLARE @last_item_id VARCHAR(40) = 'ITEM-10000';

SELECT TOP 100 * FROM inv_mast
WHERE item_id > @last_item_id
ORDER BY item_id;
```

**B. Covering Indexes**
```sql
-- Slow report: filters on date_created, customer_id
-- Add covering index with INCLUDE clause
CREATE INDEX IX_oe_hdr_customer_date
ON oe_hdr (customer_id, date_created)
INCLUDE (order_no, po_no, total_dollars);
```

**C. Read-Only Queries with NOLOCK**
```sql
-- Dashboard/reporting queries
SELECT * FROM oe_hdr WITH (NOLOCK)
WHERE customer_id = @customer_id;
```

**3. N8N Integration Performance**
- **Batch API Calls**: 50 items per request vs. 1,500 individual calls
- **SQL vs. API Decision**: Use SQL for bulk reads, API for writes
- **Async Job Tracking**: Store progress in workflow static data

---

### Case Study: Address Matching Dashboard Optimization

**Original Performance:**
- **Total API Calls**: 1,500+ (1,000 to P21, 500 to SellerCloud/Rithum)
- **Runtime**: 5 hours with constant timeouts
- **User Experience**: Unusable for daily audits

**Optimization Strategy:**
1. **Replaced 1,000 P21 API calls** with single SQL query
   - Added `LEFT JOIN address` to get full ship-to addresses
   - Filtered by `LEN(ship2_add1) = 25` (potential truncation)

2. **Batched External API Calls**
   - SellerCloud: 50 orders per request (5 calls vs. 250)
   - Rithum: 50 orders per request (5 calls vs. 250)

3. **Added Indexes**
   ```sql
   CREATE INDEX IX_oe_hdr_customer_date
   ON oe_hdr (customer_id, date_created)
   INCLUDE (order_no, po_no, ship2_add1, ship2_add2);
   ```

**Results:**
- ⚡ **Total API Calls**: 1,500+ → 11 (140x reduction)
- ⚡ **Runtime**: 5 hours → <2 minutes (150x faster)
- ✅ **Timeout Errors**: Eliminated
- ✅ **Dashboard**: Real-time updates enabled

---

### Pricing & Deliverables

**Performance Audit (Free):**
- 1-hour database review
- Top 10 slow queries identified
- Quick-win recommendations
- Estimated optimization ROI

**Optimization Engagement:**
- **Basic Package** (5 queries): $2,500 - $4,000
- **Standard Package** (10 queries + indexes): $5,000 - $8,000
- **Comprehensive** (full database review): $10,000 - $15,000
- **Monthly Retainer** (proactive monitoring): $1,000 - $2,000/mo

**What You Get:**
- Optimized SQL queries (with before/after benchmarks)
- Index creation scripts
- Execution plan analysis reports
- Best practices documentation
- Performance baseline vs. post-optimization metrics
- 90-day performance warranty

---

### Call-to-Action
**Primary CTA:**
"Schedule Free Performance Audit"

**Secondary CTA:**
"Download: P21 SQL Optimization Checklist"

---

## Service Page 5: Warehouse Automation Solutions

### Page URL
`/services/warehouse-automation-p21`

### Hero Section
**Headline:**
"Automate Pick Ticket Routing, Bin Allocation, and Shipping Workflows"

**Subheadline:**
Reduce picker travel time, eliminate manual bin selection, and integrate RF scanners with P21 -- without expensive WMS platforms.

**CTA:**
"See Automation Examples →"

---

### Value Propositions

**1. Warehouse Automations We Build**
- **Dynamic Bin Routing**: Quantity-based allocation (eaches vs. pallet bins)
- **Carrier Auto-Assignment**: Route orders by ship-to, weight, or customer
- **Pick Ticket Validation**: Block invalid pick tickets before printing
- **Shipping Label Generation**: Integrate with ShipLink, UPS WorldShip
- **Cycle Count Scheduling**: Automated ABC analysis and count lists

**2. Integration Capabilities**
- **RF Scanners**: Integrate with Zebra, Honeywell devices
- **Shipping Systems**: ShipLink, SellerCloud, ShipStation
- **Label Printers**: Zebra ZPL, Dymo, Brother
- **Conveyor Systems**: PLC integration via Modbus/OPC

**3. Deployment Options**
| Approach | Speed | Flexibility | Cost |
|----------|-------|-------------|------|
| **N8N Automation** | Fast (days) | High (visual editor) | Low |
| **DynaChange Rule** | Medium (weeks) | Medium (recompile) | Medium |
| **SQL Trigger** | Fast (days) | Low (database-only) | Low |
| **Custom Application** | Slow (months) | High (full control) | High |

---

### Featured Solution: Dynamic Bin Quantity Routing

**Business Problem:**
Small Costco.com orders (1-2 units) allocated to BULK pallet bins. Pickers walked across warehouse when inventory existed in nearby EACHES bins.

**Solution:**
Automated bin routing based on order quantity thresholds:
- **Small Orders** (< threshold): Route to EACHES bin (e.g., `B52025`)
- **Large Orders** (≥ threshold): Route to PALLET bin (e.g., `A70160`)

**Architecture Options:**

**Option A: N8N Polling (5-minute interval)**
```
N8N Trigger (every 5 min)
  ↓
Query: Recent pick tickets (last 10 min)
  ↓
Filter: Items in TDP_Bin_Routing_Config
  ↓
Decision: qty < threshold?
  ├─ Yes → Move to EACHES bin
  └─ No → Move to PALLET bin
  ↓
Call: p21_move_document_allocation
  ↓
Log: Success/failure to audit table
```

**Option B: SQL Trigger (Real-time)**
```sql
CREATE TRIGGER trg_BinRouting_OnPickTicket
ON document_line_bin
AFTER INSERT
AS
BEGIN
    -- Check config for threshold
    -- Compare qty vs threshold
    -- Call p21_move_document_allocation if needed
    -- Log result
END
```

**Configuration Table:**
```sql
CREATE TABLE TDP_Bin_Routing_Config (
    inv_mast_uid INT NOT NULL,
    item_id VARCHAR(40),
    location_id DECIMAL(19,0),
    qty_threshold DECIMAL(19,4),
    eaches_bin VARCHAR(10),
    pallet_bin VARCHAR(10),
    active_flag CHAR(1) DEFAULT 'Y'
)
```

**Results:**
- ✅ Automated bin selection (no manual override)
- ✅ Reduced picker travel time
- ✅ Configuration without code changes
- ✅ Audit trail for verification

---

### Case Study: Carrier Validation Before Pick Ticket

**Business Problem:**
Pick tickets printed without carrier assigned. ShipLink integration fails when `carrier_id` is NULL. Manual cleanup required.

**Solution:**
DynaChange "On Event" business rule:
1. Intercepts pick ticket creation (Event UID = 5)
2. Queries `oe_hdr.carrier_id` for the order
3. If carrier is NULL, sets `create_pick_ticket_flag = 'N'`
4. P21 skips pick ticket creation
5. User sees friendly error popup

**Implementation:**
```csharp
// DynaChange business rule
public override RuleResult Execute()
{
    string orderNo = GetOrderNumber();
    bool hasCarrier = CheckOrderHasCarrier(orderNo);

    if (!hasCarrier)
    {
        SetCreatePickTicketFlag("N");  // Block creation

        result.Success = false;
        result.Message = string.Format(
            "Pick ticket cannot be created for Order {0}.\n\n" +
            "Reason: No carrier has been assigned.\n\n" +
            "Please assign a carrier in Ship Info tab.",
            orderNo);
    }

    return result;
}
```

**Results:**
- ✅ Prevents ShipLink integration failures
- ✅ User-friendly error messages
- ✅ No invalid pick tickets created
- ✅ Blocks operation BEFORE print

---

### Additional Warehouse Automations

**1. Auto-Carrier Assignment**
- Rule: Route orders by customer default carrier or ship-to zone
- Trigger: Order save or batch assignment
- Benefit: Eliminates manual carrier selection

**2. Packing List Customization**
- Custom Crystal Report or SSRS template
- Include barcode, QR code for tracking
- Customer-specific branding/messaging

**3. Cycle Count Optimization**
- ABC analysis based on movement
- Automated count list generation
- Integration with RF scanners for count entry

**4. Shipping Label Integration**
- Pull tracking from ShipLink/UPS
- Update P21 `Complete_Tracking` view
- Sync to SellerCloud/marketplaces

---

### Pricing & Deliverables

**Warehouse Automation Project:**
- **Discovery**: Workflow mapping, pain point analysis (2-3 days)
- **Development**: Rule or workflow building (1-3 weeks)
- **Testing**: PLAY environment validation (3-5 days)
- **Pilot**: Production with limited items/users (1-2 weeks)
- **Rollout**: Full deployment and training (1 week)

**Investment Range:**
- **Simple Validation Rule**: $2,000 - $4,000
- **Bin Routing Automation**: $5,000 - $8,000
- **Carrier Assignment + Labeling**: $6,000 - $10,000
- **Full Warehouse Automation Suite**: $15,000 - $30,000

**What You Get:**
- Custom business rule or N8N workflow
- Configuration tables and UI (if applicable)
- SQL scripts for setup
- PLAY environment testing results
- Pilot plan with success metrics
- User training and documentation
- 60-day warranty on automation logic

---

### Call-to-Action
**Primary CTA:**
"Request Warehouse Automation Consultation"

**Secondary CTA:**
"Download: P21 Warehouse Automation Guide"

---

## Service Page 6: API Development & Integration

### Page URL
`/services/api-development-integration`

### Hero Section
**Headline:**
"Build Secure APIs on Top of P21 for Portals, Mobile Apps, and Partners"

**Subheadline:**
Expose P21 data via REST APIs without compromising security. OAuth2 authentication, rate limiting, and documentation included.

**CTA:**
"See API Examples →"

---

### Value Propositions

**1. API Development Services**
- **RESTful API Design**: JSON endpoints for P21 data
- **Authentication**: OAuth2, API keys, JWT tokens
- **Rate Limiting**: Protect P21 from abuse
- **Webhook Notifications**: Event-driven integrations
- **OpenAPI Documentation**: Auto-generated Swagger docs

**2. Common API Use Cases**
| Use Case | HTTP Method | Example Endpoint |
|----------|-------------|------------------|
| Customer pricing lookup | `GET` | `/api/pricing?customer={id}&items={skus}` |
| Create quote | `POST` | `/api/quotes` |
| Order status | `GET` | `/api/orders/{order_no}/status` |
| Inventory availability | `GET` | `/api/inventory?item={id}&location={loc}` |
| Update tracking | `PUT` | `/api/orders/{order_no}/tracking` |

**3. Technology Stack**
- **Node.js + Express**: Lightweight API framework
- **N8N Webhooks**: Rapid prototyping with visual workflows
- **SQL Server**: Direct database queries (read-only)
- **P21 APIs**: Transaction API, eCommerce API wrappers

---

### Technical Architecture

**API Layer Pattern:**
```
External Client (Portal, Mobile App)
        ↓
OAuth2 Authentication (JWT token)
        ↓
API Gateway (Node.js/Express or N8N)
        ↓
Rate Limiting (Redis-based)
        ↓
┌─────────────┬────────────────┐
│             │                │
▼             ▼                ▼
P21 API    Direct SQL    Business Logic
(Write)    (Read-Only)   (Custom Rules)
```

**Security Layers:**
1. **Authentication**: OAuth2 with refresh tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Rate Limiting**: 100 requests/min per API key
4. **Input Validation**: Parameterized queries, schema validation
5. **Audit Logging**: Every request logged to database

---

### Case Study: P21 Pricing API for Customer Portal

**Business Requirement:**
Expose customer-specific pricing via REST API for custom web portal. Support batch queries (1-50 SKUs per request).

**API Design:**
```
POST /api/pricing
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "customer_id": "103804",
  "location_id": 11,
  "items": [
    { "item_id": "BRESIG110", "quantity": 5 },
    { "item_id": "3M-5613432", "quantity": 10 }
  ]
}

Response:
{
  "customer_id": "103804",
  "location_id": 11,
  "items": [
    {
      "item_id": "BRESIG110",
      "quantity": 5,
      "net_price": 120.75,
      "uom": "EA",
      "availability": {
        "qty_on_hand": 250,
        "qty_allocated": 50,
        "available": 200,
        "lead_time_days": 0
      }
    },
    {
      "item_id": "3M-5613432",
      "quantity": 10,
      "net_price": 4.89,
      "uom": "EA",
      "availability": {
        "qty_on_hand": 92,
        "qty_allocated": 10,
        "available": 82,
        "lead_time_days": 0
      }
    }
  ]
}
```

**Implementation:**
1. N8N webhook receives POST request
2. Validate API token (query `api_tokens` table)
3. Build P21 eCommerce XML payload (batch items)
4. Call P21 GetItemPrice API
5. Parse XML response
6. Transform to JSON
7. Return to client

**Performance:**
- **Batch Size**: 25-50 items optimal
- **Response Time**: 1.5-2.5 seconds for 25 items
- **Throughput**: 14-18 items/second

---

### API Documentation & Developer Experience

**OpenAPI Specification:**
- Auto-generated Swagger UI
- Interactive API testing
- Code examples (curl, JavaScript, Python)
- Authentication guide

**Developer Portal:**
- API key management
- Usage analytics dashboard
- Rate limit visibility
- Webhook configuration

**SDKs & Libraries:**
- JavaScript/TypeScript client
- Python client (optional)
- Postman collection

---

### Pricing & Deliverables

**API Development Project:**
- **Discovery**: API requirements, endpoint design (2-3 days)
- **Development**: Endpoint implementation, testing (2-4 weeks)
- **Documentation**: OpenAPI spec, developer guide (3-5 days)
- **Deployment**: Production hosting, SSL, monitoring (2 days)

**Investment Range:**
- **Simple API** (1-3 endpoints): $3,000 - $6,000
- **Standard API** (5-10 endpoints): $8,000 - $15,000
- **Complex API** (OAuth2, webhooks, 15+ endpoints): $15,000 - $30,000
- **Monthly Hosting/Maintenance**: $300 - $800/mo

**What You Get:**
- RESTful API endpoints (Node.js or N8N)
- OAuth2 authentication system
- Rate limiting and security
- OpenAPI documentation
- Developer portal (optional)
- SSL certificate and hosting
- Monitoring and alerting
- 60-day warranty on API functionality

---

### Call-to-Action
**Primary CTA:**
"Request API Development Quote"

**Secondary CTA:**
"Explore API Documentation" (Sample Swagger UI)

---

## Cross-Page Strategies

### 1. Consistent Case Study Format

**Structure:**
- **Business Problem**: Pain point in 1-2 sentences
- **Solution**: Technical approach with architecture diagram
- **Results**: Quantifiable metrics (✅ checkmarks)
- **Code/Config Examples**: Real snippets from production

**Metrics to Highlight:**
- **Performance Gains**: "150x faster", "140x fewer API calls"
- **Time Savings**: "5 hours → 2 minutes"
- **Error Reduction**: "Eliminated timeouts"
- **ROI**: "Reduced picker travel by 30%"

---

### 2. Technical Transparency

**Show Real Code Patterns:**
- SQL query optimization (before/after)
- DynaChange rule structure
- N8N workflow JSON excerpts
- API request/response examples

**Architecture Diagrams:**
- Use ASCII art or Mermaid diagrams
- Show data flow between systems
- Highlight integration points

---

### 3. Lead Magnets per Service

| Service Page | Lead Magnet | Format |
|--------------|-------------|--------|
| **P21 Extensions** | "P21 Extensions Architecture Guide" | PDF (code patterns, SDK reference) |
| **N8N Integrations** | "N8N Pattern Guide for P21" | Markdown/PDF (actual N8N-Pattern-Guide.md) |
| **Custom Portals** | "Portal Development Checklist" | PDF (requirements gathering template) |
| **Database Optimization** | "P21 SQL Optimization Checklist" | PDF (query tuning guide) |
| **Warehouse Automation** | "P21 Warehouse Automation Guide" | PDF (automation decision matrix) |
| **API Development** | "P21 API Integration Guide" | PDF (Transaction API examples) |

---

### 4. Pricing Transparency

**Always Include:**
- Investment range (low - high)
- What's included (deliverables)
- Typical timeline (discovery → deployment)
- Warranty period (30-60-90 days)

**Hourly Rate Anchor:**
- Standard Rate: $125/hour
- Retainer Discount: 5-25% off hourly
- Project Pricing: Fixed bid with scope

---

### 5. Call-to-Action Hierarchy

**Primary CTA:**
- "Request Quote" / "Schedule Consultation"
- High-contrast button, glow effect
- Above the fold + sticky footer

**Secondary CTA:**
- "Download Guide" / "View Demo"
- Outline button, less prominent
- Lead capture form

**Tertiary CTA:**
- "Read Case Study" / "See Examples"
- Text link, inline with content

---

## SEO & Content Strategy

### Target Keywords per Page

**P21 Extensions:**
- "P21 DynaChange development"
- "Prophet 21 business rules"
- "P21 custom extensions"
- "DynaChange business rule examples"

**N8N Integrations:**
- "P21 N8N integration"
- "Prophet 21 API integration"
- "SellerCloud P21 sync"
- "Rithum ChannelAdvisor P21"

**Custom Portals:**
- "P21 customer portal"
- "Prophet 21 pricing portal"
- "P21 web portal development"
- "Customer self-service P21"

**Database Optimization:**
- "P21 performance tuning"
- "Prophet 21 SQL optimization"
- "P21 slow reports fix"
- "P21 database optimization"

**Warehouse Automation:**
- "P21 warehouse automation"
- "Prophet 21 bin routing"
- "P21 pick ticket automation"
- "P21 RF scanner integration"

**API Development:**
- "P21 REST API"
- "Prophet 21 API development"
- "P21 Transaction API"
- "P21 eCommerce API integration"

---

### Content Depth Strategy

**Pillar Content (Service Pages):**
- 3,000-5,000 words
- Multiple case studies
- Technical diagrams
- Code examples
- Video demos (future)

**Supporting Content (Blog Posts):**
- "How We Made P21 Address Audits 150x Faster"
- "P21 Transaction API: The Complete Guide"
- "Keyset Pagination vs. Offset-Based in P21"
- "5 P21 DynaChange Patterns Every Developer Should Know"

**Documentation (Lead Magnets):**
- In-depth PDF guides (10-20 pages)
- Code repositories (GitHub)
- Video tutorials (YouTube)

---

## Implementation Roadmap

### Phase 1: Core Service Pages (Weeks 1-2)
- [ ] Create `/services/p21-extensions-dynachange`
- [ ] Create `/services/n8n-integrations-p21`
- [ ] Create `/services/custom-portals-p21`

### Phase 2: Supporting Pages (Weeks 3-4)
- [ ] Create `/services/erp-database-optimization-p21`
- [ ] Create `/services/warehouse-automation-p21`
- [ ] Create `/services/api-development-integration`

### Phase 3: Lead Magnets (Week 5)
- [ ] Convert research docs to PDF guides
- [ ] Design downloadable templates
- [ ] Set up email capture forms

### Phase 4: Case Studies (Week 6)
- [ ] Write 3-5 detailed case study pages
- [ ] Add video walkthroughs (optional)
- [ ] Publish to `/case-studies/` directory

### Phase 5: Blog Content (Ongoing)
- [ ] Publish 1-2 technical blog posts per month
- [ ] Cross-link to service pages
- [ ] Build SEO authority

---

## Success Metrics

**Traffic Goals (6 months):**
- 500+ organic visits/month to service pages
- 100+ lead magnet downloads
- 20+ qualified consultation requests

**Conversion Goals:**
- 5% visitor → lead (form submission)
- 10% lead → consultation scheduled
- 25% consultation → proposal sent

**Content Engagement:**
- 3+ minutes avg. time on service pages
- 40%+ scroll depth
- <60% bounce rate

---

## Next Steps

1. **Review & Approve**: Team lead reviews service page plan
2. **Content Writing**: Draft full service pages in Markdown
3. **Design Assets**: Create diagrams, screenshots, demo videos
4. **Development**: Build Astro pages from content
5. **SEO Optimization**: Meta tags, schema markup, internal linking
6. **Launch**: Deploy to production, announce via email/social

---

**Document Version:** 1.0
**Last Updated:** 2026-02-12
**Status:** ✅ Ready for Review
