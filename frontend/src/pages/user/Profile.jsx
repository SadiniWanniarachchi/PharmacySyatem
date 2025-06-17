import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiUser, FiMail, FiShoppingCart, FiPackage } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import Swal from 'sweetalert2';

function Profile() {
    const { user, updateUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Validation rules
    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!editData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (!/^[a-zA-Z\s]*$/.test(editData.firstName)) {
            newErrors.firstName = 'First name should only contain letters';
        }

        // Last Name validation
        if (!editData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (!/^[a-zA-Z\s]*$/.test(editData.lastName)) {
            newErrors.lastName = 'Last name should only contain letters';
        }

        // Phone validation
        if (editData.phone && !/^\+?[\d\s-]{10,}$/.test(editData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Address validation
        if (!editData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (user) {
            setEditData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const saveProfile = async () => {
        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please check the form for errors'
            });
            return;
        }

        try {
            const result = await updateUser(editData);
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile has been updated successfully!',
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsEditing(false);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: result.error || 'Failed to update profile. Please try again.'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating your profile.'
            });
        }
    };

    const startEditing = () => {
        setEditData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
        });
        setIsEditing(true);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-[#2c8ba3]/20 to-[#2c8ba3]/10 h-48 relative">
                        <div className="absolute -bottom-16 left-6">
                            <div className="relative">
                                <FaUserCircle className="h-32 w-32 text-[#2c8ba3] border-4 border-white rounded-full shadow-2xl" />
                                <button
                                    onClick={startEditing}
                                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                                >
                                    <FiEdit className="text-[#2c8ba3]" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 px-6 pb-6">
                        {!isEditing ? (
                            <>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </h1>
                                        <div className="flex items-center mt-2 text-gray-600">
                                            <FiMail className="mr-2 text-[#2c8ba3]" />
                                            <p>{user.email}</p>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center mt-1 text-gray-600">
                                                <FiUser className="mr-2 text-[#2c8ba3]" />
                                                <p>{user.phone}</p>
                                            </div>
                                        )}
                                        {user.address && (
                                            <p className="mt-1 text-gray-600">{user.address}</p>
                                        )}
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => navigate('/shop')}
                                            className="bg-[#2c8ba3] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center cursor-pointer hover:bg-[#2c8ba3]/90 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                                        >
                                            <FiShoppingCart className="mr-2" />
                                            Shop Now
                                        </button>
                                        <button
                                            onClick={() => navigate('/orders')}
                                            className="bg-[#2c8ba3] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center cursor-pointer hover:bg-[#2c8ba3]/90 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                                        >
                                            <FiPackage className="mr-2" />
                                            My Orders
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editData.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-colors duration-200 ${errors.firstName ? 'border-red-500' : 'hover:border-gray-400'}`}
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editData.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-colors duration-200 ${errors.lastName ? 'border-red-500' : 'hover:border-gray-400'}`}
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editData.email}
                                            disabled
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editData.phone}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-colors duration-200 ${errors.phone ? 'border-red-500' : 'hover:border-gray-400'}`}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={editData.address}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-colors duration-200 ${errors.address ? 'border-red-500' : 'hover:border-gray-400'}`}
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveProfile}
                                        className="px-4 py-2 bg-[#2c8ba3] text-white rounded-lg font-medium hover:bg-[#2c8ba3]/90 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;