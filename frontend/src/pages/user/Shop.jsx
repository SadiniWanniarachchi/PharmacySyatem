import { useState, useEffect } from 'react';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { addToCart, getCartItems } from '../../utils/cartUtils';
import Swal from 'sweetalert2';
import axios from 'axios';

function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        // Load cart items on component mount
        setCartItems(getCartItems());
        // Fetch products from backend
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/products');
            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                setError('Failed to fetch products');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (product) => {
        if (product.outOfStock) {
            Swal.fire({
                title: 'Out of Stock',
                text: 'This product is currently out of stock',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        const updatedCart = addToCart(product);
        setCartItems(updatedCart);

        Swal.fire({
            title: 'Added to Cart!',
            text: `${product.name} has been added to your cart`,
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            position: 'top-end',
            toast: true
        });
    };

    const isInCart = (productId) => {
        return cartItems.some(item => item._id === productId);
    };

    const toggleFavorite = (productId) => {
        console.log('Toggled favorite for product:', productId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600 text-center">
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-8 px-4 ">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-5xl text-gray-900 font-bold mb-4 md:mb-0">MedCare Shop</h1>
                    <div className="w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search medical products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Medicines', 'Medical Devices', 'First Aid', 'Health Supplements', 'Medical Equipment'].map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === category
                                    ? 'bg-[#2c8ba3] text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                {category === 'All' ? 'All Products' : category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="group relative flex flex-col h-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                            {/* Badges Container */}
                            <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                                {/* New badge */}
                                {product.isNew && (
                                    <span className="bg-[#2c8ba3] text-white text-xs font-bold px-2 py-1 rounded-full">
                                        NEW
                                    </span>
                                )}
                            </div>

                            {/* Status Badges Container */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                {/* Prescription Required badge */}
                                {product.prescriptionRequired && (
                                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full border border-red-200 flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Prescription Required
                                    </span>
                                )}

                                {/* Out of Stock badge */}
                                {product.outOfStock && (
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Image container with fixed aspect ratio */}
                            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4 relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className={`w-full h-full object-cover object-center transition-opacity duration-300 ${product.outOfStock ? 'opacity-50' : 'group-hover:opacity-90'
                                        }`}
                                />
                                {product.outOfStock && (
                                    <div className="absolute inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center">
                                        <span className="text-white text-sm font-medium bg-gray-900 bg-opacity-50 px-3 py-1 rounded-full">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Product details */}
                            <div className="flex flex-col flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                                        <p className="text-sm text-gray-600">Brand: {product.brand}</p>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">LKR {product.price.toFixed(2)}</p>
                                </div>

                                {/* Rating */}
                                <div className="mt-2 flex items-center">
                                    <div className="flex items-center">
                                        {[0, 1, 2, 3, 4].map((rating) => (
                                            <StarIcon
                                                key={rating}
                                                className={`h-4 w-4 ${rating < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                aria-hidden="true"
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-500">{product.reviews} reviews</span>
                                </div>

                                <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-grow">
                                    {product.description}
                                </p>

                                <div className="mt-2 text-sm text-gray-500">
                                    Expiry: {new Date(product.expiryDate).toLocaleDateString()}
                                </div>

                                <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={isInCart(product._id) || product.outOfStock}
                                    className={`mt-4 w-full ${isInCart(product._id)
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : product.outOfStock
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#2c8ba3] hover:bg-[#2c8ba3]/90'
                                        } text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors duration-300`}
                                >
                                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                    {isInCart(product._id)
                                        ? 'Added to Cart'
                                        : product.outOfStock
                                            ? 'Out of Stock'
                                            : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Shop;