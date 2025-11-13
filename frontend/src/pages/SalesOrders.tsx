import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: string;
  totalAmount: number | string;
  orderDate: string;
  items?: SalesOrderItem[];
}

interface SalesOrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number | string;
  };
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number | string;
}

const SalesOrders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    notes: '',
  });
  const [orderItems, setOrderItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number }>
  >([]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('sales-orders', async () => {
    const response = await apiClient.get('/sales-orders');
    return response.data.data.orders;
  });

  useQuery('products', async () => {
    const response = await apiClient.get('/products');
    setProducts(response.data.data.products || []);
    return response.data.data.products;
  });

  const createMutation = useMutation(
    async (data: any) => {
      const response = await apiClient.post('/sales-orders', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sales-orders');
        toast.success('Sales order created successfully');
        handleCloseCreateModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create sales order');
      },
    }
  );

  const cancelMutation = useMutation(
    async (id: string) => {
      const response = await apiClient.patch(`/sales-orders/${id}/cancel`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sales-orders');
        toast.success('Order cancelled successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      },
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      notes: '',
    });
    setOrderItems([]);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'productId' | 'quantity' | 'unitPrice',
    value: string | number
  ) => {
    const newItems = [...orderItems];
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value as string,
        unitPrice: product ? (typeof product.price === 'string' ? parseFloat(product.price) : product.price) : 0,
      };
    } else {
      newItems[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    }
    setOrderItems(newItems);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const items = orderItems
      .filter((item) => item.productId && item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

    if (items.length === 0) {
      toast.error('Please add valid items');
      return;
    }

    createMutation.mutate({
      ...formData,
      items,
    });
  };

  const columns = [
    { header: 'Order Number', accessor: 'orderNumber' as keyof SalesOrder },
    { header: 'Customer', accessor: 'customerName' as keyof SalesOrder },
    { header: 'Status', accessor: 'status' as keyof SalesOrder },
    { header: 'Total Amount', accessor: (row: SalesOrder) => formatCurrency(row.totalAmount) },
    { header: 'Order Date', accessor: (row: SalesOrder) => new Date(row.orderDate).toLocaleDateString() },
    {
      header: 'Actions',
      accessor: (row: SalesOrder) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(row);
              setIsModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View
          </button>
          {row.status === 'pending' || row.status === 'confirmed' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to cancel this order?')) {
                  cancelMutation.mutate(row.id);
                }
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Cancel
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading sales orders...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Sales Order
        </button>
      </div>
      <Table data={data || []} columns={columns} />
      
      {/* View Order Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Order Details">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-semibold">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold">{selectedOrder.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-semibold">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
            </div>
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Items:</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.product.name} (x{item.quantity})</span>
                      <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Create Sales Order"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
            <FormInput
              label="Customer Email"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Customer Phone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>
          <FormInput
            label="Shipping Address"
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            textarea
          />
          <FormInput
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            textarea
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Order Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded">
                  <div className="col-span-5">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {orderItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No items added. Click "Add Item" to add products.
                </p>
              )}
            </div>
            {orderItems.length > 0 && (
              <div className="mt-2 text-right">
                <p className="text-sm font-semibold">
                  Total: {formatCurrency(
                    orderItems.reduce(
                      (sum, item) => sum + item.quantity * item.unitPrice,
                      0
                    )
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseCreateModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || orderItems.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesOrders;
