import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status: string;
}

const Warehouses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    latitude: '',
    longitude: '',
    status: 'active',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('warehouses', async () => {
    const response = await apiClient.get('/warehouses');
    return response.data.data;
  });

  const createMutation = useMutation(
    async (data: any) => {
      const submitData = {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      };
      const response = await apiClient.post('/warehouses', submitData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('warehouses');
        toast.success('Warehouse created successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create warehouse');
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const submitData = {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      };
      const response = await apiClient.patch(`/warehouses/${id}`, submitData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('warehouses');
        toast.success('Warehouse updated successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update warehouse');
      },
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWarehouse(null);
    setFormData({
      code: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      latitude: '',
      longitude: '',
      status: 'active',
    });
  };

  const handleOpenCreate = () => {
    setSelectedWarehouse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address || '',
      city: warehouse.city || '',
      state: warehouse.state || '',
      zipCode: warehouse.zipCode || '',
      country: warehouse.country || 'USA',
      latitude: warehouse.latitude ? String(warehouse.latitude) : '',
      longitude: warehouse.longitude ? String(warehouse.longitude) : '',
      status: warehouse.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWarehouse) {
      updateMutation.mutate({ id: selectedWarehouse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' as keyof Warehouse },
    { header: 'Name', accessor: 'name' as keyof Warehouse },
    { header: 'City', accessor: 'city' as keyof Warehouse },
    { header: 'State', accessor: 'state' as keyof Warehouse },
    { header: 'Country', accessor: 'country' as keyof Warehouse },
    { header: 'Status', accessor: 'status' as keyof Warehouse },
    {
      header: 'Actions',
      accessor: (row: Warehouse) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEdit(row);
          }}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Edit
        </button>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading warehouses...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Warehouse
        </button>
      </div>
      <Table data={data || []} columns={columns} onRowClick={(row) => handleOpenEdit(row)} />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Warehouse Code"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              disabled={!!selectedWarehouse}
            />
            <FormInput
              label="Warehouse Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <FormInput
            label="Address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            textarea
          />
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <FormInput
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Country"
              name="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
            <FormInput
              label="Latitude"
              name="latitude"
              type="number"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              step="0.0000001"
              placeholder="Optional"
            />
            <FormInput
              label="Longitude"
              name="longitude"
              type="number"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              step="0.0000001"
              placeholder="Optional"
            />
          </div>
          <FormInput
            label="Status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'maintenance', label: 'Maintenance' },
            ]}
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
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : selectedWarehouse
                ? 'Update'
                : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warehouses;
