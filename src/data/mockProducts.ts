import { Product } from '../types';

/**
 * Mock product data for the marketplace
 * 
 * NORMAL MODE PRODUCTS:
 * - Artisan goods, vintage items, electronics
 * - Warm, inviting descriptions
 * - Standard seller types
 * 
 * UPSIDE DOWN MODE PRODUCTS:
 * - Black market medieval items
 * - Dark, dangerous descriptions
 * - Cursed items with warnings
 */

// ============================================
// NORMAL MODE PRODUCTS (Artisan Goods)
// ============================================
export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Vintage Leather Jacket',
    price: 4999,
    imageUrl: 'https://picsum.photos/seed/jacket/400/800',
    seller: {
      id: 's1',
      name: 'Rahul Sharma',
      rating: 4.5,
      totalSales: 120,
      contactNumber: '+91 98765 43210',
      address: 'Connaught Place, New Delhi, 110001',
      email: 'rahul.sharma@email.com',
      type: 'artisan',
    },
    description: 'Classic vintage leather jacket in excellent condition. Genuine leather with minimal wear.',
    eerieDescription: 'Worn by many before you... each stitch holds a memory.',
    category: 'Fashion',
    createdAt: '2025-12-01',
    sellerType: 'artisan',
  },
  {
    id: '2',
    title: 'iPhone 14 Pro - 256GB',
    price: 89999,
    imageUrl: 'https://picsum.photos/seed/iphone/400/800',
    seller: {
      id: 's2',
      name: 'Priya Electronics',
      rating: 4.8,
      totalSales: 450,
      contactNumber: '+91 99887 76655',
      address: 'Lajpat Nagar, New Delhi, 110024',
      email: 'priya.electronics@email.com',
      type: 'artisan',
    },
    description: 'Like new iPhone 14 Pro with all accessories. Battery health 98%. No scratches.',
    eerieDescription: 'Still remembers the last owner\'s touch...',
    category: 'Electronics',
    createdAt: '2025-12-15',
    sellerType: 'artisan',
  },
  {
    id: '3',
    title: 'Handmade Wooden Table',
    price: 12500,
    imageUrl: 'https://picsum.photos/seed/table/400/800',
    seller: {
      id: 's3',
      name: 'Crafts by Vikram',
      rating: 4.9,
      totalSales: 85,
      contactNumber: '+91 87654 32109',
      address: 'Jaipur, Rajasthan, 302001',
      type: 'artisan',
    },
    description: 'Beautiful handcrafted wooden dining table. Seats 6 people comfortably. Solid teak wood.',
    eerieDescription: 'The wood whispers of ancient forests...',
    category: 'Furniture',
    createdAt: '2025-11-20',
    sellerType: 'artisan',
  },
  {
    id: '4',
    title: 'Sony PlayStation 5',
    price: 54999,
    imageUrl: 'https://picsum.photos/seed/ps5/400/800',
    seller: {
      id: 's4',
      name: 'Gaming Hub',
      rating: 4.7,
      totalSales: 200,
      contactNumber: '+91 90909 12345',
      address: 'Koramangala, Bangalore, 560034',
      email: 'contact@gaminghub.in',
      type: 'artisan',
    },
    description: 'Brand new PS5 with extra controller. Disc edition. Sealed box with warranty.',
    eerieDescription: 'Gateway to worlds unknown...',
    category: 'Gaming',
    createdAt: '2025-12-10',
    sellerType: 'artisan',
  },
  {
    id: '5',
    title: 'Canon EOS R5 Camera',
    price: 125000,
    imageUrl: 'https://picsum.photos/seed/camera/400/800',
    seller: {
      id: 's5',
      name: 'Photo World',
      rating: 4.6,
      totalSales: 75,
      contactNumber: '+91 98123 45678',
      address: 'MG Road, Mumbai, 400001',
      type: 'artisan',
    },
    description: 'Professional mirrorless camera with 24-105mm lens. Shutter count under 10K. Includes bag.',
    eerieDescription: 'Captures more than meets the eye...',
    category: 'Photography',
    createdAt: '2025-11-25',
    sellerType: 'artisan',
  },
  {
    id: '6',
    title: 'Antique Wall Clock',
    price: 3500,
    imageUrl: 'https://picsum.photos/seed/clock/400/800',
    seller: {
      id: 's6',
      name: 'Heritage Finds',
      rating: 4.4,
      totalSales: 60,
      address: 'Chor Bazaar, Mumbai, 400003',
      type: 'artisan',
    },
    description: 'Beautiful antique wall clock from the 1920s. Working condition. Minor patina adds character.',
    eerieDescription: 'Time moves differently around it...',
    category: 'Antiques',
    createdAt: '2025-12-05',
    sellerType: 'artisan',
  },
  {
    id: '7',
    title: 'Mountain Bike - Giant',
    price: 28000,
    imageUrl: 'https://picsum.photos/seed/bike/400/800',
    seller: {
      id: 's7',
      name: 'Sports Arena',
      rating: 4.5,
      totalSales: 150,
      contactNumber: '+91 77665 54433',
      address: 'HSR Layout, Bangalore, 560102',
      email: 'sports.arena@email.com',
      type: 'artisan',
    },
    description: '21-speed mountain bike, barely used. Shimano gears. Perfect for trail riding.',
    eerieDescription: 'Will take you places you never meant to go...',
    category: 'Sports',
    createdAt: '2025-12-08',
    sellerType: 'artisan',
  },
  {
    id: '8',
    title: 'Designer Handbag',
    price: 7999,
    imageUrl: 'https://picsum.photos/seed/bag/400/800',
    seller: {
      id: 's8',
      name: 'Fashion Forward',
      rating: 4.3,
      totalSales: 95,
      contactNumber: '+91 88776 65544',
      email: 'fashionforward@email.com',
      type: 'artisan',
    },
    description: 'Authentic designer handbag with dust bag. Barely used. Certificate of authenticity included.',
    eerieDescription: 'Something stirs within its depths...',
    category: 'Fashion',
    createdAt: '2025-12-12',
    sellerType: 'artisan',
  },
];

