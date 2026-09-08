import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const NAV_LINKS = ["Services", "Our Cars", "Packages", "About", "Reviews", "Contact"];

interface Car {
  id: number;
  name: string;
  specs: string;
  tag: string;
  img: string;
  gallery: string[];
  features: string[];
  description: string;
}

const CARS: Car[] = [
  {
    id: 1,
    name: "Toyota Innova",
    specs: "7-seater · AC · Automatic",
    tag: "Most Booked",
    img: "https://images.unsplash.com/photo-1748215210939-ad8b6c8c086d?w=800&h=500&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1748215210939-ad8b6c8c086d?w=1200&h=700&fit=crop&auto=format",
      "/src/imports/WhatsApp_Image_.jpeg",
      "https://images.unsplash.com/photo-1581862142388-23e1c52ca091?w=1200&h=700&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1611073819030-ac7216dd0022?w=1200&h=700&fit=crop&auto=format",
    ],
    features: ["7 Seats", "AC", "GPS Navigation", "USB Charging", "Luggage Space", "Driver Available"],
    description: "The Toyota Innova is our most trusted family and group vehicle — spacious, comfortable, and built for both city commutes and long highway journeys. A favourite for pilgrimages, family trips, and airport transfers.",
  },
  {
    id: 2,
    name: "Suzuki Baleno",
    specs: "5-seater · AC · Automatic",
    tag: "Hatchback",
    img: "/src/imports/IMG_9426.PNG",
    gallery: [
      "/src/imports/IMG_9426.PNG",
      "/src/imports/IMG_9428.PNG",
      "https://images.unsplash.com/photo-1564245316659-a21d3a49d0f5?w=1200&h=700&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1646119197795-c0f7ba0e34c0?w=1200&h=700&fit=crop&auto=format",
    ],
    features: ["5 Seats", "AC", "Fuel Efficient", "USB Charging", "Compact", "Easy Parking"],
    description: "The Suzuki Baleno is our go-to for solo travelers and couples who need a nimble, fuel-efficient car that handles city traffic and winding hill roads with equal ease.",
  },
  {
    id: 3,
    name: "Maruti Ertiga",
    specs: "7-seater · AC · Automatic",
    tag: "Family MPV",
    img: "/src/imports/image-2.png",
    gallery: [
      "/src/imports/image-2.png",
      "/src/imports/image-3.png",
      "/src/imports/image-4.png",
    ],
    features: ["7 Seats", "AC", "Boot Space", "USB Charging", "Smooth Ride", "Driver Available"],
    description: "The Maruti Ertiga strikes the perfect balance between space and economy. Ideal for family outings, small group tours, and weekend getaways across Maharashtra.",
  },
  {
    id: 4,
    name: "Force Urbania",
    specs: "17-seater · AC · Automatic",
    tag: "Luxury Van",
    img: "/src/imports/image-7.png",
    gallery: [
      "/src/imports/image-5.png",
      "/src/imports/image-6.png",
      "/src/imports/image-7.png",
      "/src/imports/image-8.png",
    ],
    features: ["17 Seats", "Pushback Seats", "AC", "Large Luggage Bay", "USB Charging", "Professional Driver"],
    description: "The Force Urbania is our premium choice for large groups — corporate outings, pilgrimages, and destination weddings. Pushback luxury seats, powerful AC, and a cavernous luggage bay for long-distance comfort.",
  },
  {
    id: 5,
    name: "Hyundai i10",
    specs: "4-seater · AC · Manual",
    tag: "City Compact",
    img: "/src/imports/image-10.png",
    gallery: [
      "/src/imports/image-9.png",
      "/src/imports/image-10.png",
      "/src/imports/image-11.png",
    ],
    features: ["4 Seats", "AC", "Fuel Efficient", "Easy Parking", "City Friendly", "USB Charging"],
    description: "The Hyundai i10 is our most agile city car — perfect for solo travelers and couples navigating busy city streets, temple lanes, and narrow hill roads with ease and comfort.",
  },
];

interface SubPackage {
  title: string;
  duration: string;
  price: string;
  img: string;
}

interface Destination {
  id: number;
  city: string;
  country: string;
  tagline: string;
  img: string;
  heroImg: string;
  description: string;
  subPackages: SubPackage[];
}

