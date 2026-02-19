// Lumina Erp - Website Copy
// All website copy as typed constants for page builders to import

// ─── Brand ────────────────────────────────────────────────────────────────────

export const brand = {
  name: "Lumina Erp",
  tagline: "Illuminate your ERP potential.",
  domain: "Lumina-ERP.com",
  email: "Discovery@Lumina-ERP.com",
  location: "Humble, TX",
  locationFull: "Based in Humble, TX. Serving distributors nationwide.",
  founder: "Lumina ERP Team",
  copyright: `\u00A9 ${new Date().getFullYear()} Lumina Erp. All rights reserved.`,
  footerDescription:
    "Expert ERP consulting for wholesale distributors. From Prophet 21 and Epicor Kinetic to custom integrations and cloud migration, we illuminate the path to ERP excellence.",
} as const;

// ─── Navigation ───────────────────────────────────────────────────────────────

export const nav = {
  links: [
    { label: "Services", href: "/services" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "About", href: "/about" },
    { label: "Roadmap", href: "/roadmap" },
  ],
  cta: { label: "Free Consultation", href: "/contact" },
} as const;

// ─── Homepage ─────────────────────────────────────────────────────────────────

export const homepage = {
  hero: {
    headline: "Stop Losing Revenue to\nBroken ERP Workflows",
    subheadline:
      "Expert ERP consulting for wholesale distributors and beyond. From Prophet 21 and Epicor Kinetic to custom integrations and cloud migration, we illuminate the path to ERP excellence.",
    primaryCta: { label: "Schedule a Free Consultation", href: "/contact" },
    secondaryCta: { label: "View Case Studies", href: "/case-studies" },
  },
  trustBar: {
    metrics: [
      { value: "150x", label: "Performance Improvement" },
      { value: "100K+", label: "Product Operations" },
      { value: "140x", label: "API Call Reduction" },
    ],
  },
  metrics: {
    heading: "Proven Results from Real ERP Projects",
    items: [
      { value: 150, suffix: "x", label: "Performance Improvement" },
      { value: 100, suffix: "K+", label: "Large-Scale Product Operations" },
      { value: 140, suffix: "x", label: "API Call Reduction" },
      { value: 5, suffix: "+", label: "Production Business Rules" },
    ],
  },
  featuredProjects: {
    heading: "Featured ERP Projects",
    subheading: "Real-world optimizations delivering measurable performance gains and operational efficiency.",
    projects: [
      {
        title: "E-Commerce Order Integration",
        challenge: "Marketplace order sync failing with high-volume batches due to API rate limits and data validation gaps",
        solution: "Custom middleware with intelligent batching, retry logic, and field validation",
        results: [
          { label: "Performance", value: "150x faster", detail: "vs previous approach" },
          { label: "Orders", value: "2,000+", detail: "processed per batch" },
          { label: "Accuracy", value: "99.8%", detail: "success rate" },
        ],
        tech: ["C# .NET", "DynaChange", "Marketplace APIs (Amazon, Shopify, etc.)"],
      },
      {
        title: "Bulk Catalog Sync",
        challenge: "Manual product updates taking hours across large multi-channel catalogs",
        solution: "Automated workflow with batch processing, rate limiting, and error recovery",
        results: [
          { label: "Products", value: "100K+", detail: "synced automatically" },
          { label: "API Calls", value: "140x less", detail: "optimized batch processing" },
          { label: "Time Saved", value: "85%", detail: "reduction in manual effort" },
        ],
        tech: ["n8n", "REST API", "PostgreSQL", "Rate Limiting"],
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
      "Whether you need a quick fix or a full migration plan, we bring hands-on ERP expertise to every engagement.",
    cards: [
      {
        icon: "advisory",
        title: "Strategy & Advisory",
        description:
          "ERP health checks, migration planning, and configuration audits. We find what's slowing your system down and build a roadmap to fix it.",
        link: { label: "Learn More", href: "/services#service-quiz" },
      },
      {
        icon: "development",
        title: "Custom Development",
        description:
          "Business rules, SSRS reports, SQL optimization, and API integrations. Real code from a team that writes it daily in production ERP environments.",
        link: { label: "Learn More", href: "/services#extensions" },
      },
      {
        icon: "cloud",
        title: "Cloud Migration",
        description:
          "Whether it's P21 to Kinetic, on-prem to cloud, or a full platform switch -- we audit your customizations, plan the timeline, and guide the transition.",
        link: { label: "Learn More", href: "/services#migration" },
      },
      {
        icon: "managed",
        title: "Managed Support",
        description:
          "Monthly retainers starting at $625/mo. Guaranteed availability, priority response, and a dedicated ERP expert on call when you need one.",
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
      "The Lumina team understood our ERP setup from day one. No ramp-up time, no hand-holding -- just results.",
    attribution: "Operations Manager, Regional HVAC Distributor",
    link: {
      label: "Read Full Case Study",
      href: "/case-studies/hvac-distributor",
    },
  },
  socialProof: {
    heading: "Results We've Delivered",
    subheading:
      "Real metrics from real ERP projects. No vague promises -- just measurable outcomes.",
    footerCta: {
      label: "See All Case Studies",
      href: "/case-studies",
      note: "These are just the highlights. We've solved dozens of ERP challenges across multiple distribution verticals.",
    },
    stories: [
      {
        metric: { value: 150, suffix: "x", label: "Performance Improvement" },
        title: "E-Commerce Order Integration",
        problem:
          "Marketplace order sync failing with high-volume batches due to API rate limits and data validation gaps.",
        solution:
          "We built custom middleware with intelligent batching, retry logic, and field validation -- eliminating integration failures and data loss.",
        result: "150x faster than the previous approach, with 99.8% success rate across 2,000+ orders per batch.",
        tech: ["C# .NET", "DynaChange", "Marketplace APIs (Amazon, Shopify, etc.)"],
        accent: "primary" as const,
      },
      {
        metric: { value: 60, suffix: "%", label: "Faster Order Processing" },
        title: "HVAC Distribution Workflow",
        problem:
          "Order processing consuming 45 minutes per order due to manual validation steps.",
        solution:
          "We automated critical workflow checkpoints and optimized P21 business rules for real-time validation.",
        result: "Cut order processing from 45 minutes to 18 minutes -- a 60% reduction.",
        tech: ["P21 Business Rules", "SQL Server", "Workflow Automation"],
        link: { label: "Read Case Study", href: "/case-studies/hvac-distributor" },
        accent: "violet" as const,
      },
      {
        metric: { value: 85, suffix: "%", label: "Time Saved" },
        title: "Bulk Catalog Sync Automation",
        problem:
          "Manual product updates taking hours across large multi-channel catalogs.",
        solution:
          "We built an automated workflow with intelligent batching, rate limiting, and error recovery -- syncing 100K+ products without intervention.",
        result: "85% reduction in manual effort with 140x fewer API calls.",
        tech: ["n8n", "REST API", "PostgreSQL"],
        accent: "success" as const,
      },
    ],
  },
  bottomCta: {
    heading: "Ready to Illuminate Your ERP?",
    subheading:
      "Schedule a free 30-minute consultation. We'll review your setup and tell you exactly where the opportunities are -- no sales pitch, just straight talk.",
    cta: { label: "Schedule a Free Consultation", href: "/contact" },
  },
} as const;

// ─── Services ─────────────────────────────────────────────────────────────────

export const services = {
  hero: {
    headline: "ERP Expertise That Delivers Results",
    subheadline:
      "Production-tested ERP solutions backed by real code, proven performance metrics, and deep technical expertise. From business rules and workflow automation to API integrations -- we build solutions that work in the real world.",
  },
  transparency: {
    badge: "Radically Transparent",
    headline: "We Publish Our Prices. Every Single One.",
    subheadline:
      "In an industry where every consultant hides behind \"Contact Us for Pricing,\" we put our rates right here on this page. Your budget shouldn't be a guessing game.",
    comparisonHeadline: "See the Difference",
    comparisonItems: [
      { them: "\"Contact us for a custom quote\"", us: "Published rates. Fixed quotes before work begins." },
      { them: "\"Pricing varies by engagement\"", us: "Transparent project pricing upfront." },
      { them: "\"Let's schedule a call to discuss\"", us: "Flexible plans from 5 to 40 hrs/mo." },
      { them: "\"Depends on complexity\"", us: "Scope-based fixed quotes. No surprises." },
    ],
    trustSignals: [
      { icon: "lock", label: "No Hidden Fees", detail: "The price we quote is the price you pay" },
      { icon: "calendar", label: "Flexible Plans", detail: "Support plans that scale with your needs" },
      { icon: "shield", label: "Fixed-Price Projects", detail: "Scope creep? That's on us, not you" },
      { icon: "refresh", label: "Satisfaction Guaranteed", detail: "30-90 day warranty on all deliverables" },
    ],
    pullQuote: "We believe if you can't tell someone what it costs before they sign, you're not confident in your value. We are.",
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
        "Custom P21 business rules that automate workflows, enforce validation, and integrate with external systems -- without modifying core P21 code. Built against the DynaChange Extensibility Suite with production-tested patterns.",
      includes: [
        "C# .NET business rules (Validators, Converters, On Event, On Demand)",
        "P21 Transaction API integration for quote/order automation",
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
    },
    {
      id: "integrations",
      icon: "integration",
      title: "API & ERP Integration Services",
      description:
        "Connect your ERP to e-commerce platforms, marketplaces, CRMs, and third-party systems. We build custom API integrations and n8n automation workflows with proven patterns delivering significant performance improvements.",
      includes: [
        "n8n workflow development with visual automation editor",
        "Bi-directional data sync (orders, tracking, pricing, inventory)",
        "ERP-to-marketplace connectors (Amazon, Wayfair, Shopify, and more)",
        "Batch API processing (25-50 items per request for optimal performance)",
        "OAuth2 token management and refresh automation",
        "Retry logic with exponential backoff (up to 10 attempts)",
        "Error handling workflows with database logging",
        "n8n workflow JSON export and documentation",
        "30-day post-deployment support",
      ],
      timeline: "1-3 weeks per integration",
      pricing: "$2,000 - $15,000 per integration",
      cta: { label: "Schedule Integration Discovery", href: "/contact" },
    },
    {
      id: "database",
      icon: "reporting",
      title: "Database Optimization & Performance",
      description:
        "Make your ERP reports load 10x faster without upgrading hardware. Expert SQL query optimization, indexing strategies, and database performance tuning for Crystal Reports, SSRS, Power BI, and custom queries across any SQL Server-backed ERP.",
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
    },
    {
      id: "warehouse",
      icon: "advisory",
      title: "Warehouse Automation Solutions",
      description:
        "Automate pick ticket routing, bin allocation, and shipping workflows without expensive WMS platforms. Quantity-based logic, carrier validation, and RF scanner integration built on your existing ERP.",
      includes: [
        "Quantity-based bin routing (eaches vs. pallet bin logic)",
        "Carrier auto-assignment and validation rules",
        "Pick ticket validation before printing/processing",
        "Shipping label integration (UPS WorldShip, FedEx Ship Manager, and more)",
        "Dynamic bin allocation based on configurable thresholds",
        "Configuration portal for warehouse managers",
        "SQL triggers or n8n automation (client choice)",
        "Custom audit tables and reporting",
        "Pilot deployment with success metrics",
        "60-day warranty on automation logic",
      ],
      timeline: "1-3 weeks per automation",
      pricing: "$2,000 - $8,000 per automation",
      cta: { label: "Request Warehouse Consultation", href: "/contact" },
    },
    {
      id: "portals",
      icon: "cloud",
      title: "Custom Portal Development",
      description:
        "Customer-facing portals that pull live pricing, availability, and order history from your ERP without exposing the backend. Modern web interfaces with mobile-optimized responsive design.",
      includes: [
        "Responsive web portal (HTML/CSS/JavaScript)",
        "Customer-specific contract pricing via ERP APIs",
        "Real-time inventory availability lookups",
        "Order history and tracking information",
        "Quote request forms integrated with your ERP",
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
    },
    {
      id: "support",
      icon: "managed",
      title: "System Administration & Support",
      description:
        "Predictable monthly support with guaranteed response times and proactive monitoring. Like having an ERP expert on speed dial -- no emergency rates, no surprises.",
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
          "A free 30-minute call to understand your ERP setup, pain points, and goals. No sales pitch -- just honest assessment.",
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
    subheadline:
      "You've seen our prices. No surprises left. Book a free 30-minute call and we'll tell you exactly which service fits your situation -- even if the answer is 'you don't need a consultant for this.'",
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
    greeting: "Our Team",
    paragraphs: [
      "Lumina ERP was built on a simple idea: ERP consulting should come from people who actually use the system every day. Our team includes working ERP administrators at wholesale distribution companies -- managing inventory, processing orders, writing business rules, and keeping enterprise systems running for real operations.",
      "We specialize in Prophet 21 and the broader Epicor ecosystem, but our expertise extends across ERP platforms. Whether you're running P21, Kinetic, SAP Business One, NetSuite, or a custom-built system -- we understand the patterns, the pain points, and the shortcuts that only come from daily hands-on experience.",
      "We started this practice because we kept seeing the same pattern: companies struggling with ERP problems that had already been solved in real production environments. They'd hire a big consulting firm, get a junior consultant who'd never actually run a distribution operation, and end up with a solution that looked good on paper but didn't survive the first busy season.",
      "We're developers, too. C#, SQL, Python -- we write code that automates the tedious stuff, integrates your systems, and gives you data you can actually act on. From cloud migrations to API integrations, we help companies modernize their ERP stack without disrupting operations.",
    ],
  },
  skills: {
    heading: "What We Bring to the Table",
    categories: [
      {
        title: "ERP Platforms",
        items: [
          "Prophet 21 (Specialty)",
          "Epicor Kinetic",
          "SAP Business One",
          "NetSuite",
          "System Administration",
        ],
      },
      {
        title: "Development",
        items: [
          "C# .NET Business Rules",
          "SQL Server & SSRS",
          "Python Automation",
          "REST API Development",
          "Workflow Automation",
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
      label: "Production ERP Use",
      detail: "Not project-based exposure -- hands-on administration of live enterprise systems every single day.",
    },
    {
      metric: "Full Stack",
      label: "Development Team",
      detail: "C#, SQL, Python, REST APIs -- we write the code, not just configure screens.",
    },
    {
      metric: "Multi-Platform",
      label: "ERP Expertise",
      detail:
        "P21 specialists with broad ERP experience. We know the inventory headaches, pricing edge cases, and reporting gaps across platforms.",
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
    text: "Based in Humble, TX (Houston metro), serving companies nationwide. Our team combines deep ERP expertise -- with a specialty in Prophet 21 -- with a passion for automation and pushing the boundaries of what enterprise systems can do.",
  },
  cta: {
    heading: "Let's See If We're a Good Fit",
    subheading:
      "Schedule a free 30-minute call. No pressure, no sales pitch -- just a conversation about your ERP challenges.",
    cta: { label: "Schedule a Call", href: "/contact" },
  },
} as const;

// ─── Contact ──────────────────────────────────────────────────────────────────

export const contact = {
  hero: {
    headline: "Let's Talk ERP",
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
          "ERP Health Check / Audit",
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
          "Tell us about your ERP environment and what you're looking to solve. The more context, the better we can help.",
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
          "A 30-minute video call where we ask about your ERP setup, your pain points, and what you're trying to accomplish. We'll give you honest feedback on where we see opportunities -- and whether we're the right fit to help.",
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
          "That's what the discovery call is for. We'll ask the right questions to figure out where your biggest opportunities are. An ERP Health Check ($2,500-$5,000) is also a great starting point -- it gives us all a clear picture of your system's state.",
      },
      {
        question: "Can you help with the Kinetic UI transition?",
        answer:
          "Yes. Epicor is discontinuing the Classic UI in Kinetic 2026.1 (May 2026). We help with compatibility testing, user retraining, and making sure your customizations work in the new browser-based interface.",
      },
    ],
  },
} as const;

// ─── Case Studies Page ───────────────────────────────────────────────────────

export const caseStudiesPage = {
  hero: {
    headline: "Real Results from\nReal Distributors",
    subheadline:
      "Every project below solved a real problem in a real production ERP environment. No hypotheticals, no lab tests -- just measurable outcomes from live systems.",
  },
  aggregateMetrics: [
    { value: "60%", label: "Avg. Process Time Reduction" },
    { value: "150x", label: "Best Performance Gain" },
    { value: "100%", label: "Client Satisfaction" },
  ],
  portfolioCta: {
    heading: "These Are Just the Highlights",
    subheading:
      "Every company's ERP environment is unique -- different modules, different integrations, different pain points. We've solved dozens of challenges across HVAC, electrical, plumbing, and industrial supply. The projects above represent a sample of what we do.",
    emphasis:
      "Want to see how we've handled challenges similar to yours? Let's talk.",
    cta: { label: "Discuss Your ERP Challenges", href: "/contact" },
    secondaryCta: { label: "Or email us directly", href: "mailto:Discovery@Lumina-ERP.com" },
  },
  industryNote: {
    heading: "We Work Across Distribution Verticals",
    industries: [
      "HVAC Distribution",
      "Electrical Supply",
      "Plumbing & Pipe",
      "Industrial Supply",
      "Fastener Distribution",
      "Safety & Janitorial",
    ],
    note: "Each vertical has unique ERP challenges. Our hands-on experience means faster solutions with fewer surprises.",
  },
  midPageCta: {
    text: "Seeing results you want for your operation?",
    cta: { label: "Schedule a Free Consultation", href: "/contact" },
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
        { label: "Roadmap", href: "/roadmap" },
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
          href: "https://www.linkedin.com/company/lumina-erp/",
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
