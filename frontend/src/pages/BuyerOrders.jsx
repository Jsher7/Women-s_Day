import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiShoppingBag } from 'react-icons/fi';

const STATUS_CONFIG = {
    pending: { icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Pending' },
    confirmed: { icon: FiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Confirmed' },
    shipped: { icon: FiTruck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Shipped' },
    delivered: { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Delivered' },
    cancelled: { icon: FiPackage, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Cancelled' },
};

const BuyerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderAPI.getMyOrders();
                setOrders(res.data);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-500 mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <FiShoppingBag className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="text-xl text-gray-400 mb-2">No orders yet</p>
                        <p className="text-gray-500 mb-6">Start exploring the marketplace!</p>
                        <Link
                            to="/marketplace"
                            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const StatusIcon = statusCfg.icon;
                            const product = order.productId;

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                                >
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Product Image */}
                                        <Link to={product ? `/marketplace/${product._id}` : '#'} className="shrink-0">
                                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
                                                {product?.imageUrl && product.imageUrl !== '/uploads/placeholder.jpg' ? (
                                                    <img
                                                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${product.imageUrl}`}
                                                        alt={product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-2xl">
                                                        {product?.category === 'embroidery' ? '🧵' :
                                                            product?.category === 'crochet' ? '🧶' :
                                                                product?.category === 'jewelry' ? '💍' : '🎨'}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Order Details */}
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {product?.name || 'Product'}
                                                    </h3>
                                                    {order.sellerId && (
                                                        <p className="text-sm text-gray-500">
                                                            Sold by {order.sellerId.businessName || order.sellerId.name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color} border`}>
                                                    <StatusIcon size={14} />
                                                    {statusCfg.label}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-6 mt-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Qty: </span>
                                                    <span className="font-medium">{order.quantity}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Total: </span>
                                                    <span className="font-bold text-purple-600">₹{order.totalPrice}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Ordered: </span>
                                                    <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerOrders;
