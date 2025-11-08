import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, ChevronDown, Plus, X, Upload, Check } from 'lucide-react';

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
    <div className="h-screen overflow-auto bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-settings">Settings</h1>
          <p className="text-muted-foreground">Manage orders, invoices, products, and expenses</p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map(section => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              onClick={() => {
                setActiveSection(section.id);
                setShowForm(false);
              }}
              data-testid={`tab-${section.id}`}
            >
              {section.label}
            </Button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button variant="outline" data-testid="button-filter">
              <Filter size={18} className="mr-2" />
              Filter
              <ChevronDown size={16} className="ml-2" />
            </Button>
            <Button variant="outline" data-testid="button-group-by">
              Group By
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </div>
          <Button onClick={handleCreate} data-testid="button-create-new">
            <Plus size={18} className="mr-2" />
            Create New
          </Button>
        </div>

        {/* Content Area */}
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
  );
}

// Content Table Component
function ContentTable({ section, searchValue, onEdit }: { section: string; searchValue: string; onEdit: (item: any) => void }) {
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
    <Card>
      <CardContent className="p-0">
        {renderTable()}
      </CardContent>
    </Card>
  );
}

// Sales Order Table
function SalesOrderTable({ onEdit }: { onEdit: (item: any) => void }) {
  const mockData = [
    { id: 1, code: 'SO001', customer: 'Acme Corp', project: 'Website Redesign', status: 'Draft', amount: 15000 },
    { id: 2, code: 'SO002', customer: 'Tech Solutions', project: 'Mobile App', status: 'Confirmed', amount: 25000 }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left text-xs font-medium text-muted-foreground uppercase">
            <th className="px-6 py-3">Order Code</th>
            <th className="px-6 py-3">Customer</th>
            <th className="px-6 py-3">Project</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {mockData.map(order => (
            <tr key={order.id} className="hover-elevate" data-testid={`row-order-${order.id}`}>
              <td className="px-6 py-4 text-sm">{order.code}</td>
              <td className="px-6 py-4 text-sm">{order.customer}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{order.project}</td>
              <td className="px-6 py-4">
                <Badge variant={order.status === 'Confirmed' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">${order.amount.toLocaleString()}</td>
              <td className="px-6 py-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(order)} 
                  data-testid={`button-edit-${order.id}`}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Purchase Order Table
function PurchaseOrderTable({ onEdit }: { onEdit: (item: any) => void }) {
  const mockData = [
    { id: 1, code: 'PO001', vendor: 'Office Supplies Co', project: 'General', status: 'Draft', amount: 5000 }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left text-xs font-medium text-muted-foreground uppercase">
            <th className="px-6 py-3">PO Code</th>
            <th className="px-6 py-3">Vendor</th>
            <th className="px-6 py-3">Project</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {mockData.map(order => (
            <tr key={order.id} className="hover-elevate" data-testid={`row-po-${order.id}`}>
              <td className="px-6 py-4 text-sm">{order.code}</td>
              <td className="px-6 py-4 text-sm">{order.vendor}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{order.project}</td>
              <td className="px-6 py-4">
                <Badge variant="secondary">{order.status}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">${order.amount.toLocaleString()}</td>
              <td className="px-6 py-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(order)} 
                  data-testid={`button-edit-po-${order.id}`}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VendorBillTable({ onEdit }: { onEdit: (item: any) => void }) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>No vendor bills yet. Click "Create New" to add one.</p>
    </div>
  );
}

function CustomerInvoiceTable({ onEdit }: { onEdit: (item: any) => void }) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>No customer invoices yet. Click "Create New" to add one.</p>
    </div>
  );
}

function ProductTable({ onEdit }: { onEdit: (item: any) => void }) {
  const mockData = [
    { id: 1, name: 'Web Development Service', sales: true, purchase: false, expenses: false, salesPrice: 150, cost: 0 },
    { id: 2, name: 'Office Supplies', sales: false, purchase: true, expenses: true, salesPrice: 0, cost: 25 }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left text-xs font-medium text-muted-foreground uppercase">
            <th className="px-6 py-3">Product Name</th>
            <th className="px-6 py-3">Sales</th>
            <th className="px-6 py-3">Purchase</th>
            <th className="px-6 py-3">Expenses</th>
            <th className="px-6 py-3">Sales Price</th>
            <th className="px-6 py-3">Cost</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {mockData.map(product => (
            <tr key={product.id} className="hover-elevate" data-testid={`row-product-${product.id}`}>
              <td className="px-6 py-4 text-sm">{product.name}</td>
              <td className="px-6 py-4">
                {product.sales ? <Check size={18} className="text-green-600" /> : <X size={18} className="text-muted-foreground" />}
              </td>
              <td className="px-6 py-4">
                {product.purchase ? <Check size={18} className="text-green-600" /> : <X size={18} className="text-muted-foreground" />}
              </td>
              <td className="px-6 py-4">
                {product.expenses ? <Check size={18} className="text-green-600" /> : <X size={18} className="text-muted-foreground" />}
              </td>
              <td className="px-6 py-4 text-sm">${product.salesPrice}</td>
              <td className="px-6 py-4 text-sm">${product.cost}</td>
              <td className="px-6 py-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(product)} 
                  data-testid={`button-edit-product-${product.id}`}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpenseTable({ onEdit }: { onEdit: (item: any) => void }) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>No expenses yet. Click "Create New" to add one.</p>
    </div>
  );
}

// Form View Component
function FormView({ section, editingItem, onClose }: { section: string; editingItem: any; onClose: () => void }) {
  const [formData, setFormData] = useState({});
  const [lines, setLines] = useState([{ product: '', quantity: 1, unit: 'Unit', unitPrice: 0, tax: 0, amount: 0 }]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    setTimeout(() => {
      const mockOcrData = {
        name: "Office Supplies Purchase",
        periodStart: "2025-11-01",
        periodEnd: "2025-11-01",
        description: "Purchase of office supplies including paper, pens, and folders from Vendor ABC. Invoice #INV-2025-1234",
        project: "General Operations"
      };
      
      setFormData({
        ...formData,
        ...mockOcrData
      });
      setUploading(false);
    }, 2000);
  };

  const renderForm = () => {
    switch(section) {
      case 'expenses':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input 
                type="text" 
                placeholder="Enter expense name" 
                data-testid="input-expense-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Period Start</label>
                <Input type="date" data-testid="input-period-start" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Period End</label>
                <Input type="date" data-testid="input-period-end" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Receipt/Invoice</label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden" 
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? 'Processing image with OCR...' : 'Click to upload or drag and drop'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            <p>Form for {section} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>
          {editingItem ? 'Edit' : 'Create'} {section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-form">
          <X size={20} />
        </Button>
      </CardHeader>
      <CardContent>
        {renderForm()}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button data-testid="button-save">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
