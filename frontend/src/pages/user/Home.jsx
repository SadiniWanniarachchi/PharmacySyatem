import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import HeroImage from '../../assets/hero.png';
import { FaHospital, FaClock, FaUserMd, FaClinicMedical, FaPills, FaHeartbeat, FaShoppingCart, FaPrescriptionBottle } from 'react-icons/fa';
import { GiMedicinePills } from 'react-icons/gi';

function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                if (response.data.success) {
                    // Get first 3 products
                    setFeaturedProducts(response.data.products.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="bg-gradient-to-b from-white to-blue-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10"></div>
                <img
                    src={HeroImage}
                    alt="MedCare Pharmacy"
                    className="w-full h-screen object-cover object-center"
                />

                <div className="absolute inset-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 h-full">
                        <div className="flex items-center h-full">
                            <div className="max-w-xl pt-8">
                                <div className="flex items-center mb-6 animate-fade-in-up">
                                    <FaPrescriptionBottle className="text-[#2c8ba3] mr-2 text-2xl" />
                                    <span className="text-[#2c8ba3] font-semibold tracking-wider">YOUR TRUSTED PHARMACY</span>
                                </div>
                                <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
                                    <span className="block mb-2">MedCare</span>
                                    <span className="block text-[#2c8ba3]">Pharmacy & Shop</span>
                                </h1>
                                <p className="mt-8 text-xl text-gray-200 max-w-lg leading-relaxed">
                                    Your one-stop destination for all your medical and healthcare needs. Quality products, expert advice, and convenient service.
                                </p>
                                <div className="mt-10 flex flex-wrap gap-6">
                                    <Link
                                        to="/shop"
                                        className="inline-flex items-center px-4 py-3 border border-transparent text-lg font-semibold rounded-full text-white bg-[#2c8ba3] hover:bg-[#2c8ba3]/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        Shop Now
                                    </Link>
                                    <Link
                                        to="/prescriptions"
                                        className="inline-flex items-center px-4 py-3 border-2 border-white text-lg font-semibold rounded-full text-white bg-transparent hover:bg-white/10 transition-all duration-300"
                                    >
                                        Order Prescriptions
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 relative">
                <div className="absolute -top-10 left-0 right-0 flex justify-center">
                    <div className="w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-[#2c8ba3]/10 text-[#2c8ba3] rounded-full font-medium mb-4">
                            Why Choose MedCare
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Your Trusted <span className="text-[#2c8ba3]">Pharmacy</span>
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            We provide quality healthcare products and professional pharmacy services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <div className="absolute -top-6 left-6 flex items-center justify-center h-14 w-14 rounded-xl bg-[#2c8ba3] text-white text-2xl shadow-md">
                                    {feature.icon}
                                </div>
                                <h3 className="mt-8 text-2xl font-bold text-gray-900">{feature.title}</h3>
                                <p className="mt-4 text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop Preview Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Featured <span className="text-[#2c8ba3]">Products</span>
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            Browse our selection of high-quality medical supplies and healthcare products.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredProducts.map((product) => (
                                <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    <div className="h-48 bg-gray-200">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                                        <p className="mt-2 text-gray-600">{product.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-2xl font-bold text-[#2c8ba3]">${product.price.toFixed(2)}</span>
                                            <Link
                                                to="/shop"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2c8ba3] hover:bg-[#2c8ba3]/90"
                                            >
                                                <FaShoppingCart className="mr-2" />
                                                Shop Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <Link
                            to="/shop"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-[#2c8ba3] hover:bg-[#2c8ba3]/90 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            View All Products
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

const features = [
    {
        title: 'Prescription Service',
        description: 'Fast and reliable prescription fulfillment with professional consultation.',
        icon: <FaPrescriptionBottle />
    },
    {
        title: 'Quality Products',
        description: 'Wide range of authentic medical supplies and healthcare products.',
        icon: <FaPills />
    },
    {
        title: 'Expert Advice',
        description: 'Professional guidance from qualified pharmacists.',
        icon: <FaUserMd />
    },
    {
        title: 'Fast Delivery',
        description: 'Quick and reliable delivery to your doorstep.',
        icon: <FaClock />
    }
];

// Add this to your global CSS
// @keyframes float {
//     0%, 100% { transform: translateY(0); }
//     50% { transform: translateY(-10px); }
// }
// .animate-float { animation: float 3s ease-in-out infinite; }
// .animate-float-delay { animation: float 3s ease-in-out 1.5s infinite; }

export default Home;