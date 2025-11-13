import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';

interface Shipment {
  id: string;
  trackingNumber: string;
  salesOrder: { orderNumber: string; id: string };
  originWarehouse: { name: string; code: string };
  status: string;
  carrier?: string;
  carrierTrackingNumber?: string;
  shippedDate?: string;
  expectedDeliveryDate?: string;
  deliveredDate?: string;
}

const Shipments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    salesOrderId: '',
    status: 'pending',
    carrier: '',
    carrierTrackingNumber: '',
    expectedDeliveryDate: '',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('shipments', async () => {
    const response = await apiClient.get('/shipments');
    return response.data.data.shipments;
  });

  useQuery('sales-orders-for-shipment', async () => {
    const response = await apiClient.get('/sales-orders?status=confirmed');
    setSalesOrders(response.data.data.orders || []);
    return response.data.data.orders;
  });

  const createMutation = useMutation(
    async (data: any) => {
      const response = await apiClient.post('/shipments', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('shipments');
        queryClient.invalidateQueries('sales-orders');
        toast.success('Shipment created successfully');
        handleCloseCreateModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create shipment');
      },
    }
  );

  const updateStatusMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/shipments/${id}/status`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('shipments');
        toast.success('Shipment status updated successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update shipment');
      },
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedShipment(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      salesOrderId: '',
      status: 'pending',
      carrier: '',
      carrierTrackingNumber: '',
      expectedDeliveryDate: '',
    });
  };

  const handleOpenStatusUpdate = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      salesOrderId: shipment.salesOrder.id,
      status: shipment.status,
      carrier: shipment.carrier || '',
      carrierTrackingNumber: shipment.carrierTrackingNumber || '',
      expectedDeliveryDate: shipment.expectedDeliveryDate || '',
    });
    setIsModalOpen(true);
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      salesOrderId: formData.salesOrderId,
    });
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShipment) {
      updateStatusMutation.mutate({
        id: selectedShipment.id,
        data: {
          status: formData.status,
          carrier: formData.carrier,
          carrierTrackingNumber: formData.carrierTrackingNumber,
        },
      });
    }
  };

  const columns = [
    { header: 'Tracking Number', accessor: 'trackingNumber' as keyof Shipment },
    { header: 'Order Number', accessor: (row: Shipment) => row.salesOrder.orderNumber },
    { header: 'Origin Warehouse', accessor: (row: Shipment) => row.originWarehouse.name },
    { header: 'Status', accessor: 'status' as keyof Shipment },
    { header: 'Carrier', accessor: 'carrier' as keyof Shipment },
    {
      header: 'Shipped Date',
      accessor: (row: Shipment) =>
        row.shippedDate ? new Date(row.shippedDate).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Actions',
      accessor: (row: Shipment) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStatusUpdate(row);
          }}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Update Status
        </button>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading shipments...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Shipment
        </button>
      </div>
      <Table data={data || []} columns={columns} />

      {/* Update Status Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Update Shipment Status">
        {selectedShipment && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="font-semibold">{selectedShipment.trackingNumber}</p>
            </div>
            <FormInput
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'picked', label: 'Picked' },
                { value: 'packed', label: 'Packed' },
                { value: 'in_transit', label: 'In Transit' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <FormInput
              label="Carrier"
              name="carrier"
              value={formData.carrier}
              onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
            />
            <FormInput
              label="Carrier Tracking Number"
              name="carrierTrackingNumber"
              value={formData.carrierTrackingNumber}
              onChange={(e) => setFormData({ ...formData, carrierTrackingNumber: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateStatusMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {updateStatusMutation.isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Shipment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Create Shipment"
      >
        <form onSubmit={handleCreateShipment} className="space-y-4">
          <FormInput
            label="Sales Order"
            name="salesOrderId"
            value={formData.salesOrderId}
            onChange={(e) => setFormData({ ...formData, salesOrderId: e.target.value })}
            required
            options={salesOrders.map((order) => ({
              value: order.id,
              label: `${order.orderNumber} - ${order.customerName || 'N/A'}`,
            }))}
          />
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
              disabled={createMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Shipments;
