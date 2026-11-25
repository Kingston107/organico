import type { Product, ProductCategory } from '@/types/store';

export const FREE_SHIPPING_THRESHOLD_INR = 799;
export const STANDARD_SHIPPING_INR = 49;

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    slug: 'beeswax-food-wraps',
    name: 'Beeswax Food Wraps (Set of 3)',
    category: 'Kitchen',
    materialBadge: 'Reusable Organic Cotton',
    shortDescription:
      'Washable organic cotton wraps coated in natural beeswax and tree resin.',
    description:
      'Replace single-use cling film with three breathable sizes (small, medium, large) that mold to bowls, fruit halves, and sandwiches with the warmth of your hands.',
    sustainabilityNote:
      'Lasts up to 12 months with cool-water rinsing, then composts naturally.',
    priceInr: 399,
    compareAtInr: 499,
    imageUrl: '/images/products/beeswax-food-wraps.jpg',
    stock: 34,
    featured: true,
  },
  {
    id: 'prod-02',
    slug: 'hemp-carryall-tote',
    name: 'Unbleached Hemp Carryall Tote',
    category: 'Carry',
    materialBadge: '100% Hemp & Cotton',
    shortDescription:
      'Reinforced wide-gusset market tote built for heavy grocery runs.',
    description:
      'Stitched from unbleached heavy-gauge canvas and natural hemp straps with a structured base so bottles, jars, and fresh produce sit upright.',
    sustainabilityNote:
      'Zero synthetic dyes or polyester lining; machine washable and biodegradable.',
    priceInr: 449,
    compareAtInr: 549,
    imageUrl: '/images/products/hemp-carryall-tote.jpg',
    stock: 28,
    featured: true,
  },
  {
    id: 'prod-03',
    slug: 'natural-loofah-sponges',
    name: 'Natural Loofah Scrub Sponges (2-Pack)',
    category: 'Kitchen',
    materialBadge: '100% Plant Fiber',
    shortDescription:
      'Sun-dried luffa gourd scrubbers that clean cookware without microplastics.',
    description:
      'Softens quickly in warm water to scrub cast iron, ceramic plates, and non-stick pans without scratching surfaces or shedding plastic fibers.',
    sustainabilityNote:
      'Grown without synthetic pesticides and home-compostable after use.',
    priceInr: 199,
    imageUrl: '/images/products/natural-loofah-sponges.jpg',
    stock: 52,
    featured: true,
  },
  {
    id: 'prod-04',
    slug: 'solid-shampoo-bar',
    name: 'Botanical Olive & Herb Soap Bar',
    category: 'Bath',
    materialBadge: 'Plastic-Free Bar',
    shortDescription:
      'Cold-processed botanical cleansing bar wrapped in recycled kraft paper.',
    description:
      'Formulated with cold-pressed olive oil and gentle plant clays for daily hand, body, or travel washing without liquid bottle waste.',
    sustainabilityNote:
      'One 110 g bar replaces roughly two plastic bottles of liquid wash.',
    priceInr: 279,
    compareAtInr: 329,
    imageUrl: '/images/products/solid-shampoo-bar.jpg',
    stock: 41,
    featured: true,
  },
  {
    id: 'prod-05',
    slug: 'cotton-produce-bags',
    name: 'Knitted Organic Cotton Market Bag',
    category: 'Carry',
    materialBadge: 'Organic Cotton Mesh',
    shortDescription:
      'Lightweight stretchy net bag for vegetables, fruit, and bulk dry goods.',
    description:
      'Expands easily to hold up to 6 kg of produce while folding flat into a pocket or glovebox between errands.',
    sustainabilityNote:
      'Unbleached ring-spun cotton that replaces dozens of thin plastic produce bags.',
    priceInr: 299,
    imageUrl: '/images/products/cotton-produce-bags.jpg',
    stock: 45,
    featured: true,
  },
  {
    id: 'prod-06',
    slug: 'stainless-steel-straws',
    name: 'Reusable Steel Straws (Set of 4)',
    category: 'Kitchen',
    materialBadge: 'Recycled 304 Steel',
    shortDescription:
      'Two bent and two straight food-grade straws with a cleaning brush.',
    description:
      'Smooth rounded rims for cold coffees, smoothies, and nimbu pani at home or on the go, packed in a cotton pouch.',
    sustainabilityNote:
      'Infinitely recyclable stainless steel built to last for years.',
    priceInr: 249,
    imageUrl: '/images/products/stainless-steel-straws.jpg',
    stock: 60,
    featured: true,
  },
  {
    id: 'prod-07',
    slug: 'bamboo-toothbrush',
    name: 'Bamboo Charcoal Toothbrush (Pack of 2)',
    category: 'Bath',
    materialBadge: 'FSC Bamboo Handle',
    shortDescription:
      'Ergonomic bamboo handle with soft BPA-free charcoal-infused bristles.',
    description:
      'Smooth water-resistant bamboo grip paired with gentle tapered bristles for comfortable daily brushing.',
    sustainabilityNote:
      'Snap off the bristle head and compost the untreated bamboo handle.',
    priceInr: 179,
    imageUrl: '/images/products/bamboo-toothbrush.jpg',
    stock: 64,
    featured: true,
  },
  {
    id: 'prod-08',
    slug: 'bamboo-dish-brush',
    name: 'Bamboo Dish & Pot Brush',
    category: 'Kitchen',
    materialBadge: 'Bamboo & Sisal',
    shortDescription:
      'Replaceable sisal-bristle scrub brush with an oiled bamboo handle.',
    description:
      'Firm plant bristles tackle baked-on food on kadhais, baking trays, and steel cookware while keeping hands out of hot soapy water.',
    sustainabilityNote:
      'Handle is reusable; worn brush heads are plant-fiber compostable.',
    priceInr: 249,
    imageUrl: '/images/products/bamboo-dish-brush.jpg',
    stock: 39,
    featured: true,
  },
  {
    id: 'prod-09',
    slug: 'amber-soap-dispenser',
    name: 'Refillable Amber Glass Soap Bottle',
    category: 'Bath',
    materialBadge: 'Recycled Amber Glass',
    shortDescription:
      '500 ml UV-tinted glass dispenser built for bulk soap and lotion refills.',
    description:
      'Thick amber glass protects essential oils from sunlight and pairs with a corrosion-resistant matte pump for bathroom or sink counters.',
    sustainabilityNote:
      'Buy liquid refills in bulk pouches and reuse this bottle indefinitely.',
    priceInr: 349,
    imageUrl: '/images/products/amber-soap-dispenser.jpg',
    stock: 22,
    featured: false,
  },
  {
    id: 'prod-10',
    slug: 'insulated-steel-bottle',
    name: 'Insulated Steel Water Bottle (750 ml)',
    category: 'Carry',
    materialBadge: 'Recycled Steel',
    shortDescription:
      'Double-wall vacuum flask that keeps water chilled for 24 hours.',
    description:
      'Sweat-free powder-coated body sized for backpack side pockets, campus desks, and daily commutes.',
    sustainabilityNote:
      'Replaces single-use PET water bottles with a BPA-free lifetime vessel.',
    priceInr: 699,
    compareAtInr: 849,
    imageUrl: '/images/products/insulated-steel-bottle.jpg',
    stock: 30,
    featured: false,
  },
  {
    id: 'prod-11',
    slug: 'recycled-glass-tumblers',
    name: 'Recycled Glass Drinking Tumbler',
    category: 'Home',
    materialBadge: '100% Recycled Glass',
    shortDescription:
      'Hand-finished 320 ml drinking glass blown from reclaimed glass.',
    description:
      'Thick weighted base with a subtle clear finish from recycled glass cullet—ideal for water, iced tea, and morning juice.',
    sustainabilityNote:
      'Melted from post-consumer glass bottles using lower kiln energy.',
    priceInr: 549,
    imageUrl: '/images/products/recycled-glass-tumblers.jpg',
    stock: 19,
    featured: false,
  },
  {
    id: 'prod-12',
    slug: 'soy-wax-candle',
    name: 'Hand-Poured Soy Wax Jar Candle',
    category: 'Home',
    materialBadge: '100% Soy Wax',
    shortDescription:
      'Clean-burning lemongrass and eucalyptus soy candle in a reusable jar.',
    description:
      'Slow-burning plant wax with an unbleached cotton wick for up to 36 hours of gentle room fragrance without paraffin soot.',
    sustainabilityNote:
      'Wash out the glass jar after burning to reuse for spices or desk storage.',
    priceInr: 429,
    imageUrl: '/images/products/soy-wax-candle.jpg',
    stock: 27,
    featured: false,
  },
  {
    id: 'prod-13',
    slug: 'wooden-hair-comb',
    name: 'Wide-Tooth Neem Wood Comb',
    category: 'Bath',
    materialBadge: 'Seasoned Neem Wood',
    shortDescription:
      'Hand-carved static-free comb that gently detangles wet or dry hair.',
    description:
      'Rounded wooden teeth distribute natural scalp oils evenly without snagging or generating plastic static.',
    sustainabilityNote:
      'Carved from sustainably pruned neem timber with zero plastic.',
    priceInr: 219,
    imageUrl: '/images/products/wooden-hair-comb.jpg',
    stock: 44,
    featured: false,
  },
  {
    id: 'prod-14',
    slug: 'linen-kitchen-towel',
    name: 'Unbleached Linen Kitchen Towels (2-Pack)',
    category: 'Home',
    materialBadge: 'Flax & Organic Cotton',
    shortDescription:
      'Fast-drying waffle-weave dishcloths that replace paper towel rolls.',
    description:
      'Absorbent textured weave dries glassware lint-free and softens with every wash, finished with a sewn hanging loop.',
    sustainabilityNote:
      'Flax linen requires minimal irrigation and lasts years of daily laundering.',
    priceInr: 379,
    imageUrl: '/images/products/linen-kitchen-towel.jpg',
    stock: 31,
    featured: false,
  },
];

export const PRODUCT_CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Kitchen',
  'Bath',
  'Carry',
  'Home',
];

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateShippingInr(subtotalInr: number): number {
  if (subtotalInr <= 0) return 0;
  return subtotalInr >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_INR;
}
