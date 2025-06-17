import { useState, useEffect } from 'react';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';

function CardPaymentForm({ onCardDetailsChange, errors, setErrors }) {
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    const [cardType, setCardType] = useState('');

    useEffect(() => {
        // Detect card type based on first digit
        const firstDigit = cardDetails.cardNumber.charAt(0);
        switch (firstDigit) {
            case '3':
                setCardType('amex');
                break;
            case '4':
                setCardType('visa');
                break;
            case '5':
                setCardType('mastercard');
                break;
            default:
                setCardType('');
        }
    }, [cardDetails.cardNumber]);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 3) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'expiryDate') {
            formattedValue = formatExpiryDate(value);
        }

        setCardDetails(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Clear error when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        // Validate and update parent component
        validateField(name, formattedValue);
    };

    const validateField = (name, value) => {
        let isValid = true;
        let errorMessage = '';

        switch (name) {
            case 'cardNumber':
                const cardNumber = value.replace(/\s/g, '');
                if (!/^\d{16}$/.test(cardNumber)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 16-digit card number';
                }
                break;
            case 'expiryDate':
                if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid expiry date (MM/YY)';
                } else {
                    const [month, year] = value.split('/');
                    const currentYear = new Date().getFullYear() % 100;
                    const currentMonth = new Date().getMonth() + 1;

                    if (parseInt(year) < currentYear ||
                        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                        isValid = false;
                        errorMessage = 'Card has expired';
                    }
                }
                break;
            case 'cvv':
                if (!/^\d{3,4}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid CVV';
                }
                break;
            case 'cardHolderName':
                if (!value.trim()) {
                    isValid = false;
                    errorMessage = 'Please enter card holder name';
                }
                break;
            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: isValid ? '' : errorMessage
        }));

        onCardDetailsChange({
            ...cardDetails,
            [name]: value
        }, isValid);
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Card Details</h3>
                <div className="flex items-center space-x-2">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Secure Payment</span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Card Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleChange}
                            maxLength="19"
                            placeholder="1234 5678 9012 3456"
                            className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] ${errors.cardNumber ? 'border-red-500' : ''
                                }`}
                        />
                        <CreditCardIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${errors.cardNumber ? 'text-red-500' : 'text-gray-400'
                            }`} />
                        {cardType && (
                            <img
                                src={`/card-icons/${cardType}.svg`}
                                alt={cardType}
                                className="h-6 absolute right-3 top-1/2 transform -translate-y-1/2"
                            />
                        )}
                    </div>
                    {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Expiry Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                        </label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleChange}
                            maxLength="5"
                            placeholder="MM/YY"
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] ${errors.expiryDate ? 'border-red-500' : ''
                                }`}
                        />
                        {errors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                    </div>

                    {/* CVV */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                        </label>
                        <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleChange}
                            maxLength="4"
                            placeholder="123"
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] ${errors.cvv ? 'border-red-500' : ''
                                }`}
                        />
                        {errors.cvv && (
                            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                    </div>
                </div>

                {/* Card Holder Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Holder Name
                    </label>
                    <input
                        type="text"
                        name="cardHolderName"
                        value={cardDetails.cardHolderName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] ${errors.cardHolderName ? 'border-red-500' : ''
                            }`}
                    />
                    {errors.cardHolderName && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardHolderName}</p>
                    )}
                </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">Secure Payment</h3>
                        <div className="mt-2 text-sm text-gray-500">
                            <p>Your payment information is encrypted and secure. We never store your full card details.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardPaymentForm; 