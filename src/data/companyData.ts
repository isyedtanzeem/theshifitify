export interface LocalityInfo {
  name: string;
  zone: 'South' | 'East' | 'North' | 'West' | 'Central';
  popularFor: string;
}

export interface RouteInfo {
  from: string;
  to: string;
  distanceKm: number;
  typicalTransitDays: string;
  popularTypes: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export const COMPANY_INFO = {
  name: 'Shiftify Packers & Movers',
  tagline: 'Reliable, Safe & On-Time Moving Services in Bangalore & Pan-India',
  phone: '+91 98452 01449',
  rawPhone: '919845201449',
  whatsapp: '919845201449',
  email: 'support@shiftify.in',
  leadsEmail: 'shiftify.leads@gmail.com',
  officeAddress: '52/1, Khazi Street, Basavanagudi, Bangalore, Karnataka 560004',
  website: 'https://shiftify.in',
  operatingHours: '24/7 Booking & Move Coordination',
  googleMapsLink: 'https://maps.app.goo.gl/LPzpWrTQYYWC1wYw8',
};

export const BANGALORE_LOCALITIES: LocalityInfo[] = [
  { name: 'Basavanagudi', zone: 'South', popularFor: 'Head Office & Heritage Residential Shifting' },
  { name: 'HSR Layout', zone: 'South', popularFor: 'Apartment & Tech Household Relocation' },
  { name: 'Koramangala', zone: 'South', popularFor: 'Villa & Startup Office Relocation' },
  { name: 'Whitefield', zone: 'East', popularFor: 'Gated Community & Tech Parks' },
  { name: 'Indiranagar', zone: 'East', popularFor: 'Residential & Boutique Shifting' },
  { name: 'Electronic City', zone: 'South', popularFor: 'IT Professional & Studio Shifting' },
  { name: 'JP Nagar', zone: 'South', popularFor: 'Family Homes & Multi-Story Buildings' },
  { name: 'Jayanagar', zone: 'South', popularFor: 'Heritage & Premium Household Moving' },
  { name: 'Bellandur & Outer Ring Road', zone: 'East', popularFor: 'High-rise Condominiums' },
  { name: 'Marathahalli', zone: 'East', popularFor: 'Local & Flat Shifting' },
  { name: 'Sarjapur Road', zone: 'East', popularFor: 'Villas & High-rise Societies' },
  { name: 'Hebbal', zone: 'North', popularFor: 'North Bangalore Transit & Homes' },
  { name: 'Yelahanka', zone: 'North', popularFor: 'Spacious Residences & Airport Zone' },
  { name: 'Malleshwaram', zone: 'West', popularFor: 'Traditional Homes & Local Moves' },
  { name: 'Rajajinagar', zone: 'West', popularFor: 'Commercial & Residential Relocation' },
  { name: 'Banashankari', zone: 'South', popularFor: 'Household Shifting' },
  { name: 'Thanisandra & Manyata', zone: 'North', popularFor: 'Tech Hub Relocations' },
];

export const POPULAR_ROUTES: RouteInfo[] = [
  {
    from: 'Bangalore',
    to: 'Mumbai',
    distanceKm: 985,
    typicalTransitDays: '2 - 3 Days',
    popularTypes: ['House Shifting', 'Vehicle Transport', 'Corporate Relocation'],
  },
  {
    from: 'Bangalore',
    to: 'Hyderabad',
    distanceKm: 575,
    typicalTransitDays: '1 - 2 Days',
    popularTypes: ['House Shifting', 'Office Shifting', 'Bike Transport'],
  },
  {
    from: 'Bangalore',
    to: 'Chennai',
    distanceKm: 345,
    typicalTransitDays: '24 - 36 Hours',
    popularTypes: ['House Shifting', 'Vehicle Transport', 'Local & Express'],
  },
  {
    from: 'Bangalore',
    to: 'Delhi NCR (Delhi / Gurgaon / Noida)',
    distanceKm: 2150,
    typicalTransitDays: '4 - 6 Days',
    popularTypes: ['Full Household', 'Car Carrier', 'Corporate Moving'],
  },
  {
    from: 'Bangalore',
    to: 'Pune',
    distanceKm: 840,
    typicalTransitDays: '2 - 3 Days',
    popularTypes: ['House Shifting', 'Vehicle Transport'],
  },
  {
    from: 'Bangalore',
    to: 'Kolkata',
    distanceKm: 1870,
    typicalTransitDays: '4 - 5 Days',
    popularTypes: ['House Shifting', 'Luggage & Furniture'],
  },
  {
    from: 'Bangalore',
    to: 'Ahmedabad',
    distanceKm: 1490,
    typicalTransitDays: '3 - 4 Days',
    popularTypes: ['Household & Industrial Machinery'],
  },
  {
    from: 'Bangalore',
    to: 'Kochi & Trivandrum',
    distanceKm: 550,
    typicalTransitDays: '1 - 2 Days',
    popularTypes: ['House Shifting', 'Car Carrier'],
  },
  {
    from: 'Bangalore',
    to: 'Goa',
    distanceKm: 560,
    typicalTransitDays: '1 - 2 Days',
    popularTypes: ['House Shifting', 'Vehicle Transport'],
  },
  {
    from: 'Bangalore',
    to: 'Coimbatore',
    distanceKm: 365,
    typicalTransitDays: '24 Hours',
    popularTypes: ['House Shifting', 'Office Shifting'],
  },
];

export const HOMEPAGE_FAQS: FAQItem[] = [
  {
    question: 'How are packing and moving charges calculated at Shiftify?',
    answer:
      'Moving charges depend on several objective factors: volume/inventory of goods, distance between pickup and drop locations, floor levels, elevator availability, packaging material grade (e.g., 3-ply vs. 5-ply cartons, bubble wrap for electronics), vehicle size required, and optional transit insurance.',
  },
  {
    question: 'How much in advance should I book my move in Bangalore?',
    answer:
      'For local shifting within Bangalore, booking 2 to 3 days in advance is recommended. For month-ends, weekends, or intercity moves across India, we recommend confirming 5 to 7 days prior so we can allocate dedicated vehicle slots and moving crews.',
  },
  {
    question: 'What packing materials does Shiftify use to protect fragile items?',
    answer:
      'We use professional multi-layer packaging: heavy-duty corrugated cartons, multilayer bubble wrap, edge protectors, stretch film wrap, waterproof corrugated sheets, foam sheets, and specialized wardrobe cartons for hanging garments.',
  },
  {
    question: 'Do you handle dismantling and reassembling of furniture and appliances?',
    answer:
      'Yes. Our trained moving crew carries professional toolkit sets to safely dismantle and reassemble beds, modular wardrobes, dining tables, TV wall mounts, and RO water purifiers upon arrival at your new residence.',
  },
  {
    question: 'How are vehicles (cars and two-wheelers) transported intercity?',
    answer:
      'Vehicles are transported using specialized closed car carriers and secured wheel-chocked transport trucks. Before transit, an inspection condition report with odometer reading and photos is recorded.',
  },
  {
    question: 'Can I track my moving consignment or enquiry status online?',
    answer:
      'Yes. Every booking and quotation request receives a unique Shiftify Enquiry ID (e.g., SFY...). You can check your status directly on our website or get instant updates from your assigned move coordinator via WhatsApp.',
  },
  {
    question: 'Are there any hidden costs or surprise surcharges on moving day?',
    answer:
      'No. We adhere to transparent, upfront pricing. Our written quotation clearly itemizes labor, packing material, transport, toll taxes, and GST without surprise hidden charges.',
  },
];

export const WHY_CHOOSE_ITEMS = [
  {
    title: 'Safe & Multi-Layer Packing',
    description: 'High-grade bubble wrap, heavy corrugated boxes, foam edge guards, and waterproof plastic wrapping for complete protection.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Punctual & On-Time Delivery',
    description: 'Dedicated vehicle allocation and scheduled moving slots to ensure your goods arrive strictly on time, local or intercity.',
    icon: 'Clock',
  },
  {
    title: 'Transparent Upfront Pricing',
    description: 'Clear itemized quotations with zero hidden surprises on moving day. What we quote is what you pay.',
    icon: 'ReceiptCheck',
  },
  {
    title: 'Dedicated Move Coordinator',
    description: 'Single point of contact from pre-move survey through loading, transit updates, and final room-wise unpacking.',
    icon: 'Headphones',
  },
  {
    title: 'Furniture Dismantling & Setup',
    description: 'Skilled technicians with power tools for safe dismantling of beds, wardrobes, and TV units with prompt reassembly.',
    icon: 'Wrench',
  },
  {
    title: 'Bangalore & Pan-India Fleet',
    description: 'Extensive fleet network ranging from local Tata Ace/Eicher trucks to closed multi-axle container carriers.',
    icon: 'Truck',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Submit Moving Details',
    description: 'Fill our simple 4-step quote form with pickup/drop locations, tentative moving date, and items type.',
  },
  {
    step: '02',
    title: 'Get Free Estimate',
    description: 'Receive a transparent, customized quote via WhatsApp or call after a quick inventory review.',
  },
  {
    step: '03',
    title: 'Careful Packing & Loading',
    description: 'Our trained crew arrives on schedule with premium materials to safely pack, label, and load your belongings.',
  },
  {
    step: '04',
    title: 'Safe Transit & Setup',
    description: 'Your goods are transported securely to your destination, unloaded, unpacked, and placed in your designated rooms.',
  },
];
