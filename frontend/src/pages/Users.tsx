import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import apiClient from '../api/client';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  role: {
    id: string;
    name: string;
  };
}

interface Role {
  id: string;
  name: string;
}

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    status: 'active',
    roleId: '',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('users', async () => {
    const response = await apiClient.get('/users');
    return response.data.data.users;
  });

  useQuery('roles', async () => {
    const response = await apiClient.get('/roles');
    setRoles(response.data.data || []);
    return response.data.data;
  });

  const updateMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/users/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User updated successfully');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      },
    }
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      },
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      status: user.status,
      roleId: user.role.id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data: formData });
    }
  };

  const columns = [
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Name', accessor: (row: User) => `${row.firstName} ${row.lastName}` },
    { header: 'Role', accessor: (row: User) => row.role.name.replace('_', ' ').toUpperCase() },
    { header: 'Status', accessor: 'status' as keyof User },
    {
      header: 'Actions',
      accessor: (row: User) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this user?')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      </div>
      <Table data={data || []} columns={columns} onRowClick={(row) => handleOpenEdit(row)} />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Edit User">
        {selectedUser && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
            </div>
            <FormInput
              label="Role"
              name="roleId"
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              required
              options={roles.map((r) => ({
                value: r.id,
                label: r.name.replace('_', ' ').toUpperCase(),
              }))}
            />
            <FormInput
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
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
                disabled={updateMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMutation.isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Users;

