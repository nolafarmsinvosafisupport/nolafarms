import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { Leaf, MapPin, Compass, ArrowRight, Play, Camera, ChevronRight, Menu, X, Mail, Phone } from 'lucide-react';

// Custom hook for mouse position (used for subtle parallax interactions)
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });
  useEffect(() => {
    const updateMousePosition = ev => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);
  return mousePosition;
};

// Ambient background particles to make the site feel "alive"
const DustParticles = () => {
  const particles = Array.from({ length: 30 });
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 mix-blend-screen">
      {particles.map((_, i) => {
        const size = Math.random() * 3 + 1;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-100/30"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, -200],
              x: [0, Math.random() * 50 - 25, Math.random() * 50 - 25],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
          />
        );
      })}
    </div>
  );
};

// Reusable animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const SectionHeader = ({ title, subtitle, align = "left" }) => (
  <motion.div 
    variants={fadeUp} 
    initial="hidden" 
    whileInView="visible" 
    viewport={{ once: true, margin: "-100px" }}
    className={`mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}
  >
    <p className="tracking-[0.2em] text-amber-600 uppercase text-xs font-semibold mb-4 flex items-center gap-2 justify-center md:justify-start">
      {align === 'center' && <span className="w-8 h-[1px] bg-amber-600 block"></span>}
      {subtitle}
      {align === 'left' && <span className="w-12 h-[1px] bg-amber-600 block"></span>}
      {align === 'center' && <span className="w-8 h-[1px] bg-amber-600 block"></span>}
    </p>
    <h2 className="text-4xl md:text-6xl font-serif text-slate-900 dark:text-stone-100">
      {title}
    </h2>
  </motion.div>
);

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.1]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-stone-900 flex items-center justify-center">
      {/* Parallax Background */}
      <motion.div 
        style={{ y: y1, scale }}
        className="absolute inset-0 w-full h-full"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-stone-900/90 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1518596603135-f70241857905?q=80&w=2000&auto=format&fit=crop" 
          alt="Laikipia Landscape" 
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Cinematic Text Reveal */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <p className="text-amber-500 tracking-[0.3em] text-sm md:text-base mb-6 font-light uppercase">
            Laikipia, Kenya
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-8 leading-tight tracking-tight">
            Enkare <br className="md:hidden" />
            <span className="italic font-light text-stone-300">Highlands</span>
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-12"
        >
          A regenerative estate where untamed wilderness meets visionary agriculture. Invest in the earth, experience the extraordinary.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a href="#invest" className="group relative px-8 py-4 bg-amber-700 text-white overflow-hidden rounded-sm transition-all hover:bg-amber-800">
            <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest text-xs font-semibold">
              Investor Vision <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a href="#visit" className="group relative px-8 py-4 bg-transparent border border-white/30 text-white overflow-hidden rounded-sm transition-all hover:bg-white/10 hover:border-white/50">
            <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest text-xs font-semibold">
              Discover the Farm
            </span>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-white/50 tracking-widest text-[10px] uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-white/20 overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48, 48], opacity: [0, 1, 0] }} 
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-amber-500"
          />
        </div>
      </motion.div>
    </section>
  );
};

const AboutSection = () => {
  return (
    <section id="about" className="py-32 bg-stone-100 dark:bg-stone-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            className="order-2 lg:order-1"
          >
            <SectionHeader subtitle="Our Story" title="Rooted in the Rift." align="left" />
            
            <motion.p variants={fadeUp} className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed mb-6">
              Nestled on the equator in the shadow of Mount Kenya, Enkare Highlands spans 5,000 acres of diverse ecosystems. We are not just a farm; we are a living laboratory for regenerative agriculture and wildlife coexistence.
            </motion.p>
            <motion.p variants={fadeUp} className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed mb-10">
              Our approach restores soil vitality, sequesters carbon, and produces world-class organic yields, all while providing a sanctuary for traversing elephant herds and indigenous flora.
            </motion.p>

            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-8 border-t border-stone-300 dark:border-stone-800 pt-10">
              <div>
                <h4 className="text-4xl font-serif text-amber-700 mb-2">5k</h4>
                <p className="text-sm uppercase tracking-wider text-stone-500">Acres Preserved</p>
              </div>
              <div>
                <h4 className="text-4xl font-serif text-amber-700 mb-2">100%</h4>
                <p className="text-sm uppercase tracking-wider text-stone-500">Regenerative</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 relative h-[600px]"
          >
            <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 rounded-sm overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1603513492128-ba7e95454685?q=80&w=1000&auto=format&fit=crop" 
                alt="Wildlife on Farm" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating accent card */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-10 -left-10 bg-white dark:bg-stone-950 p-8 shadow-2xl max-w-xs border border-stone-100 dark:border-stone-800"
            >
              <Leaf className="text-amber-600 mb-4" size={32} />
              <h3 className="font-serif text-xl mb-2 dark:text-white">Harmony by Design</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">Agriculture that yields without depleting. Nature that thrives alongside commerce.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const InvestSection = () => {
  const stats = [
    { label: "Projected IRR", value: "14.5%", desc: "Consistent, sustainable yield backed by tangible land assets." },
    { label: "Carbon Credits", value: "20k", desc: "Verified tons sequestered annually, creating secondary revenue." },
    { label: "Agri-Yield", value: "+30%", desc: "Increase in organic output over conventional local metrics." }
  ];

  return (
    <section id="invest" className="py-32 bg-[#1B2A1E] text-stone-100 relative overflow-hidden">
      {/* Subtle topographic background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-20">
          <SectionHeader subtitle="For Investors" title="Cultivating Capital. Restoring Earth." align="left" />
          <p className="max-w-2xl text-stone-400 text-lg md:text-xl font-light">
            We offer a rare asset class: high-performance agriculture coupled with measurable ecological repair. Enkare represents a defensive, hard-asset investment with significant upside.
          </p>
        </div>

        <motion.div 
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx} variants={fadeUp}
              className="group p-8 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-500 flex flex-col justify-between h-full"
            >
              <div>
                <h4 className="text-5xl font-serif text-amber-500 mb-4 group-hover:scale-105 transition-transform origin-left">{stat.value}</h4>
                <h5 className="text-xl font-medium text-white mb-4">{stat.label}</h5>
                <p className="text-stone-400 leading-relaxed">{stat.desc}</p>
              </div>
              <div className="mt-8 flex items-center text-amber-500 text-sm uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View Thesis <ChevronRight size={16} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <button className="px-10 py-5 bg-white text-[#1B2A1E] uppercase tracking-widest text-sm font-bold hover:bg-amber-500 transition-colors duration-300">
            Request Prospectus
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const VisitSection = () => {
  const experiences = [
    {
      title: "Agro-Safari Expeditions",
      img: "https://images.unsplash.com/photo-1587339144367-f1dd9629b1be?q=80&w=800&auto=format&fit=crop",
      desc: "Tour our working regenerative systems alongside roaming herds."
    },
    {
      title: "The Eco-Lodge",
      img: "https://images.unsplash.com/photo-1571896349842-12c8e1e7914d?q=80&w=800&auto=format&fit=crop",
      desc: "Sleep under the Laikipia stars in luxury, off-grid accommodations."
    },
    {
      title: "Farm-to-Table Dining",
      img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
      desc: "Taste the terroir with meals harvested steps from your table."
    }
  ];

  return (
    <section id="visit" className="py-32 bg-[#FDFBF7] dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeader subtitle="Experience Enkare" title="Touch the Soil." align="center" />
        
        <motion.div 
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20"
        >
          {experiences.map((exp, idx) => (
            <motion.div key={idx} variants={fadeUp} className="group cursor-pointer">
              <div className="relative overflow-hidden h-[400px] mb-6">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  src={exp.img} 
                  alt={exp.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mb-3">{exp.title}</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-4">{exp.desc}</p>
              <span className="text-amber-700 text-sm uppercase tracking-wider font-semibold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Explore <ArrowRight size={14} />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const GallerySection = () => {
  // Masonry layout simulation
  const images = [
    "https://images.unsplash.com/photo-1547471080-7fc2caa6f17f?q=80&w=600&auto=format&fit=crop", // Giraffe
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop", // Landscape
    "https://images.unsplash.com/photo-1516244463378-0158223d70b7?q=80&w=600&auto=format&fit=crop", // Crops
    "https://images.unsplash.com/photo-1504280741564-f25ea8401306?q=80&w=600&auto=format&fit=crop"  // Dirt/Hands
  ];

  return (
    <section id="gallery" className="py-24 bg-stone-900">
      <div className="w-full overflow-hidden flex flex-nowrap gap-4 px-4">
        {images.map((src, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className="min-w-[300px] md:min-w-[400px] h-[400px] md:h-[500px] relative group"
          >
            <img src={src} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" alt="Gallery item" />
            <div className="absolute inset-0 bg-amber-900/0 group-hover:bg-amber-900/20 transition-colors duration-500 mix-blend-multiply" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer id="contact" className="bg-stone-950 pt-32 pb-12 border-t border-stone-800 text-stone-400">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-4xl font-serif text-white mb-6">Enkare Highlands</h2>
          <p className="max-w-sm mb-8 text-stone-500">
            A vision for the future of farming, rooted deeply in the ancient soils of Laikipia.
          </p>
          <div className="flex gap-4">
            <span className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-amber-700 hover:text-white transition-colors cursor-pointer"><Mail size={16} /></span>
            <span className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-amber-700 hover:text-white transition-colors cursor-pointer"><Phone size={16} /></span>
            <span className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-amber-700 hover:text-white transition-colors cursor-pointer"><MapPin size={16} /></span>
          </div>
        </div>
        
        <div>
          <h4 className="text-white uppercase tracking-widest text-xs font-semibold mb-6">Explore</h4>
          <ul className="space-y-4">
            <li><a href="#about" className="hover:text-amber-500 transition-colors">Our Story</a></li>
            <li><a href="#invest" className="hover:text-amber-500 transition-colors">Investor Relations</a></li>
            <li><a href="#visit" className="hover:text-amber-500 transition-colors">Book a Stay</a></li>
            <li><a href="#gallery" className="hover:text-amber-500 transition-colors">Journal</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white uppercase tracking-widest text-xs font-semibold mb-6">Location</h4>
          <p className="mb-2">Laikipia County</p>
          <p className="mb-2">Rift Valley Province</p>
          <p className="mb-6">Kenya, East Africa</p>
          <p className="text-xs text-stone-600">Coordinates: 0°18'N 36°58'E</p>
        </div>
      </div>

      <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-600">
        <p>&copy; {new Date().getFullYear()} Enkare Highlands Estate. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span className="hover:text-stone-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-stone-300 cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Smooth progress bar at the top
  const scaleX = useSpring(useTransform(scrollY, [0, 5000], [0, 1]), {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Inline styles for fonts to ensure they load in the preview environment
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap');
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #FAFAFA;
      color: #111;
    }

    h1, h2, h3, h4, h5, h6, .font-serif {
      font-family: 'Playfair Display', serif;
    }

    /* Custom Premium Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #1c1917; 
    }
    ::-webkit-scrollbar-thumb {
      background: #78350f; 
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #b45309; 
    }
  `;

  return (
    <div className="relative selection:bg-amber-900 selection:text-white">
      <style>{globalStyles}</style>
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-amber-500 origin-left z-50"
        style={{ scaleX }}
      />

      <DustParticles />

      {/* Navigation */}
      <nav className={`fixed w-full z-40 transition-all duration-500 ${isScrolled ? 'bg-stone-950/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          <div className="text-white font-serif text-2xl tracking-wider">
            ENKARE<span className="text-amber-500">.</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            {['About', 'Invest', 'Visit', 'Gallery'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-stone-300 hover:text-white text-xs uppercase tracking-widest font-medium transition-colors"
              >
                {item}
              </a>
            ))}
            <a href="#contact" className="ml-4 px-6 py-2 border border-white/20 text-white text-xs uppercase tracking-widest hover:bg-white hover:text-stone-950 transition-colors">
              Contact
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-stone-950 pt-24 px-6 md:hidden flex flex-col gap-8"
          >
            {['About', 'Invest', 'Visit', 'Gallery', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white text-3xl font-serif text-center"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <HeroSection />
        <AboutSection />
        <InvestSection />
        <VisitSection />
        <GallerySection />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;