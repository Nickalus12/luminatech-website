# Service Selector Tool - Technical Specification

## Overview
An interactive decision tree/quiz component that guides prospects to the most appropriate LuminaTech services based on their specific needs, capabilities, and constraints.

---

## Decision Flow Architecture

### Question Sequence

```
START
  ↓
Q1: Main Challenge
  ↓
Q2: Company Size / P21 Usage
  ↓
Q3: Technical Capability
  ↓
Q4: Timeline Urgency
  ↓
Q5: Budget Range
  ↓
RECOMMENDATION ENGINE
  ↓
RESULTS
```

---

## Question Definitions

### Q1: What's Your Main Challenge?

**Question Type:** Single Select (Radio Buttons)

**Options:**
- **Performance Issues** - "System slowdowns, timeout errors, or poor response times"
- **Integration Needs** - "Connecting P21 with other systems (eCommerce, CRM, EDI, etc.)"
- **Automation Opportunities** - "Manual processes that could be automated"
- **Custom Development** - "Specific functionality P21 doesn't provide out-of-box"
- **Support & Optimization** - "Need expert help managing and improving our P21 system"
- **Not Sure** - "Multiple challenges or need help identifying the issue"

**Scoring Logic:**
```javascript
{
  'performance': {
    services: ['database-optimization', 'system-audit', 'managed-services'],
    priority: 'high'
  },
  'integration': {
    services: ['api-integration', 'custom-development', 'automation'],
    priority: 'medium'
  },
  'automation': {
    services: ['automation', 'custom-development', 'managed-services'],
    priority: 'medium'
  },
  'custom-development': {
    services: ['custom-development', 'api-integration'],
    priority: 'medium'
  },
  'support': {
    services: ['managed-services', 'system-audit', 'training'],
    priority: 'low'
  },
  'not-sure': {
    services: ['system-audit'], // Start with audit to identify needs
    priority: 'high',
    skipToEnd: false // Continue with all questions
  }
}
```

---

### Q2: Company Size / P21 Usage Level

**Question Type:** Single Select (Radio Buttons)

**Options:**
- **Small** - "1-20 users, single location"
- **Medium** - "21-100 users, 2-5 locations"
- **Large** - "100+ users, multiple locations or complex operations"
- **Enterprise** - "500+ users, highly customized P21 environment"

**Scoring Logic:**
```javascript
{
  'small': {
    complexity: 1,
    recommendPackages: ['starter', 'essentials'],
    suggestManagedServices: false
  },
  'medium': {
    complexity: 2,
    recommendPackages: ['professional', 'growth'],
    suggestManagedServices: true
  },
  'large': {
    complexity: 3,
    recommendPackages: ['enterprise', 'custom'],
    suggestManagedServices: true,
    prioritize: ['scalability', 'reliability']
  },
  'enterprise': {
    complexity: 4,
    recommendPackages: ['custom', 'white-glove'],
    suggestManagedServices: true,
    requiresDiscovery: true
  }
}
```

---

### Q3: Technical Capability

**Question Type:** Single Select (Radio Buttons)

**Options:**
- **In-House Development Team** - "We have developers who can handle implementation"
- **Technical Staff (Non-Developers)** - "We have IT staff but not developers"
- **Limited Technical Resources** - "Small team, mostly business users"
- **No Technical Resources** - "Need fully managed/turnkey solution"

**Scoring Logic:**
```javascript
{
  'in-house-dev': {
    deliveryModel: 'consulting',
    includeTraining: true,
    includeDocumentation: true,
    suggestSelfService: true,
    supportLevel: 'standard'
  },
  'technical-staff': {
    deliveryModel: 'guided-implementation',
    includeTraining: true,
    includeDocumentation: true,
    suggestSelfService: false,
    supportLevel: 'enhanced'
  },
  'limited-technical': {
    deliveryModel: 'turnkey',
    includeTraining: true,
    includeDocumentation: true,
    suggestManagedServices: true,
    supportLevel: 'premium'
  },
  'no-technical': {
    deliveryModel: 'fully-managed',
    includeTraining: true,
    includeDocumentation: true,
    requireManagedServices: true,
    supportLevel: 'white-glove'
  }
}
```

