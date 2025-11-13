import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: { id: string; name: string };
  status: string;
  totalAmount: number | string;
  createdAt: string;
  items?: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  quantity: number;
  receivedQuantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
}

const PurchaseOrders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
  });
  const [orderItems, setOrderItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number }>
  >([]);
  const [receiveData, setReceiveData] = useState({
    warehouseId: '',
    items: [] as Array<{ itemId: string; receivedQuantity: number; batchNumber?: string; expiryDate?: string }>,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('purchase-orders', async () => {
    const response = await apiClient.get('/sales-orders/purchase');
    return response.data.data.orders;
  });

  useQuery('products', async () => {
    const response = await apiClient.get('/products');
    setProducts(response.data.data.products || []);
    return response.data.data.products;
  });

  useQuery('suppliers', async () => {
    const response = await apiClient.get('/suppliers');
    setSuppliers(response.data.data || []);
    return response.data.data;
  });

  useQuery('warehouses', async () => {
    const response = await apiClient.get('/warehouses');
    setWarehouses(response.data.data || []);
    return response.data.data;
  });

  const createMutation = useMutation(
    async (data: any) => {
      const response = await apiClient.post('/sales-orders/purchase', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('purchase-orders');
        toast.success('Purchase order created successfully');
        handleCloseCreateModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create purchase order');
      },
    }
  );

  const receiveMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post(`/purchase-orders/${id}/receive`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('purchase-orders');
        queryClient.invalidateQueries('inventory');
        toast.success('Purchase order received successfully');
        handleCloseReceiveModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to receive order');
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
      supplierId: '',
      expectedDeliveryDate: '',
      notes: '',
    });
    setOrderItems([]);
  };

  const handleCloseReceiveModal = () => {
    setIsReceiveModalOpen(false);
    setSelectedOrder(null);
    setReceiveData({
      warehouseId: '',
      items: [],
    });
  };

  const handleOpenReceive = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    if (order.items) {
      setReceiveData({
        warehouseId: '',
        items: order.items.map((item) => ({
          itemId: item.id,
          receivedQuantity: item.quantity - item.receivedQuantity,
          batchNumber: '',
          expiryDate: '',
        })),
      });
    }
    setIsReceiveModalOpen(true);
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
    newItems[index] = {
      ...newItems[index],
      [field]: typeof value === 'string' ? (field === 'productId' ? value : parseFloat(value) || 0) : value,
    };
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

  const handleReceiveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveData.warehouseId) {
      toast.error('Please select a warehouse');
      return;
    }

    const items = receiveData.items
      .filter((item) => item.receivedQuantity > 0)
      .map((item) => ({
        itemId: item.itemId,
        receivedQuantity: item.receivedQuantity,
        batchNumber: item.batchNumber || undefined,
        expiryDate: item.expiryDate || undefined,
      }));

    if (items.length === 0) {
      toast.error('Please enter received quantities');
      return;
    }

    if (selectedOrder) {
      receiveMutation.mutate({
        id: selectedOrder.id,
        data: {
          warehouseId: receiveData.warehouseId,
          items,
        },
      });
    }
  };

  const columns = [
    { header: 'PO Number', accessor: 'poNumber' as keyof PurchaseOrder },
    { header: 'Supplier', accessor: (row: PurchaseOrder) => row.supplier.name },
    { header: 'Status', accessor: 'status' as keyof PurchaseOrder },
    { header: 'Total Amount', accessor: (row: PurchaseOrder) => formatCurrency(row.totalAmount) },
    { header: 'Created', accessor: (row: PurchaseOrder) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      accessor: (row: PurchaseOrder) => (
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
          {(row.status === 'ordered' || row.status === 'partially_received') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenReceive(row);
              }}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Receive
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading purchase orders...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Purchase Order
        </button>
      </div>
      <Table data={data || []} columns={columns} />

      {/* View Order Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Purchase Order Details">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">PO Number</p>
                <p className="font-semibold">{selectedOrder.poNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-semibold">{selectedOrder.supplier.name}</p>
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
                      <span>
                        {item.product.name} - Qty: {item.receivedQuantity}/{item.quantity}
                      </span>
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
        title="Create Purchase Order"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <FormInput
            label="Supplier"
            name="supplierId"
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            required
            options={suppliers.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
          />
          <FormInput
            label="Expected Delivery Date"
            name="expectedDeliveryDate"
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
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

      {/* Receive Order Modal */}
      <Modal
        isOpen={isReceiveModalOpen}
        onClose={handleCloseReceiveModal}
        title="Receive Purchase Order"
      >
        <form onSubmit={handleReceiveOrder} className="space-y-4">
          <FormInput
            label="Warehouse"
            name="warehouseId"
            value={receiveData.warehouseId}
            onChange={(e) => setReceiveData({ ...receiveData, warehouseId: e.target.value })}
            required
            options={warehouses.map((w) => ({ value: w.id, label: `${w.code} - ${w.name}` }))}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Received Items</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {receiveData.items.map((item, index) => {
                const orderItem = selectedOrder?.items?.find((i) => i.id === item.itemId);
                return (
                  <div key={index} className="p-3 bg-gray-50 rounded space-y-2">
                    <p className="text-sm font-semibold">
                      {orderItem?.product.name} - Ordered: {orderItem?.quantity}, Received: {orderItem?.receivedQuantity}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        max={orderItem ? orderItem.quantity - orderItem.receivedQuantity : 0}
                        value={item.receivedQuantity}
                        onChange={(e) => {
                          const newItems = [...receiveData.items];
                          newItems[index].receivedQuantity = parseInt(e.target.value) || 0;
                          setReceiveData({ ...receiveData, items: newItems });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Batch Number (optional)"
                        value={item.batchNumber || ''}
                        onChange={(e) => {
                          const newItems = [...receiveData.items];
                          newItems[index].batchNumber = e.target.value;
                          setReceiveData({ ...receiveData, items: newItems });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <input
                      type="date"
                      placeholder="Expiry Date (optional)"
                      value={item.expiryDate || ''}
                      onChange={(e) => {
                        const newItems = [...receiveData.items];
                        newItems[index].expiryDate = e.target.value;
                        setReceiveData({ ...receiveData, items: newItems });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseReceiveModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={receiveMutation.isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {receiveMutation.isLoading ? 'Receiving...' : 'Receive Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
