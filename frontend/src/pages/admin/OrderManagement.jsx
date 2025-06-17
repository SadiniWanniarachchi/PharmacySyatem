import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { EyeIcon, TruckIcon, CheckCircleIcon, XCircleIcon, PhoneIcon, MapPinIcon, ClockIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        status: '',
        deliveryNotes: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data.orders || []);
        } catch (error) {
            setError('Failed to fetch orders');
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
        setIsEditMode(false);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setFormData({
            status: order.status || '',
            deliveryNotes: order.deliveryNotes || ''
        });
        setIsModalOpen(true);
        setIsEditMode(true);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                text: `Order status has been updated to ${newStatus}`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            fetchOrders();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update order status',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleDeleteOrder = async (orderId) => {
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
                const response = await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Order has been deleted.',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    fetchOrders();
                } else {
                    throw new Error(response.data.message || 'Failed to delete order');
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: error.response?.data?.message || error.message || 'Failed to delete order',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Status validation
        if (!formData.status) {
            newErrors.status = 'Status is required';
        }

        // Delivery notes validation (optional)
        if (formData.deliveryNotes && formData.deliveryNotes.length > 500) {
            newErrors.deliveryNotes = 'Delivery notes cannot exceed 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/${selectedOrder._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Order has been updated.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });

            setIsModalOpen(false);
            fetchOrders();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update order',
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Shipped':
                return 'bg-purple-100 text-purple-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <ClockIcon className="h-5 w-5" />;
            case 'Processing':
                return <TruckIcon className="h-5 w-5" />;
            case 'Shipped':
                return <TruckIcon className="h-5 w-5" />;
            case 'Delivered':
                return <CheckCircleIcon className="h-5 w-5" />;
            case 'Cancelled':
                return <XCircleIcon className="h-5 w-5" />;
            default:
                return null;
        }
    };

    const handleDownloadReport = () => {
        const columns = [
            { header: 'Order ID', accessor: (order) => `#${order._id.slice(-6)}` },
            { header: 'Customer', accessor: (order) => order.contactInfo.name },
            { header: 'Total Amount', accessor: (order) => `$${order.totalAmount.toFixed(2)}` },
            { header: 'Status', accessor: (order) => order.status },
            { header: 'Order Date', accessor: (order) => formatDate(order.createdAt) }
        ];

        generatePDF('Order Management Report', filteredOrders, columns, 'order-management-report.pdf', 'orders');
    };

    const filteredOrders = orders.filter(order => {
        const searchLower = searchQuery.toLowerCase();
        const statusMatch = filterStatus === 'all' || order.status === filterStatus;
        const searchMatch =
            order.contactInfo?.name?.toLowerCase().includes(searchLower) ||
            order.contactInfo?.email?.toLowerCase().includes(searchLower) ||
            order.status?.toLowerCase().includes(searchLower) ||
            order.paymentMethod?.toLowerCase().includes(searchLower) ||
            order.items?.some(item => item.product?.name?.toLowerCase().includes(searchLower));

        return statusMatch && searchMatch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Download Report</span>
                        <span className="sm:hidden">Download</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                    >
                        <option value="all">All Orders</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2c8ba3]">
                                            #{order._id.slice(-6)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{order.contactInfo.name}</div>
                                            <div className="text-xs sm:text-sm text-gray-500">{order.contactInfo.email}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 sm:px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="ml-1">{order.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditOrder(order)}
                                                    className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200"
                                                    title="Edit Order"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                {order.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'Processing')}
                                                            className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                            title="Mark as Processing"
                                                        >
                                                            <TruckIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                            title="Cancel Order"
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {order.status === 'Processing' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                                                        className="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                                                        title="Mark as Shipped"
                                                    >
                                                        <TruckIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {order.status === 'Shipped' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                                                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                                        title="Mark as Delivered"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                    title="Delete Order"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
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

            {/* Order Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-2xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Order' : 'Order Details'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedOrder(null);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {isEditMode ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.status ? 'border-red-300' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Delivery Notes</label>
                                    <textarea
                                        name="deliveryNotes"
                                        value={formData.deliveryNotes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.deliveryNotes ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.deliveryNotes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deliveryNotes}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
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
                                        Update Order
                                    </button>
                                </div>
                            </form>
                        ) : selectedOrder ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            Order Information
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-900">Date: {formatDate(selectedOrder.createdAt)}</p>
                                            <p className="text-sm text-gray-900">
                                                Status: <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                                    {selectedOrder.status}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-900">Total: ${selectedOrder.totalAmount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-900">Payment Method: {selectedOrder.paymentMethod}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            Customer Information
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-900">Name: {selectedOrder.contactInfo.name}</p>
                                            <p className="text-sm text-gray-900">Email: {selectedOrder.contactInfo.email}</p>
                                            <p className="text-sm text-gray-900">Phone: {selectedOrder.contactInfo.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            Shipping Information
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-900">Address: {selectedOrder.shippingAddress}</p>
                                            {selectedOrder.deliveryNotes && (
                                                <p className="text-sm text-gray-900">
                                                    Delivery Notes: {selectedOrder.deliveryNotes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                                        <div className="space-y-2">
                                            {selectedOrder.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.product?.name || 'Product not available'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500">No order details available</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderManagement;