---

### Q4: Timeline Urgency

**Question Type:** Single Select (Radio Buttons)

**Options:**
- **Critical** - "Need solution within 2 weeks"
- **Urgent** - "Need solution within 1-2 months"
- **Standard** - "Can implement within 3-6 months"
- **Flexible** - "No specific deadline, quality over speed"

**Scoring Logic:**
```javascript
{
  'critical': {
    timelineWeeks: 2,
    requiresExpedited: true,
    recommendAccelerator: true,
    limitComplexity: true,
    suggestPhased: false,
    rushFeeMultiplier: 1.5
  },
  'urgent': {
    timelineWeeks: 8,
    requiresExpedited: false,
    recommendAccelerator: true,
    limitComplexity: false,
    suggestPhased: true,
    rushFeeMultiplier: 1.25
  },
  'standard': {
    timelineWeeks: 24,
    requiresExpedited: false,
    recommendAccelerator: false,
    limitComplexity: false,
    suggestPhased: true,
    rushFeeMultiplier: 1.0
  },
  'flexible': {
    timelineWeeks: null,
    requiresExpedited: false,
    recommendAccelerator: false,
    limitComplexity: false,
    suggestPhased: true,
    allowDiscounts: true,
    rushFeeMultiplier: 0.9
  }
}
```

---

### Q5: Budget Range

**Question Type:** Single Select (Radio Buttons)

**Options:**
- **Under $5K** - "Small project or specific task"
- **$5K - $15K** - "Single service or small integration"
- **$15K - $50K** - "Major integration or ongoing support"
- **$50K+** - "Enterprise solution or multiple services"
- **Not Sure** - "Need help understanding investment level"

**Scoring Logic:**
```javascript
{
  'under-5k': {
    budgetMin: 0,
    budgetMax: 5000,
    recommendServices: ['single-report', 'small-automation', 'training-session'],
    excludeServices: ['managed-services-annual', 'enterprise-integration'],
    suggestPhased: true
  },
  '5k-15k': {
    budgetMin: 5000,
    budgetMax: 15000,
    recommendServices: ['automation-package', 'api-integration', 'database-optimization'],
    excludeServices: ['enterprise-integration', 'white-glove-support'],
    suggestPhased: false
  },
  '15k-50k': {
    budgetMin: 15000,
    budgetMax: 50000,
    recommendServices: ['managed-services', 'major-integration', 'custom-modules'],
    excludeServices: [],
    suggestPhased: false
  },
  '50k-plus': {
    budgetMin: 50000,
    budgetMax: null,
    recommendServices: ['enterprise-solutions', 'white-glove', 'multi-service-packages'],
    excludeServices: [],
    suggestPhased: false,
    includeStrategySession: true
  },
  'not-sure': {
    budgetMin: null,
    budgetMax: null,
    recommendConsultation: true,
    showAllOptions: true,
    prioritizeByNeed: true
  }
}
```

---

## Recommendation Engine Algorithm

### Service Catalog with Metadata

