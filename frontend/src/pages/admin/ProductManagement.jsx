import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showHidden, setShowHidden] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/products/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                console.error('Failed to fetch products:', response.data);
                Swal.fire('Error', 'Failed to fetch products', 'error');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to fetch products', 'error');
        }
    };

    const handleToggleVisibility = async (productId, currentVisibility) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/products/admin/${productId}/visibility`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                title: 'Success',
                text: `Product ${currentVisibility ? 'hidden' : 'shown'} in shop`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            fetchProducts(); // Refresh the list
        } catch (error) {
            console.error('Error toggling visibility:', error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to update product visibility', 'error');
        }
    };

    const handleDownloadReport = () => {
        const columns = [
            { header: 'Product Name', accessor: (product) => product.name },
            { header: 'Category', accessor: (product) => product.category },
            { header: 'Price', accessor: (product) => `$${product.price}` },
            { header: 'Supplier', accessor: (product) => `${product.supplier?.firstName || ''} ${product.supplier?.lastName || ''}`.trim() || 'N/A' },
            { header: 'Expiry Date', accessor: (product) => new Date(product.expiryDate).toLocaleDateString() },
            { header: 'Prescription', accessor: (product) => product.prescriptionRequired ? 'Required' : 'Not Required' },
            { header: 'Stock Status', accessor: (product) => product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock' }
        ];

        generatePDF('Product Inventory Report', filteredProducts, columns, 'product-inventory-report.pdf', 'products');
    };

    const filteredProducts = products.filter(product => {
        const searchLower = searchQuery.toLowerCase();
        const supplierName = `${product.supplier?.firstName || ''} ${product.supplier?.lastName || ''}`.toLowerCase();
        const matchesSearch = (
            product.name.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.brand.toLowerCase().includes(searchLower) ||
            supplierName.includes(searchLower)
        );

        const matchesVisibility = showHidden || product.isVisible;

        return matchesSearch && matchesVisibility;
    });

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={showHidden}
                                onChange={(e) => setShowHidden(e.target.checked)}
                                className="rounded border-gray-300 text-[#2c8ba3] focus:ring-[#2c8ba3]"
                            />
                            Show Hidden Products
                        </label>
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

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Product</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Supplier</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 sm:px-6 py-4 text-center text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                                        <img
                                                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                                                            src={product.image}
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                    <div className="ml-3 sm:ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                                                            {product.description.length > 50
                                                                ? `${product.description.substring(0, 50)}...`
                                                                : product.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#2c8ba3]/10 text-[#2c8ba3]">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${product.price}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.supplier ? `${product.supplier.firstName} ${product.supplier.lastName}` : 'N/A'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isVisible
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {product.isVisible ? 'Visible' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleToggleVisibility(product._id, product.isVisible)}
                                                    className={`${product.isVisible
                                                        ? 'text-gray-600 hover:text-gray-900'
                                                        : 'text-[#2c8ba3] hover:text-[#2c8ba3]/80'
                                                        }`}
                                                    title={product.isVisible ? 'Hide from shop' : 'Show in shop'}
                                                >
                                                    {product.isVisible ? (
                                                        <EyeSlashIcon className="h-5 w-5" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductManagement; 