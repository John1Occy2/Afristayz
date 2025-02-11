import { motion } from "framer-motion";
import SearchBar from "./search-bar";

export default function HeroSection() {
  return (
    <div className="relative h-[600px] flex items-center justify-center text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1549439602-43ebca2327af')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 container mx-auto px-4 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Discover Africa's Finest Hotels
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Experience authentic African hospitality in our carefully curated
          collection of luxury accommodations
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </motion.div>

      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{
          background: "linear-gradient(to bottom, transparent, #FFF5E6)",
        }}
      />
    </div>
  );
}
