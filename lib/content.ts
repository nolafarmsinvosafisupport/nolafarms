import { ClipboardList, Compass, Tractor } from 'lucide-react';
import { IMAGES } from './constants';

export const crops = [
  { name: 'Wheat', season: 'Seasonal harvest', image: IMAGES.wheat, alt: 'Wheat crop grown at Nola Ranches Laikipia Kenya', description: 'Highland-grown wheat from our expansive Laikipia ranch — available for milling, wholesale, and direct purchase.' },
  { name: 'Fresh Produce', season: 'Availability varies', image: IMAGES.produce, alt: 'Fresh farm produce from Nola Ranches Oloitoktok Kenya', description: 'Watermelons, cabbages, spinach, and sukuma wiki grown fresh at our Oloitoktok ranch.' },
];

export const livestock = [
  { name: 'Exotic Cattle', image: IMAGES.cattle, alt: 'Brahman and Holstein cattle at Nola Ranches Oloitoktok Kenya', description: 'Brahman and Holstein cattle raised at our Oloitoktok ranch for buyers seeking quality livestock.' },
  { name: 'Goats & Sheep', image: IMAGES.goats, alt: 'Boer goats and Dorper sheep at Nola Ranches Oloitoktok Kenya', description: 'Premium Boer goats and Dorper sheep bred at Oloitoktok — enquire directly through the farm.' },
];

export const services = [
  { name: 'Ranch Visits', icon: Compass, description: 'Guided tours across our Oloitoktok and Laikipia ranches — walk the fields, meet the herds, and experience working agriculture.' },
  { name: 'Wholesale & Bulk Orders', icon: Tractor, description: 'Direct wholesale enquiries for livestock, fresh produce, and grains from both our Oloitoktok and Laikipia ranches.' },
  { name: 'Farm Consultancy', icon: ClipboardList, description: 'Agricultural consultancy — from livestock breeding to crop management. Contact us to discuss your farming goals.' },
];

export const galleryImages = [
  { src: '/images/farm/farm.webp', alt: 'Nola Ranches estate farmland Kenya', caption: 'The Nola Ranches estate.' },
  { src: '/images/livestock/cow6.webp', alt: 'Cattle at Nola Ranches Oloitoktok Kenya', caption: 'Cattle at our Oloitoktok ranch.' },
  { src: '/images/source/jpeg/goats3.jpeg', alt: 'Boer goats at Nola Ranches Oloitoktok Kenya', caption: 'Boer goat breeding and care.' },
  { src: '/images/source/jpeg/wheat.jpeg', alt: 'Wheat crops at Nola Ranches Laikipia Kenya', caption: 'Wheat fields in Laikipia.' },
  { src: '/images/livestock/sheep.jpeg', alt: 'Dorper sheep at Nola Ranches Kenya', caption: 'Dorper sheep on the ranch.' },
  { src: '/images/farm/farm3.webp', alt: 'Nola Ranches fields and landscape Kenya', caption: 'Open farmlands of Nola Ranches.' },
];
