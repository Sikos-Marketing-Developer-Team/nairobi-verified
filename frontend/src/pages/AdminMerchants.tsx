import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Eye, Plus, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { usePageLoading } from '@/hooks/use-loading';
import { TableSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { merchantsAPI } from '@/lib/api';

const AdminMerchants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoading = usePageLoading(600);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const response = await merchantsAPI.getMerchants();
        setMerchants(response.data || []);
      } catch (err) {
        setError('Failed to load merchants');
        console.error('Error fetching merchants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter || 
                         (statusFilter === 'verified' && merchant.verified) ||
                         (statusFilter === 'pending' && !merchant.verified);
    return matchesSearch && matchesStatus;
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <TableSkeleton />
        </PageSkeleton>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Merchants</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Merchants</h1>
              <p className="text-gray-600 mt-2">View and manage all merchants on the platform</p>
            </div>
            <Link to="/admin/merchants/add">
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="h-4 w-4 mr-2" />
                Add Merchant
              </Button>
            </Link>
          </div>
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
                    placeholder="Search merchants by name or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  All ({merchants.length})
                </Button>
                <Button
                  variant={statusFilter === 'verified' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('verified')}
                >
                  Verified ({merchants.filter(m => m.status === 'verified' || m.verified).length})
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending ({merchants.filter(m => m.status === 'pending' || !m.verified).length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Merchants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Merchants Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Business</th>
                    <th className="text-left p-4 font-medium text-gray-900">Owner</th>
                    <th className="text-left p-4 font-medium text-gray-900">Category</th>
                    <th className="text-left p-4 font-medium text-gray-900">Location</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Join Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerchants.map((merchant) => (
                    <tr key={merchant.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{merchant.businessName || merchant.name || 'Unknown Business'}</p>
                          <p className="text-sm text-gray-500">{merchant.email || 'No email provided'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{merchant.owner || merchant.firstName + ' ' + merchant.lastName || 'Unknown Owner'}</p>
                          <p className="text-sm text-gray-500">{merchant.phone || 'No phone provided'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {merchant.category || merchant.businessCategory || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{merchant.location || merchant.address || 'Location not specified'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          merchant.status === 'verified' || merchant.verified
                            ? 'bg-green-100 text-green-800'
                            : merchant.status === 'pending' || !merchant.verified
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(merchant.status === 'verified' || merchant.verified) && <CheckCircle className="inline h-3 w-3 mr-1" />}
                          {merchant.status === 'verified' || merchant.verified ? 'verified' : 'pending'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{merchant.joinDate || new Date(merchant.createdAt).toLocaleDateString() || 'Unknown'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link to={`/merchant/${merchant._id || merchant.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredMerchants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No merchants found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMerchants;
