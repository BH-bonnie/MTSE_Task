import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProductsApi, getCategoriesApi } from '../util/api';
import ProductCard from '../components/products/ProductCard';
import { Filter, SlidersHorizontal, ChevronDown, Search as SearchIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesApi();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset page and products when filters change
    setPage(1);
    setProducts([]);
  }, [query, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = {
          search: query,
          category: selectedCategory,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sort: sortBy,
          page: page,
          limit: 6 // For demonstration of lazy loading
        };
        const res = await getAllProductsApi(params);
        if (page === 1) {
          setProducts(res?.data?.products || []);
        } else {
          setProducts(prev => [...prev, ...(res?.data?.products || [])]);
        }
        setTotalPages(res?.data?.pagination?.totalPages || 1);
      } catch (err) {
        console.error(err);
        if (page === 1) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchProducts();
  }, [query, selectedCategory, priceRange, sortBy, page]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        if (!loading && !loadingMore && page < totalPages) {
          setPage(prev => prev + 1);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, page, totalPages]);

  const handleCategoryClick = (catSlug) => {
    const newCat = selectedCategory === catSlug ? '' : catSlug;
    setSelectedCategory(newCat);
    setSearchParams(prev => {
      if (newCat) prev.set('category', newCat);
      else prev.delete('category');
      return prev;
    });
  };

  return (
    <div className="pb-24 pt-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            {query ? `Results for "${query}"` : 'Our Menu'}
            {query && <button onClick={() => setSearchParams({})} className="p-1 hover:bg-gray-100 rounded-full"><X className="h-5 w-5 text-gray-400" /></button>}
          </h1>
          <p className="text-gray-400 font-medium">{products?.length || 0} delicious drinks found</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-100 rounded-2xl py-3.5 pl-6 pr-12 font-bold text-sm text-gray-600 focus:border-orange-500 outline-none shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <option value="newest">Latest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-orange-500 transition-colors" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3.5 rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm ${showFilters ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-100' : 'bg-white border-gray-100 text-gray-600 hover:border-orange-200'}`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">Refine</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filter */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="w-full lg:w-72 space-y-10"
            >
              {/* Category Filter */}
              <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryClick('')}
                    className={`flex items-center justify-between w-full p-4 rounded-2xl font-bold text-sm transition-all ${!selectedCategory ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    All Drinks
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`flex items-center justify-between w-full p-4 rounded-2xl font-bold text-sm transition-all ${selectedCategory === cat.slug ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Price Range</h3>
                <div className="space-y-6">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Min</p>
                      <span className="text-xs font-black text-gray-800">0đ</span>
                    </div>
                    <div className="h-px flex-1 bg-gray-100 mx-4" />
                    <div className="text-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Max</p>
                      <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                        {priceRange[1].toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-[32px] aspect-[3/4]" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[48px] border-2 border-dashed border-gray-100">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <SearchIcon className="h-10 w-10 text-orange-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">No drinks match your filters</h3>
              <p className="text-gray-400 font-medium">Try adjusting your search or resetting filters.</p>
              <button
                onClick={() => {
                  setSearchParams({});
                  setSelectedCategory('');
                  setPriceRange([0, 100000]);
                }}
                className="mt-8 px-8 py-3 bg-gray-800 text-white rounded-2xl font-black text-sm hover:bg-gray-900 transition-all shadow-xl"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center mt-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
            </div>
          )}
          {!loading && !loadingMore && products.length > 0 && page >= totalPages && (
            <div className="text-center mt-10 text-gray-400 font-medium">
              You have reached the end of the list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
