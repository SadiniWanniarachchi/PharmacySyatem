import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { EyeIcon, UserPlusIcon, XCircleIcon, PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, PencilIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';
import { validateName } from '../../utils/validationUtils';

function SupplierManagement() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        companyName: '',
        businessType: '',
        taxId: ''
    });
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        companyName: '',
        businessType: '',
        taxId: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter users to only show suppliers
            const suppliers = response.data.filter(user => user.userType === 'supplier');
            setSuppliers(suppliers || []);
        } catch (error) {
            setError('Failed to fetch suppliers');
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleEditSupplier = (supplier) => {
        setEditFormData({
            firstName: supplier.firstName,
            lastName: supplier.lastName,
            email: supplier.email,
            phone: supplier.phone || '',
            address: supplier.address || '',
            companyName: supplier.companyName || '',
            businessType: supplier.businessType || '',
            taxId: supplier.taxId || ''
        });
        setSelectedSupplier(supplier);
        setIsEditModalOpen(true);
    };

    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (!validateName(formData.firstName)) {
            newErrors.firstName = 'First name can only contain letters and spaces';
        }

        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (!validateName(formData.lastName)) {
            newErrors.lastName = 'Last name can only contain letters and spaces';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        if (!formData.businessType.trim()) {
            newErrors.businessType = 'Business type is required';
        }

        if (!formData.taxId.trim()) {
            newErrors.taxId = 'Tax ID is required';
        }

        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateSupplier = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const supplierData = {
                ...formData,
                userType: 'supplier',
                companyName: formData.companyName,
                businessType: formData.businessType,
                taxId: formData.taxId
            };

            await axios.post('http://localhost:5000/api/auth/users', supplierData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Supplier Created',
                text: 'New supplier has been created successfully',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });

            setIsCreateModalOpen(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phone: '',
                address: '',
                companyName: '',
                businessType: '',
                taxId: ''
            });
            setErrors({});
            fetchSuppliers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.response?.data?.message || 'Failed to create supplier',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDeleteSupplier = async (supplierId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/auth/users/${supplierId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Supplier has been deleted.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                fetchSuppliers();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: 'Failed to delete supplier',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleUpdateSupplier = async (e) => {
        e.preventDefault();

        // Validate names before updating
        const nameErrors = {};
        if (!validateName(editFormData.firstName)) {
            nameErrors.firstName = 'First name can only contain letters and spaces';
        }
        if (!validateName(editFormData.lastName)) {
            nameErrors.lastName = 'Last name can only contain letters and spaces';
        }

        if (Object.keys(nameErrors).length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please check the name fields for errors',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const supplierData = {
                ...editFormData,
                userType: 'supplier'
            };

            await axios.put(`http://localhost:5000/api/auth/users/${selectedSupplier._id}`, supplierData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Supplier Updated',
                text: 'Supplier has been updated successfully',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });

            setIsEditModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to update supplier',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const filteredSuppliers = suppliers.filter(supplier => {
        const searchLower = searchQuery.toLowerCase();
        return (
            supplier.firstName.toLowerCase().includes(searchLower) ||
            supplier.lastName.toLowerCase().includes(searchLower) ||
            supplier.email.toLowerCase().includes(searchLower) ||
            supplier.companyName.toLowerCase().includes(searchLower) ||
            (supplier.phone && supplier.phone.toLowerCase().includes(searchLower)) ||
            (supplier.address && supplier.address.toLowerCase().includes(searchLower))
        );
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleDownloadReport = () => {
        const columns = [
            { header: 'Supplier ID', accessor: (supplier) => `#${supplier._id.slice(-6)}` },
            { header: 'Name', accessor: (supplier) => `${supplier.firstName} ${supplier.lastName}` },
            { header: 'Company', accessor: (supplier) => supplier.companyName },
            { header: 'Email', accessor: (supplier) => supplier.email },
            { header: 'Business Type', accessor: (supplier) => supplier.businessType },
            { header: 'Joined Date', accessor: (supplier) => formatDate(supplier.createdAt) }
        ];

        generatePDF('Supplier Management Report', filteredSuppliers, columns, 'supplier-management-report.pdf', 'suppliers');
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
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Supplier Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadReport}
                            className="flex-1 sm:flex-none px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            <span className="hidden sm:inline">Download Report</span>
                            <span className="sm:hidden">Download</span>
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            <span className="hidden sm:inline">Add New Supplier</span>
                            <span className="sm:hidden">Add Supplier</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Supplier ID</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Company</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Business Type</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Joined</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSuppliers.map((supplier) => (
                                    <tr key={supplier._id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2c8ba3]">
                                            #{supplier._id.slice(-6)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{supplier.firstName} {supplier.lastName}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {supplier.companyName}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {supplier.email}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {supplier.businessType}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(supplier.createdAt)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2 sm:space-x-3">
                                                <button
                                                    onClick={() => handleViewSupplier(supplier)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSupplier(supplier)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                    title="Edit Supplier"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSupplier(supplier._id)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                    title="Delete Supplier"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Supplier Details Modal */}
            {isModalOpen && selectedSupplier && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-2xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                Supplier Details #{selectedSupplier._id.slice(-6)}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Information</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-900">Name: {selectedSupplier.firstName} {selectedSupplier.lastName}</p>
                                        <p className="text-sm text-gray-900">Joined: {formatDate(selectedSupplier.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Business Information</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-900">Company: {selectedSupplier.companyName}</p>
                                        <p className="text-sm text-gray-900">Business Type: {selectedSupplier.businessType}</p>
                                        <p className="text-sm text-gray-900">Tax ID: {selectedSupplier.taxId}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-900">Email: {selectedSupplier.email}</p>
                                        {selectedSupplier.phone && (
                                            <p className="text-sm text-gray-900">Phone: {selectedSupplier.phone}</p>
                                        )}
                                        {selectedSupplier.address && (
                                            <p className="text-sm text-gray-900">Address: {selectedSupplier.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Supplier Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-2xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Create New Supplier</h3>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setErrors({});
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSupplier} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.companyName ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.companyName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                                <input
                                    type="text"
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.businessType ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.businessType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                                <input
                                    type="text"
                                    name="taxId"
                                    value={formData.taxId}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.taxId ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.taxId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setErrors({});
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200"
                                >
                                    Create Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Supplier Modal */}
            {isEditModalOpen && selectedSupplier && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-2xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Supplier</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSupplier} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={editFormData.firstName}
                                        onChange={handleEditInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editFormData.lastName}
                                        onChange={handleEditInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={editFormData.companyName}
                                    onChange={handleEditInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                                <input
                                    type="text"
                                    name="businessType"
                                    value={editFormData.businessType}
                                    onChange={handleEditInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                                <input
                                    type="text"
                                    name="taxId"
                                    value={editFormData.taxId}
                                    onChange={handleEditInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editFormData.phone}
                                    onChange={handleEditInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleEditInputChange}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200"
                                >
                                    Update Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SupplierManagement; 