// ============================================
// UPSIDE DOWN MODE PRODUCTS (Black Market)
// ============================================
export const blackMarketProducts: Product[] = [
  {
    id: 'bm1',
    title: 'Cursed Medieval Dagger',
    price: 66666,
    imageUrl: 'https://picsum.photos/seed/dagger/400/800',
    seller: {
      id: 'bms1',
      name: 'The Collector',
      rating: 4.9,
      totalSales: 13,
      address: 'Unknown Location',
      type: 'blackmarket',
    },
    description: 'Ancient dagger with runes of unknown origin. Handle warm to touch.',
    eerieDescription: 'Handle at your own risk. It hungers.',
    category: 'Weapons',
    createdAt: '1342-06-06',
    sellerType: 'blackmarket',
    isCursed: true,
  },
  {
    id: 'bm2',
    title: 'Shadowbound Grimoire',
    price: 199999,
    imageUrl: 'https://picsum.photos/seed/grimoire/400/800',
    seller: {
      id: 'bms2',
      name: 'Void Merchant',
      rating: 5.0,
      totalSales: 7,
      type: 'blackmarket',
    },
    description: 'Tome bound in material that absorbs light. Pages write themselves.',
    eerieDescription: 'Unstable. Limited supply. Do not read aloud.',
    category: 'Artifacts',
    createdAt: '0666-06-06',
    sellerType: 'blackmarket',
    isCursed: true,
  },
  {
    id: 'bm3',
    title: 'Plague Doctor Mask',
    price: 45000,
    imageUrl: 'https://picsum.photos/seed/plaguemask/400/800',
    seller: {
      id: 'bms3',
      name: 'Forgotten Archives',
      rating: 4.7,
      totalSales: 23,
      address: 'The Old Quarter',
      type: 'blackmarket',
    },
    description: 'Authentic 14th century plague doctor mask. Still smells of herbs.',
    eerieDescription: 'Those who wear it see what others cannot...',
    category: 'Antiques',
    createdAt: '1348-03-15',
    sellerType: 'blackmarket',
    isCursed: false,
  },
  {
    id: 'bm4',
    title: 'Whispering Chalice',
    price: 88888,
    imageUrl: 'https://picsum.photos/seed/chalice/400/800',
    seller: {
      id: 'bms4',
      name: 'The Antiquarian',
      rating: 4.8,
      totalSales: 5,
      type: 'blackmarket',
    },
    description: 'Silver chalice that emits faint sounds at midnight. Origin: unknown.',
    eerieDescription: 'It speaks to those who listen. Not all survive.',
    category: 'Artifacts',
    createdAt: '1066-12-25',
    sellerType: 'blackmarket',
    isCursed: true,
  },
  {
    id: 'bm5',
    title: 'Executioner\'s Axe',
    price: 77000,
    imageUrl: 'https://picsum.photos/seed/axe/400/800',
    seller: {
      id: 'bms5',
      name: 'Iron Legacy',
      rating: 4.6,
      totalSales: 31,
      address: 'Tower District',
      type: 'blackmarket',
    },
    description: 'Heavy iron axe from the Tower of London. Blade still sharp.',
    eerieDescription: 'Has tasted royal blood. Remembers every swing.',
    category: 'Weapons',
    createdAt: '1536-05-19',
    sellerType: 'blackmarket',
    isCursed: false,
  },
  {
    id: 'bm6',
    title: 'Obsidian Scrying Mirror',
    price: 55555,
    imageUrl: 'https://picsum.photos/seed/mirror/400/800',
    seller: {
      id: 'bms6',
      name: 'Midnight Curios',
      rating: 4.9,
      totalSales: 9,
      type: 'blackmarket',
    },
    description: 'Aztec obsidian mirror. Shows reflections of things not present.',
    eerieDescription: 'Your reflection watches back. Do not stare too long.',
    category: 'Artifacts',
    createdAt: '1400-01-01',
    sellerType: 'blackmarket',
    isCursed: true,
  },
  {
    id: 'bm7',
    title: 'Bone Dice Set',
    price: 13000,
    imageUrl: 'https://picsum.photos/seed/bonedice/400/800',
    seller: {
      id: 'bms7',
      name: 'Gambler\'s Rest',
      rating: 4.5,
      totalSales: 66,
      address: 'The Crossroads',
      type: 'blackmarket',
    },
    description: 'Dice carved from unknown bone. Always roll what you need... at a cost.',
    eerieDescription: 'Fortune favors the bold. But fortune collects.',
    category: 'Games',
    createdAt: '1666-09-02',
    sellerType: 'blackmarket',
    isCursed: true,
  },
  {
    id: 'bm8',
    title: 'Mourning Locket',
    price: 33333,
    imageUrl: 'https://picsum.photos/seed/locket/400/800',
    seller: {
      id: 'bms8',
      name: 'Victorian Shadows',
      rating: 4.4,
      totalSales: 18,
      email: 'shadows@void.net',
      type: 'blackmarket',
    },
    description: 'Victorian mourning locket containing hair of the deceased. Warm to touch.',
    eerieDescription: 'She still waits inside. Looking for her beloved.',
    category: 'Jewelry',
    createdAt: '1888-11-09',
    sellerType: 'blackmarket',
    isCursed: false,
  },
];

// Function to fetch products - can be replaced with API call later
export const fetchProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 500);
  });
};

// Function to fetch black market products for Upside Down mode
export const fetchBlackMarketProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(blackMarketProducts);
    }, 500);
  });
};

// Function to fetch products based on mode
export const fetchProductsByMode = async (isUpsideDown: boolean): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(isUpsideDown ? blackMarketProducts : mockProducts);
    }, 500);
  });
};
