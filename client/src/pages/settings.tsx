import React, { useState, useEffect } from 'react';
import { LayoutGrid, Folder, CheckSquare, BarChart2, Settings, User, Search, Filter, ChevronDown, Plus, X, Upload, Check, XCircle, Menu } from 'lucide-react';

// Mock user data
const currentUser = {
  name: "John Doe",
  email: "john.doe@flowchain.com",
  initials: "JD"
};

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <div className={${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 h-screen fixed left-0 top-0}>
      {/* Brand Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            {!collapsed && (
              <div>
                <div className="font-bold text-gray-900">FlowChain</div>
                <div className="text-xs text-gray-500">Bill Management</div>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-100 rounded">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-purple-50 text-purple-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm truncate">{currentUser.name}</div>
              <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Toolbar Component
const Toolbar = ({ onSearch, onFilter, onGroupBy, onCreate, searchValue, filters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showGroupBy, setShowGroupBy] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={18} />
              <span>Filter</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Group By */}
          <div className="relative">
            <button
              onClick={() => setShowGroupBy(!showGroupBy)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span>Group By</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Create New */}
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={18} />
          <span>Create New</span>
        </button>
      </div>
    </div>
  );
};

// Settings Module
const SettingsModule = () => {
  const [activeSection, setActiveSection] = useState('sales-orders');
  const [searchValue, setSearchValue] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [data, setData] = useState({
    salesOrders: [],
    purchaseOrders: [],
    vendorBills: [],
    customerInvoices: [],
    products: [],
    expenses: []
  });

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

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Section Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
          <div className="flex gap-2 overflow-x-auto">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setShowForm(false);
                }}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        onSearch={setSearchValue}
        onFilter={() => {}}
        onGroupBy={() => {}}
        onCreate={handleCreate}
        searchValue={searchValue}
      />

      {/* Content Area */}
      <div className="p-6">
        {!showForm ? (
          <ContentTable 
            section={activeSection} 
            searchValue={searchValue}
            onEdit={handleEdit}
            data={data[activeSection.replace('-', '')]}
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
  );
};

// Content Table Component
const ContentTable = ({ section, searchValue, onEdit, data }) => {
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
    <div className="bg-white rounded-lg shadow">
      {renderTable()}
    </div>
  );
};

