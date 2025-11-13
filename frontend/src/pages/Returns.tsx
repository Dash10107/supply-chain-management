import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

interface Return {
  id: string;
  returnNumber: string;
  salesOrder: { orderNumber: string; id: string };
  status: string;
  reason: string;
  refundAmount: number | string;
  returnDate: string;
  items?: ReturnItem[];
}

interface ReturnItem {
  id: string;
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  unitPrice: number | string;
  refundAmount: number | string;
}

const Returns = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    salesOrderId: '',
    reason: 'customer_request',
    description: '',
  });
  const [returnItems, setReturnItems] = useState<
    Array<{ productId: string; quantity: number }>
  >([]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('returns', async () => {
    const response = await apiClient.get('/returns');
    return response.data.data.returns;
  });

  useQuery('sales-orders-for-return', async () => {
    const response = await apiClient.get('/sales-orders?status=delivered');
    setSalesOrders(response.data.data.orders || []);
    return response.data.data.orders;
  });

  const createMutation = useMutation(
    async (data: any) => {
      const response = await apiClient.post('/returns', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('returns');
        queryClient.invalidateQueries('sales-orders');
        toast.success('Return created successfully');
        handleCloseCreateModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create return');
      },
    }
  );

  const approveMutation = useMutation(
    async (id: string) => {
      const response = await apiClient.patch(`/returns/${id}/approve`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('returns');
        toast.success('Return approved successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to approve return');
      },
    }
  );

  const processMutation = useMutation(
    async ({ id, warehouseId }: { id: string; warehouseId: string }) => {
      const response = await apiClient.patch(`/returns/${id}/process`, { warehouseId });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('returns');
        queryClient.invalidateQueries('inventory');
        toast.success('Return processed successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to process return');
      },
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReturn(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      salesOrderId: '',
      reason: 'customer_request',
      description: '',
    });
    setReturnItems([]);
  };

  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewReturn = (returnOrder: Return) => {
    setSelectedReturn(returnOrder);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setReturnItems([...returnItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setReturnItems(returnItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...returnItems];
    newItems[index] = {
      ...newItems[index],
      [field]: typeof value === 'string' ? (field === 'productId' ? value : parseInt(value) || 0) : value,
    };
    setReturnItems(newItems);
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const items = returnItems
      .filter((item) => item.productId && item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
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
    { header: 'Return Number', accessor: 'returnNumber' as keyof Return },
    { header: 'Order Number', accessor: (row: Return) => row.salesOrder.orderNumber },
    { header: 'Status', accessor: 'status' as keyof Return },
    { header: 'Reason', accessor: 'reason' as keyof Return },
    { header: 'Refund Amount', accessor: (row: Return) => formatCurrency(row.refundAmount) },
    { header: 'Return Date', accessor: (row: Return) => new Date(row.returnDate).toLocaleDateString() },
    {
      header: 'Actions',
      accessor: (row: Return) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewReturn(row);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View
          </button>
          {row.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Approve this return?')) {
                  approveMutation.mutate(row.id);
                }
              }}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Approve
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading returns...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Returns</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Return
        </button>
      </div>
      <Table data={data || []} columns={columns} />

      {/* View Return Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Return Details">
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Return Number</p>
                <p className="font-semibold">{selectedReturn.returnNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{selectedReturn.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-semibold">{selectedReturn.reason}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Refund Amount</p>
                <p className="font-semibold">{formatCurrency(selectedReturn.refundAmount)}</p>
              </div>
            </div>
            {selectedReturn.items && selectedReturn.items.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Items:</p>
                <div className="space-y-2">
                  {selectedReturn.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.product.name} (x{item.quantity})</span>
                      <span>{formatCurrency(item.refundAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedReturn.status === 'approved' && (
              <ProcessReturnForm
                returnId={selectedReturn.id}
                onProcess={(warehouseId) => {
                  processMutation.mutate({ id: selectedReturn.id, warehouseId });
                }}
                isLoading={processMutation.isLoading}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Create Return Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Create Return"
      >
        <form onSubmit={handleCreateReturn} className="space-y-4">
          <FormInput
            label="Sales Order"
            name="salesOrderId"
            value={formData.salesOrderId}
            onChange={(e) => {
              setFormData({ ...formData, salesOrderId: e.target.value });
              // Load order items when order is selected
              const order = salesOrders.find((o) => o.id === e.target.value);
              if (order && order.items) {
                setReturnItems(
                  order.items.map((item: any) => ({
                    productId: item.productId,
                    quantity: 0,
                  }))
                );
              }
            }}
            required
            options={salesOrders.map((order) => ({
              value: order.id,
              label: `${order.orderNumber} - ${order.customerName || 'N/A'}`,
            }))}
          />
          <FormInput
            label="Reason"
            name="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
            options={[
              { value: 'defective', label: 'Defective' },
              { value: 'wrong_item', label: 'Wrong Item' },
              { value: 'damaged', label: 'Damaged' },
              { value: 'customer_request', label: 'Customer Request' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <FormInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            textarea
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Return Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {returnItems.map((item, index) => {
                const order = salesOrders.find((o) => o.id === formData.salesOrderId);
                const orderItem = order?.items?.find((oi: any) => oi.productId === item.productId);
                const maxQuantity = orderItem ? orderItem.quantity : 0;

                return (
                  <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded">
                    <div className="col-span-6">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      >
                        <option value="">Select Product</option>
                        {order?.items?.map((oi: any) => (
                          <option key={oi.productId} value={oi.productId}>
                            {oi.product.name} (Max: {oi.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-5">
                      <input
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
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
                );
              })}
              {returnItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Select a sales order first, then add items to return.
                </p>
              )}
            </div>
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
              disabled={createMutation.isLoading || returnItems.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Return'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const ProcessReturnForm = ({
  returnId,
  onProcess,
  isLoading,
}: {
  returnId: string;
  onProcess: (warehouseId: string) => void;
  isLoading: boolean;
}) => {
  void returnId;
  const [warehouseId, setWarehouseId] = useState('');
  const { data: warehouses } = useQuery('warehouses', async () => {
    const response = await apiClient.get('/warehouses');
    return response.data.data;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (warehouseId) {
      onProcess(warehouseId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-blue-50 rounded">
      <p className="text-sm font-semibold mb-2">Process Return</p>
      <div className="space-y-2">
        <FormInput
          label="Warehouse"
          name="warehouseId"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          required
          options={(warehouses || []).map((w: any) => ({
            value: w.id,
            label: `${w.code} - ${w.name}`,
          }))}
        />
        <button
          type="submit"
          disabled={isLoading || !warehouseId}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Process Return'}
        </button>
      </div>
    </form>
  );
};

export default Returns;