```javascript
const services = {
  'database-optimization': {
    name: 'Database Performance Optimization',
    basePrice: 8000,
    timeline: '2-4 weeks',
    complexity: 2,
    bestFor: ['performance', 'support'],
    companySize: ['medium', 'large', 'enterprise'],
    technicalLevel: ['any'],
    deliverables: [
      'Performance audit report',
      'Query optimization',
      'Index tuning',
      'Configuration recommendations',
      'Monitoring setup'
    ],
    tags: ['performance', 'technical', 'one-time']
  },

  'api-integration': {
    name: 'API Integration Development',
    basePrice: 12000,
    timeline: '4-8 weeks',
    complexity: 3,
    bestFor: ['integration', 'automation'],
    companySize: ['medium', 'large', 'enterprise'],
    technicalLevel: ['in-house-dev', 'technical-staff'],
    deliverables: [
      'Custom API endpoints',
      'Integration middleware',
      'Error handling & logging',
      'Documentation',
      'Testing suite'
    ],
    tags: ['integration', 'custom', 'ongoing']
  },

  'automation-studio': {
    name: 'Automation Studio Implementation',
    basePrice: 6000,
    timeline: '2-3 weeks',
    complexity: 1,
    bestFor: ['automation', 'performance'],
    companySize: ['small', 'medium', 'large'],
    technicalLevel: ['any'],
    deliverables: [
      'Workflow automation (up to 5 processes)',
      'DynaChange business rules',
      'Testing & validation',
      'User training',
      'Documentation'
    ],
    tags: ['automation', 'turnkey', 'quick-win']
  },

  'custom-development': {
    name: 'Custom Module Development',
    basePrice: 15000,
    timeline: '6-12 weeks',
    complexity: 4,
    bestFor: ['custom-development', 'integration'],
    companySize: ['medium', 'large', 'enterprise'],
    technicalLevel: ['in-house-dev', 'technical-staff'],
    deliverables: [
      'Custom P21 module',
      'Source code',
      'Installation package',
      'Technical documentation',
      'Support & maintenance plan'
    ],
    tags: ['custom', 'complex', 'long-term']
  },

  'managed-services': {
    name: 'Managed Services - Ongoing Support',
    basePrice: 2500, // per month
    timeline: 'Ongoing',
    complexity: 2,
    bestFor: ['support', 'performance', 'automation'],
    companySize: ['medium', 'large', 'enterprise'],
    technicalLevel: ['limited-technical', 'no-technical'],
    deliverables: [
      'Proactive monitoring',
      'Monthly optimization',
      'Priority support',
      'Regular health checks',
      'Quarterly strategy sessions'
    ],
    tags: ['support', 'ongoing', 'peace-of-mind'],
    pricingModel: 'monthly'
  },

  'system-audit': {
    name: 'P21 System Audit & Roadmap',
    basePrice: 4500,
    timeline: '1-2 weeks',
    complexity: 1,
    bestFor: ['not-sure', 'support', 'performance'],
    companySize: ['any'],
    technicalLevel: ['any'],
    deliverables: [
      'Comprehensive system audit',
      'Performance assessment',
      'Security review',
      'Optimization opportunities',
      '12-month improvement roadmap'
    ],
    tags: ['discovery', 'quick', 'strategic']
  },

  'ecommerce-integration': {
    name: 'eCommerce Platform Integration',
    basePrice: 18000,
    timeline: '6-10 weeks',
    complexity: 4,
    bestFor: ['integration', 'automation'],
    companySize: ['medium', 'large', 'enterprise'],
    technicalLevel: ['technical-staff', 'limited-technical'],
    deliverables: [
      'Real-time inventory sync',
      'Order import automation',
      'Customer data synchronization',
      'Pricing & availability updates',
      'Admin dashboard'
    ],
    tags: ['integration', 'ecommerce', 'high-value']
  },

  'reporting-package': {
    name: 'Custom Reporting Package',
    basePrice: 3500,
    timeline: '1-3 weeks',
    complexity: 1,
    bestFor: ['support', 'custom-development'],
    companySize: ['any'],
    technicalLevel: ['any'],
    deliverables: [
      'Up to 10 custom reports',
      'Crystal Reports or SSRS',
      'Automated scheduling',
      'Export templates',
      'User training'
    ],
    tags: ['reporting', 'quick-win', 'affordable']
  },

  'training-program': {
    name: 'P21 Power User Training',
    basePrice: 2000,
    timeline: '1 week',
    complexity: 1,
    bestFor: ['support'],
    companySize: ['any'],
    technicalLevel: ['any'],
    deliverables: [
      '8 hours of training',
      'Custom training materials',
      'Best practices guide',
      'Follow-up support (30 days)',
      'Certification'
    ],
    tags: ['training', 'quick', 'foundational']
  }
};
```

### Scoring Algorithm

