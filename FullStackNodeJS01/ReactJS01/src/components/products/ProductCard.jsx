import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const hasPromotion = product.promotionPrice > 0;
  // Fallback image nếu không có ảnh
  const productImage = product?.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-50 flex flex-col h-full"
    >
      {/* Product Image Wrapper */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <img 
          src={productImage} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hasPromotion && (
            <div className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider">
              Sale
            </div>
          )}
          {product.isNewest && (
            <div className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider">
              New
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-xl text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick Action Overlay */}
        <div className="absolute inset-x-4 bottom-4 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-full bg-white text-gray-800 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-colors">
            <Plus className="h-4 w-4" /> Quick Add
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-2 py-0.5 bg-orange-50 rounded-md">
            {product?.category?.name || 'Beverage'}
          </span>
          <div className="flex items-center text-amber-400">
            <Star className="h-3 w-3 fill-amber-400" />
            <span className="text-[11px] font-bold text-gray-400 ml-1">4.8 (120)</span>
          </div>
        </div>
        
        <Link to={`/product/${product._id}`} className="block flex-1">
          <h3 className="text-gray-800 font-bold text-base leading-snug group-hover:text-orange-500 transition-colors mb-4 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {hasPromotion ? (
              <>
                <span className="text-orange-600 font-black text-xl">{product.promotionPrice.toLocaleString()}đ</span>
                <span className="text-gray-300 text-xs line-through font-bold">{product.price.toLocaleString()}đ</span>
              </>
            ) : (
              <span className="text-gray-800 font-black text-xl">{product.price.toLocaleString()}đ</span>
            )}
          </div>
          <button className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
