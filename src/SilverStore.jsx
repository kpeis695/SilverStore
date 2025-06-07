import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Package, TrendingUp, Users, DollarSign, Search, Star, Heart, Plus, Minus, Eye, BarChart3, ShoppingBag, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

const SilverStore = () => {
  // State management
  const [currentView, setCurrentView] = useState('storefront');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analytics, setAnalytics] = useState({});
  const [userProfile, setUserProfile] = useState({
    preferences: {},
    purchaseHistory: [],
    browsingHistory: [],
    aiRecommendations: []
  });

  // AI Recommendation Functions
  const getCollaborativeRecommendations = (productList, profile) => {
    // Simulate collaborative filtering based on similar users
    const similarUsers = [
      { purchases: [1, 3, 6, 8], similarity: 0.8 },
      { purchases: [2, 4, 5, 9], similarity: 0.6 },
      { purchases: [1, 7, 9, 10], similarity: 0.7 }
    ];
    
    const recommendations = [];
    similarUsers.forEach(user => {
      user.purchases.forEach(productId => {
        if (!profile.purchaseHistory.includes(productId)) {
          const product = productList.find(p => p.id === productId);
          if (product) {
            recommendations.push({
              product,
              confidence: user.similarity * 0.8,
              reason: "Users with similar interests also bought this"
            });
          }
        }
      });
    });
    
    return recommendations;
  };

  const getContentBasedRecommendations = (productList, profile) => {
    const recommendations = [];
    
    // Find products similar to purchase history
    profile.purchaseHistory.forEach(purchasedId => {
      const purchasedProduct = productList.find(p => p.id === purchasedId);
      if (purchasedProduct) {
        productList.forEach(product => {
          if (product.id !== purchasedId && !profile.purchaseHistory.includes(product.id)) {
            let similarity = 0;
            
            // Category similarity
            if (product.category === purchasedProduct.category) {
              similarity += 0.5;
            }
            
            // Tag similarity
            const commonTags = product.tags?.filter(tag => 
              purchasedProduct.tags?.includes(tag)
            ).length || 0;
            similarity += (commonTags / Math.max(product.tags?.length || 1, purchasedProduct.tags?.length || 1)) * 0.3;
            
            // Related categories
            const commonRelated = product.relatedCategories?.filter(cat => 
              purchasedProduct.relatedCategories?.includes(cat)
            ).length || 0;
            similarity += (commonRelated / Math.max(product.relatedCategories?.length || 1, purchasedProduct.relatedCategories?.length || 1)) * 0.2;
            
            if (similarity > 0.3) {
              recommendations.push({
                product,
                confidence: similarity,
                reason: `Similar to ${purchasedProduct.name}`
              });
            }
          }
        });
      }
    });
    
    return recommendations;
  };

  const getTrendingRecommendations = (productList, profile) => {
    return productList
      .filter(product => !profile.purchaseHistory.includes(product.id))
      .map(product => {
        let trendingScore = product.rating * 0.3 + (product.reviews / 300) * 0.3;
        
        // Boost score based on user preferences
        if (profile.preferences[product.category]) {
          trendingScore *= (1 + profile.preferences[product.category]);
        }
        
        return {
          product,
          confidence: Math.min(trendingScore, 1),
          reason: "Trending in your interests"
        };
      })
      .filter(rec => rec.confidence > 0.4);
  };

  // AI Recommendation Engine
  const generateAIRecommendations = useCallback((productList, profile) => {
    // Collaborative Filtering: Find similar users' purchases
    const collaborativeRecs = getCollaborativeRecommendations(productList, profile);
    
    // Content-Based Filtering: Recommend based on purchase history
    const contentBasedRecs = getContentBasedRecommendations(productList, profile);
    
    // Trending/Popular items with user preference weighting
    const trendingRecs = getTrendingRecommendations(productList, profile);
    
    // Combine all recommendation types with confidence scores
    const allRecs = [
      ...collaborativeRecs.map(r => ({ ...r, type: 'collaborative', confidence: r.confidence * 0.4 })),
      ...contentBasedRecs.map(r => ({ ...r, type: 'content-based', confidence: r.confidence * 0.5 })),
      ...trendingRecs.map(r => ({ ...r, type: 'trending', confidence: r.confidence * 0.3 }))
    ];
    
    // Sort by confidence and remove duplicates
    const uniqueRecs = allRecs
      .reduce((acc, rec) => {
        const existing = acc.find(r => r.product.id === rec.product.id);
        if (!existing || existing.confidence < rec.confidence) {
          return [...acc.filter(r => r.product.id !== rec.product.id), rec];
        }
        return acc;
      }, [])
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
    
    setUserProfile(prev => ({
      ...prev,
      aiRecommendations: uniqueRecs
    }));
  }, []);

  // Initialize demo data
  useEffect(() => {
    const demoProducts = [
      {
        id: 1,
        name: "Premium Wireless Headphones",
        price: 299.99,
        category: "electronics",
        image: "🎧",
        description: "High-quality wireless headphones with noise cancellation",
        stock: 25,
        rating: 4.8,
        reviews: 124,
        featured: true,
        tags: ["audio", "wireless", "premium", "noise-cancelling"],
        relatedCategories: ["electronics", "music", "gaming"]
      },
      {
        id: 2,
        name: "Organic Cotton T-Shirt",
        price: 29.99,
        category: "clothing",
        image: "👕",
        description: "Comfortable organic cotton t-shirt in various colors",
        stock: 50,
        rating: 4.5,
        reviews: 89,
        featured: false,
        tags: ["clothing", "cotton", "organic", "casual"],
        relatedCategories: ["clothing", "fashion", "casual"]
      },
      {
        id: 3,
        name: "Smart Fitness Watch",
        price: 199.99,
        category: "electronics",
        image: "⌚",
        description: "Advanced fitness tracking with heart rate monitor",
        stock: 15,
        rating: 4.7,
        reviews: 203,
        featured: true,
        tags: ["fitness", "smart", "health", "tracking"],
        relatedCategories: ["electronics", "fitness", "health"]
      },
      {
        id: 4,
        name: "Artisan Coffee Beans",
        price: 24.99,
        category: "food",
        image: "☕",
        description: "Premium single-origin coffee beans, freshly roasted",
        stock: 100,
        rating: 4.9,
        reviews: 156,
        featured: false,
        tags: ["coffee", "premium", "organic", "artisan"],
        relatedCategories: ["food", "beverage", "gourmet"]
      },
      {
        id: 5,
        name: "Eco-Friendly Water Bottle",
        price: 19.99,
        category: "lifestyle",
        image: "🍶",
        description: "Sustainable stainless steel water bottle",
        stock: 75,
        rating: 4.6,
        reviews: 67,
        featured: false,
        tags: ["eco-friendly", "sustainable", "water", "bottle"],
        relatedCategories: ["lifestyle", "fitness", "eco"]
      },
      {
        id: 6,
        name: "Wireless Gaming Mouse",
        price: 79.99,
        category: "electronics",
        image: "🖱️",
        description: "High-precision gaming mouse with RGB lighting",
        stock: 30,
        rating: 4.4,
        reviews: 91,
        featured: true,
        tags: ["gaming", "wireless", "precision", "rgb"],
        relatedCategories: ["electronics", "gaming", "computer"]
      },
      {
        id: 7,
        name: "Yoga Mat Pro",
        price: 49.99,
        category: "fitness",
        image: "🧘",
        description: "Non-slip premium yoga mat for all skill levels",
        stock: 40,
        rating: 4.7,
        reviews: 78,
        featured: false,
        tags: ["yoga", "fitness", "exercise", "non-slip"],
        relatedCategories: ["fitness", "health", "lifestyle"]
      },
      {
        id: 8,
        name: "Bluetooth Speaker",
        price: 89.99,
        category: "electronics",
        image: "🔊",
        description: "Portable wireless speaker with deep bass",
        stock: 35,
        rating: 4.5,
        reviews: 112,
        featured: false,
        tags: ["audio", "bluetooth", "portable", "speaker"],
        relatedCategories: ["electronics", "music", "portable"]
      },
      {
        id: 9,
        name: "Protein Powder",
        price: 39.99,
        category: "fitness",
        image: "💪",
        description: "Whey protein powder for muscle building",
        stock: 60,
        rating: 4.6,
        reviews: 89,
        featured: false,
        tags: ["protein", "fitness", "supplement", "muscle"],
        relatedCategories: ["fitness", "health", "nutrition"]
      },
      {
        id: 10,
        name: "LED Desk Lamp",
        price: 59.99,
        category: "home",
        image: "💡",
        description: "Adjustable LED desk lamp with multiple brightness levels",
        stock: 45,
        rating: 4.4,
        reviews: 67,
        featured: false,
        tags: ["led", "desk", "lamp", "adjustable"],
        relatedCategories: ["home", "office", "lighting"]
      }
    ];

    const demoOrders = [
      { id: 1001, customer: "John Smith", total: 329.98, status: "delivered", date: "2025-06-05", items: 2 },
      { id: 1002, customer: "Sarah Johnson", total: 79.99, status: "shipped", date: "2025-06-06", items: 1 },
      { id: 1003, customer: "Mike Davis", total: 54.98, status: "processing", date: "2025-06-07", items: 3 },
      { id: 1004, customer: "Emily Wilson", total: 199.99, status: "delivered", date: "2025-06-04", items: 1 }
    ];

    const demoCustomers = [
      { id: 1, name: "John Smith", email: "john@example.com", orders: 5, spent: 1299.95, joined: "2024-03-15" },
      { id: 2, name: "Sarah Johnson", email: "sarah@example.com", orders: 3, spent: 459.97, joined: "2024-05-22" },
      { id: 3, name: "Mike Davis", email: "mike@example.com", orders: 7, spent: 2150.43, joined: "2024-01-10" },
      { id: 4, name: "Emily Wilson", email: "emily@example.com", orders: 2, spent: 349.98, joined: "2024-06-01" }
    ];

    const demoAnalytics = {
      totalRevenue: 45230.50,
      totalOrders: 1287,
      totalProducts: 156,
      totalCustomers: 843,
      conversionRate: 3.2,
      avgOrderValue: 85.40,
      topProducts: ["Wireless Headphones", "Smart Watch", "Gaming Mouse"],
      revenueGrowth: 12.5,
      monthlyRevenue: [3200, 3800, 4100, 4500, 4800, 5200],
      categoryBreakdown: { electronics: 45, clothing: 25, food: 15, lifestyle: 15 }
    };

    setProducts(demoProducts);
    setOrders(demoOrders);
    setCustomers(demoCustomers);
    setAnalytics(demoAnalytics);
    
    // Initialize AI user profile with demo data
    const demoUserProfile = {
      preferences: {
        electronics: 0.7,
        fitness: 0.5,
        food: 0.3,
        lifestyle: 0.4
      },
      purchaseHistory: [1, 3, 4], // Product IDs
      browsingHistory: [1, 2, 3, 6, 7],
      aiRecommendations: []
    };
    setUserProfile(demoUserProfile);
    
    // Generate initial AI recommendations
    generateAIRecommendations(demoProducts, demoUserProfile);
  }, [generateAIRecommendations]);

  // Track user behavior for AI learning
  const trackUserInteraction = useCallback((action, productId, data = {}) => {
    setUserProfile(prev => {
      const product = products.find(p => p.id === productId);
      if (!product) return prev;
      
      const updatedProfile = { ...prev };
      
      switch (action) {
        case 'view':
          if (!updatedProfile.browsingHistory.includes(productId)) {
            updatedProfile.browsingHistory = [...updatedProfile.browsingHistory, productId].slice(-20);
          }
          // Increase category preference
          updatedProfile.preferences[product.category] = Math.min(
            (updatedProfile.preferences[product.category] || 0) + 0.1,
            1
          );
          break;
          
        case 'purchase':
          if (!updatedProfile.purchaseHistory.includes(productId)) {
            updatedProfile.purchaseHistory = [...updatedProfile.purchaseHistory, productId];
          }
          // Significantly increase category preference
          updatedProfile.preferences[product.category] = Math.min(
            (updatedProfile.preferences[product.category] || 0) + 0.3,
            1
          );
          break;
          
        case 'cart_add':
          // Moderate increase in category preference
          updatedProfile.preferences[product.category] = Math.min(
            (updatedProfile.preferences[product.category] || 0) + 0.2,
            1
          );
          break;
          
        default:
          // No action needed for unknown actions
          break;
      }
      
      return updatedProfile;
    });
    
    // Regenerate recommendations after user interaction
    setTimeout(() => {
      generateAIRecommendations(products, userProfile);
    }, 100);
  }, [products, userProfile, generateAIRecommendations]);

  // Cart management with AI tracking
  const addToCart = useCallback((product) => {
    console.log('Adding to cart:', product); // Debug log
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const updated = prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        console.log('Updated cart:', updated); // Debug log
        return updated;
      }
      const newCart = [...prev, { ...product, quantity: 1 }];
      console.log('New cart:', newCart); // Debug log
      return newCart;
    });
    
    // Track AI interaction
    trackUserInteraction('cart_add', product.id);
  }, [trackUserInteraction]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => 
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart]);

  // Inventory management
  const updateStock = useCallback((productId, newStock) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, stock: newStock } : product
      )
    );
  }, []);

  // Filtered products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'electronics', 'clothing', 'food', 'lifestyle'];

  // Navigation component
  const Navigation = () => (
    <nav className="bg-white shadow-lg border-b-2 border-blue-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">SilverStore</h1>
            <div className="hidden md:flex space-x-6">
              <button 
                onClick={() => setCurrentView('storefront')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'storefront' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Storefront
              </button>
              <button 
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'admin' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Admin Panel
              </button>
              <button 
                onClick={() => setCurrentView('ai-insights')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'ai-insights' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                AI Insights
              </button>
              <button 
                onClick={() => setCurrentView('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Analytics
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentView('cart')}
              className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // AI Recommendation Card Component
  const AIRecommendationCard = ({ recommendation, addToCart, onView }) => {
    const { product, confidence, reason } = recommendation;
    
    return (
      <div 
        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative"
        onClick={(e) => {
          // Only trigger onView if not clicking on interactive elements
          if (!e.target.closest('button')) {
            onView();
          }
        }}
      >
        {/* AI Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {Math.round(confidence * 100)}% match
          </span>
        </div>
        
        <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-6xl">{product.image}</span>
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
          
          {/* AI Reason */}
          <div className="mb-3 p-2 bg-purple-100 rounded-lg">
            <p className="text-xs text-purple-700 font-medium">🤖 {reason}</p>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center mb-3">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
            <span className="text-sm text-gray-400 ml-1">({product.reviews})</span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-purple-600">${product.price}</span>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {product.stock} in stock
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('AI rec add to cart clicked for:', product.name); // Debug log
              addToCart(product);
            }}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Product Card Component
  const ProductCard = ({ product, addToCart, onView }) => (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
      onClick={(e) => {
        // Only trigger onView if not clicking on interactive elements
        if (!e.target.closest('button')) {
          onView();
        }
      }}
    >
      <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-6xl">{product.image}</span>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
            <span className="text-sm text-gray-400 ml-1">({product.reviews})</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-blue-600">${product.price}</span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            product.stock > 20 ? 'bg-green-100 text-green-800' :
            product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {product.stock} in stock
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add to cart clicked for:', product.name); // Debug log
            addToCart(product);
          }}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );

  // Storefront view
  const StorefrontView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Welcome to SilverStore</h1>
            <p className="text-xl mb-8 opacity-90">Discover premium products with intelligent recommendations</p>
            <div className="flex justify-center">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearchTerm(e.target.value);
                  }}
                  onFocus={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* AI Recommendations Section */}
        {userProfile.aiRecommendations.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">🤖 AI Recommendations for You</h2>
              <span className="ml-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm">
                Powered by AI
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userProfile.aiRecommendations.slice(0, 4).map(rec => (
                <AIRecommendationCard 
                  key={rec.product.id} 
                  recommendation={rec} 
                  addToCart={addToCart}
                  onView={() => trackUserInteraction('view', rec.product.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        {selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.featured).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  addToCart={addToCart}
                  onView={() => trackUserInteraction('view', product.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                addToCart={addToCart}
                onView={() => trackUserInteraction('view', product.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Cart View
  const CartView = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <button
                onClick={() => setCurrentView('storefront')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
                  <span className="text-4xl">{item.image}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total: ${total.toFixed(2)}</span>
                  <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    onClick={() => {
                      // Track purchases for AI learning
                      cart.forEach(item => {
                        trackUserInteraction('purchase', item.id, { quantity: item.quantity });
                      });
                      // Show checkout success message
                      alert(`Thank you for your purchase! Total: ${total.toFixed(2)}\n\nYour AI preferences have been updated based on this purchase.`);
                      setCart([]); // Clear cart after purchase
                    }}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Admin Panel View
  const AdminView = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SilverStore Admin Panel</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Inventory Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{product.image}</span>
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">${product.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        product.stock > 20 ? 'bg-green-100 text-green-800' :
                        product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} units
                      </span>
                      <button
                        onClick={() => updateStock(product.id, product.stock + 10)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Recent Orders
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">#{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total}</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Management */}
          <div className="bg-white rounded-lg shadow lg:col-span-2">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer Management
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Orders</th>
                      <th className="text-left py-2">Total Spent</th>
                      <th className="text-left py-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => (
                      <tr key={customer.id} className="border-b">
                        <td className="py-3">{customer.name}</td>
                        <td className="py-3 text-gray-600">{customer.email}</td>
                        <td className="py-3">{customer.orders}</td>
                        <td className="py-3 font-semibold">${customer.spent}</td>
                        <td className="py-3 text-gray-600">{customer.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Analytics View
  const AnalyticsView = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SilverStore Analytics</h1>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue?.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{analytics.revenueGrowth}% from last month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders?.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Avg: ${analytics.avgOrderValue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Products</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
                <p className="text-sm text-purple-600">Across all categories</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalCustomers}</p>
                <p className="text-sm text-orange-600">{analytics.conversionRate}% conversion rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Monthly Revenue
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.monthlyRevenue?.map((revenue, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-16 text-sm text-gray-500">
                      {new Date(2025, index).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${(revenue / Math.max(...analytics.monthlyRevenue)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-20 text-sm text-right font-medium">${revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products & Category Breakdown */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Top Products</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {analytics.topProducts?.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-900">{product}</span>
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Category Breakdown</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(analytics.categoryBreakdown || {}).map(([category, percentage]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                        <span className="text-sm text-gray-500">{percentage}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Real-time Alerts
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
                  <p className="text-sm text-yellow-700">Smart Fitness Watch has only 15 units remaining</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">High Performance</p>
                  <p className="text-sm text-green-700">Revenue target exceeded by 12.5% this month</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Trending Product</p>
                  <p className="text-sm text-blue-700">Wireless Gaming Mouse sales increased 45% this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // AI Insights View
  const AIInsightsView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🤖 SilverStore AI Insights</h1>
          <span className="ml-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm">
            Machine Learning Powered
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Preference Profile */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-purple-200">
              <h2 className="text-xl font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Your Preference Profile
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(userProfile.preferences).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                      <span className="text-sm text-purple-600 font-bold">{Math.round(score * 100)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  <strong>AI Analysis:</strong> You show strong interest in electronics and moderate interest in fitness products. 
                  Our recommendations focus on high-tech gadgets and health-related items.
                </p>
              </div>
            </div>
          </div>

          {/* AI Recommendation Breakdown */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-purple-200">
              <h2 className="text-xl font-semibold flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                Recommendation Engine
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {userProfile.aiRecommendations.slice(0, 4).map((rec, index) => (
                  <div key={rec.product.id} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{rec.product.name}</span>
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{rec.type}</span>
                      <span>${rec.product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>How it works:</strong> Our AI analyzes your browsing history, purchases, and similar users' 
                  behavior to predict what you'll love next.
                </p>
              </div>
            </div>
          </div>

          {/* Behavioral Analytics */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-purple-200">
              <h2 className="text-xl font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Shopping Behavior
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Purchase History</h3>
                  <div className="space-y-2">
                    {userProfile.purchaseHistory.slice(0, 3).map(productId => {
                      const product = products.find(p => p.id === productId);
                      return product ? (
                        <div key={productId} className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                          <span className="text-lg">{product.image}</span>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">${product.price}</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recently Viewed</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {userProfile.browsingHistory.slice(-4).map(productId => {
                      const product = products.find(p => p.id === productId);
                      return product ? (
                        <div key={productId} className="text-center p-2 bg-blue-50 rounded">
                          <span className="text-lg">{product.image}</span>
                          <p className="text-xs text-gray-600 mt-1 truncate">{product.name}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">🎯 AI Prediction</h3>
                  <p className="text-sm text-yellow-700">
                    Based on your behavior, you're 78% likely to purchase another electronics item within the next week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 All AI Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userProfile.aiRecommendations.map(rec => (
              <AIRecommendationCard 
                key={rec.product.id} 
                recommendation={rec} 
                addToCart={addToCart}
                onView={() => trackUserInteraction('view', rec.product.id)}
              />
            ))}
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="mt-8 bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-purple-200">
            <h2 className="text-xl font-semibold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              AI Performance Metrics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="text-sm text-green-700">Recommendation Accuracy</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">76%</div>
                <div className="text-sm text-blue-700">Click-through Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">12%</div>
                <div className="text-sm text-purple-700">Conversion Lift</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">$2.4M</div>
                <div className="text-sm text-orange-700">AI-driven Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      {currentView === 'storefront' && <StorefrontView />}
      {currentView === 'cart' && <CartView />}
      {currentView === 'admin' && <AdminView />}
      {currentView === 'analytics' && <AnalyticsView />}
      {currentView === 'ai-insights' && <AIInsightsView />}
    </div>
  );
};

export default SilverStore;
