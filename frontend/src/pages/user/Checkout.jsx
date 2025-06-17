import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartItems, clearCart } from '../../utils/cartUtils';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ShoppingBagIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, DocumentTextIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/Spinner';
import CardPaymentForm from '../../components/payment/CardPaymentForm';
import { validateEmail, validatePhone, validateRequired, validateAddress } from '../../utils/validationUtils';

function Checkout() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        deliveryNotes: ''
    });
    const [formData, setFormData] = useState({
        address: user?.address || '',
        phone: user?.phone || '',
        email: user?.email || '',
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        deliveryNotes: '',
        paymentMethod: 'cod' // Default to Cash on Delivery
    });

    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    const [cardErrors, setCardErrors] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    const [isCardValid, setIsCardValid] = useState(false);

    useEffect(() => {
        loadCartItems();
    }, []);

    const loadCartItems = async () => {
        try {
            setLoading(true);
            const items = getCartItems();
            if (items.length === 0) {
                navigate('/cart');
                return;
            }

            // Fetch product details for each cart item
            const itemsWithDetails = await Promise.all(
                items.map(async (item) => {
                    try {
                        const response = await axios.get(`http://localhost:5000/api/products/${item._id}`);
                        if (response.data.success) {
                            return {
                                ...item,
                                ...response.data.product,
                                price: response.data.product.price,
                                cartQuantity: item.quantity || 1 // Keep the cart quantity separate from stock quantity
                            };
                        }
                        return item;
                    } catch (error) {
                        console.error(`Error fetching product ${item._id}:`, error);
                        return item;
                    }
                })
            );

            setCartItems(itemsWithDetails);
        } catch (error) {
            setError('Error loading cart items');
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {
            name: '',
            email: '',
            phone: '',
            address: '',
            deliveryNotes: ''
        };

        // Validate name
        if (!validateRequired(formData.name)) {
            errors.name = 'Name is required';
        }

        // Validate email
        if (!validateRequired(formData.email)) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Validate phone
        if (!validateRequired(formData.phone)) {
            errors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        // Validate address
        if (!validateRequired(formData.address)) {
            errors.address = 'Address is required';
        } else if (!validateAddress(formData.address)) {
            errors.address = 'Please enter a complete address (minimum 10 characters)';
        }

        setFormErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const validateCardDetails = () => {
        const errors = {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolderName: ''
        };

        if (formData.paymentMethod === 'card') {
            if (!cardDetails.cardNumber || !/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
                errors.cardNumber = 'Please enter a valid 16-digit card number';
            }

            if (!cardDetails.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
                errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
            }

            if (!cardDetails.cvv || !/^\d{3,4}$/.test(cardDetails.cvv)) {
                errors.cvv = 'Please enter a valid CVV';
            }

            if (!cardDetails.cardHolderName) {
                errors.cardHolderName = 'Please enter card holder name';
            }
        }

        setCardErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleCardDetailsChange = (details, isValid) => {
        setCardDetails(details);
        setIsCardValid(isValid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (formData.paymentMethod === 'card' && !validateCardDetails()) {
            return;
        }

        // Check for prescription requirements
        const prescriptionRequiredItems = cartItems.filter(item => item.prescriptionRequired);
        if (prescriptionRequiredItems.length > 0) {
            const result = await Swal.fire({
                title: 'Prescription Required',
                html: `
                    <div class="text-left">
                        <p class="mb-4">The following items require a prescription:</p>
                        <ul class="list-disc pl-5 mb-4">
                            ${prescriptionRequiredItems.map(item => `
                                <li>${item.name}</li>
                            `).join('')}
                        </ul>
                        <p>Please ensure you have valid prescriptions for these items before proceeding.</p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, I have prescriptions',
                cancelButtonText: 'Cancel order'
            });

            if (!result.isConfirmed) {
                return;
            }
        }

        try {
            setSubmitting(true);

            // Calculate total
            const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.cartQuantity || 1)), 0);
            const deliveryCharge = 200; // Fixed delivery charge of 200 LKR
            const total = subtotal + deliveryCharge;

            // Prepare order data
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id,
                    quantity: item.cartQuantity || 1,
                    price: item.price,
                    prescription: item.prescriptionRequired
                })),
                shippingAddress: formData.address.trim(),
                contactInfo: {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim()
                },
                paymentMethod: formData.paymentMethod,
                totalAmount: total,
                deliveryCharge: deliveryCharge,
                deliveryNotes: formData.deliveryNotes.trim()
            };

            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to place an order');
            }

            if (formData.paymentMethod === 'card') {
                // Create order first
                const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!orderResponse.data.success) {
                    throw new Error(orderResponse.data.message || 'Failed to create order');
                }

                // Create payment intent with order ID
                const paymentResponse = await axios.post('http://localhost:5000/api/payments/create-intent', {
                    amount: total,
                    currency: 'lkr',
                    paymentMethod: 'card',
                    order: orderResponse.data.order._id,
                    cardDetails: {
                        cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
                        expiryDate: cardDetails.expiryDate,
                        cvv: cardDetails.cvv,
                        cardHolderName: cardDetails.cardHolderName
                    }
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!paymentResponse.data.success) {
                    throw new Error(paymentResponse.data.message || 'Payment failed');
                }

                // Clear cart
                clearCart();

                // Show success message
                await Swal.fire({
                    title: 'Order Placed!',
                    text: 'Your order has been placed successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                navigate('/');
            } else {
                // For COD orders, just create the order
                const response = await axios.post('http://localhost:5000/api/orders', orderData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    // Clear cart
                    clearCart();

                    // Show success message
                    await Swal.fire({
                        title: 'Order Placed!',
                        text: 'Your order has been placed successfully.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                    navigate('/');
                }
            }
        } catch (error) {
            let errorMessage = 'Something went wrong';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.cartQuantity || 1)), 0);
    const deliveryCharge = 200; // Fixed delivery charge of 200 LKR
    const total = subtotal + deliveryCharge;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" text="Loading your cart..." />
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
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="">
                    <div className="">
                        <div className="px-6 py-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Order Summary */}
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                                        <ShoppingBagIcon className="h-5 w-5 mr-2 text-[#2c8ba3]" />
                                        Order Summary
                                    </h2>
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item._id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-16 w-16 object-cover rounded-lg"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.cartQuantity || 1}</p>
                                                        <p className="text-sm text-gray-600">Brand: {item.brand || 'N/A'}</p>
                                                        {item.prescriptionRequired && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                                Prescription Required
                                                            </span>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    LKR {(item.price * (item.cartQuantity || 1)).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-200 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <p className="text-gray-600">Subtotal</p>
                                                <p className="text-gray-900">LKR {subtotal.toFixed(2)}</p>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <p className="text-gray-600">Delivery Charge</p>
                                                <p className="text-gray-900">LKR {deliveryCharge.toFixed(2)}</p>
                                            </div>
                                            <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-gray-900">Total</p>
                                                <p className="text-[#2c8ba3]">LKR {total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical Information Notice */}
                                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <h3 className="text-lg font-semibold mb-2 flex items-center text-yellow-800">
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Important Medical Information
                                        </h3>
                                        <div className="space-y-2">
                                            {cartItems.some(item => item.prescriptionRequired) && (
                                                <p className="text-sm text-yellow-700 font-medium">
                                                    • You have prescription-required items in your cart. Please ensure you have valid prescriptions ready for delivery.
                                                </p>
                                            )}
                                            <p className="text-sm text-yellow-700">
                                                • Please ensure you have valid prescriptions for prescription-required items
                                            </p>
                                            <p className="text-sm text-yellow-700">
                                                • Check expiry dates before using any medical products
                                            </p>
                                            <p className="text-sm text-yellow-700">
                                                • Store products according to manufacturer instructions
                                            </p>
                                            <p className="text-sm text-yellow-700">
                                                • Consult healthcare professionals for proper usage
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Information */}
                                    <div className="mt-6 p-4 bg-[#2c8ba3]/10 rounded-lg border border-[#2c8ba3]/20">
                                        <h3 className="text-lg font-semibold mb-2 flex items-center text-[#2c8ba3]">
                                            <BanknotesIcon className="h-5 w-5 mr-2" />
                                            Payment Information
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="text-sm text-[#2c8ba3]/90">
                                                <span className="font-medium">Payment Method:</span> {formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                                            </p>
                                            <p className="text-sm text-[#2c8ba3]/80">
                                                Since this is a test mode, only Cash on Delivery and Credit/Debit Card are available. You will pay when your order arrives.
                                            </p>
                                            <div className="mt-2 text-xs text-[#2c8ba3]/70">
                                                <p>• No payment is required at checkout</p>
                                                <p>• Pay with cash when your order arrives</p>
                                                <p>• Keep exact change ready for delivery</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                                        <UserIcon className="h-5 w-5 mr-2 text-[#2c8ba3]" />
                                        Shipping Information
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}`}
                                                    placeholder="Enter your full name"
                                                />
                                                <UserIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${formErrors.name ? 'text-red-500' : 'text-gray-400'}`} />
                                            </div>
                                            {formErrors.name && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formErrors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}`}
                                                    placeholder="Enter your email"
                                                />
                                                <EnvelopeIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${formErrors.email ? 'text-red-500' : 'text-gray-400'}`} />
                                            </div>
                                            {formErrors.email && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formErrors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 ${formErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}`}
                                                    placeholder="Enter your phone number"
                                                />
                                                <PhoneIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${formErrors.phone ? 'text-red-500' : 'text-gray-400'}`} />
                                            </div>
                                            {formErrors.phone && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formErrors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address *</label>
                                            <div className="relative">
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 ${formErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}`}
                                                    placeholder="Enter your complete shipping address"
                                                />
                                                <MapPinIcon className={`h-5 w-5 absolute left-3 top-3 ${formErrors.address ? 'text-red-500' : 'text-gray-400'}`} />
                                            </div>
                                            {formErrors.address && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formErrors.address}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes (Optional)</label>
                                            <div className="relative">
                                                <textarea
                                                    name="deliveryNotes"
                                                    value={formData.deliveryNotes}
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 hover:border-gray-400"
                                                    placeholder="Any special instructions for delivery?"
                                                />
                                                <DocumentTextIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="cod"
                                                    name="paymentMethod"
                                                    value="cod"
                                                    checked={formData.paymentMethod === 'cod'}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 text-[#2c8ba3] focus:ring-[#2c8ba3] border-gray-300"
                                                />
                                                <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                                                    Cash on Delivery
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="card"
                                                    name="paymentMethod"
                                                    value="card"
                                                    checked={formData.paymentMethod === 'card'}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 text-[#2c8ba3] focus:ring-[#2c8ba3] border-gray-300"
                                                />
                                                <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                                                    Credit/Debit Card
                                                </label>
                                            </div>
                                        </div>

                                        {/* Card Details Form */}
                                        {formData.paymentMethod === 'card' && (
                                            <div className="mt-6">
                                                <CardPaymentForm
                                                    onCardDetailsChange={handleCardDetailsChange}
                                                    errors={cardErrors}
                                                    setErrors={setCardErrors}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            disabled={submitting || (formData.paymentMethod === 'card' && !isCardValid)}
                                            className={`w-full bg-[#2c8ba3] text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${submitting || (formData.paymentMethod === 'card' && !isCardValid)
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-[#2c8ba3]/90'
                                                }`}
                                        >
                                            {submitting ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                'Place Order'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout; 