// Sales Order Table
const SalesOrderTable = ({ onEdit }) => {
  const mockData = [
    { id: 1, code: 'SO001', customer: 'Acme Corp', project: 'Website Redesign', status: 'Draft', amount: 15000 },
    { id: 2, code: 'SO002', customer: 'Tech Solutions', project: 'Mobile App', status: 'Confirmed', amount: 25000 }
  ];

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {mockData.map(order => (
          <tr key={order.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-900">{order.code}</td>
            <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{order.project}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs rounded-full ${
                order.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">${order.amount.toLocaleString()}</td>
            <td className="px-6 py-4">
              <button onClick={() => onEdit(order)} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Similar table components for other sections
const PurchaseOrderTable = ({ onEdit }) => {
  const mockData = [
    { id: 1, code: 'PO001', vendor: 'Office Supplies Co', project: 'General', status: 'Draft', amount: 5000 }
  ];

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {mockData.map(order => (
          <tr key={order.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-900">{order.code}</td>
            <td className="px-6 py-4 text-sm text-gray-900">{order.vendor}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{order.project}</td>
            <td className="px-6 py-4">
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">${order.amount.toLocaleString()}</td>
            <td className="px-6 py-4">
              <button onClick={() => onEdit(order)} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const VendorBillTable = ({ onEdit }) => (
  <div className="p-8 text-center text-gray-500">
    <p>No vendor bills yet. Click "Create New" to add one.</p>
  </div>
);

const CustomerInvoiceTable = ({ onEdit }) => (
  <div className="p-8 text-center text-gray-500">
    <p>No customer invoices yet. Click "Create New" to add one.</p>
  </div>
);

const ProductTable = ({ onEdit }) => {
  const mockData = [
    { id: 1, name: 'Web Development Service', sales: true, purchase: false, expenses: false, salesPrice: 150, cost: 0 },
    { id: 2, name: 'Office Supplies', sales: false, purchase: true, expenses: true, salesPrice: 0, cost: 25 }
  ];

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Price</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {mockData.map(product => (
          <tr key={product.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
            <td className="px-6 py-4">{product.sales ? <Check size={18} className="text-green-600" /> : <X size={18} className="text-gray-300" />}</td>
            <td className="px-6 py-4">{product.purchase ? <Check size={18} className="text-green-600" /> : <X size={18} className="text-gray-300" />}</td>
            <td className="px-6 py-4">{product.expenses ? <Check size={18} className="text-green-600" /> : <X size={18} className="text-gray-300" />}</td>
            <td className="px-6 py-4 text-sm text-gray-900">${product.salesPrice}</td>
            <td className="px-6 py-4 text-sm text-gray-900">${product.cost}</td>
            <td className="px-6 py-4">
              <button onClick={() => onEdit(product)} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ExpenseTable = ({ onEdit }) => (
  <div className="p-8 text-center text-gray-500">
    <p>No expenses yet. Click "Create New" to add one.</p>
  </div>
);

// Form View Component
const FormView = ({ section, editingItem, onClose }) => {
  const [formData, setFormData] = useState({});
  const [lines, setLines] = useState([{ product: '', quantity: 1, unit: 'Unit', unitPrice: 0, tax: 0, amount: 0 }]);
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      const mockOcrData = {
        name: "Office Supplies Purchase",
        period_start: "2025-11-01",
        period_end: "2025-11-01",
        description: "Purchase of office supplies including paper, pens, and folders from Vendor ABC. Invoice #INV-2025-1234",
        project: "General Operations"
      };
      
      setOcrResult(mockOcrData);
      setFormData({
        ...formData,
        name: mockOcrData.name,
        periodStart: mockOcrData.period_start,
        periodEnd: mockOcrData.period_end,
        description: mockOcrData.description,
        project: mockOcrData.project
      });
      setUploading(false);
      
      // Show toast notification
      alert("✓ Auto-filled details using uploaded image");
    }, 2000);
  };

  const renderForm = () => {
    switch(section) {
      case 'sales-orders':
        return <SalesOrderForm lines={lines} setLines={setLines} formData={formData} setFormData={setFormData} />;
      case 'purchase-orders':
        return <PurchaseOrderForm lines={lines} setLines={setLines} formData={formData} setFormData={setFormData} />;
      case 'vendor-bills':
        return <VendorBillForm lines={lines} setLines={setLines} formData={formData} setFormData={setFormData} />;
      case 'customer-invoices':
        return <CustomerInvoiceForm lines={lines} setLines={setLines} formData={formData} setFormData={setFormData} />;
      case 'products':
        return <ProductForm formData={formData} setFormData={setFormData} />;
      case 'expenses':
        return <ExpenseForm formData={formData} setFormData={setFormData} onImageUpload={handleImageUpload} uploading={uploading} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingItem ? 'Edit' : 'Create'} {section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X size={20} />
        </button>
      </div>
      <div className="p-6">
        {renderForm()}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Form Components
const SalesOrderForm = ({ lines, setLines, formData, setFormData }) => {
  const addLine = () => {
    setLines([...lines, { product: '', quantity: 1, unit: 'Unit', unitPrice: 0, tax: 0, amount: 0 }]);
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
      const qty = parseFloat(newLines[index].quantity) || 0;
      const price = parseFloat(newLines[index].unitPrice) || 0;
      const tax = parseFloat(newLines[index].tax) || 0;
      newLines[index].amount = qty * price * (1 + tax / 100);
    }
    setLines(newLines);
  };

  const total = lines.reduce((sum, line) => sum + (line.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Code</label>
          <input type="text" placeholder="Auto-generated" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>Select customer...</option>
            <option>Acme Corp</option>
            <option>Tech Solutions</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>Select project...</option>
            <option>Website Redesign</option>
            <option>Mobile App</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Order Lines</label>
          <button onClick={addLine} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            + Add Line
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tax %</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">
                    <input type="text" value={line.product} onChange={(e) => updateLine(idx, 'product', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} className="w-20 px-2 py-1 border border-gray-300 rounded" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" value={line.unit} onChange={(e) => updateLine(idx, 'unit', e.target.value)} className="w-20 px-2 py-1 border border-gray-300 rounded" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" value={line.unitPrice} onChange={(e) => updateLine(idx, 'unitPrice', e.target.value)} className="w-24 px-2 py-1 border border-gray-300 rounded" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" value={line.tax} onChange={(e) => updateLine(idx, 'tax', e.target.value)} className="w-20 px-2 py-1 border border-gray-300 rounded" />
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">${line.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PurchaseOrderForm = ({ lines, setLines, formData, setFormData }) => {
  return <SalesOrderForm lines={lines} setLines={setLines} formData={formData} setFormData={setFormData} />;
};

const VendorBillForm = ({ lines, setLines, formData, setFormData }) => {
  return <SalesOrderForm lines={lines} setLines={setLines} formData={formData} setFormData={setFormData} />;
};

const CustomerInvoiceForm = ({ lines, setLines, formData, setFormData }) => {
  return <SalesOrderForm lines={lines} setLines={setLines} formData={formData} setFormData={setFormData} />;
};

const ProductForm = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter product name" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Product Type</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <span className="text-sm text-gray-700">Can be sold</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <span className="text-sm text-gray-700">Can be purchased</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <span className="text-sm text-gray-700">Can be expensed</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sales Price</label>
          <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
          <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0.00" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sales Taxes</label>
        <select multiple className="w-full px-3 py-2 border border-gray-300 rounded-lg" size="3">
          <option>VAT 10%</option>
          <option>VAT 20%</option>
          <option>Service Tax 5%</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
      </div>
    </div>
  );
};

const ExpenseForm = ({ formData, setFormData, onImageUpload, uploading }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input 
          type="text" 
          value={formData.name || ''} 
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
          placeholder="Enter expense name" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Period Start</label>
          <input 
            type="date" 
            value={formData.periodStart || ''} 
            onChange={(e) => setFormData({...formData, periodStart: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Period End</label>
          <input 
            type="date" 
            value={formData.periodEnd || ''} 
            onChange={(e) => setFormData({...formData, periodEnd: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
        <select 
          value={formData.project || ''} 
          onChange={(e) => setFormData({...formData, project: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option>Select project...</option>
          <option>Website Redesign</option>
          <option>Mobile App</option>
          <option>General Operations</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Receipt/Invoice</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input 
            type="file" 
            accept="image/*" 
            onChange={onImageUpload}
            className="hidden" 
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {uploading ? 'Processing image with OCR...' : 'Click to upload or drag and drop'}
            </span>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea 
          value={formData.description || ''} 
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="4" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
          placeholder="Enter expense description"
        ></textarea>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300}>
        {activeTab === 'settings' ? (
          <SettingsModule />
        ) : (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-gray-600 mt-2">This section is under construction.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
