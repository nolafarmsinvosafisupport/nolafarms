import { ClipboardList, Compass, Tractor } from 'lucide-react';
import { IMAGES } from './constants';

export const crops = [
  { name: 'Wheat', season: 'Seasonal harvest', image: IMAGES.wheat, alt: 'Wheat crop grown at Nola Farms in Laikipia Kenya', description: 'Field-grown wheat from a 375-acre Laikipia agricultural estate.' },
  { name: 'Seasonal Produce', season: 'Availability varies', image: IMAGES.produce, alt: 'Fresh farm produce from Nola Farms Laikipia Kenya', description: 'Seasonal produce grown on the estate — watermelons, cabbages, and more.' },
];

export const livestock = [
  { name: 'Exotic Cattle', image: IMAGES.cattle, alt: 'Exotic cattle breeds at Nola Farms Laikipia Kenya', description: 'Cattle raised on the estate for buyers seeking quality livestock from Laikipia.' },
  { name: 'Goats', image: IMAGES.goats, alt: 'Goats raised at Nola Farms in Laikipia Kenya', description: 'Goat breeding and sales enquiries handled directly through Nola Farms.' },
];

export const services = [
  { name: 'Ranch Visits', icon: Compass, description: 'Guided tours of the farm, fields, and exotic livestock for visitors and groups.' },
  { name: 'Wholesale & Bulk Orders', icon: Tractor, description: 'Direct enquiries for farm produce and livestock sourcing from Nola Farms.' },
  { name: 'Farm Consultancy', icon: ClipboardList, description: 'Placeholder service to be confirmed with the client before launch.' },
];

export const galleryImages = [
  { src: '/images/farm/farm.webp', alt: 'Nola Farms estate farmland in Laikipia Kenya', caption: 'The Nola Farms estate.' },
  { src: '/images/livestock/cow6.webp', alt: 'Cattle at Nola Farms Laikipia Kenya', caption: 'Cattle raised on the estate.' },
  { src: '/images/source/jpeg/goats3.jpeg', alt: 'Goats grazing at Nola Farms Laikipia Kenya', caption: 'Goat breeding and care.' },
  { src: '/images/source/jpeg/wheat.jpeg', alt: 'Wheat crops at Nola Farms in Laikipia Kenya', caption: 'Wheat fields under cultivation.' },
  { src: '/images/livestock/sheep.jpeg', alt: 'Sheep at Nola Farms Laikipia Kenya', caption: 'Sheep on the highland pastures.' },
  { src: '/images/farm/farm3.webp', alt: 'Nola Farms fields and landscape in Laikipia Kenya', caption: 'Open farmlands of Nola Farms.' },
];
