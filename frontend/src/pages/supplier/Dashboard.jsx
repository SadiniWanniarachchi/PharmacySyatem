import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import {
    ShoppingBagIcon,
    CurrencyDollarIcon,
    TruckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

function SupplierDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        lowStockProducts: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [productsRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products/supplier/products', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/orders/supplier/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const products = productsRes.data.products || [];
            const orders = ordersRes.data.orders || [];

            // Calculate statistics
            const lowStockProducts = products.filter(p => p.quantity < 10).length;
            const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                totalRevenue,
                lowStockProducts,
                recentOrders: orders.slice(0, 5)
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Welcome Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-[#2c8ba3] to-[#2c8ba3]/90">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">
                                Welcome back, {user?.firstName} {user?.lastName}!
                            </h2>
                            <p className="mt-1 text-sm text-white/90">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center sm:text-right">
                                <p className="text-sm text-white/90">Role</p>
                                <p className="text-base sm:text-lg font-semibold text-white">Supplier</p>
                            </div>
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-lg sm:text-xl font-bold text-white">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Total Products */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-4 sm:p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                            <div className="ml-4 sm:ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                    <dd className="text-base sm:text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-4 sm:p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                            <div className="ml-4 sm:ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                    <dd className="text-base sm:text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-4 sm:p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TruckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                            <div className="ml-4 sm:ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                    <dd className="text-base sm:text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Products */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-4 sm:p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                            </div>
                            <div className="ml-4 sm:ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Products</dt>
                                    <dd className="text-base sm:text-lg font-medium text-gray-900">{stats.lowStockProducts}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                    <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900">Recent Orders</h3>
                </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {stats.recentOrders.map((order) => (
                            <li key={order._id} className="px-4 py-3 sm:px-6 sm:py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                    <div className="flex items-center">
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                Order #{order._id.slice(-6)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {order.customer.name} - {formatCurrency(order.totalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default SupplierDashboard; 