const DESTINATIONS: Destination[] = [
  {
    id: 1,
    city: "Sambhajinagar",
    country: "Maharashtra · Sightseeing",
    tagline: "Ancient caves, sacred temples & hilltop shrines",
    img: "https://images.unsplash.com/photo-1631774933370-d596a344e851?w=700&h=900&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1631774934803-554afa7371c9?w=1600&h=900&fit=crop&auto=format",
    description:
      "Sambhajinagar — formerly Aurangabad — sits at the heart of Maharashtra's heritage triangle. Home to the UNESCO-listed Ellora Caves, one of the world's greatest rock-cut monuments, the city blends Maratha history, Mughal grandeur, and living pilgrimage traditions into a single unforgettable circuit.",
    subPackages: [
      { title: "Ellora Caves", duration: "Full Day", price: "₹1,200", img: "https://images.unsplash.com/photo-1631774933370-d596a344e851?w=600&h=400&fit=crop&auto=format" },
      { title: "Ghrishneshwar Temple", duration: "Half Day", price: "₹800", img: "https://images.unsplash.com/photo-1759134334340-9398d9814bcb?w=600&h=400&fit=crop&auto=format" },
      { title: "Bhadra Maruti", duration: "Half Day", price: "₹600", img: "https://images.unsplash.com/photo-1721532865608-c041a31add0e?w=600&h=400&fit=crop&auto=format" },
      { title: "Saptashrungi Gad", duration: "Full Day", price: "₹1,500", img: "https://images.unsplash.com/photo-1597637245724-beb1e10cb79a?w=600&h=400&fit=crop&auto=format" },
      { title: "Daulatabad Fort", duration: "Half Day", price: "₹900", img: "https://images.unsplash.com/photo-1629283151116-65b2369c8eff?w=600&h=400&fit=crop&auto=format" },
      { title: "Bibi Ka Maqbara", duration: "Half Day", price: "₹700", img: "https://images.unsplash.com/photo-1629353025246-51ebf45025b9?w=600&h=400&fit=crop&auto=format" },
      { title: "Goga Baba Hill", duration: "Half Day", price: "₹500", img: "https://images.unsplash.com/photo-1616388969587-8196f32388b4?w=600&h=400&fit=crop&auto=format" },
      { title: "Himayat Bagh", duration: "Half Day", price: "₹400", img: "https://images.unsplash.com/photo-1665402294437-c12f2e4259ea?w=600&h=400&fit=crop&auto=format" },
      { title: "Ajanta Caves", duration: "Full Day", price: "₹1,400", img: "https://images.unsplash.com/photo-1631774933370-d596a344e851?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    id: 2,
    city: "Pune",
    country: "Maharashtra · Sightseeing",
    tagline: "Spiritual landmarks of the cultural capital",
    img: "https://images.unsplash.com/photo-1749276551411-18a26e0905a0?w=700&h=900&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1567319210485-63e23072cc30?w=1600&h=900&fit=crop&auto=format",
    description:
      "Pune is Maharashtra's cultural and spiritual heartbeat — a city where ancient temples stand beside vibrant cafes and Maratha forts overlook modern expressways. Our Pune sightseeing circuit takes you to the most revered and iconic stops the city has to offer.",
    subPackages: [
      { title: "Bhimashankar Temple", duration: "Full Day", price: "₹1,400", img: "https://images.unsplash.com/photo-1704788564069-d54cab4169aa?w=600&h=400&fit=crop&auto=format" },
      { title: "Dagdusheth Ganpati", duration: "Half Day", price: "₹700", img: "https://images.unsplash.com/photo-1766843685626-eb30e8bc6560?w=600&h=400&fit=crop&auto=format" },
      { title: "Sinhagad Fort", duration: "Half Day", price: "₹800", img: "https://images.unsplash.com/photo-1715678710159-ee67d5bdba85?w=600&h=400&fit=crop&auto=format" },
      { title: "Khadakwasla Dam", duration: "Half Day", price: "₹500", img: "https://images.unsplash.com/photo-1764315576362-b5725e77ce76?w=600&h=400&fit=crop&auto=format" },
      { title: "Panshet Dam", duration: "Half Day", price: "₹600", img: "https://images.unsplash.com/photo-1607025188828-be77a08aa372?w=600&h=400&fit=crop&auto=format" },
      { title: "Mulshi Dam", duration: "Half Day", price: "₹600", img: "https://images.unsplash.com/photo-1597637245724-beb1e10cb79a?w=600&h=400&fit=crop&auto=format" },
      { title: "Lonavala & Khandala", duration: "Full Day", price: "₹1,200", img: "https://images.unsplash.com/photo-1619260584294-8a4e63f5ade5?w=600&h=400&fit=crop&auto=format" },
      { title: "Tikona Fort", duration: "Full Day", price: "₹900", img: "https://images.unsplash.com/photo-1663089554801-4562b8ea5388?w=600&h=400&fit=crop&auto=format" },
      { title: "Rajgad Fort", duration: "Full Day", price: "₹1,100", img: "https://images.unsplash.com/photo-1663089555556-38b1fb22bb20?w=600&h=400&fit=crop&auto=format" },
      { title: "Panchganga", duration: "Half Day", price: "₹500", img: "https://images.unsplash.com/photo-1699630923504-9a24dbaab37c?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    id: 3,
    city: "Hill Stations",
    country: "Maharashtra · Nature Escapes",
    tagline: "Mist-wrapped valleys and cascading waterfalls",
    img: "https://images.unsplash.com/photo-1759855021430-d6e2121b6928?w=700&h=900&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1597637245724-beb1e10cb79a?w=1600&h=900&fit=crop&auto=format",
    description:
      "Maharashtra's Western Ghats hide four of India's most enchanting hill escapes — Saputara with its forested plateau, Bhandardara with Arthur Lake and Randha Falls, Lonavala & Khandala with their dramatic valleys and tiger's leap viewpoints, and Mahabaleshwar with its sweeping panoramas and strawberry farms. Perfect for a weekend away from the city.",
    subPackages: [
      { title: "Saputara", duration: "2 Days", price: "₹2,800", img: "https://images.unsplash.com/photo-1621578847110-61f6cf5a3d9e?w=600&h=400&fit=crop&auto=format" },
      { title: "Bhandardara", duration: "2 Days", price: "₹2,400", img: "https://images.unsplash.com/photo-1521206644285-8db1549e484f?w=600&h=400&fit=crop&auto=format" },
      { title: "Lonavala & Khandala", duration: "2 Days", price: "₹2,200", img: "https://images.unsplash.com/photo-1619260584294-8a4e63f5ade5?w=600&h=400&fit=crop&auto=format" },
      { title: "Mahabaleshwar", duration: "2 Days", price: "₹2,600", img: "https://images.unsplash.com/photo-1616388969587-8196f32388b4?w=600&h=400&fit=crop&auto=format" },
      { title: "Panchgani", duration: "2 Days", price: "₹2,300", img: "https://images.unsplash.com/photo-1759855021430-d6e2121b6928?w=600&h=400&fit=crop&auto=format" },
      { title: "Chikhaldara", duration: "2 Days", price: "₹2,500", img: "https://images.unsplash.com/photo-1723745390402-04eeda8b6444?w=600&h=400&fit=crop&auto=format" },
      { title: "Toranmal", duration: "2 Days", price: "₹2,200", img: "https://images.unsplash.com/photo-1764012393805-1da6013415f4?w=600&h=400&fit=crop&auto=format" },
      { title: "Jawhar", duration: "2 Days", price: "₹2,000", img: "https://images.unsplash.com/photo-1597637245724-beb1e10cb79a?w=600&h=400&fit=crop&auto=format" },
      { title: "Amboli", duration: "2 Days", price: "₹2,400", img: "https://images.unsplash.com/photo-1610044847457-f6aabcbb67d3?w=600&h=400&fit=crop&auto=format" },
      { title: "Matheran", duration: "2 Days", price: "₹2,100", img: "https://images.unsplash.com/photo-1708547981655-e67e6dada4c3?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    id: 4,
    city: "Nashik",
    country: "Maharashtra · Sightseeing",
    tagline: "Pilgrimage ghats and sacred riverside temples",
    img: "https://images.unsplash.com/photo-1694667509674-676629c9d069?w=700&h=900&fit=crop&auto=format",
    heroImg: "https://images.unsplash.com/photo-1706077009991-ef8e611aff47?w=1600&h=900&fit=crop&auto=format",
    description:
      "Nashik is one of India's holiest cities — a place where the sacred Godavari winds through ancient ghats and jyotirlinga temples draw pilgrims from across the subcontinent. The city also sits at the heart of Maharashtra's wine country, making it a rare blend of the divine and the indulgent.",
    subPackages: [
      { title: "Trimbakeshwar Temple", duration: "Half Day", price: "₹900", img: "https://images.unsplash.com/photo-1759134334340-9398d9814bcb?w=600&h=400&fit=crop&auto=format" },
      { title: "Panchavati", duration: "Half Day", price: "₹700", img: "https://images.unsplash.com/photo-1704788564069-d54cab4169aa?w=600&h=400&fit=crop&auto=format" },
      { title: "Sula Vineyard", duration: "Half Day", price: "₹800", img: "https://images.unsplash.com/photo-1607025187860-4c1c1d9da14f?w=600&h=400&fit=crop&auto=format" },
      { title: "Pandavleni Caves", duration: "Half Day", price: "₹600", img: "https://images.unsplash.com/photo-1631774933370-d596a344e851?w=600&h=400&fit=crop&auto=format" },
      { title: "Anjaneri Hills", duration: "Full Day", price: "₹1,000", img: "https://images.unsplash.com/photo-1522506209496-4536d9020ec4?w=600&h=400&fit=crop&auto=format" },
      { title: "Ram Kund & Panchavati", duration: "Half Day", price: "₹500", img: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=600&h=400&fit=crop&auto=format" },
      { title: "Kalaram Temple", duration: "Half Day", price: "₹400", img: "https://images.unsplash.com/photo-1766843685626-eb30e8bc6560?w=600&h=400&fit=crop&auto=format" },
      { title: "Brahmagiri Hills", duration: "Full Day", price: "₹1,100", img: "https://images.unsplash.com/photo-1597637245724-beb1e10cb79a?w=600&h=400&fit=crop&auto=format" },
      { title: "Harihar Fort", duration: "Full Day", price: "₹1,200", img: "https://images.unsplash.com/photo-1703134942857-ef0b6f009a42?w=600&h=400&fit=crop&auto=format" },
      { title: "Kalsubai Peak", duration: "Full Day", price: "₹1,300", img: "https://images.unsplash.com/photo-1465919292275-c60ba49da6ae?w=600&h=400&fit=crop&auto=format" },
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Rahul Deshmukh",
    location: "Pune, Maharashtra",
    rating: 5,
    quote: "Saisarathi made our Shirdi pilgrimage completely hassle-free. The car was spotless, the driver was punctual and polite, and the entire trip felt taken care of from start to finish.",
    img: "https://images.unsplash.com/photo-1618306842557-a2515acf2112?w=200&h=200&fit=crop&auto=format",
  },
  {
    name: "Sneha Kulkarni",
    location: "Nashik, Maharashtra",
    rating: 5,
    quote: "Booked the Trimbakeshwar package and it was beyond expectations. Everything was perfectly timed, the vehicle was comfortable, and the driver knew every route beautifully.",
    img: "https://images.unsplash.com/photo-1622207691293-5cd80466dab3?w=200&h=200&fit=crop&auto=format",
  },
  {
    name: "Vijay Patil",
    location: "Aurangabad, Maharashtra",
    rating: 5,
    quote: "We hired the Innova for our family trip to Ellora Caves. The experience was outstanding — comfortable ride, knowledgeable driver, and timely service throughout the day.",
    img: "https://images.unsplash.com/photo-1724225618359-a1d2763326f9?w=200&h=200&fit=crop&auto=format",
  },
  {
    name: "Priya Sharma",
    location: "Mumbai, Maharashtra",
    rating: 5,
    quote: "The airport pickup was exactly on time at an odd hour. Clean car, professional driver, ice-cold water ready. Saisarathi is my go-to for every Mumbai airport transfer now.",
    img: "https://images.unsplash.com/photo-1552113125-81af17f36b57?w=200&h=200&fit=crop&auto=format",
  },
  {
    name: "Amol Jadhav",
    location: "Solapur, Maharashtra",
    rating: 5,
    quote: "Took the Mahabaleshwar hill station package with my wife. Scenic stops, a well-maintained Ertiga, and a driver who felt like a local guide. Truly memorable trip.",
    img: "https://images.unsplash.com/photo-1596633816484-10da10b748e4?w=200&h=200&fit=crop&auto=format",
  },
  {
    name: "Deepa Nair",
    location: "Nagpur, Maharashtra",
    rating: 5,
    quote: "Hired Saisarathi for our group pilgrimage to Bhimashankar. The Urbania was spacious and AC worked perfectly throughout. Everyone in our group was extremely satisfied.",
    img: "https://images.unsplash.com/photo-1536766768598-e09213fdcf22?w=200&h=200&fit=crop&auto=format",
  },
  {
    name: "Sachin Bhosale",
    location: "Kolhapur, Maharashtra",
    rating: 5,
    quote: "Used Saisarathi for a corporate team outing to Lonavala. Everything was arranged professionally — on time, clean vehicles, and zero stress for our entire team of 14 people.",
    img: "https://images.unsplash.com/photo-1701721865389-9935778b40e3?w=200&h=200&fit=crop&auto=format",
  },
  {
    name: "Anita Joshi",
    location: "Ahmednagar, Maharashtra",
    rating: 5,
    quote: "Our Shirdi darshan trip was beautifully planned by Saisarathi. Comfortable ride, kind driver, and they even helped us with timing our visit to avoid the long queues. Highly recommend!",
    img: "https://images.unsplash.com/photo-1463335361701-e90f4c5045d0?w=200&h=200&fit=crop&auto=format",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4" style={{ fill: "#C9A227" }} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function SubPackagesScroller({ packages }: { packages: SubPackage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);
  const rafId = useRef(0);

  // Stagger-in animation when mounted
  useEffect(() => {
    const cards = trackRef.current?.querySelectorAll(".pkg-card");
    if (!cards) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 36, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", stagger: 0.1, delay: 0.15 }
    );
  }, [packages]);

  // Convert vertical wheel → horizontal scroll with GSAP lerp momentum
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      // Keep targetX in sync with actual position so boundary checks are accurate
      targetX.current = el.scrollLeft;

      const atStart = el.scrollLeft <= 1;
      const atEnd = el.scrollLeft >= maxScroll - 1;

      // At the start scrolling up → let page scroll
      if (atStart && e.deltaY < 0) {
        cancelAnimationFrame(rafId.current);
        return;
      }
      // At the end scrolling down → let page scroll
      if (atEnd && e.deltaY > 0) {
        cancelAnimationFrame(rafId.current);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      targetX.current = Math.max(0, Math.min(maxScroll, targetX.current + e.deltaY * 1.2));
      cancelAnimationFrame(rafId.current);
      const animate = () => {
        const diff = targetX.current - el.scrollLeft;
        if (Math.abs(diff) < 0.5) {
          el.scrollLeft = targetX.current;
          return;
        }
        el.scrollLeft += diff * 0.12;
        rafId.current = requestAnimationFrame(animate);
      };
      rafId.current = requestAnimationFrame(animate);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafId.current);
    };
  }, [packages]);

  // Hover lift on cards
  const onCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: -6, scale: 1.02, boxShadow: "0 20px 48px rgba(11,28,44,0.18)", duration: 0.3, ease: "power2.out" });
    gsap.to(e.currentTarget.querySelector(".pkg-img"), { scale: 1.07, duration: 0.5, ease: "power2.out" });
  };
  const onCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: 0, scale: 1, boxShadow: "0 2px 16px rgba(11,28,44,0.08)", duration: 0.35, ease: "power2.inOut" });
    gsap.to(e.currentTarget.querySelector(".pkg-img"), { scale: 1, duration: 0.4, ease: "power2.inOut" });
  };

  return (
    <div className="relative -mx-6 md:-mx-10">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-4 w-10 md:w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #F8F6F1, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-4 w-10 md:w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #F8F6F1, transparent)" }} />

      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto hide-scrollbar px-6 md:px-10 pb-4"
        style={{ userSelect: "none", scrollBehavior: "auto" }}
      >
        {packages.map((pkg, i) => (
          <div
            key={i}
            className="pkg-card group bg-white rounded-2xl overflow-hidden border border-[#E8E3D8] shrink-0 flex flex-col"
            style={{ width: 240, opacity: 0, boxShadow: "0 2px 16px rgba(11,28,44,0.08)" }}
            onMouseEnter={onCardEnter}
            onMouseLeave={onCardLeave}
          >
            <div className="h-44 overflow-hidden bg-[#0B1C2C] shrink-0">
              <img
                src={pkg.img}
                alt={pkg.title}
                className="pkg-img w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="w-7 h-0.5 bg-[#C9A227] rounded-full mb-3" />
              <h4 className="font-serif text-sm font-semibold text-[#1A1A1A] mb-auto leading-snug">{pkg.title}</h4>
              <div className="mt-4 pt-3 border-t border-[#F1EDE4]">
                <a
                  href="https://wa.me/919623389211"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block w-full text-center bg-[#C9A227] text-white text-xs font-semibold py-2 rounded-full tracking-wide hover:bg-[#DDB84A] transition-colors"
                >
                  Book Ride
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[#5A5A5A]/40 text-xs mt-2 tracking-wide select-none">
        scroll to explore →
      </p>
    </div>
  );
}

function CarDetailSheet({ car, onClose }: { car: Car | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => { onClose(); }, 520);
  };

  useEffect(() => {
    if (car) {
      setMounted(true);
      setActiveImg(0);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => { setMounted(false); document.body.style.overflow = ""; }, 520);
      return () => clearTimeout(t);
    }
  }, [car]);

  // GSAP stagger thumbnails when sheet opens
  useEffect(() => {
    if (!visible || !thumbsRef.current) return;
    const thumbs = thumbsRef.current.querySelectorAll(".thumb-item");
    gsap.fromTo(thumbs,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out", stagger: 0.08, delay: 0.25 }
    );
  }, [visible]);

  if (!mounted || !car) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: visible ? "rgba(11,28,44,0.75)" : "rgba(11,28,44,0)", transition: "background-color 0.4s ease" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 bg-[#F8F6F1] rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          height: "90vh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.55s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#0B1C2C]/20 z-10" />

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ backgroundColor: "#C9A227", boxShadow: "0 4px 16px rgba(201,162,39,0.5)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Main image with slide transition */}
          <div className="relative bg-[#0B1C2C] overflow-hidden" style={{ height: 300 }}>
            {car.gallery.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${car.name} view ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: i === activeImg ? 1 : 0,
                  transform: i === activeImg ? "scale(1)" : "scale(1.04)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2C]/40 to-transparent" />

            {/* Image counter */}
            <div className="absolute bottom-4 right-5 bg-[#0B1C2C]/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              {activeImg + 1} / {car.gallery.length}
            </div>

            {/* Arrow buttons */}
            <button
              onClick={() => setActiveImg((p) => (p - 1 + car.gallery.length) % car.gallery.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setActiveImg((p) => (p + 1) % car.gallery.length)}
              className="absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Thumbnails */}
          <div ref={thumbsRef} className="flex gap-3 px-6 pt-5 pb-1 overflow-x-auto hide-scrollbar">
            {car.gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="thumb-item shrink-0 rounded-xl overflow-hidden bg-[#0B1C2C] opacity-0"
                style={{
                  width: 80, height: 56,
                  outline: i === activeImg ? "2px solid #C9A227" : "2px solid transparent",
                  outlineOffset: 2,
                  transition: "outline-color 0.2s ease",
                }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="px-6 md:px-8 pt-6 pb-10">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block bg-[#C9A227]/15 text-[#C9A227] text-xs font-semibold px-3 py-1 rounded-full mb-2">{car.tag}</span>
                <h2 className="font-serif text-3xl text-[#0B1C2C] font-semibold">{car.name}</h2>
                <p className="text-[#5A5A5A] text-sm mt-1">{car.specs}</p>
              </div>
            </div>

            <div className="w-10 h-0.5 bg-[#C9A227] rounded-full mb-5" />

            <p className="text-[#5A5A5A] text-base leading-relaxed mb-8">{car.description}</p>

            {/* Features grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {car.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 bg-white border border-[#E8E3D8] rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-[#C9A227] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#0B1C2C] text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-[#C9A227] text-white py-4 rounded-full font-medium text-sm tracking-wide hover:bg-[#DDB84A] transition-colors"
              >
                Book This Vehicle
              </button>
              <button
                onClick={handleClose}
                className="flex-1 border border-[#0B1C2C] text-[#0B1C2C] py-4 rounded-full font-medium text-sm tracking-wide hover:bg-[#0B1C2C] hover:text-white transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SERVICES = [
  {
    id: "airport",
    label: "Airport Services",
    tag: "★ Most Popular",
    highlight: true,
    img: "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=900&h=1100&fit=crop&auto=format",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    tagline: "Door-to-gate, flawlessly",
    desc: "On-time airport pickups and drops, flight tracked, luggage handled.",
    expandedDesc: "Available 24/7 at 60+ international airports. Fixed pricing with no surge charges. Chilled water, Wi-Fi, and child seats on every ride. We wait — no matter how late your flight lands.",
    features: ["Flight tracking", "Name-board meet & greet", "60+ airports", "Fixed pricing"],
    cta: "Book a Transfer",
  },
  {
    id: "rental",
    label: "Car Rental",
    tag: null,
    highlight: false,
    img: "https://images.unsplash.com/photo-1533558701576-23c65e0272fb?w=900&h=1100&fit=crop&auto=format",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    tagline: "Drive on your own terms",
    desc: "Clean, well-maintained vehicles for every trip — hourly, daily, or outstation.",
    expandedDesc: "From city runabouts to weekend convertibles and long-range SUVs, our fleet is hand-selected and maintained to showroom standard. Chauffeur delivery included.",
    features: ["320+ vehicles", "Door delivery", "Fully insured", "No hidden fees"],
    cta: "Browse Fleet",
  },
  {
    id: "trip",
    label: "Outstanding Trip",
    tag: null,
    highlight: false,
    img: "https://images.unsplash.com/photo-1637139498630-9a580b24fa75?w=900&h=1100&fit=crop&auto=format",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    tagline: "Scenic routes, curated moments",
    desc: "Curated sightseeing trips across Maharashtra, pilgrimage to leisure.",
    expandedDesc: "We design the route, book the stays, curate the stops, and put you behind the wheel of something extraordinary. Travel the way it was meant to feel.",
    features: ["Custom itineraries", "Scenic routing", "Hotel selection", "Local expertise"],
    cta: "Plan My Trip",
  },
  {
    id: "planner",
    label: "Travel Planner",
    tag: null,
    highlight: false,
    img: "https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?w=900&h=1100&fit=crop&auto=format",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    tagline: "Your vision, expertly executed",
    desc: "We handle the itinerary, bookings, and logistics — you just travel.",
    expandedDesc: "Think of us as your personal travel director. We handle the complexity; you collect the memories. Available for one-off trips or ongoing annual travel management.",
    features: ["Dedicated specialist", "Full concierge", "Flights & hotels", "Annual plans"],
    cta: "Talk to a Planner",
  },
];

function ServicesSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false]);
  const sectionRef = useRef<HTMLElement>(null);
  const observed = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;
          SERVICES.forEach((_, i) => {
            setTimeout(() => {
              setVisibleCards((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 120);
          });
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-24 md:py-32 bg-[#F1EDE4] relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C9A227]/6 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#0B1C2C]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-[#C9A227] text-xs font-medium tracking-[0.3em] uppercase mb-3">What We Offer</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0B1C2C] font-semibold leading-tight">
              Our <span className="italic font-normal">Services</span>
            </h2>
          </div>
          <p className="text-[#5A5A5A] text-base leading-relaxed max-w-sm">
            From the runway to the open road — every service crafted to eliminate friction and elevate the journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((svc, i) => {
            const isVisible = visibleCards[i];
            return (
              <div
                key={svc.id}
                className="group relative rounded-3xl overflow-hidden flex flex-col"
                style={{
                  backgroundColor: "#343a40",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
                  transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
                  transitionDelay: `${i * 80}ms`,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                }}
              >
                {/* Image */}
                <div className="relative overflow-hidden shrink-0" style={{ height: "260px" }}>
                  <img
                    src={svc.img}
                    alt={svc.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {svc.highlight && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 bg-[#C9A227] text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
                        {svc.tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="w-7 h-0.5 mb-5 rounded-full" style={{ backgroundColor: "#C9A227" }} />
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }}>
                      {svc.icon}
                    </div>
                    <h3 className="font-serif text-lg text-white font-semibold leading-snug pt-1">{svc.label}</h3>
                  </div>
                  <p className="text-white/50 text-xs mb-3 tracking-wide italic">{svc.tagline}</p>
                  <p className="text-white/70 text-sm leading-relaxed">{svc.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BottomSheet({
  destination,
  onClose,
}: {
  destination: Destination | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (destination) {
      setMounted(true);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "";
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [destination]);


  if (!mounted || !destination) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: visible ? "rgba(11,28,44,0.72)" : "rgba(11,28,44,0)", transition: "background-color 0.4s ease" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-[#F8F6F1] rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          height: "94vh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.55s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Hero image */}
        <div className="relative h-72 md:h-96 shrink-0 bg-[#0B1C2C] overflow-hidden">
          <img
            src={destination.heroImg}
            alt={destination.city}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2C]/80 via-[#0B1C2C]/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-6 left-8 right-8">
            <p className="text-[#C9A227] text-sm font-medium tracking-widest uppercase mb-1">{destination.country}</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white font-semibold">{destination.city}</h2>
          </div>
          {/* drag handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/40" />
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
            <p className="text-[#5A5A5A] text-lg leading-relaxed max-w-2xl mb-12">{destination.description}</p>

            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-[#C9A227]/30" />
              <span className="font-serif italic text-[#1A3A4A] text-sm tracking-wide">Curated Experiences</span>
              <div className="h-px flex-1 bg-[#C9A227]/30" />
            </div>

            <SubPackagesScroller packages={destination.subPackages} />

            <div className="mt-12 flex flex-col sm:flex-row gap-4 pb-4">
              <button className="bg-[#C9A227] text-white px-10 py-4 rounded-full font-medium text-sm tracking-wide hover:bg-[#DDB84A] transition-colors">
                Book This Destination
              </button>
              <button className="border border-[#0B1C2C] text-[#0B1C2C] px-10 py-4 rounded-full font-medium text-sm tracking-wide hover:bg-[#0B1C2C] hover:text-white transition-colors">
                Talk to a Specialist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);
  const [activeCar, setActiveCar] = useState<Car | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-full bg-[#F8F6F1]">
      {/* ── NAV ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-[#0B1C2C]/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-18 flex items-center justify-between py-4">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img
              src="/src/imports/Gemini_Generated_Image_76txuq76txuq76tx__1_-removebg-preview.png"
              alt="Saisarathi Car Rentals"
              className="h-12 w-auto brightness-0 invert"
            />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase().replace(" ", "-"))}
                className="text-white/80 hover:text-[#C9A227] text-sm font-medium tracking-wide transition-colors"
              >
                {link}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo("contact")}
              className="hidden md:block bg-[#C9A227] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#DDB84A] transition-colors tracking-wide"
            >
              Book Now
            </button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0B1C2C]/98 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase().replace(" ", "-"))}
                className="text-white/80 hover:text-[#C9A227] text-base font-medium text-left transition-colors"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => scrollTo("contact")}
              className="bg-[#C9A227] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#DDB84A] transition-colors w-fit"
            >
              Book Now
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[640px] flex items-end bg-[#0B1C2C]">
        <img
          src="/src/imports/hero01.jpeg"
          alt="Sai Sarathi Travels fleet parked at headquarters"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2C] via-[#0B1C2C]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1C2C]/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32 w-full">
          <div className="max-w-2xl">
            <p className="text-[#C9A227] text-xs font-medium tracking-[0.3em] uppercase mb-5">
              Premium Travel & Car Rental
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-white font-semibold leading-[1.05] mb-6">
              Travel Differently<br />
              <span className="italic font-normal text-[#C9A227]">with Saisaryhi</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Curated journeys and premium vehicles for discerning travelers who understand that how you get there is as important as where you're going.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollTo("packages")}
                className="bg-[#C9A227] text-white px-10 py-4 rounded-full font-medium tracking-wide hover:bg-[#DDB84A] transition-colors text-sm"
              >
                Explore Packages
              </button>
              <button
                onClick={() => scrollTo("our-cars")}
                className="border border-white/50 text-white px-10 py-4 rounded-full font-medium tracking-wide hover:border-white hover:bg-white/10 transition-colors text-sm backdrop-blur-sm"
              >
                Rent a Car
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase" style={{ writingMode: "vertical-rl" }}>Scroll</span>
          <div className="w-px h-12 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="bg-[#0B1C2C] py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "100+", label: "Destinations" },
            { value: "4K+", label: "Happy Travelers" },
            { value: "15+", label: "Premium Vehicles" },
            { value: "9 yrs", label: "Of Excellence" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-3xl text-[#C9A227] font-semibold mb-1">{stat.value}</div>
              <div className="text-white/50 text-sm tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <ServicesSection />

      {/* ── OUR CARS ── */}
      <section id="our-cars" className="py-24 md:py-32 bg-[#F8F6F1]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[#C9A227] text-xs font-medium tracking-[0.3em] uppercase mb-3">Fleet</p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#0B1C2C] font-semibold leading-tight">
                Our Signature<br />
                <span className="italic font-normal">Vehicles</span>
              </h2>
            </div>
            <p className="text-[#5A5A5A] text-base leading-relaxed max-w-sm">
              Every car in our fleet is hand-selected, meticulously maintained, and delivered to your door.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CARS.map((car) => (
              <div
                key={car.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8E3D8] hover:border-[#C9A227]/60 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {car.tag && (
                  <div className="px-4 pt-4">
                    <span className="inline-block bg-[#C9A227]/10 text-[#C9A227] text-xs font-medium px-3 py-1 rounded-full tracking-wide">
                      {car.tag}
                    </span>
                  </div>
                )}
                <div className="h-44 overflow-hidden bg-[#1A3A4A] mx-4 mt-3 rounded-xl">
                  <img
                    src={car.img}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-base font-semibold text-[#0B1C2C] mb-1 leading-snug">{car.name}</h3>
                  <p className="text-[#5A5A5A] text-xs mb-4">{car.specs}</p>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setActiveCar(car)}
                      className="text-[#0B1C2C] text-xs font-medium border border-[#0B1C2C] px-3 py-1.5 rounded-full hover:bg-[#0B1C2C] hover:text-white transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button className="border border-[#0B1C2C] text-[#0B1C2C] px-10 py-3.5 rounded-full text-sm font-medium hover:bg-[#0B1C2C] hover:text-white transition-colors tracking-wide">
              View Full Fleet
            </button>
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section id="packages" className="py-24 md:py-32 bg-[#F1EDE4]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <p className="text-[#C9A227] text-xs font-medium tracking-[0.3em] uppercase mb-3">Destinations</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0B1C2C] font-semibold mb-5">
              Curated Travel <span className="italic font-normal">Packages</span>
            </h2>
            <p className="text-[#5A5A5A] text-base max-w-lg mx-auto leading-relaxed">
              Each destination is selected for those who want more than a trip. Click any card to explore curated experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                onClick={() => setActiveDestination(dest)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#0B1C2C]"
                style={{ aspectRatio: "4/5" }}
              >
                <img
                  src={dest.img}
                  alt={dest.city}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2C]/90 via-[#0B1C2C]/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  <p className="text-[#C9A227] text-xs font-medium tracking-widest uppercase mb-1">{dest.country}</p>
                  <h3 className="font-serif text-3xl text-white font-semibold mb-2">{dest.city}</h3>
                  <p className="text-white/60 text-sm mb-5 leading-relaxed">{dest.tagline}</p>
                  <div className="flex items-center gap-2 text-[#C9A227] group-hover:gap-3 transition-all duration-200">
                    <span className="text-sm font-medium tracking-wide">Explore</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 md:py-32 bg-[#F8F6F1]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <p className="text-[#C9A227] text-xs font-medium tracking-[0.3em] uppercase mb-5">Our Story</p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#0B1C2C] font-semibold leading-tight mb-7">
                Travel is a craft.<br />
                <span className="italic font-normal">We've mastered it.</span>
              </h2>
              <p className="text-[#5A5A5A] text-base leading-relaxed mb-6">
                Saisaryhi was founded on a simple conviction: that extraordinary travel is about intention, not just destination. After a decade crafting journeys for discerning travelers across 180 countries, we've learned that the details no one else bothers with — the route, the car, the table by the window — are precisely what make a trip unforgettable.
              </p>
              <p className="text-[#5A5A5A] text-base leading-relaxed mb-10">
                We combine a curated fleet of premium vehicles with hand-picked itineraries, local relationships, and a team of specialists who treat every journey as if it were their own.
              </p>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-6 border-t border-[#E8E3D8] pt-8">
                {/* Fully Insured */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1C2C] flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[#C9A227]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[#0B1C2C] text-sm font-semibold mb-0.5">Fully Insured</div>
                    <div className="text-[#5A5A5A] text-xs leading-relaxed">All vehicles & trips covered</div>
                  </div>
                </div>

                {/* 24/7 Support */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1C2C] flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[#C9A227]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[#0B1C2C] text-sm font-semibold mb-0.5">24/7 Support</div>
                    <div className="text-[#5A5A5A] text-xs leading-relaxed">Concierge on call, always</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden bg-[#0B1C2C]" style={{ aspectRatio: "4/5" }}>
                <img
                  src="https://images.unsplash.com/photo-1782113326479-b450da6c86d9?w=900&h=1100&fit=crop&auto=format"
                  alt="Curved sofa by infinity pool overlooking the sea"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-[#0B1C2C] rounded-2xl p-5 shadow-2xl max-w-52 hidden md:block">
                <div className="text-[#C9A227] font-serif text-3xl font-semibold">9+</div>
                <div className="text-white text-sm mt-1 leading-snug">Years crafting exceptional journeys worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="py-24 md:py-32 relative overflow-hidden" style={{ backgroundColor: "#0F1419" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />

        {/* Header */}
        <div className="text-center mb-16 px-6">
          <p className="text-xs font-medium tracking-[0.3em] uppercase mb-3" style={{ color: "#C9A227" }}>Reviews</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold" style={{ color: "#F5F5F5" }}>
            What our travelers{" "}
            <span className="italic font-normal" style={{ color: "#C9A227" }}>say</span>
          </h2>
        </div>

        {/* Marquee — fade edges */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #0F1419, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #0F1419, transparent)" }} />

          {/* Track — duplicated for seamless loop */}
          <div className="overflow-hidden">
            <div className="marquee-track flex gap-5 w-max">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 flex flex-col rounded-2xl p-7"
                  style={{
                    width: 340,
                    backgroundColor: "#1A2332",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
                  }}
                >
                  <div className="absolute top-0 left-7 w-10 h-0.5 rounded-full" style={{ backgroundColor: "#C9A227" }} />
                  <StarRating count={t.rating} />
                  <p className="text-sm leading-relaxed italic flex-1 mb-7" style={{ color: "#F5F5F5" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <img
                      src={t.img}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      style={{ border: "2px solid rgba(201,162,39,0.45)" }}
                    />
                    <div>
                      <div className="font-medium text-sm" style={{ color: "#F5F5F5" }}>{t.name}</div>
                      <div className="text-xs" style={{ color: "#A0AEC0" }}>{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 md:py-32 bg-[#F1EDE4]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <p className="text-[#C9A227] text-xs font-medium tracking-[0.3em] uppercase mb-4">Get in Touch</p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#0B1C2C] font-semibold mb-3">
                Plan your <span className="italic font-normal">journey</span>
              </h2>
              <p className="text-[#5A5A5A] text-base mb-10 leading-relaxed">
                Our specialists are ready to craft an itinerary around your vision. No template packages — every trip is designed from scratch.
              </p>

              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="text-[#0B1C2C] text-xs font-medium tracking-wide uppercase block mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-white border border-[#E8E3D8] rounded-xl px-4 py-3.5 text-sm text-[#1A1A1A] placeholder-[#5A5A5A]/50 focus:outline-none focus:border-[#C9A227] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#0B1C2C] text-xs font-medium tracking-wide uppercase block mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white border border-[#E8E3D8] rounded-xl px-4 py-3.5 text-sm text-[#1A1A1A] placeholder-[#5A5A5A]/50 focus:outline-none focus:border-[#C9A227] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#0B1C2C] text-xs font-medium tracking-wide uppercase block mb-2">Preferred Service</label>
                  <select className="w-full bg-white border border-[#E8E3D8] rounded-xl px-4 py-3.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C9A227] transition-colors appearance-none">
                    <option value="">Select a service…</option>
                    <option>Travel Package</option>
                    <option>Car Rental</option>
                    <option>Combined Trip & Car</option>
                    <option>Corporate Travel</option>
                    <option>Honeymoon Package</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#0B1C2C] text-xs font-medium tracking-wide uppercase block mb-2">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your dream trip…"
                    className="w-full bg-white border border-[#E8E3D8] rounded-xl px-4 py-3.5 text-sm text-[#1A1A1A] placeholder-[#5A5A5A]/50 focus:outline-none focus:border-[#C9A227] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#0B1C2C] text-white px-10 py-4 rounded-full font-medium text-sm tracking-wide hover:bg-[#1A3A4A] transition-colors mt-2 self-start"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-8">
              {/* Map placeholder */}
              <div className="rounded-2xl overflow-hidden bg-[#0B1C2C] flex-1 min-h-64 relative">
                <img
                  src="/src/imports/Immersive_4K_Documentary__Exploring_the_Divine_Aura_of_Shri_Shirdi_Sai_Baba_Temple___Telugu_.jpeg"
                  alt="Shirdi Sai Baba"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2C]/75 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-white font-serif text-lg font-semibold">Shirdi Sai Baba</p>
                  <p className="text-white/60 text-sm">Near Saibaba Temple, Shirdi</p>
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Address */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8E3D8]">
                  <p className="text-[#C9A227] text-xs font-medium tracking-widest uppercase mb-2">Address</p>
                  <p className="text-[#1A1A1A] text-sm leading-relaxed">Near Saibaba Temple,{"\n"}Shirdi, Maharashtra</p>
                </div>

                {/* Phone */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8E3D8]">
                  <p className="text-[#C9A227] text-xs font-medium tracking-widest uppercase mb-2">Contact Us</p>
                  <div className="flex flex-col gap-1.5">
                    <div>
                      <p className="text-[#1A1A1A] text-sm font-medium">Abhi Gosavi</p>
                      <a href="tel:9623389211" className="text-[#0B1C2C] text-sm hover:text-[#C9A227] transition-colors">9623389211</a>
                    </div>
                    <div>
                      <p className="text-[#1A1A1A] text-sm font-medium">Rajendra Gosavi</p>
                      <a href="tel:7350145826" className="text-[#0B1C2C] text-sm hover:text-[#C9A227] transition-colors">7350145826</a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8E3D8] sm:col-span-2">
                  <p className="text-[#C9A227] text-xs font-medium tracking-widest uppercase mb-2">Email</p>
                  <a href="mailto:saisarathi@gmail.com" className="text-[#0B1C2C] text-sm hover:text-[#C9A227] transition-colors">saisarathi@gmail.com</a>
                </div>
              </div>

              {/* Brand tag */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E8E3D8]" />
                <span className="font-serif text-[#0B1C2C] text-sm font-semibold tracking-widest italic">Saisarathi</span>
                <div className="h-px flex-1 bg-[#E8E3D8]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0B1C2C] py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <img
            src="/src/imports/Gemini_Generated_Image_76txuq76txuq76tx__1_-removebg-preview.png"
            alt="Saisarathi Car Rentals"
            className="h-10 w-auto brightness-0 invert"
          />
          <p className="text-white/30 text-sm text-center">
            © {new Date().getFullYear()} Saisaryhi. All rights reserved. Travel with intention.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((link) => (
              <button key={link} className="text-white/40 text-xs hover:text-white/70 transition-colors">
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FAB ── */}
      <a
        href="https://wa.me/919623389211"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#25D366" }}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.074-1.12l-.292-.174-3.035.795.813-2.965-.19-.305A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
        </svg>
      </a>

      {/* ── BOTTOM SHEET ── */}
      <BottomSheet destination={activeDestination} onClose={() => setActiveDestination(null)} />
      <CarDetailSheet car={activeCar} onClose={() => setActiveCar(null)} />
    </div>
  );
}
