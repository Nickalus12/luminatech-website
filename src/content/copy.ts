// Lumina ERP - Website Copy
// All website copy as typed constants for page builders to import

// ─── Brand ────────────────────────────────────────────────────────────────────

export const brand = {
  name: "Lumina ERP",
  tagline: "Illuminate your ERP potential.",
  domain: "Lumina-ERP.com",
  email: "Nickalus@Lumina-ERP.com",
  location: "Humble, TX",
  locationFull: "Based in Humble, TX. Serving distributors nationwide.",
  founder: "Nick Brewer",
  copyright: `\u00A9 ${new Date().getFullYear()} Lumina ERP. All rights reserved.`,
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
      { value: "10+", label: "Years P21 Experience" },
      { value: "50+", label: "Projects Delivered" },
      { value: "100%", label: "Real Distribution Results" },
    ],
  },
  metrics: {
    heading: "Results That Speak for Themselves",
    items: [
      { value: 10, suffix: "+", label: "Years with Prophet 21" },
      { value: 50, suffix: "+", label: "Projects Delivered" },
      { value: 60, suffix: "%", label: "Avg Time Saved" },
      { value: 99, suffix: "%", label: "Client Satisfaction" },
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
    headline: "Services",
    subheadline:
      "Hands-on Prophet 21 consulting from practitioners who use the system every day. No junior staff, no hand-offs -- you work directly with our lead consultant.",
  },
  anchors: [
    { label: "Advisory", href: "#advisory" },
    { label: "Development", href: "#development" },
    { label: "Migration", href: "#migration" },
    { label: "Reporting", href: "#reporting" },
    { label: "Integration", href: "#integration" },
    { label: "Support", href: "#support" },
  ],
  items: [
    {
      id: "advisory",
      icon: "advisory",
      title: "Strategy & Advisory",
      description:
        "Your P21 system is only as good as its configuration. We dig into your setup, find the bottlenecks, and build a prioritized plan to fix them. No vague recommendations -- you get a written report with specific actions and expected outcomes.",
      includes: [
        "Comprehensive P21 health check (configuration, performance, security)",
        "Written report with prioritized recommendations",
        "Migration readiness assessment",
        "Process optimization review",
        "ROI analysis for recommended changes",
      ],
      timeline: "1-2 days (Health Check) | 2-4 weeks (Migration Planning)",
      pricing: "Starting at $2,500",
      cta: { label: "Schedule a Health Check", href: "/contact" },
    },
    {
      id: "development",
      icon: "development",
      title: "Custom Development",
      description:
        "DynaChange visual rules, compiled C# .NET business rules, and custom workflows built by practitioners who write them in a production P21 environment daily. We know which approaches survive upgrades and which ones create technical debt.",
      includes: [
        "DynaChange visual business rules",
        "C# .NET compiled business rules",
        "Order entry automation and validation",
        "Pricing logic and approval workflows",
        "Custom stored procedures and triggers",
      ],
      timeline: "1-5 days per rule",
      pricing: "$500 - $5,000 per rule",
      cta: { label: "Discuss Your Project", href: "/contact" },
    },
    {
      id: "migration",
      icon: "cloud",
      title: "Cloud Migration",
      description:
        "Epicor is sunsetting on-prem P21. The final feature release hits May 2028, and active support ends June 2029. We help you audit your customizations, plan the timeline, test compatibility, and make the move without disrupting operations.",
      includes: [
        "Full customization audit and compatibility assessment",
        "Migration timeline and risk analysis",
        "Business rules remediation for cloud compatibility",
        "User retraining plan for Kinetic UI",
        "Go-live support and post-migration optimization",
      ],
      timeline: "2-4 weeks (planning) | 2-6 months (execution)",
      pricing: "Starting at $5,000",
      cta: { label: "Start Migration Planning", href: "/contact" },
    },
    {
      id: "reporting",
      icon: "reporting",
      title: "Reporting & Analytics",
      description:
        "If you're exporting to Excel to get the numbers you need, your reporting setup is broken. We build SSRS reports, SQL queries, and Power BI dashboards that pull real-time data directly from P21 -- no more stale spreadsheets.",
      includes: [
        "Custom SSRS report development",
        "SQL query optimization and creation",
        "Crystal Reports migration to SSRS",
        "Power BI dashboard setup",
        "Automated report scheduling and distribution",
      ],
      timeline: "1-3 days per report",
      pricing: "$1,500 - $5,000 per report",
      cta: { label: "Fix Your Reporting", href: "/contact" },
    },
    {
      id: "integration",
      icon: "integration",
      title: "Integration Development",
      description:
        "P21 doesn't exist in a vacuum. We build integrations with ecommerce platforms, CRMs, warehouse management systems, EDI providers, and custom APIs. Clean data flow in, clean data flow out.",
      includes: [
        "Ecommerce platform integration (Shopify, Magento, BigCommerce)",
        "CRM connectivity (Salesforce, HubSpot)",
        "WMS and barcode scanning integration",
        "EDI setup and troubleshooting",
        "Custom REST API development",
      ],
      timeline: "2-8 weeks",
      pricing: "Starting at $5,000",
      cta: { label: "Plan Your Integration", href: "/contact" },
    },
    {
      id: "support",
      icon: "managed",
      title: "Managed Support",
      description:
        "A dedicated P21 expert on retainer. Stop paying emergency rates when something breaks. Our retainer clients get guaranteed hours, priority response, and proactive monitoring -- like having a P21 admin on speed dial.",
      includes: [
        "Guaranteed monthly hours at discounted rates",
        "Priority response times",
        "Proactive system monitoring and optimization",
        "Business rules maintenance and updates",
        "Regular check-ins and system reviews",
      ],
      tiers: [
        {
          name: "Basic",
          hours: "5 hrs/mo",
          price: "$625/mo",
          features: ["Email support", "Minor fixes", "Quarterly check-in"],
        },
        {
          name: "Standard",
          hours: "10 hrs/mo",
          price: "$1,100/mo",
          features: [
            "Priority response",
            "Business rules maintenance",
            "Monthly review",
          ],
        },
        {
          name: "Premium",
          hours: "20 hrs/mo",
          price: "$2,000/mo",
          features: [
            "Same-day response",
            "Proactive monitoring",
            "Weekly touchpoint",
          ],
        },
        {
          name: "Dedicated",
          hours: "40 hrs/mo",
          price: "$3,600/mo",
          features: [
            "Embedded support",
            "Dedicated availability",
            "Full optimization",
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
    greeting: "Hey, I'm Nick Brewer.",
    paragraphs: [
      "I'm an ERP administrator at a wholesale distribution company in Houston. I use Prophet 21 every single day -- managing inventory, processing orders, writing business rules, building reports, and keeping the system running for a real distribution operation.",
      "I started Lumina ERP because I kept seeing the same thing: distributors struggling with P21 problems that I'd already solved at my own company. They'd hire a big consulting firm, get a junior consultant who'd never actually run a distribution operation, and end up with a solution that looked good on paper but didn't survive the first busy season.",
      "When you work with me, you're getting someone who lives inside P21. I know the workarounds, the gotchas, and the shortcuts that only come from daily hands-on experience. I don't implement and leave -- I build things that actually work in the real world of wholesale distribution.",
      "I'm also a developer. C#, SQL, Python -- I write code that automates the tedious stuff, integrates your systems, and gives you data you can actually act on. And with the mandatory cloud migration deadline approaching, I help distributors plan and execute their transition without disrupting operations.",
    ],
  },
  skills: {
    heading: "What I Bring to the Table",
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
      metric: "10+",
      label: "Years with Prophet 21",
      detail: "Daily production use, not just project-based exposure",
    },
    {
      metric: "Full Stack",
      label: "P21 Developer",
      detail: "C#, SQL, Python, APIs -- I write the code, not just configure",
    },
    {
      metric: "Real",
      label: "Distribution Operator",
      detail:
        "I run P21 at a live distributor. I know the inventory headaches, pricing edge cases, and reporting gaps firsthand.",
    },
  ],
  process: {
    heading: "How I Work",
    steps: [
      {
        title: "Discovery",
        description:
          "I listen first. A free 30-minute call to understand your setup, pain points, and goals.",
      },
      {
        title: "Blueprint",
        description:
          "Clear scope, fixed pricing, defined deliverables. You know exactly what you're getting.",
      },
      {
        title: "Execute",
        description:
          "I do the work with regular check-ins. No hand-offs, no junior staff -- just me.",
      },
      {
        title: "Optimize",
        description:
          "Post-delivery support to make sure everything works in production. Full documentation included.",
      },
    ],
  },
  personal: {
    text: "Based in Humble, TX (Houston metro), serving distributors nationwide. When I'm not elbow-deep in P21, I'm building electronics projects with my daughters and tinkering with AI automation.",
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
    name: "Lumina ERP",
    description: brand.footerDescription,
    tagline: brand.tagline,
  },
  columns: [
    {
      heading: "Services",
      links: [
        { label: "Strategy & Advisory", href: "/services#advisory" },
        { label: "Custom Development", href: "/services#development" },
        { label: "Cloud Migration", href: "/services#migration" },
        { label: "Reporting & Analytics", href: "/services#reporting" },
        { label: "Managed Support", href: "/services#support" },
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
          label: "Nickalus@Lumina-ERP.com",
          href: "mailto:Nickalus@Lumina-ERP.com",
        },
        {
          label: "LinkedIn",
          href: "https://linkedin.com/in/nickalus",
          external: true,
        },
        {
          label: "GitHub",
          href: "https://github.com/nickalus",
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