```javascript
function calculateRecommendations(answers) {
  const {
    mainChallenge,
    companySize,
    technicalCapability,
    timeline,
    budget
  } = answers;

  // Initialize scoring object
  const scores = {};

  // Step 1: Filter services by main challenge
  const challengeConfig = Q1_SCORING[mainChallenge];
  let eligibleServices = challengeConfig.services;

  // Step 2: Score each eligible service
  eligibleServices.forEach(serviceId => {
    const service = services[serviceId];
    let score = 0;

    // Challenge alignment (40 points)
    if (service.bestFor.includes(mainChallenge)) {
      score += 40;
    }

    // Company size fit (20 points)
    if (service.companySize.includes(companySize) ||
        service.companySize.includes('any')) {
      score += 20;
    }

    // Technical capability match (15 points)
    if (service.technicalLevel.includes(technicalCapability) ||
        service.technicalLevel.includes('any')) {
      score += 15;
    }

    // Timeline compatibility (15 points)
    const timelineConfig = Q4_SCORING[timeline];
    const serviceWeeks = parseTimeline(service.timeline);
    if (serviceWeeks <= timelineConfig.timelineWeeks || !timelineConfig.timelineWeeks) {
      score += 15;
    } else {
      score += Math.max(0, 15 - (serviceWeeks - timelineConfig.timelineWeeks));
    }

    // Budget fit (10 points)
    const budgetConfig = Q5_SCORING[budget];
    if (budget === 'not-sure') {
      score += 5; // Neutral score
    } else {
      const adjustedPrice = calculateAdjustedPrice(service, answers);
      if (adjustedPrice >= budgetConfig.budgetMin &&
          (adjustedPrice <= budgetConfig.budgetMax || !budgetConfig.budgetMax)) {
        score += 10;
      } else if (adjustedPrice < budgetConfig.budgetMin) {
        score += 5; // Under budget is okay
      }
    }

    scores[serviceId] = {
      score,
      service,
      adjustedPrice: calculateAdjustedPrice(service, answers),
      estimatedTimeline: calculateAdjustedTimeline(service, answers),
      fit: categorizeFit(score)
    };
  });

  // Step 3: Sort and categorize recommendations
  const sortedServices = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score);

  return {
    primary: sortedServices.slice(0, 1).map(([id, data]) => ({
      id,
      ...data,
      reason: generateRecommendationReason(id, data, answers, 'primary')
    })),
    secondary: sortedServices.slice(1, 3).map(([id, data]) => ({
      id,
      ...data,
      reason: generateRecommendationReason(id, data, answers, 'secondary')
    })),
    additional: sortedServices.slice(3, 6).map(([id, data]) => ({
      id,
      ...data,
      reason: generateRecommendationReason(id, data, answers, 'additional')
    })),
    bundles: generateBundleRecommendations(sortedServices, answers)
  };
}

function calculateAdjustedPrice(service, answers) {
  let price = service.basePrice;

  // Apply complexity multiplier based on company size
  const sizeMultipliers = {
    'small': 1.0,
    'medium': 1.2,
    'large': 1.5,
    'enterprise': 2.0
  };
  price *= sizeMultipliers[answers.companySize];

  // Apply rush fee if applicable
  const timelineConfig = Q4_SCORING[answers.timeline];
  price *= timelineConfig.rushFeeMultiplier;

  // Apply technical capability discount/premium
  const techMultipliers = {
    'in-house-dev': 0.9, // Discount for self-service
    'technical-staff': 1.0,
    'limited-technical': 1.15,
    'no-technical': 1.3 // Premium for fully managed
  };
  price *= techMultipliers[answers.technicalCapability];

  return Math.round(price);
}

function calculateAdjustedTimeline(service, answers) {
  const baseTimeline = parseTimeline(service.timeline);

  // Adjust for company size complexity
  const sizeMultipliers = {
    'small': 1.0,
    'medium': 1.2,
    'large': 1.4,
    'enterprise': 1.8
  };

  const adjustedWeeks = Math.ceil(baseTimeline * sizeMultipliers[answers.companySize]);

  return formatTimeline(adjustedWeeks);
}

function generateRecommendationReason(serviceId, data, answers, tier) {
  const service = data.service;
  const reasons = [];

  // Challenge-specific reasoning
  if (answers.mainChallenge === 'performance' && service.tags.includes('performance')) {
    reasons.push('Directly addresses your performance challenges');
  }

  if (answers.mainChallenge === 'integration' && service.tags.includes('integration')) {
    reasons.push('Specialized in system integration');
  }

  // Budget reasoning
  if (tier === 'primary' && data.score >= 80) {
    reasons.push('Best overall fit for your needs and constraints');
  }

  // Timeline reasoning
  if (answers.timeline === 'critical' && service.tags.includes('quick-win')) {
    reasons.push('Can be delivered within your urgent timeline');
  }

  // Technical capability reasoning
  if (answers.technicalCapability === 'no-technical' && service.tags.includes('turnkey')) {
    reasons.push('Fully managed solution requiring minimal technical resources');
  }

  return reasons.join('. ') + '.';
}

function generateBundleRecommendations(sortedServices, answers) {
  const bundles = [];

  // Performance + Managed Services Bundle
  if (answers.mainChallenge === 'performance' && answers.companySize !== 'small') {
    const dbOptimization = sortedServices.find(([id]) => id === 'database-optimization');
    const managedServices = sortedServices.find(([id]) => id === 'managed-services');

    if (dbOptimization && managedServices) {
      bundles.push({
        name: 'Performance & Peace of Mind Package',
        services: ['database-optimization', 'managed-services'],
        totalPrice: dbOptimization[1].adjustedPrice + (managedServices[1].adjustedPrice * 12),
        savings: 2000,
        description: 'Optimize now, stay optimized forever with ongoing monitoring and support.'
      });
    }
  }

  // Integration Starter Bundle
  if (answers.mainChallenge === 'integration' && answers.budget !== 'under-5k') {
    bundles.push({
      name: 'Integration Starter Package',
      services: ['system-audit', 'api-integration'],
      totalPrice: 15000,
      savings: 1500,
      description: 'Comprehensive audit followed by custom integration development.'
    });
  }

  return bundles;
}

function categorizeFit(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'possible';
}
```

