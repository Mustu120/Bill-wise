import { useState } from 'react';
import { Search, Filter, ChevronDown, Plus, X, Upload, Check } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';

// Settings Module
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('sales-orders');
  const [searchValue, setSearchValue] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const sections = [
    { id: 'sales-orders', label: 'Sales Orders' },
    { id: 'purchase-orders', label: 'Purchase Orders' },
    { id: 'vendor-bills', label: 'Vendor Bills' },
    { id: 'customer-invoices', label: 'Customer Invoices' },
    { id: 'products', label: 'Products' },
    { id: 'expenses', label: 'Expenses' }
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <AppLayout>
      <div className="h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-6 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Settings</h1>
            
            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setShowForm(false);
                  }}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-medium ${
                    activeSection === section.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                {/* Filter */}
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filter</span>
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Create New */}
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Plus size={18} />
                <span>Create New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {!showForm ? (
            <ContentTable 
              section={activeSection} 
              searchValue={searchValue}
              onEdit={handleEdit}
            />
          ) : (
            <FormView 
              section={activeSection}
              editingItem={editingItem}
              onClose={handleCloseForm}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// Content Table Component
const ContentTable = ({ section, searchValue, onEdit }: any) => {
  const renderTable = () => {
    switch(section) {
      case 'sales-orders':
        return <SalesOrderTable onEdit={onEdit} />;
      case 'purchase-orders':
        return <PurchaseOrderTable onEdit={onEdit} />;
      case 'vendor-bills':
        return <VendorBillTable onEdit={onEdit} />;
      case 'customer-invoices':
        return <CustomerInvoiceTable onEdit={onEdit} />;
      case 'products':
        return <ProductTable onEdit={onEdit} />;
      case 'expenses':
        return <ExpenseTable onEdit={onEdit} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {renderTable()}
    </div>
  );
};

// Sales Order Table
const SalesOrderTable = ({ onEdit }: any) => {
  const mockData = [
    { id: 1, code: 'SO001', customer: 'Acme Corp', project: 'Website Redesign', status: 'Draft', amount: 15000 },
    { id: 2, code: 'SO002', customer: 'Tech Solutions', project: 'Mobile App', status: 'Confirmed', amount: 25000 }
  ];

  return (
    <table className="w-full">
      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Project</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {mockData.map(order => (
          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.code}</td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.customer}</td>
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.project}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                order.status === 'Confirmed' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${order.amount.toLocaleString()}</td>
            <td className="px-6 py-4">
              <button onClick={() => onEdit(order)} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Purchase Order Table
const PurchaseOrderTable = ({ onEdit }: any) => {
  const mockData = [
    { id: 1, code: 'PO001', vendor: 'Office Supplies Co', project: 'General', status: 'Draft', amount: 5000 }
  ];

  return (
    <table className="w-full">
      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PO Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendor</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Project</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {mockData.map(order => (
          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.code}</td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.vendor}</td>
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.project}</td>
            <td className="px-6 py-4">
              <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${order.amount.toLocaleString()}</td>
            <td className="px-6 py-4">
              <button onClick={() => onEdit(order)} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const VendorBillTable = ({ onEdit }: any) => (
  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
    <p>No vendor bills yet. Click "Create New" to add one.</p>
  </div>
);

const CustomerInvoiceTable = ({ onEdit }: any) => (
  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
    <p>No customer invoices yet. Click "Create New" to add one.</p>
  </div>
);

const ProductTable = ({ onEdit }: any) => {
  const mockData = [
    { id: 1, name: 'Web Development Service', sales: true, purchase: false, expenses: false, salesPrice: 150, cost: 0 },
    { id: 2, name: 'Office Supplies', sales: false, purchase: true, expenses: true, salesPrice: 0, cost: 25 }
  ];

  return (
    <table className="w-full">
      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Purchase</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expenses</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales Price</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {mockData.map(product => (
          <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{product.name}</td>
            <td className="px-6 py-4">{product.sales ? <Check size={18} className="text-green-600 dark:text-green-400" /> : <X size={18} className="text-gray-300 dark:text-gray-600" />}</td>
            <td className="px-6 py-4">{product.purchase ? <Check size={18} className="text-green-600 dark:text-green-400" /> : <X size={18} className="text-gray-300 dark:text-gray-600" />}</td>
            <td className="px-6 py-4">{product.expenses ? <Check size={18} className="text-green-600 dark:text-green-400" /> : <X size={18} className="text-gray-300 dark:text-gray-600" />}</td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${product.salesPrice}</td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${product.cost}</td>
            <td className="px-6 py-4">
              <button onClick={() => onEdit(product)} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ExpenseTable = ({ onEdit }: any) => (
  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
    <p>No expenses yet. Click "Create New" to add one.</p>
  </div>
);

// Form View Component
const FormView = ({ section, editingItem, onClose }: any) => {
  const [formData, setFormData] = useState<any>({});
  const [lines, setLines] = useState([{ product: '', quantity: 1, unit: 'Unit', unitPrice: 0, tax: 0, amount: 0 }]);

  const addLine = () => {
    setLines([...lines, { product: '', quantity: 1, unit: 'Unit', unitPrice: 0, tax: 0, amount: 0 }]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {editingItem ? 'Edit' : 'Create'} {section.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input 
                type="text" 
                placeholder="Enter name..." 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                <option>Draft</option>
                <option>Confirmed</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea 
              rows={4}
              placeholder="Enter description..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
