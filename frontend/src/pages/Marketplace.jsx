import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceAPI } from '../utils/api';
import { FiSearch, FiChevronLeft, FiChevronRight, FiEye, FiShoppingCart } from 'react-icons/fi';

const CATEGORIES = [
    { value: 'all', label: '✨ All' },
    { value: 'embroidery', label: '🧵 Embroidery' },
    { value: 'crochet', label: '🧶 Crochet' },
    { value: 'jewelry', label: '💍 Jewelry' },
    { value: 'diy', label: '🎨 DIY Crafts' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'popular', label: 'Most Popular' },
];

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('newest');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (search) params.search = search;
            if (category !== 'all') params.category = category;
            if (sort !== 'newest') params.sort = sort;

            const res = await marketplaceAPI.browse(params);
            setProducts(res.data.products);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    }, [search, category, sort]);

    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500 text-white py-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Discover Handcrafted Treasures
                    </h1>
                    <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                        Browse unique, handmade products from talented artisans. Each piece tells a story.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-28 py-4 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filters Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    {/* Category Chips */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${category === cat.value
                                        ? 'bg-purple-600 text-white shadow-md scale-105'
                                        : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Results Count */}
                <p className="text-gray-500 mb-6">
                    {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
                </p>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl text-gray-400 mb-2">No products found</p>
                        <p className="text-gray-500">Try a different search or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product._id}
                                to={`/marketplace/${product._id}`}
                                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1"
                            >
                                {/* Product Image */}
                                <div className="relative h-48 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
                                    {product.imageUrl && product.imageUrl !== '/uploads/placeholder.jpg' ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${product.imageUrl}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-5xl">
                                                {product.category === 'embroidery' ? '🧵' :
                                                    product.category === 'crochet' ? '🧶' :
                                                        product.category === 'jewelry' ? '💍' : '🎨'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                                        {product.category}
                                    </span>
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-1 truncate group-hover:text-purple-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-3 line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {product.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-purple-600">₹{product.finalPrice}</span>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <span className="flex items-center gap-1"><FiEye /> {product.views || 0}</span>
                                            <span className="flex items-center gap-1"><FiShoppingCart /> {product.sales || 0}</span>
                                        </div>
                                    </div>

                                    {product.userId?.businessName && (
                                        <p className="text-xs text-gray-400 mt-2">by {product.userId.businessName}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-10">
                        <button
                            onClick={() => fetchProducts(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <FiChevronLeft /> Prev
                        </button>
                        <span className="text-gray-600 font-medium">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => fetchProducts(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Next <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
