export interface ServiceData {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  heroTagline: string;
  iconName: string;
  overview: string;
  features: { title: string; desc: string }[];
  packingMaterialsUsed: string[];
  process: { step: string; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
}

export const SERVICES_LIST: ServiceData[] = [
  {
    id: 'house-shifting',
    slug: 'house-shifting',
    title: 'House Shifting Services',
    shortDesc: 'Safe & secure home relocation in Bangalore and across India with multi-layer packing.',
    heroTagline: 'Stress-Free Home Relocation with Dedicated Packing Specialists',
    iconName: 'Home',
    overview:
      'Shiftify provides end-to-end residential relocation services designed to protect your household goods, kitchenware, electronics, and valuable furniture. Whether shifting a 1BHK apartment in Bangalore or a 4BHK duplex across states, our experienced crew handles packing, loading, transit, unloading, and furniture reassembly with surgical care.',
    features: [
      {
        title: '3 to 5-Layer Defensive Packing',
        desc: 'Bubble wrap, heavy-duty corrugated cartons, edge protectors, and waterproof stretch film for fragile crockery and gadgets.',
      },
      {
        title: 'Furniture Disassembly & Assembly',
        desc: 'Safe unbolting of king/queen beds, dining sets, modular wardrobes, and reassembly at your new residence.',
      },
      {
        title: 'Room-by-Room Color Coding',
        desc: 'Boxes are labeled and color-coded by room (Master Bedroom, Living, Kitchen) to ensure hassle-free organized unpacking.',
      },
      {
        title: 'Special Handling for Electronics',
        desc: 'Anti-static packing, customized TV flight boxes, and cushioned foam padding for refrigerators, washing machines, and audio setups.',
      },
    ],
    packingMaterialsUsed: [
      '5-Ply Corrugated Heavy Duty Cartons',
      'High-Density Multi-Layer Bubble Wrap',
      'Corrugated Edge Protectors & Foam Sheets',
      'Moisture-Resistant Stretch Film Wrap',
      'Heavy-Duty Adhesive Packing Tapes',
      'Garment Wardrobe Boxes with Hanger Bars',
    ],
    process: [
      {
        step: '01',
        title: 'Pre-Move Survey & Accurate Estimate',
        desc: 'We review your item inventory (via video call, list, or on-site visit) to provide a clear, transparent written quote.',
      },
      {
        step: '02',
        title: 'Systematic Packing on Moving Day',
        desc: 'Our uniformed crew arrives on time with premium materials to systematically pack and label every item.',
      },
      {
        step: '03',
        title: 'Cautious Loading & Transit',
        desc: 'Items are cushioned and secured inside clean, covered trucks using straps and protective blankets.',
      },
      {
        step: '04',
        title: 'Unloading & Furniture Reassembly',
        desc: 'Careful placement in respective rooms, furniture re-assembly, and removal of basic packing debris.',
      },
    ],
    faqs: [
      {
        question: 'How long does house shifting take within Bangalore?',
        answer:
          'A typical 1BHK to 3BHK local home move in Bangalore is completed within 4 to 8 hours from packing start to unloading and furniture assembly.',
      },
      {
        question: 'Do you provide boxes for clothes and kitchen utensils?',
        answer:
          'Yes, we provide specialized 5-ply cartons, bubble wrap for glassware, and wardrobe boxes for hung garments as part of our comprehensive house shifting service.',
      },
      {
        question: 'Can I reschedule my house shifting date if my lease start date changes?',
        answer:
          'Yes, simply inform your assigned Shiftify move coordinator at least 24 hours in advance, and we will reschedule your move slot at no extra charge.',
      },
    ],
    metaTitle: 'House Shifting Services in Bangalore & Pan-India | Shiftify',
    metaDescription:
      'Reliable house shifting and home relocation services in Bangalore. Multi-layer packing, safe furniture assembly, and zero hidden costs. Get your free home moving quote today.',
    canonicalPath: '/services/house-shifting',
  },
  {
    id: 'office-shifting',
    slug: 'office-shifting',
    title: 'Office Shifting Services',
    shortDesc: 'Hassle-free corporate and office relocation with minimum business downtime.',
    heroTagline: 'Zero-Downtime Commercial & Office Relocation Solutions',
    iconName: 'Briefcase',
    overview:
      'Relocating an office requires meticulous planning, data asset protection, and zero business interruption. Shiftify offers structured office relocation for tech startups, corporate enterprises, and co-working floors in Bangalore and nationwide. We organize weekend and overnight shifting schedules to ensure your team is operational on Monday morning.',
    features: [
      {
        title: 'Weekend & Overnight Shifts',
        desc: 'Flexible scheduling outside business hours to prevent productivity loss and operational disruption.',
      },
      {
        title: 'IT Asset & Server Rack Handling',
        desc: 'Anti-static bubble wrap, numbered bin tagging, and padded server transit crates for monitors, towers, and networking gear.',
      },
      {
        title: 'Desk & Workstation Labeling',
        desc: 'Employee-wise desk tagging system ensuring individual documents, equipment, and peripherals arrive directly at designated desks.',
      },
      {
        title: 'Conference & Modular Furniture Setup',
        desc: 'Expert modular partition deconstruction and reconstruction by trained commercial carpenters.',
      },
    ],
    packingMaterialsUsed: [
      'Anti-Static Bubble Sheets & Foam Cushions',
      'Heavy Duty Numbered Plastic Crates',
      'Color-Coded Employee Identification Labels',
      'Reinforced Server & IT Equipment Packaging',
      'High-Tack Security Tamper-Evident Seals',
    ],
    process: [
      {
        step: '01',
        title: 'Floor Plan & Inventory Mapping',
        desc: 'Technical site survey to map server rooms, workstations, seating layouts, and elevator access timelines.',
      },
      {
        step: '02',
        title: 'Phased Packing & IT De-Cabling',
        desc: 'Systematic tagging and packing of workstations, files, and electronics into serial-numbered security crates.',
      },
      {
        step: '03',
        title: 'Dedicated Transport & Escalator Handling',
        desc: 'Secure transport in covered freight carriers with hydraulic lift gate assistance if necessary.',
      },
      {
        step: '04',
        title: 'Setup & Ready-to-Work Placement',
        desc: 'Positioning workstations according to the new layout diagram, unpacking crates, and clearing packaging waste.',
      },
    ],
    faqs: [
      {
        question: 'Can you execute our office move over the weekend?',
        answer:
          'Yes, our office shifting teams routinely operate on Friday evenings and Saturdays to complete setup by Sunday evening.',
      },
      {
        question: 'How do you ensure sensitive client documents remain confidential during transit?',
        answer:
          'We use tamper-evident numbered security ties on all confidential file storage crates with documented sign-off chain of custody.',
      },
      {
        question: 'Do you dismantle and re-install modular glass and MDF office cubicles?',
        answer:
          'Yes, our commercial moving crew includes technicians experienced in assembling popular modular workstation systems.',
      },
    ],
    metaTitle: 'Office Shifting Services in Bangalore | Commercial Relocation | Shiftify',
    metaDescription:
      'Professional office shifting and commercial relocation in Bangalore. Minimal business downtime, secure IT equipment transit, and weekend moving. Get an office quote.',
    canonicalPath: '/services/office-shifting',
  },
  {
    id: 'vehicle-transport',
    slug: 'vehicle-transport',
    title: 'Vehicle Transport Services',
    shortDesc: 'Safe car and bike transport across India with enclosed car carriers and tracking.',
    heroTagline: 'Door-to-Door Car & Bike Transport Across All Indian States',
    iconName: 'Car',
    overview:
      'Transporting your two-wheeler or four-wheeler across cities requires specialized equipment and careful handling. Shiftify delivers door-to-door vehicle transport using enclosed car carriers and customized bike wooden crates with wheel locks, ensuring zero transit scratches or road damage.',
    features: [
      {
        title: 'Enclosed Hydraulic Car Carriers',
        desc: 'Multi-car enclosed carrier trucks that protect your vehicle from highway weather, gravel, and dust.',
      },
      {
        title: 'Individual Bike Crating & Wheel Chocks',
        desc: 'Motorcycles and scooters are wrapped in foam sheets and secured in custom wooden crates with tied wheel locks.',
      },
      {
        title: 'Comprehensive Pre-Transit Inspection',
        desc: 'Detailed digital inspection condition report documenting odometer reading, existing condition, and accessories.',
      },
      {
        title: 'Doorstep Pickup & Delivery',
        desc: 'Convenient home pickup in Bangalore and direct delivery at your new address across any Indian city.',
      },
    ],
    packingMaterialsUsed: [
      'Multi-Layer Foam Wrap for Two-Wheelers',
      'Corrugated Mirror & Headlight Protectors',
      'Heavy-Duty Wheel Lashings & Ratchet Straps',
      'Custom Wooden Crating for Premium Superbikes',
      'Weather-Resistant Protective Vehicle Covers',
    ],
    process: [
      {
        step: '01',
        title: 'Booking & Documentation Review',
        desc: 'Verification of RC copy, insurance certificate, and ID proof to ensure seamless highway toll transit.',
      },
      {
        step: '02',
        title: 'Doorstep Inspection & Handover',
        desc: 'Joint vehicle condition check with photo logging and issuing of the consignment dispatch note.',
      },
      {
        step: '03',
        title: 'Carrier Loading & Transit',
        desc: 'Secure loading on the hydraulic car carrier and journey tracking through checkpoints.',
      },
      {
        step: '04',
        title: 'Final Doorstep Delivery',
        desc: 'Safe unloading at destination, final inspection check, and recipient sign-off.',
      },
    ],
    faqs: [
      {
        question: 'What documents are required for intercity vehicle transport in India?',
        answer:
          'A copy of the Vehicle Registration Certificate (RC), valid insurance policy, pollution under control (PUC) certificate, and government photo ID of the owner.',
      },
      {
        question: 'Should I keep fuel in the vehicle tank prior to transit?',
        answer:
          'For safety regulations on transport carriers, please keep fuel at approximately 15-20% capacity (low reserve), just enough for loading and unloading.',
      },
      {
        question: 'How many days does car transport take from Bangalore to Delhi or Mumbai?',
        answer:
          'Bangalore to Mumbai transit typically takes 2 to 3 days, while Bangalore to Delhi NCR takes 4 to 6 days depending on weather and highway checks.',
      },
    ],
    metaTitle: 'Vehicle Transport Services Bangalore | Car & Bike Relocation | Shiftify',
    metaDescription:
      'Secure car and bike transport services from Bangalore to anywhere in India. Enclosed car carriers, doorstep pickup, and vehicle tracking. Get a vehicle moving quote.',
    canonicalPath: '/services/vehicle-transport',
  },
  {
    id: 'warehouse-storage',
    slug: 'warehouse-storage',
    title: 'Warehouse & Storage Solutions',
    shortDesc: 'Clean, secure, climate-controlled storage for household goods and business inventory.',
    heroTagline: 'Short-Term & Long-Term Flexible Storage Solutions in Bangalore',
    iconName: 'Warehouse',
    overview:
      'Whether traveling abroad on assignment, renovating your home, or needing temporary overflow storage for commercial stock, Shiftify provides secure warehousing facilities in Bangalore. Our warehouses feature 24/7 CCTV surveillance, fire prevention systems, periodic pest control, and dedicated palletized bays.',
    features: [
      {
        title: '24/7 Monitored Security',
        desc: 'Continuous CCTV monitoring, biometric access logs, and dedicated on-site security personnel.',
      },
      {
        title: 'Moisture & Pest Protected',
        desc: 'Elevated wooden pallets, regular pest control spraying, and clean industrial ventilation.',
      },
      {
        title: 'Flexible Rental Tenures',
        desc: 'Store by the week, month, or year with no lock-in penalties and easy item retrieval.',
      },
      {
        title: 'Professional Packing for Storage',
        desc: 'Long-term preservation packing with moisture desiccants and sealed vacuum wrapping.',
      },
    ],
    packingMaterialsUsed: [
      'Moisture-Barrier Vacuum Protective Wraps',
      'Desiccant Silica Gel Moisture Absorbers',
      'Heavy-Duty Palletized Wooden Crates',
      'Reinforced Plastic Dust Sheets',
      'Tamper-Proof Barcode Inventory Tags',
    ],
    process: [
      {
        step: '01',
        title: 'Item Audit & Space Estimation',
        desc: 'We calculate the required cubic volume to recommend the most cost-effective storage bay size.',
      },
      {
        step: '02',
        title: 'Preservation Packing & Barcoding',
        desc: 'Items are packaged for long-term storage and individually tagged with unique barcode identifiers.',
      },
      {
        step: '03',
        title: 'Palletized Warehousing',
        desc: 'Goods are placed on elevated pallets inside your dedicated clean storage zone.',
      },
      {
        step: '04',
        title: 'Redelivery on Demand',
        desc: 'When you are ready, we load and deliver your belongings to your new home address.',
      },
    ],
    faqs: [
      {
        question: 'Can I store my household goods for just 2 to 3 weeks?',
        answer:
          'Yes, we offer flexible short-term storage options starting from 7 days as well as long-term multi-year plans.',
      },
      {
        question: 'Can I access or retrieve specific items during the storage period?',
        answer:
          'Yes, with 24 hours prior notice, you can visit our Bangalore warehouse facility to retrieve specific boxes.',
      },
      {
        question: 'How are furniture items protected against moisture and dust during long storage?',
        answer:
          'All furniture is wrapped in breathable protective foam and sealed with heavy plastic dust wrap over elevated wooden pallets.',
      },
    ],
    metaTitle: 'Warehouse & Household Storage in Bangalore | Shiftify',
    metaDescription:
      'Safe warehouse and storage facility in Bangalore for household goods, furniture, and commercial inventory. 24/7 CCTV, pest-controlled, and flexible monthly plans.',
    canonicalPath: '/services/warehouse-storage',
  },
  {
    id: 'local-shifting',
    slug: 'local-shifting',
    title: 'Local Shifting Services',
    shortDesc: 'Quick, same-day house and apartment moving within all areas of Bangalore.',
    heroTagline: 'Same-Day Local Moving Across All Bangalore Localities',
    iconName: 'Navigation',
    overview:
      'Moving within Bangalore — whether from Whitefield to Indiranagar, HSR Layout to Electronic City, or Malleshwaram to Hebbal — requires navigating city traffic, apartment society moving protocols, and narrow residential streets. Shiftify provides swift, same-day local moving with right-sized city trucks and disciplined moving crews.',
    features: [
      {
        title: 'Same-Day Move Completion',
        desc: 'Full packing, transport, and room-by-room unpacking executed within a single morning or afternoon slot.',
      },
      {
        title: 'Apartment Society Clearance Adherence',
        desc: 'Familiarity with moving time windows (typically 10 AM to 5 PM) and lift padding protocols in major gated societies.',
      },
      {
        title: 'Compact City Fleets',
        desc: 'Fleet of Tata Ace, Bolero Maxi Trucks, and 14ft Eicher vehicles capable of accessing apartment basements.',
      },
      {
        title: 'Zero Extra Charges for Elevators',
        desc: 'Clear upfront pricing with transparent handling for stairs or elevator access.',
      },
    ],
    packingMaterialsUsed: [
      'Standard 3-Ply and 5-Ply Cardboard Boxes',
      'Bubble Wrap for Kitchen Glassware and TV',
      'Protective Blankets & Furniture Padded Covers',
      'Stretch Film Wrap for Mattresses and Sofas',
    ],
    process: [
      {
        step: '01',
        title: 'Instant Local Quote',
        desc: 'Quick booking via our online form with confirmed time slot reservation.',
      },
      {
        step: '02',
        title: 'Swift Morning Packing',
        desc: 'Crew arrives with dedicated boxes to pack fragile items, appliances, and clothing.',
      },
      {
        step: '03',
        title: 'Optimized Route Transit',
        desc: 'Navigating city routes to bypass peak traffic hours and deliver directly to your new address.',
      },
      {
        step: '04',
        title: 'Unloading & Basic Setup',
        desc: 'Positioning large furniture in designated rooms and dismantling waste clearance.',
      },
    ],
    faqs: [
      {
        question: 'Which areas in Bangalore do you cover for local shifting?',
        answer:
          'We cover 100% of Bangalore, including Whitefield, HSR Layout, Koramangala, Indiranagar, Electronic City, JP Nagar, Jayanagar, Marathahalli, Bellandur, Hebbal, Yelahanka, and peripheral areas.',
      },
      {
        question: 'Do you help with society moving permissions?',
        answer:
          'We provide our vehicle driver details, helper ID copies, and vehicle registration numbers in advance for your society management gate pass.',
      },
      {
        question: 'What is the fastest way to get a local moving estimate?',
        answer:
          'Fill out our 4-step Get Free Quote form or message our team directly on WhatsApp for an estimate within 10 minutes.',
      },
    ],
    metaTitle: 'Local Shifting Services in Bangalore | Same Day House Moving | Shiftify',
    metaDescription:
      'Swift and safe local packers and movers in Bangalore. Same-day shifting across Whitefield, HSR, Koramangala, Indiranagar, and all areas. Get a free local moving quote.',
    canonicalPath: '/services/local-shifting',
  },
  {
    id: 'intercity-shifting',
    slug: 'intercity-shifting',
    title: 'Intercity Shifting Services',
    shortDesc: 'Pan-India relocation from Bangalore to all major states and tier-1/tier-2 cities.',
    heroTagline: 'Reliable Intercity Moving from Bangalore to Any City Across India',
    iconName: 'MapPin',
    overview:
      'Long-distance relocation requires specialized heavy-duty packing, dedicated long-haul container trucks, national highway permit clearances, and dependable delivery schedules. Shiftify operates regular intercity routes connecting Bangalore to Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, and over 150 Indian cities.',
    features: [
      {
        title: 'Exclusive vs. Shared Truck Options',
        desc: 'Choose between a dedicated direct truck for fastest transit or economical shared container space for budget-friendly moves.',
      },
      {
        title: 'Robust Highway-Grade Multi-Layer Packing',
        desc: 'Engineered packaging to withstand long-distance vibration, temperature changes, and road conditions.',
      },
      {
        title: 'All-State Regulatory & Toll Clearances',
        desc: 'Full GST e-way bill generation, state border toll management, and highway documentation handled smoothly.',
      },
      {
        title: 'Scheduled ETA & Transit Check-ins',
        desc: 'Daily status milestones provided by your assigned long-haul move manager.',
      },
    ],
    packingMaterialsUsed: [
      'Heavy-Duty 7-Ply Outer Corrugated Crates',
      'Waterproof Tarpaulin & Shrink Seal Wrapping',
      'High-Density Thermocol & Foam Padding',
      'Corner Edge Reinforcement Angles',
      'Security-Numbered Container Seals',
    ],
    process: [
      {
        step: '01',
        title: 'Virtual / In-Person Survey',
        desc: 'Accurate volume calculation to recommend ideal truck capacity (14ft, 17ft, 19ft, 22ft container).',
      },
      {
        step: '02',
        title: 'Export-Grade Multi-Layer Packing',
        desc: 'Double-cushioned packing of furniture, appliances, and delicate personal effects.',
      },
      {
        step: '03',
        title: 'Long-Haul Interstate Transit',
        desc: 'Transit on designated national highways with sealed container locks.',
      },
      {
        step: '04',
        title: 'Destination Unloading & Placement',
        desc: 'Unloading by local destination crew, assembly of major furniture, and delivery verification.',
      },
    ],
    faqs: [
      {
        question: 'What are your most popular intercity routes from Bangalore?',
        answer:
          'Our most frequent daily/weekly routes are Bangalore to Mumbai, Hyderabad, Chennai, Delhi NCR, Pune, Kolkata, Kochi, and Ahmedabad.',
      },
      {
        question: 'Do you provide transit insurance for long-distance moves?',
        answer:
          'Yes, we provide optional comprehensive transit insurance from leading national insurers covering unexpected accidental road transit risks.',
      },
      {
        question: 'Can I include my two-wheeler in the same truck as my household items?',
        answer:
          'Yes, for intercity moves we can securely load your packed motorcycle alongside your household consignment in a dedicated container truck.',
      },
    ],
    metaTitle: 'Intercity Packers and Movers Bangalore | Domestic Moving India | Shiftify',
    metaDescription:
      'Seamless intercity relocation from Bangalore to Mumbai, Delhi, Hyderabad, Chennai, Pune and across India. Sealed containers and scheduled delivery. Get an intercity quote.',
    canonicalPath: '/services/intercity-shifting',
  },
  {
    id: 'corporate-relocation',
    slug: 'corporate-relocation',
    title: 'Corporate Relocation Services',
    shortDesc: 'Complete employee transfer relocation packages and bulk commercial transfers.',
    heroTagline: 'End-to-End Employee Relocation & Corporate Transfer Logistics',
    iconName: 'Building',
    overview:
      'Shiftify partners with enterprise HR departments, tech corporations, and multinationals to manage employee relocation smoothly. From single-executive transfers to bulk team relocations across branches, we provide centralized billing, compliant GST invoices, dedicated HR account management, and high-touch VIP handling.',
    features: [
      {
        title: 'Dedicated Corporate Account Manager',
        desc: 'Single SPOC for corporate HR and mobility teams to manage all employee move requests.',
      },
      {
        title: 'Compliant Corporate Billing & GST',
        desc: 'Standardized monthly credit terms, consolidated invoicing, and formal purchase order integration.',
      },
      {
        title: 'End-to-End Employee Care',
        desc: 'Direct coordinator assistance for the employee family including home goods, vehicle shipping, and temporary warehousing.',
      },
      {
        title: 'SLA-Driven Service Commitments',
        desc: 'Strict adherence to contracted pickup dates, transit times, and damage-free delivery metrics.',
      },
    ],
    packingMaterialsUsed: [
      'Premium Executive Packaging Materials',
      'Specialized Wardrobe & Suit Protectors',
      'Rigid Flight Cases for High-Value Electronics',
      'Eco-Friendly Reusable Transit Crates',
    ],
    process: [
      {
        step: '01',
        title: 'Corporate Authorization & Booking',
        desc: 'HR or employee initiates request according to company relocation policy slab.',
      },
      {
        step: '02',
        title: 'Employee Consultation & Scheduling',
        desc: 'Our VIP manager connects with the employee to finalize packing dates and special requirements.',
      },
      {
        step: '03',
        title: 'Priority Packing & Direct Transit',
        desc: 'White-glove packing, priority vehicle dispatch, and live status milestone reporting.',
      },
      {
        step: '04',
        title: 'Home Setup & HR Feedback Loop',
        desc: 'Complete setup at the destination city and submission of relocation report to HR.',
      },
    ],
    faqs: [
      {
        question: 'Can Shiftify work directly with our company HR relocation policy allowances?',
        answer:
          'Yes, we can customize quotation formats, item caps, and invoice breakdowns to match your corporate HR relocation allowance guidelines.',
      },
      {
        question: 'Do you offer monthly consolidated billing for frequent corporate transfers?',
        answer:
          'Yes, corporate clients with regular relocation volume can establish an enterprise account with flexible 30-day credit terms.',
      },
    ],
    metaTitle: 'Corporate Relocation Services Bangalore | Employee Moving | Shiftify',
    metaDescription:
      'Corporate employee relocation services in Bangalore and across India. Centralized billing, SLA-driven timelines, and white-glove executive care. Partner with Shiftify.',
    canonicalPath: '/services/corporate-relocation',
  },
];
