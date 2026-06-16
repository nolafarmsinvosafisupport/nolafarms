import { ClipboardList, Compass, Tractor } from 'lucide-react';
import { IMAGES } from './constants';

export const crops = [
  { name: 'Wheat', season: 'Seasonal harvest', image: IMAGES.wheat, alt: 'Wheat crop grown at Nola Farms in Laikipia Kenya', description: 'Field-grown wheat from a 375-acre Laikipia agricultural estate.' },
  { name: 'Seasonal Produce', season: 'Availability varies', image: IMAGES.produce, alt: 'Fresh farm produce from Nola Farms Laikipia Kenya', description: "Farm produce placeholders ready for the client's confirmed crop list." },
];

export const livestock = [
  { name: 'Exotic Cattle', image: IMAGES.cattle, alt: 'Exotic cattle breeds for sale at Nola Farms Laikipia Kenya', description: 'Cattle raised on the estate for buyers seeking quality livestock from Laikipia.' },
  { name: 'Goats', image: IMAGES.goats, alt: 'Goats raised at Nola Farms in Laikipia Kenya', description: 'Goat breeding and sales enquiries handled directly through Nola Farms.' },
];

export const services = [
  { name: 'Ranch Visits', icon: Compass, description: 'Guided tours of the farm, fields, and exotic livestock for visitors and groups.' },
  { name: 'Wholesale & Bulk Orders', icon: Tractor, description: 'Direct enquiries for farm produce and livestock sourcing from Nola Farms.' },
  { name: 'Farm Consultancy', icon: ClipboardList, description: 'Placeholder service to be confirmed with the client before launch.' },
];

export const galleryImages = [
  { src: IMAGES.hero, alt: 'Nola Farms 375-acre estate landscape in Laikipia Kenya', caption: 'The Nola Farms estate in Laikipia.' },
  { src: IMAGES.wheat, alt: 'Wheat fields at Nola Farms Laikipia Kenya', caption: 'Wheat fields under cultivation.' },
  { src: IMAGES.cattle, alt: 'Exotic cattle at Nola Farms in Laikipia Kenya', caption: 'Cattle raised on the estate.' },
  { src: IMAGES.goats, alt: 'Goats at Nola Farms livestock area in Laikipia Kenya', caption: 'Goat breeding and livestock care.' },
  { src: IMAGES.produce, alt: 'Farm produce from Nola Farms Laikipia Kenya', caption: 'Seasonal produce placeholders.' },
  { src: IMAGES.landscape, alt: 'Laikipia highland landscape near Nola Farms Kenya', caption: 'Laikipia highland views.' },
];