---

## UI/UX Specification

### Component Structure

```
ServiceSelector/
├── index.tsx                  # Main container component
├── QuestionCard.tsx          # Individual question display
├── ProgressIndicator.tsx     # Progress bar/stepper
├── ResultsDisplay.tsx        # Recommendation results
├── ServiceCard.tsx           # Individual service recommendation
├── BundleCard.tsx           # Bundle recommendation
└── styles.module.css         # Component styles
```

### React Component Architecture

```typescript
// Main Component State
interface SelectorState {
  currentStep: number;
  answers: {
    mainChallenge?: string;
    companySize?: string;
    technicalCapability?: string;
    timeline?: string;
    budget?: string;
  };
  recommendations?: RecommendationResults;
  showResults: boolean;
}

// Question Configuration
interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single-select' | 'multi-select';
  options: QuestionOption[];
  helpText?: string;
}

interface QuestionOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
}

// Recommendation Results
interface RecommendationResults {
  primary: ServiceRecommendation[];
  secondary: ServiceRecommendation[];
  additional: ServiceRecommendation[];
  bundles: BundleRecommendation[];
}

interface ServiceRecommendation {
  id: string;
  name: string;
  score: number;
  fit: 'excellent' | 'good' | 'fair' | 'possible';
  adjustedPrice: number;
  estimatedTimeline: string;
  deliverables: string[];
  tags: string[];
  reason: string;
  service: Service;
}
```

### Visual Design Specifications

#### Question Cards
- **Layout:** Centered card with max-width 800px
- **Options:** Large clickable cards (min 120px height)
- **Spacing:** 16px between options
- **Hover State:** Subtle elevation + border color change
- **Selected State:** Primary color border (3px), subtle background tint
- **Icons:** 48px icons for each option (optional)
- **Typography:**
  - Question title: 24px bold
  - Option label: 18px semi-bold
  - Option description: 14px regular, muted color

