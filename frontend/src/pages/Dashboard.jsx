import React, { useState, useRef } from 'react';
import { productAPI } from '../utils/api';
import { FiUpload, FiImage, FiBarChart2 } from 'react-icons/fi';

const Dashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
    hourSpent: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setResult(null); // Reset result if image changes
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setResult(null); // Reset result if data changes
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please upload an image first');
      return;
    }
    if (!formData.name || !formData.category) {
      alert('Please provide a name and category');
      return;
    }

    setLoading(true);
    const analysisData = new FormData();
    Object.keys(formData).forEach((key) => {
      analysisData.append(key, formData[key]);
    });
    analysisData.append('image', image);

    try {
      const response = await productAPI.analyzeProduct(analysisData);
      setResult(response.data);
      setFinalPrice(response.data.pricing.suggestedPrice);
    } catch (error) {
      console.error('Analysis error:', error);
      const message = error.response?.data?.message || error.message || 'Server unreachable. Please ensure the backend is running.';
      alert('Analysis failed: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (!finalPrice || isNaN(finalPrice)) {
      alert('Please enter a valid final price');
      return;
    }

    setPublishing(true);
    const publishData = new FormData();
    Object.keys(formData).forEach((key) => {
      publishData.append(key, formData[key]);
    });
    // Send back the analysis results to avoid re-uploading/re-calculating if possible
    publishData.append('finalPrice', finalPrice);
    publishData.append('imageUrl', result.imageUrl);
    publishData.append('embedding', JSON.stringify(result.embedding));

    try {
      await productAPI.uploadProduct(publishData);
      alert('Product published successfully!');
      setResult(null);
      setFormData({ name: '', description: '', cost: '', hourSpent: '', category: '' });
      setImage(null);
      setPreview(null);
    } catch (error) {
      alert('Publishing failed: ' + error.response?.data?.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">CraftLens AI Assistant</h1>
            <p className="text-gray-600 mt-2">Upload your creation and let AI find the perfect price for you.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Product Details
              </h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Product Image</label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${preview ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                  {preview ? (
                    <div className="relative group">
                      <img src={preview} alt="Preview" className="w-full h-56 object-cover rounded-lg shadow-md" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <p className="text-white font-medium">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiImage className="text-purple-500" size={32} />
                      </div>
                      <p className="text-gray-600 font-medium">Click or drag to upload image</p>
                      <p className="text-gray-400 text-sm mt-1">High quality photos sell better!</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Hand-stitched Floral Hoop"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition appearance-none bg-white"
                  >
                    <option value="">Select a category</option>
                    <option value="embroidery">🧵 Embroidery</option>
                    <option value="crochet">🧶 Crochet</option>
                    <option value="jewelry">💍 Jewelry</option>
                    <option value="diy">🎨 DIY Crafts</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Material Cost (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Labor Hours</label>
                    <input
                      type="number"
                      name="hourSpent"
                      value={formData.hourSpent}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about the craftsmanship..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition"
                  />
                </div>

                {!result && (
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        AI analyzing market...
                      </>
                    ) : (
                      <>✨ Get Smart Picking Pricing</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Results */}
          <div className="space-y-8">
            {!result && !loading && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <FiBarChart2 size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Analysis Results</h3>
                <p className="text-gray-400 mt-2 max-w-xs">Fill in your product details and run the AI analysis to see pricing insights here.</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="w-24 h-24 relative mb-6">
                  <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl animate-pulse">🤖</span>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Deep Web Scraping...</h3>
                <p className="text-gray-500 animate-pulse">Scanning Etsy, Amazon, and Meesho for similar items...</p>

                <div className="w-full max-w-xs mt-8 space-y-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  AI Market Insight
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-purple-600 text-xs font-bold uppercase mb-1">Market Min</p>
                    <p className="text-2xl font-bold text-purple-900">₹{result.pricing.minPrice}</p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-xl">
                    <p className="text-rose-600 text-xs font-bold uppercase mb-1">Market Max</p>
                    <p className="text-2xl font-bold text-rose-900">₹{result.pricing.maxPrice}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-8 rounded-2xl text-white shadow-lg mb-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-green-100 font-bold uppercase text-xs tracking-widest">Recommended Price</h3>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                      {result.pricing.confidenceScore}% Confidence
                    </div>
                  </div>
                  <div className="text-5xl font-black mb-1">₹{result.pricing.suggestedPrice}</div>
                  <p className="text-green-100 text-sm">Based on {result.similarProducts.length} similar items found on the web.</p>
                </div>

                <div className="mb-8">
                  <label className="block text-gray-700 font-bold mb-3 flex items-center justify-between">
                    <span>Set Your Final Sale Price</span>
                    <span className="text-purple-600">₹{finalPrice}</span>
                  </label>
                  <input
                    type="range"
                    min={Math.floor(result.pricing.minPrice * 0.8)}
                    max={Math.floor(result.pricing.maxPrice * 1.2)}
                    step="10"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Aggressive</span>
                    <span>AI Sweet Spot</span>
                    <span>Premium</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleConfirmPublish}
                    disabled={publishing}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-xl flex items-center justify-center gap-2"
                  >
                    {publishing ? 'Publishing...' : 'Confirm and Publish Product'}
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="w-full text-gray-500 font-bold py-2 hover:text-gray-700 transition text-sm"
                  >
                    Discard and Start Over
                  </button>
                </div>

                {result.similarProducts?.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-800 mb-4">Competitor Reference Items:</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {result.similarProducts.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="shrink-0 w-32">
                          <img src={item.imageUrl} alt={item.name} className="w-32 h-24 object-cover rounded-lg mb-2 grayscale hover:grayscale-0 transition" />
                          <p className="text-[10px] text-gray-500 truncate font-medium">{item.name}</p>
                          <p className="text-xs font-bold text-gray-900">₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
