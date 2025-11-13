import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import CSVUpload from '../components/CSVUpload';
import FormInput from '../components/FormInput';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import HelpTooltip from '../components/HelpTooltip';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number | string;
  cost?: number | string;
  category?: string;
  brand?: string;
  reorderThreshold: number;
  reorderQuantity: number;
  unit?: string;
  isActive: boolean;
  hasExpiry: boolean;
}

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    category: '',
    brand: '',
    reorderThreshold: '10',
    reorderQuantity: '50',
    unit: 'piece',
    hasExpiry: false,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('products', async () => {
    const response = await apiClient.get('/products');
    return response.data.data.products;
  });

  const createMutation = useMutation(
    async (data: any) => {
      const response = await apiClient.post('/products', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product created successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create product');
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/products/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product updated successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update product');
      },
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      await apiClient.delete(`/products/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      },
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      price: '',
      cost: '',
      category: '',
      brand: '',
      reorderThreshold: '10',
      reorderQuantity: '50',
      unit: 'piece',
      hasExpiry: false,
    });
  };

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      cost: product.cost ? String(product.cost) : '',
      category: product.category || '',
      brand: product.brand || '',
      reorderThreshold: String(product.reorderThreshold),
      reorderQuantity: String(product.reorderQuantity),
      unit: product.unit || 'piece',
      hasExpiry: product.hasExpiry,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      reorderThreshold: parseInt(formData.reorderThreshold),
      reorderQuantity: parseInt(formData.reorderQuantity),
    };

    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const columns = [
    { header: 'SKU', accessor: 'sku' as keyof Product },
    { header: 'Name', accessor: 'name' as keyof Product },
    { header: 'Price', accessor: (row: Product) => formatCurrency(row.price) },
    { header: 'Category', accessor: 'category' as keyof Product },
    { header: 'Stock Threshold', accessor: (row: Product) => row.reorderThreshold },
    {
      header: 'Status',
      accessor: (row: Product) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Product) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            title="Edit product"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this product?')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            title="Delete product"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog. Add, edit, or remove products. Use CSV upload to import multiple products at once."
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Products' },
        ]}
        action={
          <div className="flex gap-2">
            <CSVUpload
              endpoint="/upload/products"
              onUploadComplete={() => queryClient.invalidateQueries('products')}
            />
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        }
      />

      {!data || data.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Get started by adding your first product to the catalog. You can add products manually or import them via CSV."
          actionLabel="Add Your First Product"
          onAction={handleOpenCreate}
          icon={
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table
            data={data || []}
            columns={columns}
            onRowClick={(row) => handleOpenEdit(row)}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {selectedProduct
                    ? 'Update product information. SKU cannot be changed after creation.'
                    : 'Fill in the product details. SKU must be unique and cannot be changed after creation.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormInput
                label="SKU (Stock Keeping Unit)"
                name="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                disabled={!!selectedProduct}
                placeholder="e.g., PROD-001"
              />
              {!selectedProduct && (
                <p className="mt-1 text-xs text-gray-500">Unique identifier for this product</p>
              )}
            </div>
            <FormInput
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Wireless Mouse"
            />
          </div>

          <div>
            <FormInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              textarea
              rows={3}
              placeholder="Describe the product..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Price <span className="text-red-500">*</span>
                </label>
                <HelpTooltip content="The selling price of the product. This is what customers will pay." />
              </div>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="0.00"
                step="0.01"
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">Cost</label>
                <HelpTooltip content="The cost price of the product. Used for profit calculations." />
              </div>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Electronics"
            />
            <FormInput
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., Brand Name"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Reorder Threshold <span className="text-red-500">*</span>
                </label>
                <HelpTooltip content="When inventory drops to this level, a reorder will be suggested." />
              </div>
              <input
                type="number"
                name="reorderThreshold"
                value={formData.reorderThreshold}
                onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
                required
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Reorder Quantity <span className="text-red-500">*</span>
                </label>
                <HelpTooltip content="Suggested quantity to order when reorder threshold is reached." />
              </div>
              <input
                type="number"
                name="reorderQuantity"
                value={formData.reorderQuantity}
                onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
                required
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <FormInput
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={[
                { value: 'piece', label: 'Piece' },
                { value: 'box', label: 'Box' },
                { value: 'kg', label: 'Kg' },
                { value: 'liter', label: 'Liter' },
                { value: 'set', label: 'Set' },
              ]}
            />
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-md">
            <input
              type="checkbox"
              id="hasExpiry"
              checked={formData.hasExpiry}
              onChange={(e) => setFormData({ ...formData, hasExpiry: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasExpiry" className="ml-3 block text-sm text-gray-900">
              Product has expiry date
              <HelpTooltip content="Enable this if the product expires and needs expiry date tracking." />
            </label>
          </div>

          {selectedProduct && (
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <input
                type="checkbox"
                id="isActive"
                checked={selectedProduct.isActive}
                onChange={(e) => {
                  updateMutation.mutate({
                    id: selectedProduct.id,
                    data: { isActive: e.target.checked },
                  });
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-3 block text-sm text-gray-900">
                Product is active
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : selectedProduct
                ? 'Update Product'
                : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
