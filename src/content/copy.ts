// Lumina Erp - Website Copy
// All website copy as typed constants for page builders to import

// ─── Brand ────────────────────────────────────────────────────────────────────

export const brand = {
  name: "Lumina Erp",
  tagline: "Illuminate your ERP potential.",
  domain: "Lumina-ERP.com",
  email: "Nickalus@Lumina-ERP.com",
  location: "Humble, TX",
  locationFull: "Based in Humble, TX. Serving distributors nationwide.",
  founder: "Nick Brewer",
  copyright: `\u00A9 ${new Date().getFullYear()} Lumina Erp. All rights reserved.`,
  footerDescription:
    "Expert Prophet 21 consulting for wholesale distributors. From business rules to cloud migration, we illuminate the path to ERP excellence.",
} as const;

// ─── Navigation ───────────────────────────────────────────────────────────────

export const nav = {
  links: [
    { label: "Services", href: "/services" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
  ],
  cta: { label: "Free Consultation", href: "/contact" },
} as const;

// ─── Homepage ─────────────────────────────────────────────────────────────────

export const homepage = {
  hero: {
    headline: "Stop Losing Revenue to\nBroken P21 Workflows",
    subheadline:
      "Expert Prophet 21 consulting for wholesale distributors. From business rules to cloud migration, we illuminate the path to ERP excellence.",
    primaryCta: { label: "Schedule a Free Consultation", href: "/contact" },
    secondaryCta: { label: "View Case Studies", href: "/case-studies" },
  },
  trustBar: {
    metrics: [
      { value: "150x", label: "Performance Improvement" },
      { value: "280K", label: "Product Operations" },
      { value: "140x", label: "API Call Reduction" },
    ],
  },
  metrics: {
    heading: "Proven Results from Real P21 Projects",
    items: [
      { value: 150, suffix: "x", label: "Performance Improvement" },
      { value: 280, suffix: "K", label: "Bulk Product Operations" },
      { value: 140, suffix: "x", label: "API Call Reduction" },
      { value: 5, suffix: "+", label: "Production Business Rules" },
    ],
  },
  featuredProjects: {
    heading: "Featured P21 Projects",
    subheading: "Real-world optimizations delivering measurable performance gains and operational efficiency.",
    projects: [
      {
        title: "Address Truncation Fix",
        challenge: "SellerCloud integration failing with 1,200+ orders due to 30-character address limit",
        solution: "Compiled C# business rule with intelligent truncation preserving critical address data",
        results: [
          { label: "Performance", value: "150x faster", detail: "vs SQL trigger approach" },
          { label: "Orders", value: "1,200+", detail: "processed successfully" },
          { label: "Impact", value: "Zero", detail: "address data loss" },
        ],
        tech: ["C# .NET", "DynaChange", "SellerCloud API"],
      },
      {
        title: "SellerCloud Bulk Operations",
        challenge: "Manual product sync and pricing updates taking hours across 280K+ SKUs",
        solution: "N8N workflow automating bulk operations with rate limiting and error handling",
        results: [
          { label: "Products", value: "280K+", detail: "synchronized automatically" },
          { label: "API Calls", value: "140x less", detail: "optimized batch processing" },
          { label: "Time Saved", value: "95%", detail: "from manual process" },
        ],
        tech: ["N8N", "REST API", "PostgreSQL", "Rate Limiting"],
      },
      {
        title: "Production Business Rules",
        challenge: "Complex order validation and pricing logic requiring manual intervention",
        solution: "5 production-ready DynaChange business rules automating critical workflows",
        results: [
          { label: "Rules", value: "5", detail: "in production use" },
          { label: "Validation", value: "Real-time", detail: "order entry checks" },
          { label: "Manual Work", value: "Eliminated", detail: "automated workflows" },
        ],
        tech: ["DynaChange", "SQL Server", "P21 Business Rules"],
      },
    ],
  },
  servicesPreview: {
    heading: "How We Help",
    subheading:
      "Whether you need a quick fix or a full migration plan, we bring hands-on P21 expertise to every engagement.",
    cards: [
      {
        icon: "advisory",
        title: "Strategy & Advisory",
        description:
          "P21 health checks, migration planning, and configuration audits. We find what's slowing your system down and build a roadmap to fix it.",
        link: { label: "Learn More", href: "/services#advisory" },
      },
      {
        icon: "development",
        title: "Custom Development",
        description:
          "Business rules, SSRS reports, SQL optimization, and API integrations. Real code from someone who writes it daily in a production P21 environment.",
        link: { label: "Learn More", href: "/services#development" },
      },
      {
        icon: "cloud",
        title: "Cloud Migration",
        description:
          "On-prem P21 ends in 2028. We audit your customizations, plan the timeline, and guide you through every step of the cloud transition.",
        link: { label: "Learn More", href: "/services#migration" },
      },
      {
        icon: "managed",
        title: "Managed Support",
        description:
          "Monthly retainers starting at $625/mo. Guaranteed availability, priority response, and a dedicated P21 expert on call when you need one.",
        link: { label: "Learn More", href: "/services#support" },
      },
    ],
  },
  featuredCaseStudy: {
    heading: "Featured Case Study",
    tag: "HVAC Distribution",
    title: "Regional HVAC Distributor Cuts Order Processing Time by 60%",
    before: { label: "Before", value: "45 min", detail: "per order" },
    after: { label: "After", value: "18 min", detail: "per order" },
    quote:
      "Nick understood our P21 setup from day one. No ramp-up time, no hand-holding -- just results.",
    attribution: "Operations Manager, Regional HVAC Distributor",
    link: {
      label: "Read Full Case Study",
      href: "/case-studies/hvac-distributor",
    },
  },
  testimonial: {
    quote:
      "We tried two other consulting firms before finding Lumina. Nick was the first person who actually understood how we use P21 day-to-day. He didn't just fix the problem -- he showed us three other things we didn't know we were doing wrong.",
    name: "IT Director",
    company: "Multi-Branch Electrical Supply",
  },
  bottomCta: {
    heading: "Ready to Illuminate Your P21?",
    subheading:
      "Schedule a free 30-minute consultation. We'll review your setup and tell you exactly where the opportunities are -- no sales pitch, just straight talk.",
    cta: { label: "Schedule a Free Consultation", href: "/contact" },
  },
} as const;

// ─── Services ─────────────────────────────────────────────────────────────────

export const services = {
  hero: {
    headline: "Prophet 21 Expertise That Delivers Results",
    subheadline:
      "Production-tested P21 solutions backed by real code, proven performance metrics, and deep technical expertise. From DynaChange business rules to API integrations -- we build solutions that work in the real world.",
  },
  anchors: [
    { label: "Extensions", href: "#extensions" },
    { label: "Integrations", href: "#integrations" },
    { label: "Database", href: "#database" },
    { label: "Warehouse", href: "#warehouse" },
    { label: "Portals", href: "#portals" },
    { label: "Support", href: "#support" },
  ],
  items: [
    {
      id: "extensions",
      icon: "development",
      title: "P21 Extensions & DynaChange Development",
      description:
        "Custom P21 business rules that automate workflows, enforce validation, and integrate with external systems -- without modifying core P21 code. Built against P21 Extensions SDK with production-tested patterns.",
      includes: [
        "C# .NET business rules (Validators, Converters, On Event, On Demand)",
        "P21 Transaction API v2 integration for quote/order automation",
        "Custom database tables for configuration and audit trails",
        "Field auto-population and data transformation logic",
        "Fail-safe patterns preventing legitimate operations from blocking",
        "Multi-version compatibility (Desktop + Web UI)",
        "Compiled .DLL with source code and documentation",
        "30-day warranty on defects",
      ],
      timeline: "1-4 weeks per rule",
      pricing: "$1,500 - $8,000 per rule",
      cta: { label: "Request Development Quote", href: "/contact" },
      examples: [
        {
          name: "PreventEmptyCarrierPickTickets",
          problem: "Pick tickets printed without carriers break ShipLink integration",
          solution: "On Event rule intercepts pick ticket creation, validates carrier_id, blocks if NULL",
          result: "Zero carrier-related shipping failures since deployment",
        },
        {
          name: "Quote Duplication with Auto-Repricing",
          problem: "Sales team manually re-entering quotes with outdated pricing (30+ min per quote)",
          solution: "Transaction API integration omits unit_price to trigger P21's contract pricing engine",
          result: "Quote duplication reduced from 30 minutes to 30 seconds",
        },
      ],
    },
    {
      id: "integrations",
      icon: "integration",
      title: "API Integration Services",
      description:
        "Connect P21 to SellerCloud, Rithum, e-commerce platforms, and custom APIs using N8N automation workflows. Proven patterns delivering 150x performance improvements and 140x API call reductions.",
      includes: [
        "N8N workflow development with visual automation editor",
        "Bi-directional data sync (orders, tracking, pricing, inventory)",
        "Batch API processing (25-50 items per request for optimal performance)",
        "OAuth2 token management and refresh automation",
        "Retry logic with exponential backoff (up to 10 attempts)",
        "Error handling workflows with database logging",
        "Email alerts and monitoring dashboards",
        "N8N workflow JSON export and documentation",
        "30-day post-deployment support",
      ],
      timeline: "1-3 weeks per integration",
      pricing: "$2,000 - $15,000 per integration",
      cta: { label: "Schedule Integration Discovery", href: "/contact" },
      examples: [
        {
          name: "Address Matching Dashboard Optimization",
          problem: "1,500+ API calls taking 5 hours with constant timeouts",
          solution: "Replaced 1,000 P21 API calls with single SQL query, batched external API calls (50 orders/request)",
          result: "150x faster (5 hours → <2 minutes), 140x fewer API calls (1,500+ → 11)",
        },
        {
          name: "SellerCloud Tracking Sync",
          problem: "Manual tracking number updates for Wayfair/Amazon orders via SellerCloud",
          solution: "N8N workflow running every 30 minutes with verification loops and retry logic",
          result: "Automated bi-directional tracking sync with 100% accuracy verification",
        },
      ],
    },
    {
      id: "database",
      icon: "reporting",
      title: "Database Optimization & Performance",
      description:
        "Make P21 reports load 10x faster without upgrading hardware. Expert SQL query optimization, indexing strategies, and database performance tuning for Crystal Reports, SSRS, and custom queries.",
      includes: [
        "Free performance audit (1-hour database review, top 10 slow queries)",
        "SQL query optimization with before/after benchmarks",
        "Covering index design and implementation",
        "Keyset pagination replacing offset-based patterns",
        "Crystal Reports query rewrites for timeout prevention",
        "View optimization and materialization",
        "Execution plan analysis and tuning",
        "Best practices documentation",
        "90-day performance warranty",
      ],
      timeline: "3-5 days per optimization package",
      pricing: "$2,500 - $15,000 based on scope",
      cta: { label: "Get Free Performance Audit", href: "/contact" },
      examples: [
        {
          name: "Keyset Pagination Pattern",
          problem: "Crystal Report fails at 10,000+ rows with OFFSET pagination",
          solution: "Replaced OFFSET/FETCH with keyset pagination using indexed primary key",
          result: "Consistent performance regardless of row position, eliminated timeouts",
        },
        {
          name: "Covering Index Strategy",
          problem: "Dashboard queries scanning entire oe_hdr table (30+ sec load times)",
          solution: "Created covering indexes on filter columns with INCLUDE for display columns",
          result: "Query time reduced from 30+ seconds to <2 seconds",
        },
      ],
    },
    {
      id: "warehouse",
      icon: "advisory",
      title: "Warehouse Automation Solutions",
      description:
        "Automate pick ticket routing, bin allocation, and shipping workflows without expensive WMS platforms. Quantity-based logic, carrier validation, and RF scanner integration built on P21.",
      includes: [
        "Quantity-based bin routing (eaches vs. pallet bin logic)",
        "Carrier auto-assignment and validation rules",
        "Pick ticket validation before printing/processing",
        "Shipping label integration (ShipLink, UPS WorldShip)",
        "Dynamic bin allocation based on configurable thresholds",
        "Configuration portal for warehouse managers",
        "SQL triggers or N8N automation (client choice)",
        "Custom audit tables and reporting",
        "Pilot deployment with success metrics",
        "60-day warranty on automation logic",
      ],
      timeline: "1-3 weeks per automation",
      pricing: "$2,000 - $8,000 per automation",
      cta: { label: "Request Warehouse Consultation", href: "/contact" },
      examples: [
        {
          name: "Dynamic Bin Quantity Routing",
          problem: "Small Costco.com orders (1-2 units) allocated to bulk pallet bins, excessive picker travel",
          solution: "Configuration-driven routing: qty < threshold → EACHES bin, qty >= threshold → PALLET bin",
          result: "Improved pick efficiency, reduced warehouse travel time",
        },
        {
          name: "Carrier Validation Rule",
          problem: "Pick tickets printed without carrier cause ShipLink integration failures",
          solution: "DynaChange On Event rule blocks pick ticket creation if carrier_id is NULL, shows user-friendly error",
          result: "Zero invalid pick tickets, eliminated ShipLink failures",
        },
      ],
    },
    {
      id: "portals",
      icon: "cloud",
      title: "Custom Portal Development",
      description:
        "Customer-facing portals that pull live pricing, availability, and order history from P21 without exposing your ERP. Modern web interfaces with mobile-optimized responsive design.",
      includes: [
        "Responsive web portal (HTML/CSS/JavaScript)",
        "Customer-specific contract pricing via P21 GetItemPrice API",
        "Real-time inventory availability lookups",
        "Order history and tracking information",
        "Quote request forms creating P21 quotes via Transaction API",
        "User authentication (Customer ID + token or SSO)",
        "Batch API optimization (25-50 items per request)",
        "Progress tracking for bulk export jobs",
        "Admin configuration interface",
        "SSL certificate and hosting setup",
        "Mobile-optimized glassmorphism design",
        "Training documentation and 60-day warranty",
      ],
      timeline: "2-4 weeks for full-featured portal",
      pricing: "$5,000 - $20,000 based on features",
      cta: { label: "Request Portal Development Quote", href: "/contact" },
      examples: [
        {
          name: "TDP Pricing Portal",
          problem: "Customer service reps need fast pricing lookups for 1-25,000 items with customer-specific contracts",
          solution: "Dual-mode portal (Quick: 1-25 SKUs instant, Bulk: 15K+ items async job) with batch API calls",
          result: "6.44x faster via batch processing, handles 280K product catalogs",
        },
        {
          name: "Configuration Portal for Bin Routing",
          problem: "Warehouse managers need to configure quantity thresholds without code changes",
          solution: "Web portal updating SQL config tables (item, threshold, eaches bin, pallet bin)",
          result: "Non-technical users configure routing logic, full audit trail",
        },
      ],
    },
    {
      id: "support",
      icon: "managed",
      title: "System Administration & Support",
      description:
        "Predictable monthly support with guaranteed response times and proactive monitoring. Like having a P21 expert on speed dial -- no emergency rates, no surprises.",
      includes: [
        "Guaranteed monthly hours at discounted rates (5-25% off standard)",
        "Priority response times (48hr to same-day based on tier)",
        "Proactive system monitoring and optimization",
        "Business rules maintenance and updates",
        "Regular check-ins and system reviews (quarterly to weekly)",
        "Email, phone, and video support",
        "Rollover hours available on higher tiers",
        "Flexible upgrade/downgrade anytime",
      ],
      tiers: [
        {
          name: "Basic",
          hours: "5 hrs/mo",
          price: "$625/mo",
          features: [
            "5 hours of support",
            "Email support",
            "48-hour response time",
            "Quarterly check-in",
            "Minor fixes & troubleshooting",
          ],
        },
        {
          name: "Standard",
          hours: "10 hrs/mo",
          price: "$1,100/mo",
          features: [
            "10 hours of support",
            "Email & phone support",
            "24-hour response time",
            "Monthly system review",
            "Business rules maintenance",
            "Priority response",
          ],
        },
        {
          name: "Premium",
          hours: "20 hrs/mo",
          price: "$2,000/mo",
          features: [
            "20 hours of support",
            "Email, phone & video support",
            "Same-day response",
            "Weekly touchpoint",
            "Business rules maintenance",
            "Proactive monitoring",
          ],
        },
        {
          name: "Dedicated",
          hours: "40 hrs/mo",
          price: "$3,600/mo",
          features: [
            "40 hours of support",
            "All communication channels",
            "Same-day response",
            "Weekly touchpoint",
            "Full maintenance & monitoring",
            "Dedicated availability",
          ],
        },
      ],
      cta: { label: "Choose Your Plan", href: "/contact" },
    },
  ],
  process: {
    heading: "How Every Engagement Works",
    steps: [
      {
        number: "01",
        title: "Discovery",
        description:
          "A free 30-minute call to understand your P21 setup, pain points, and goals. No sales pitch -- just honest assessment.",
      },
      {
        number: "02",
        title: "Blueprint",
        description:
          "We scope the work, define deliverables, and give you a fixed quote. You know exactly what you're getting and what it costs before we start.",
      },
      {
        number: "03",
        title: "Execute",
        description:
          "We do the work. You get regular updates and can see progress as it happens. No surprises, no scope creep without your approval.",
      },
      {
        number: "04",
        title: "Optimize",
        description:
          "After delivery, we stick around to make sure everything works in production. Then we document what was done so your team can maintain it.",
      },
    ],
  },
  bottomCta: {
    heading: "Not Sure Where to Start?",
    subheading:
      "Book a free 30-minute discovery call. We'll listen to your challenges and tell you what we'd recommend -- even if the answer is 'you don't need a consultant for this.'",
    cta: { label: "Book a Discovery Call", href: "/contact" },
  },
} as const;

// ─── About ────────────────────────────────────────────────────────────────────

export const about = {
  hero: {
    headline: "About",
    subheadline: "The practitioner-consultant.",
  },
  intro: {
    greeting: "Nick Brewer, Founder",
    paragraphs: [
      "Lumina Erp was built on a simple idea: ERP consulting should come from people who actually use the system every day. Our founder, Nick Brewer, is an ERP administrator at a wholesale distribution company in Houston -- managing inventory, processing orders, writing business rules, and keeping Prophet 21 running for a real distribution operation.",
      "We started this practice because we kept seeing the same pattern: distributors struggling with P21 problems that had already been solved in real distribution environments. They'd hire a big consulting firm, get a junior consultant who'd never actually run a distribution operation, and end up with a solution that looked good on paper but didn't survive the first busy season.",
      "When you work with us, you're getting practitioners who live inside P21. We know the workarounds, the gotchas, and the shortcuts that only come from daily hands-on experience. We don't implement and leave -- we build solutions that actually work in the real world of wholesale distribution.",
      "We're developers, too. C#, SQL, Python -- we write code that automates the tedious stuff, integrates your systems, and gives you data you can actually act on. And with the mandatory cloud migration deadline approaching, we help distributors plan and execute their transition without disrupting operations.",
    ],
  },
  skills: {
    heading: "What We Bring to the Table",
    categories: [
      {
        title: "Core P21",
        items: [
          "System Administration",
          "Configuration & Optimization",
          "Module Setup",
          "User Management",
          "Security Configuration",
        ],
      },
      {
        title: "Development",
        items: [
          "C# .NET Business Rules",
          "DynaChange Visual Rules",
          "SQL Server & SSRS",
          "Python Automation",
          "REST API Development",
        ],
      },
      {
        title: "Integration",
        items: [
          "Ecommerce Platforms",
          "CRM Systems",
          "EDI & WMS",
          "Power BI & Analytics",
          "Cloud Migration",
        ],
      },
    ],
  },
  credentials: [
    {
      metric: "Daily",
      label: "Production P21 Use",
      detail: "Not project-based exposure -- hands-on administration of a live distribution ERP every single day.",
    },
    {
      metric: "Full Stack",
      label: "Development Team",
      detail: "C#, SQL, Python, REST APIs -- we write the code, not just configure screens.",
    },
    {
      metric: "Real",
      label: "Distribution Operators",
      detail:
        "We run P21 at a live distributor. We know the inventory headaches, pricing edge cases, and reporting gaps firsthand.",
    },
  ],
  process: {
    heading: "How We Work",
    steps: [
      {
        title: "Discovery",
        description:
          "We listen first. A free 30-minute call to understand your setup, pain points, and goals.",
      },
      {
        title: "Blueprint",
        description:
          "Clear scope, fixed pricing, defined deliverables. You know exactly what you're getting.",
      },
      {
        title: "Execute",
        description:
          "We do the work with regular check-ins. No hand-offs to junior staff -- you get our A-team.",
      },
      {
        title: "Optimize",
        description:
          "Post-delivery support to make sure everything works in production. Full documentation included.",
      },
    ],
  },
  personal: {
    text: "Based in Humble, TX (Houston metro), serving distributors nationwide. Founded by Nick Brewer -- when he's not elbow-deep in P21, he's building electronics projects with his daughters and pushing the boundaries of AI automation.",
  },
  cta: {
    heading: "Let's See If We're a Good Fit",
    subheading:
      "Schedule a free 30-minute call. No pressure, no sales pitch -- just a conversation about your P21 challenges.",
    cta: { label: "Schedule a Call", href: "/contact" },
  },
} as const;

// ─── Contact ──────────────────────────────────────────────────────────────────

export const contact = {
  hero: {
    headline: "Let's Talk P21",
    subheadline:
      "Whether you have a specific project in mind or just want to explore your options, we're happy to chat. No commitment, no pressure.",
  },
  form: {
    fields: {
      name: { label: "Name", placeholder: "Your name", required: true },
      company: {
        label: "Company",
        placeholder: "Your company",
        required: true,
      },
      email: {
        label: "Email",
        placeholder: "you@company.com",
        required: true,
      },
      helpType: {
        label: "How Can We Help?",
        options: [
          "P21 Health Check / Audit",
          "Custom Business Rules",
          "Reporting & Analytics",
          "Cloud Migration Planning",
          "Integration Development",
          "Managed Support / Retainer",
          "Something Else",
        ],
        required: true,
      },
      message: {
        label: "Tell Us More",
        placeholder:
          "What's going on with your P21? The more context, the better we can help.",
        required: false,
      },
    },
    submitLabel: "Send Message",
    successMessage:
      "Thanks, {name}! We'll be in touch within 24 hours.",
  },
  sidebar: {
    heading: "What to Expect",
    items: [
      "We respond to every inquiry within 24 hours",
      "Discovery calls are free -- 30 minutes, no strings",
      "You'll get honest feedback, even if the answer is 'you don't need a consultant for this'",
    ],
    directContact: {
      email: "Support@Lumina-ERP.com",
      location: "Humble, TX (Houston Metro)",
      availability: "Mon-Fri evenings & weekends",
    },
    scheduling: {
      heading: "Prefer to Book Directly?",
      description:
        "Skip the form and pick a time that works for you.",
      ctaLabel: "View Available Times",
      ctaHref: "/contact#schedule",
    },
  },
  faq: {
    heading: "Common Questions",
    items: [
      {
        question: "What does a free consultation look like?",
        answer:
          "A 30-minute video call where we ask about your P21 setup, your pain points, and what you're trying to accomplish. We'll give you honest feedback on where we see opportunities -- and whether we're the right fit to help.",
      },
      {
        question: "Do you work on-site or remote?",
        answer:
          "Both. Most engagements are remote, which keeps costs down for you. For intensive work sessions or go-live support, we're available on-site in the Houston/Gulf Coast area and can travel nationwide.",
      },
      {
        question: "How do you price your services?",
        answer:
          "Standard consulting is $135/hr. Specialized work (business rules, integrations, migration) runs $150-$175/hr. Project-based work gets a fixed quote upfront. Retainer clients get discounted rates in exchange for monthly commitment.",
      },
      {
        question: "What if I'm not sure what I need?",
        answer:
          "That's what the discovery call is for. We'll ask the right questions to figure out where your biggest opportunities are. A P21 Health Check ($2,500-$5,000) is also a great starting point -- it gives us all a clear picture of your system's state.",
      },
      {
        question: "Can you help with the Kinetic UI transition?",
        answer:
          "Yes. Epicor is discontinuing the Classic UI in Kinetic 2026.1 (May 2026). We help with compatibility testing, user retraining, and making sure your customizations work in the new browser-based interface.",
      },
    ],
  },
} as const;

// ─── Footer ───────────────────────────────────────────────────────────────────

export const footer = {
  brand: {
    name: "Lumina Erp",
    description: brand.footerDescription,
    tagline: brand.tagline,
  },
  columns: [
    {
      heading: "Services",
      links: [
        { label: "P21 Extensions & DynaChange", href: "/services#extensions" },
        { label: "API Integration Services", href: "/services#integrations" },
        { label: "Database Optimization", href: "/services#database" },
        { label: "Warehouse Automation", href: "/services#warehouse" },
        { label: "Custom Portal Development", href: "/services#portals" },
        { label: "System Administration", href: "/services#support" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Case Studies", href: "/case-studies" },
      ],
    },
    {
      heading: "Connect",
      links: [
        {
          label: "Support@Lumina-ERP.com",
          href: "mailto:Support@Lumina-ERP.com",
        },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/nickalus-brewer",
          external: true,
        },
        {
          label: "GitHub",
          href: "https://github.com/LuminaHQ",
          external: true,
        },
      ],
    },
  ],
  bottom: {
    location: brand.locationFull,
    copyright: brand.copyright,
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
} as const;