#### Progress Indicator
- **Style:** Linear progress bar + step counter
- **Position:** Top of card, sticky
- **Steps:** "1 of 5", "2 of 5", etc.
- **Progress Bar:** Animated transitions between steps
- **Colors:** Gray background, primary color for progress

#### Results Display

**Primary Recommendation Section:**
- **Prominence:** Large featured card with "Recommended For You" badge
- **Content:**
  - Service name (28px bold)
  - Fit score badge ("98% Match" with color coding)
  - Price range (24px, highlighted)
  - Timeline estimate (with calendar icon)
  - "Why this fits" explanation (3-4 bullet points)
  - Key deliverables (expandable list)
  - CTA: "Get Started" button (prominent)

**Secondary Recommendations:**
- **Layout:** 2-column grid (1 column on mobile)
- **Card Size:** Medium cards with essential info
- **Content:** Name, price, timeline, fit score, brief reason
- **CTA:** "Learn More" button

**Bundle Recommendations:**
- **Style:** Distinctive cards with "Bundle Deal" badge
- **Content:** Bundle name, included services, total price, savings amount
- **Visual:** Show included service icons/logos
- **CTA:** "View Bundle Details" button

#### Responsive Breakpoints
- **Desktop:** 1200px+ (full layout)
- **Tablet:** 768px-1199px (adjusted columns)
- **Mobile:** <768px (single column, simplified)

---

## Implementation Checklist

### Phase 1: Core Logic (Week 1)
- [ ] Define question configuration objects
- [ ] Implement service catalog with metadata
- [ ] Build scoring algorithm
- [ ] Create price/timeline adjustment functions
- [ ] Write recommendation reason generator
- [ ] Unit tests for scoring logic

### Phase 2: UI Components (Week 2)
- [ ] Build ServiceSelector container
- [ ] Create QuestionCard component
- [ ] Implement ProgressIndicator
- [ ] Build ServiceCard component
- [ ] Create BundleCard component
- [ ] Implement ResultsDisplay

### Phase 3: Integration (Week 3)
- [ ] Connect to CMS/service catalog API
- [ ] Add analytics tracking
- [ ] Implement lead capture form
- [ ] Add "Schedule Consultation" CTA integration
- [ ] Email notification to sales team

### Phase 4: Polish & Testing (Week 4)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Load testing with various answer combinations
- [ ] A/B testing setup for conversion optimization

---

## Analytics & Tracking

### Events to Track
1. **Selector Started:** User begins quiz
2. **Question Answered:** Track each answer selection
3. **Question Skipped:** If back button used
4. **Results Viewed:** User reaches recommendation screen
5. **Service Clicked:** User clicks on recommended service
6. **Bundle Clicked:** User clicks on bundle
7. **CTA Clicked:** "Get Started", "Schedule Consultation", etc.
8. **Form Submitted:** Lead capture completed
9. **Selector Abandoned:** User exits before completion

### Data to Capture
```javascript
{
  sessionId: 'uuid',
  timestamp: 'ISO-8601',
  answers: {
    mainChallenge: 'value',
    companySize: 'value',
    technicalCapability: 'value',
    timeline: 'value',
    budget: 'value'
  },
  recommendations: {
    primary: 'service-id',
    primaryScore: 85,
    secondary: ['service-id-1', 'service-id-2']
  },
  interactions: [
    { action: 'service-clicked', serviceId: 'database-optimization', timestamp: '' }
  ],
  converted: boolean,
  leadInfo: { email, company, etc. }
}
```

---

## CTA Integration Points

### During Quiz
- **After Q3:** "Need help deciding? Schedule a free consultation" (subtle banner)

### Results Page
1. **Primary CTA:** "Get Started with [Service Name]" → Lead form
2. **Secondary CTA:** "Schedule Free Consultation" → Calendar booking
3. **Tertiary CTA:** "Download Service Guide" → Email capture
4. **Social Proof:** "Join 50+ companies optimizing their P21 systems"

