import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';

interface Supplier {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: string;
  leadTimeDays: number;
}

const Suppliers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    leadTimeDays: '7',
    status: 'active',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('suppliers', async () => {
    const response = await apiClient.get('/suppliers');
    return response.data.data;
  });

  const createMutation = useMutation(
    async (data: any) => {
      const response = await apiClient.post('/suppliers', {
        ...data,
        leadTimeDays: parseInt(data.leadTimeDays),
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
        toast.success('Supplier created successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create supplier');
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/suppliers/${id}`, {
        ...data,
        leadTimeDays: parseInt(data.leadTimeDays),
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
        toast.success('Supplier updated successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update supplier');
      },
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
    setFormData({
      code: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      leadTimeDays: '7',
      status: 'active',
    });
  };

  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      code: supplier.code,
      name: supplier.name,
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      zipCode: supplier.zipCode || '',
      country: supplier.country || 'USA',
      contactName: supplier.contactName || '',
      contactEmail: supplier.contactEmail || '',
      contactPhone: supplier.contactPhone || '',
      leadTimeDays: String(supplier.leadTimeDays),
      status: supplier.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupplier) {
      updateMutation.mutate({ id: selectedSupplier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' as keyof Supplier },
    { header: 'Name', accessor: 'name' as keyof Supplier },
    { header: 'City', accessor: 'city' as keyof Supplier },
    { header: 'State', accessor: 'state' as keyof Supplier },
    { header: 'Contact Email', accessor: 'contactEmail' as keyof Supplier },
    { header: 'Lead Time (Days)', accessor: (row: Supplier) => row.leadTimeDays },
    { header: 'Status', accessor: 'status' as keyof Supplier },
    {
      header: 'Actions',
      accessor: (row: Supplier) => (
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
    return <div className="text-center py-8">Loading suppliers...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Supplier
        </button>
      </div>
      <Table data={data || []} columns={columns} onRowClick={(row) => handleOpenEdit(row)} />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Supplier Code"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              disabled={!!selectedSupplier}
            />
            <FormInput
              label="Supplier Name"
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
          <FormInput
            label="Country"
            name="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Contact Name"
              name="contactName"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            />
            <FormInput
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
            <FormInput
              label="Contact Phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Lead Time (Days)"
              name="leadTimeDays"
              type="number"
              value={formData.leadTimeDays}
              onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
              required
            />
            <FormInput
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>
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
                : selectedSupplier
                ? 'Update'
                : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
