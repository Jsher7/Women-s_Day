import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { marketplaceAPI, orderAPI } from '../utils/api';
import { AuthContext } from '../utils/AuthContext';
import { FiArrowLeft, FiShoppingCart, FiEye, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [purchasing, setPurchasing] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productRes, similarRes] = await Promise.all([
                    marketplaceAPI.getProduct(id),
                    marketplaceAPI.getSimilar(id),
                ]);
                setProduct(productRes.data);
                setSimilarProducts(similarRes.data);
            } catch (err) {
                console.error('Failed to fetch product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setPurchasing(true);
        setError('');
        try {
            await orderAPI.placeOrder({
                productId: product._id,
                quantity,
                shippingAddress: {
                    name: 'Default',
                    address: 'To be updated',
                    city: '',
                    state: '',
                    pincode: '',
                    phone: '',
                },
            });
            setPurchased(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Purchase failed');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-xl text-gray-500">Product not found</p>
            </div>
        );
    }

    const pricePosition = product.marketMinPrice && product.marketMaxPrice
        ? Math.min(100, Math.max(0, ((product.finalPrice - product.marketMinPrice) / (product.marketMaxPrice - product.marketMinPrice)) * 100))
        : 50;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Back Link */}
                <Link to="/marketplace" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium">
                    <FiArrowLeft /> Back to Marketplace
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Product Image */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="h-80 md:h-[450px] bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                            {product.imageUrl && product.imageUrl !== '/uploads/placeholder.jpg' ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${product.imageUrl}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-8xl">
                                    {product.category === 'embroidery' ? '🧵' :
                                        product.category === 'crochet' ? '🧶' :
                                            product.category === 'jewelry' ? '💍' : '🎨'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <span className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full capitalize mb-3">
                            {product.category}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                        <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

                        {/* Price */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-4xl font-bold text-purple-700">₹{product.finalPrice}</span>
                                {product.suggestedPrice && product.suggestedPrice !== product.finalPrice && (
                                    <span className="text-lg text-gray-400 line-through">₹{product.suggestedPrice}</span>
                                )}
                            </div>

                            {/* Price Comparison Bar */}
                            {product.marketMinPrice != null && product.marketMaxPrice != null && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2 font-medium">Market Price Range</p>
                                    <div className="relative h-3 bg-gray-200 rounded-full overflow-visible">
                                        <div
                                            className="absolute h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                            style={{ width: '100%' }}
                                        ></div>
                                        {/* Price Position Marker */}
                                        <div
                                            className="absolute -top-1 w-5 h-5 bg-purple-600 rounded-full border-2 border-white shadow-md"
                                            style={{ left: `${pricePosition}%`, transform: 'translateX(-50%)' }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>₹{product.marketMinPrice}</span>
                                        <span className="text-purple-600 font-semibold">Your Price</span>
                                        <span>₹{product.marketMaxPrice}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 mb-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><FiEye /> {product.views || 0} views</span>
                            <span className="flex items-center gap-1"><FiShoppingCart /> {product.sales || 0} sold</span>
                            {product.confidenceScore != null && (
                                <span>Confidence: {product.confidenceScore}%</span>
                            )}
                        </div>

                        {/* Seller Info */}
                        {product.userId && (
                            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-500">Sold by</p>
                                <p className="font-semibold text-gray-800">{product.userId.businessName || product.userId.name}</p>
                            </div>
                        )}

                        {/* Quantity & Purchase */}
                        {!purchased ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-700 font-medium">Quantity:</span>
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition"
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className="px-4 py-2 font-semibold">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition"
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                    <span className="text-gray-500">Total: <span className="font-bold text-purple-600">₹{product.finalPrice * quantity}</span></span>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                                )}

                                <button
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <FiShoppingCart />
                                    {purchasing ? 'Processing...' : isAuthenticated ? 'Purchase Now' : 'Login to Purchase'}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                                <FiCheck className="text-green-600 text-3xl mx-auto mb-2" />
                                <p className="text-green-700 font-semibold text-lg">Order placed successfully!</p>
                                <Link to="/orders" className="text-purple-600 font-medium hover:underline mt-2 inline-block">
                                    View My Orders →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {similarProducts.map((item) => (
                                <Link
                                    key={item._id}
                                    to={`/marketplace/${item._id}`}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
                                >
                                    <div className="h-32 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                                        <span className="text-3xl">
                                            {item.category === 'embroidery' ? '🧵' :
                                                item.category === 'crochet' ? '🧶' :
                                                    item.category === 'jewelry' ? '💍' : '🎨'}
                                        </span>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-sm font-medium text-gray-800 truncate group-hover:text-purple-600">{item.name}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="font-bold text-purple-600">₹{item.finalPrice}</span>
                                            {item.matchScore != null && (
                                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{item.matchScore}% match</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