### Lead Capture Form
**Fields:**
- Name* (required)
- Company Name*
- Email*
- Phone (optional)
- Current P21 Version (optional)
- Additional Comments (textarea)
- [ ] "Send me the full service catalog"

**Submit Actions:**
1. Store lead in CRM
2. Send confirmation email with recommended services PDF
3. Notify sales team with lead details + quiz answers
4. Redirect to thank you page with next steps

---

## Future Enhancements

### V1.1 - Enhanced Personalization
- Remember previous visits (localStorage)
- "Continue where you left off" functionality
- Personalized follow-up email sequences

### V1.2 - Interactive Pricing
- Live price calculator with sliders
- "Build your own package" mode
- ROI calculator integration

### V1.3 - Social Features
- Share results with team members
- Comparison mode for multiple service options
- Customer testimonials matched to recommended services

### V1.4 - Advanced Intelligence
- ML-based recommendation refinement
- Success story matching (similar companies)
- Predictive timeline estimation based on historical data

---

## Success Metrics

### Primary KPIs
- **Completion Rate:** >60% of users who start complete all 5 questions
- **Conversion Rate:** >25% of completions submit lead form
- **Engagement Time:** Average 3-5 minutes on selector
- **Recommendation Acceptance:** >40% request info on primary recommendation

### Secondary KPIs
- **Bundle Interest:** >15% click on bundle recommendations
- **Consultation Requests:** >10% schedule consultation
- **Email Captures:** >35% download service guide
- **Return Visits:** >20% return to review recommendations

---

## Technical Requirements

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest 2 versions)

### Performance Targets
- **Initial Load:** <2 seconds
- **Question Transition:** <200ms
- **Results Calculation:** <500ms
- **Lighthouse Score:** >90 (Performance, Accessibility)

### Dependencies
- React 18+
- TypeScript 5+
- CSS Modules or Styled Components
- React Hook Form (for lead capture)
- Analytics SDK (GA4, Mixpanel, etc.)

---

## Maintenance & Updates

### Quarterly Reviews
- [ ] Review service catalog pricing
- [ ] Update timeline estimates based on actual delivery
- [ ] Analyze conversion data and optimize scoring algorithm
- [ ] A/B test question wording and options
- [ ] Update bundle offerings based on popular combinations

### Content Updates
- Service descriptions and deliverables
- Pricing adjustments
- New service additions
- Seasonal promotions or limited offers

---

## Appendix: Example User Journeys

### Journey 1: Small Business Performance Issue
**Answers:**
- Main Challenge: Performance Issues
- Company Size: Small (10 users)
- Technical Capability: Limited Technical Resources
- Timeline: Urgent (1-2 months)
- Budget: $5K-$15K

**Recommended:**
- **Primary:** Database Optimization ($8,000, 3 weeks)
- **Secondary:** System Audit ($4,500, 1 week)
- **Bundle:** Audit + Optimization Package ($11,500, save $1,000)

---

### Journey 2: Enterprise Custom Development
**Answers:**
- Main Challenge: Custom Development
- Company Size: Enterprise (500+ users)
- Technical Capability: In-House Development Team
- Timeline: Standard (3-6 months)
- Budget: $50K+

**Recommended:**
- **Primary:** Custom Module Development ($30,000, 10 weeks)
- **Secondary:** API Integration ($24,000, 6 weeks)
- **Bundle:** Custom Dev + Managed Services ($55,000 year 1)

---

### Journey 3: Medium Business - Not Sure
**Answers:**
- Main Challenge: Not Sure
- Company Size: Medium (50 users)
- Technical Capability: Technical Staff (Non-Developers)
- Timeline: Flexible
- Budget: Not Sure

**Recommended:**
- **Primary:** System Audit & Roadmap ($5,500, 2 weeks)
- **Secondary:** Training Program ($2,000, 1 week)
- **Reason:** "Start with a comprehensive audit to identify your biggest opportunities, then we'll build a roadmap tailored to your priorities and budget."

---

*End of Specification*
