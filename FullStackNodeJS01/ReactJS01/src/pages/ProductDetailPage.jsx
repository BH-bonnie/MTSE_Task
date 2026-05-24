import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';
import { getProductDetailApi } from '../util/api';
import ProductCard from '../components/products/ProductCard';
import { Minus, Plus, ShoppingCart, ArrowLeft, Package, BarChart3, Tag, Star, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M');
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      navigate('/login');
      return;
    }
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      alert("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (err) {
      alert(err || "Lỗi thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để mua hàng!");
      navigate('/login');
      return;
    }
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      navigate('/cart');
    } catch (err) {
      alert(err || "Lỗi thêm vào giỏ hàng");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getProductDetailApi(id);
        setProduct(res.data.product);
        setSimilarProducts(res.data.similarProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
    </div>
  );

  if (!product) return <div>Product not found</div>;

  const hasPromotion = product.promotionPrice > 0;
  const currentPrice = hasPromotion ? product.promotionPrice : product.price;
  
  const toggleTopping = (name) => {
    if (toppings.includes(name)) {
      setToppings(toppings.filter(t => t !== name));
    } else {
      setToppings([...toppings, name]);
    }
  };

  const toppingOptions = [
    { name: 'Pearl', price: 5000 },
    { name: 'Grass Jelly', price: 5000 },
    { name: 'Cheese Foam', price: 10000 },
    { name: 'Pudding', price: 7000 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="pb-24 pt-6"
    >
      {/* Breadcrumb */}
      <nav className="mb-10">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="rounded-[40px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative group">
            <Swiper
              modules={[Navigation, Pagination, EffectFade]}
              navigation
              pagination={{ clickable: true }}
              effect="fade"
              className="aspect-square"
            >
              {(product.images?.length ? product.images : ['https://via.placeholder.com/800']).map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
            {hasPromotion && (
              <div className="absolute top-6 left-6 z-10 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                -{(100 - (product.promotionPrice/product.price * 100)).toFixed(0)}% OFF
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-4">
             {product.images?.map((img, idx) => (
               <div key={idx} className="aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-orange-500 cursor-pointer transition-all bg-gray-50">
                 <img src={img} alt="" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1 bg-orange-50 text-orange-600 text-[11px] font-black rounded-lg uppercase tracking-widest">
              {product.category?.name || 'Drink'}
            </span>
            <div className="flex items-center text-amber-400 gap-1">
              <Star className="h-4 w-4 fill-amber-400" />
              <span className="text-sm font-bold text-gray-800">4.9</span>
              <span className="text-sm text-gray-400 font-medium">(1.2k Reviews)</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-6 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-baseline gap-4 mb-8">
            {hasPromotion ? (
              <>
                <span className="text-4xl font-black text-orange-600">{product.promotionPrice.toLocaleString()}đ</span>
                <span className="text-2xl text-gray-300 line-through font-bold">{product.price.toLocaleString()}đ</span>
              </>
            ) : (
              <span className="text-4xl font-black text-gray-800">{product.price.toLocaleString()}đ</span>
            )}
          </div>

          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            {product.description || 'Delightful beverage crafted with premium ingredients for your perfect refreshment.'}
          </p>

          <div className="space-y-8 mb-10">
            {/* Size Select */}
            <div>
              <label className="block text-sm font-black text-gray-800 uppercase tracking-widest mb-4">Select Size</label>
              <div className="flex gap-4">
                {['M', 'L'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-1 py-3.5 rounded-2xl font-black transition-all border-2 ${size === s ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-200' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'}`}
                  >
                    Size {s} {s === 'L' ? '+5.000đ' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Topping Select */}
            <div>
              <label className="block text-sm font-black text-gray-800 uppercase tracking-widest mb-4">Extra Toppings</label>
              <div className="flex flex-wrap gap-3">
                {toppingOptions.map(t => (
                  <button 
                    key={t.name}
                    onClick={() => toggleTopping(t.name)}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${toppings.includes(t.name) ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'}`}
                  >
                    {t.name} (+{t.price/1000}k)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="mt-auto pt-10 border-t border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-white rounded-xl transition-all shadow-sm"><Minus className="h-4 w-4"/></button>
                  <span className="w-16 text-center font-black text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-white rounded-xl transition-all shadow-sm"><Plus className="h-4 w-4"/></button>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Stock Status</p>
                  <div className="flex items-center gap-2 text-green-500 font-bold">
                    <ShieldCheck className="h-4 w-4" /> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-5 rounded-[24px] font-black shadow-2xl transition-all flex items-center justify-center gap-2 ${product.stock > 0 ? 'bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600 cursor-pointer' : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'}`}
              >
                <ShoppingCart className="h-5 w-5" /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className={`flex-1 py-5 rounded-[24px] font-black transition-all ${product.stock > 0 ? 'bg-gray-800 text-white hover:bg-gray-900 cursor-pointer' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Extra Info */}
      <section className="mb-24">
        <div className="border-b border-gray-100 flex gap-12 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button className="pb-4 border-b-2 border-orange-500 text-gray-800 font-black text-lg">Detailed Description</button>
          <button className="pb-4 text-gray-400 font-bold text-lg hover:text-gray-600 transition-colors">Ingredients & Nutrition</button>
          <button className="pb-4 text-gray-400 font-bold text-lg hover:text-gray-600 transition-colors">Reviews (1.2k)</button>
        </div>
        <div className="bg-white rounded-[40px] p-10 border border-gray-50 shadow-sm text-gray-500 leading-loose text-lg">
          {product.details || 'Every BonnieTea beverage is a masterpiece of flavor. We sourcing only the finest hand-picked organic tea leaves and vine-ripened seasonal fruits to ensure every sip is a celebration of nature\'s bounty. Our baristas are trained to follow precise temperature and timing protocols to unlock the full aromatic potential of our blends.'}
        </div>
      </section>

      {/* Similar Products */}
      <section>
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">You May Also Like</h2>
          <Link to="/search" className="text-orange-500 font-black text-sm hover:underline uppercase tracking-widest">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {similarProducts.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default ProductDetailPage;
