import React, { useState, useEffect } from 'react';
import { productAPI, pricingAPI } from '../utils/api';
import { FiEdit2, FiTrash2, FiDollarSign, FiBarChart2 } from 'react-icons/fi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pricingDetails, setPricingDetails] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getUserProducts();
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setEditPrice(product.finalPrice);
  };

  const handleSavePrice = async (productId) => {
    try {
      await productAPI.updatePrice(productId, { finalPrice: parseFloat(editPrice) });
      setProducts(
        products.map((p) => (p._id === productId ? { ...p, finalPrice: parseFloat(editPrice) } : p))
      );
      setEditingId(null);
    } catch (error) {
      alert('Failed to update price');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(productId);
        setProducts(products.filter((p) => p._id !== productId));
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleViewDetails = async (product) => {
    setSelectedProduct(product);
    try {
      const fairness = await pricingAPI.getPriceFairness(product._id);
      const profit = await pricingAPI.calculateProfit(product._id);
      setPricingDetails({ fairness: fairness.data, profit: profit.data });
    } catch (error) {
      console.error('Failed to fetch details:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Products</h1>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No products yet. Upload your first product to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                {product.imageUrl && (
                  <img
                    src={`http://localhost:6000${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>

                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Suggested:</span>
                      <span className="font-semibold text-purple-600">₹{product.suggestedPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Price:</span>
                      {editingId === product._id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 px-2 py-1 border border-purple-300 rounded"
                        />
                      ) : (
                        <span className="font-semibold text-green-600">₹{product.finalPrice}</span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold">{product.confidenceScore}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingId === product._id ? (
                      <button
                        onClick={() => handleSavePrice(product._id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(product)}
                        className="flex-1 bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition flex items-center justify-center gap-1"
                      >
                        <FiEdit2 size={16} /> Edit
                      </button>
                    )}

                    <button
                      onClick={() => handleViewDetails(product)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition flex items-center justify-center gap-1"
                    >
                      <FiBarChart2 size={16} /> Details
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition flex items-center justify-center gap-1"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedProduct && pricingDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6">{selectedProduct.name} - Detailed Analysis</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-3">Price Fairness</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span
                        className={`font-bold ${pricingDetails.fairness.status === 'fair'
                            ? 'text-green-600'
                            : pricingDetails.fairness.status === 'underpriced'
                              ? 'text-orange-600'
                              : 'text-red-600'
                          }`}
                      >
                        {pricingDetails.fairness.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Price:</span>
                      <span className="font-bold">₹{pricingDetails.fairness.yourPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Median:</span>
                      <span>₹{pricingDetails.fairness.marketMedian}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min - Max:</span>
                      <span>₹{pricingDetails.fairness.marketMin} - ₹{pricingDetails.fairness.marketMax}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-3">Profit Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className="font-bold text-green-600">₹{pricingDetails.profit.profit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Margin:</span>
                      <span className="font-bold">{pricingDetails.profit.profitMargin}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit/Hour:</span>
                      <span className="font-bold">₹{pricingDetails.profit.profitPerHour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI %:</span>
                      <span className="font-bold">{pricingDetails.profit.roiPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setPricingDetails(null);
                }}
                className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
