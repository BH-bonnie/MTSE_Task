import React, { useEffect, useState } from 'react';
import { getHomeProductsApi } from '../util/api';
import ProductCard from '../components/products/ProductCard';
import { ArrowRight, Zap, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [data, setData] = useState({ newest: [], bestSellers: [], promotions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getHomeProductsApi();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[480px] md:h-[520px] rounded-[40px] overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#FFEEDC] to-[#FFDAB9] shadow-inner border border-orange-50">
        <div className="max-w-7xl mx-auto px-8 md:px-16 h-full flex items-center relative z-10">
          <div className="w-full lg:w-1/2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center px-4 py-1.5 bg-orange-500/10 border border-orange-200 rounded-full text-orange-600 text-[11px] font-black uppercase tracking-widest"
            >
              Summer Collection 2026
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-gray-800 leading-[1] tracking-tighter"
            >
              Taste the <span className="text-orange-500 underline decoration-orange-200 underline-offset-8">Magic</span> <br/> in Every Sip
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-lg font-medium max-w-sm leading-relaxed"
            >
              Experience the finest blend of organic tea leaves and hand-picked fresh fruits.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <button className="px-10 py-4 bg-orange-500 text-white rounded-[20px] font-black shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all flex items-center gap-2 group">
                View Menu <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Hero Image (Right) */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:flex items-center justify-center p-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
             animate={{ opacity: 1, scale: 1, rotate: 0 }}
             transition={{ duration: 0.8 }}
             className="relative w-full h-full"
           >
             <img 
               src="https://images.unsplash.com/photo-1544787210-2213d240ad4a?q=80&w=800" 
               alt="Beverage Hero" 
               className="w-full h-full object-contain drop-shadow-2xl"
             />
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
           </motion.div>
        </div>
      </section>

      {/* Hot Promotions (3 Columns Grid) */}
      <section className="px-2">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500">
               <div className="p-2 bg-red-50 rounded-xl">
                 <Zap className="h-6 w-6 fill-red-500" />
               </div>
               <span className="text-xs font-black uppercase tracking-[0.2em]">Flash Sale</span>
            </div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Hot Promotions</h2>
          </div>
          <button className="flex items-center gap-1 text-sm font-black text-orange-500 hover:gap-2 transition-all">
            Explore All <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.promotions.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-[#FAF9F6] -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-20 rounded-[60px]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Customer Choice</span>
              </div>
              <h2 className="text-4xl font-black text-gray-800 tracking-tight">Best Sellers</h2>
            </div>
            <button className="flex items-center gap-1 text-sm font-black text-orange-500 hover:gap-2 transition-all">
              Explore All <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.bestSellers.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section>
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-500">
              <div className="p-2 bg-purple-50 rounded-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Recently Added</span>
            </div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">New Arrivals</h2>
          </div>
          <button className="flex items-center gap-1 text-sm font-black text-orange-500 hover:gap-2 transition-all">
            Explore All <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.newest.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
