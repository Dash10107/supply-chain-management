import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';

interface Inventory {
  id: string;
  product: { id: string; name: string; sku: string };
  warehouse: { id: string; name: string; code: string };
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  expiryDate?: string;
  batchNumber?: string;
}

const Inventory = () => {
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [transferData, setTransferData] = useState({
    toWarehouseId: '',
    quantity: '',
  });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['inventory', warehouseFilter],
    async () => {
      const params = warehouseFilter ? { warehouseId: warehouseFilter } : {};
      const response = await apiClient.get('/inventory', { params });
      return response.data.data.inventories;
    }
  );

  useQuery('warehouses', async () => {
    const response = await apiClient.get('/warehouses');
    setWarehouses(response.data.data || []);
    return response.data.data;
  });

  const transferMutation = useMutation(
    async (data: any) => {
      const response = await apiClient.post('/inventory-transfer', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        toast.success('Inventory transferred successfully');
        handleCloseTransferModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to transfer inventory');
      },
    }
  );

  const handleOpenTransfer = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setTransferData({
      toWarehouseId: '',
      quantity: '',
    });
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setSelectedInventory(null);
    setTransferData({
      toWarehouseId: '',
      quantity: '',
    });
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInventory) {
      transferMutation.mutate({
        productId: selectedInventory.product.id,
        fromWarehouseId: selectedInventory.warehouse.id,
        toWarehouseId: transferData.toWarehouseId,
        quantity: parseInt(transferData.quantity),
      });
    }
  };

  const columns = [
    { header: 'Product SKU', accessor: (row: Inventory) => row.product.sku },
    { header: 'Product Name', accessor: (row: Inventory) => row.product.name },
    { header: 'Warehouse', accessor: (row: Inventory) => row.warehouse.name },
    { header: 'Quantity', accessor: 'quantity' as keyof Inventory },
    { header: 'Reserved', accessor: 'reservedQuantity' as keyof Inventory },
    { header: 'Available', accessor: 'availableQuantity' as keyof Inventory },
    { header: 'Batch', accessor: 'batchNumber' as keyof Inventory },
    {
      header: 'Actions',
      accessor: (row: Inventory) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenTransfer(row);
          }}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Transfer
        </button>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <div>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Table data={data || []} columns={columns} />

      {/* Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        title="Transfer Inventory"
      >
        {selectedInventory && (
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Product</p>
              <p className="font-semibold">{selectedInventory.product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">From Warehouse</p>
              <p className="font-semibold">{selectedInventory.warehouse.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Quantity</p>
              <p className="font-semibold">{selectedInventory.availableQuantity}</p>
            </div>
            <FormInput
              label="To Warehouse"
              name="toWarehouseId"
              value={transferData.toWarehouseId}
              onChange={(e) => setTransferData({ ...transferData, toWarehouseId: e.target.value })}
              required
              options={warehouses
                .filter((w) => w.id !== selectedInventory.warehouse.id)
                .map((w) => ({
                  value: w.id,
                  label: `${w.code} - ${w.name}`,
                }))}
            />
            <FormInput
              label="Quantity"
              name="quantity"
              type="number"
              value={transferData.quantity}
              onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
              required
              placeholder={`Max: ${selectedInventory.availableQuantity}`}
            />
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleCloseTransferModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={transferMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {transferMutation.isLoading ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
