import React, { useEffect, useState } from "react";
import { getAllProductsApi } from "../util/api";
import { Coffee, Search, Plus, Trash2, Edit, AlertCircle, ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const AdminProductPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await getAllProductsApi();
                setProducts(res.data?.products || []);
            } catch (err) {
                setError("Không thể tải danh sách sản phẩm.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <Coffee className="h-8 w-8 text-orange-500" /> Quản Lý Sản Phẩm
                    </h1>
                    <p className="text-gray-500 mt-1">Danh sách sản phẩm và kiểm soát kho hàng BonnieTea.</p>
                </div>
                <button 
                    onClick={() => alert("Tính năng thêm sản phẩm mới đang được cập nhật!")}
                    className="px-5 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-orange-100 flex items-center gap-2 cursor-pointer"
                >
                    <Plus className="h-4 w-4" /> Thêm sản phẩm
                </button>
            </div>

            {/* Toolbar */}
            <div className="mb-6 flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm theo tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-150 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800 shadow-sm"
                    />
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Content list */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-red-600">
                    <AlertCircle className="h-8 w-8 mx-auto mb-3" />
                    <p className="font-bold">{error}</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <Coffee className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-gray-800">Không tìm thấy sản phẩm nào</h3>
                    <p className="text-gray-505 text-sm mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    <th className="py-4 px-6">Hình ảnh</th>
                                    <th className="py-4 px-6">Tên sản phẩm</th>
                                    <th className="py-4 px-6">Danh mục</th>
                                    <th className="py-4 px-6">Giá gốc</th>
                                    <th className="py-4 px-6">Giá khuyến mãi</th>
                                    <th className="py-4 px-6">Tồn kho</th>
                                    <th className="py-4 px-6">Đã bán</th>
                                    <th className="py-4 px-6 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-700">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                <img 
                                                    src={product.images?.[0] || "https://images.unsplash.com/photo-1544787210-2213d240ad4a?q=80&w=150"} 
                                                    alt="" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 font-black">{product.name}</td>
                                        <td className="py-4 px-6">
                                            <span className="bg-gray-105/60 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-100">
                                                {product.category?.name || "Đồ uống"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">{product.price.toLocaleString()}đ</td>
                                        <td className="py-4 px-6 text-orange-600">
                                            {product.promotionPrice > 0 ? `${product.promotionPrice.toLocaleString()}đ` : "—"}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`font-black ${product.stock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500">{product.sold || 0}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    onClick={() => alert("Sửa sản phẩm: Chức năng đang phát triển!")}
                                                    className="p-2 border border-gray-150 hover:border-orange-500 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => alert("Xóa sản phẩm: Chức năng đang phát triển!")}
                                                    className="p-2 border border-gray-150 hover:border-red-500 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductPage;
