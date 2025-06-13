
import React, { useState } from 'react';
import { Search, Users, Shield, User, MoreVertical, Edit, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Mock users data
  const users = [
    {
      id: 1,
      name: 'John Kimani',
      email: 'john@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-10',
      lastActive: '2024-01-15',
      favorites: 5
    },
    {
      id: 2,
      name: 'Mary Wanjiku',
      email: 'mary@techhub.com',
      role: 'merchant',
      status: 'active',
      joinDate: '2024-01-08',
      lastActive: '2024-01-14',
      businessName: 'TechHub Kenya'
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@nairobiverified.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-01',
      lastActive: '2024-01-15'
    },
    {
      id: 4,
      name: 'Peter Ochieng',
      email: 'peter@example.com',
      role: 'user',
      status: 'inactive',
      joinDate: '2024-01-12',
      lastActive: '2024-01-13',
      favorites: 2
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'merchant':
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      merchant: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage platform users and their roles</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('all')}
                >
                  All Users ({users.length})
                </Button>
                <Button
                  variant={roleFilter === 'admin' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('admin')}
                >
                  Admins ({users.filter(u => u.role === 'admin').length})
                </Button>
                <Button
                  variant={roleFilter === 'merchant' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('merchant')}
                >
                  Merchants ({users.filter(u => u.role === 'merchant').length})
                </Button>
                <Button
                  variant={roleFilter === 'user' ? 'default' : 'outline'}
                  onClick={() => setRoleFilter('user')}
                >
                  Users ({users.filter(u => u.role === 'user').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">User</th>
                    <th className="text-left p-4 font-medium text-gray-900">Role</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Join Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Last Active</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.role === 'merchant' && user.businessName && (
                            <p className="text-sm text-blue-600">{user.businessName}</p>
                          )}
                          {user.role === 'user' && user.favorites && (
                            <p className="text-sm text-gray-500">{user.favorites} favorites</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{user.joinDate}</td>
                      <td className="p-4 text-gray-600">{user.lastActive}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
