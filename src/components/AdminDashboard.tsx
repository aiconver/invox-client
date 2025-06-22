
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, FileText, BarChart3, Plus, Edit, Eye, UserPlus } from 'lucide-react';
import { FormTemplate, Employee } from '@/types';
import FormBuilder from './FormBuilder';
import AddUserDialog from './AddUserDialog';
import AssignFormDialog from './AssignFormDialog';
import EditFormDialog from './EditFormDialog';
import ViewResultsDialog from './ViewResultsDialog';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdminDashboard: React.FC = () => {
  const [stats] = useState({
    totalEmployees: 24,
    activeForms: 8,
    completedToday: 15,
    avgProcessingTime: '2.3s'
  });

  const [forms, setForms] = useState<FormTemplate[]>([
    { 
      id: '1', 
      title: 'Customer Feedback Survey', 
      description: 'Collect feedback about our latest product release',
      organizationId: 'org-1',
      departmentId: 'dept-1',
      fields: [],
      architecture: 'multi-agent',
      createdAt: new Date('2024-06-01'),
      createdBy: 'admin-1'
    },
    { 
      id: '2', 
      title: 'Employee Onboarding', 
      description: 'New employee information collection',
      organizationId: 'org-1',
      departmentId: 'dept-2',
      fields: [],
      architecture: 'single-shot',
      createdAt: new Date('2024-06-02'),
      createdBy: 'admin-1'
    },
    { 
      id: '3', 
      title: 'Weekly Report', 
      description: 'Weekly status and progress reporting',
      organizationId: 'org-1',
      departmentId: 'dept-4',
      fields: [],
      architecture: 'one-by-one',
      createdAt: new Date('2024-06-03'),
      createdBy: 'admin-1'
    }
  ]);

  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'John Doe', email: 'john@company.com', organizationId: 'org-1', createdAt: new Date() },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', organizationId: 'org-1', createdAt: new Date() }
  ]);

  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewResults, setShowViewResults] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);

  const handleCreateForm = (formData: Omit<FormTemplate, 'id' | 'organizationId' | 'createdAt' | 'createdBy'>) => {
    const newForm: FormTemplate = {
      ...formData,
      id: `form-${Date.now()}`,
      organizationId: 'org-1',
      createdAt: new Date(),
      createdBy: 'admin-1'
    };
    
    setForms(prev => [...prev, newForm]);
    setShowFormBuilder(false);
  };

  const handleAddUser = (userData: Omit<Employee, 'id' | 'organizationId' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...userData,
      id: `emp-${Date.now()}`,
      organizationId: 'org-1',
      createdAt: new Date()
    };
    
    setEmployees(prev => [...prev, newEmployee]);
    setShowAddUser(false);
  };

  const handleEditForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setSelectedForm(form);
      setShowEditForm(true);
    }
  };

  const handleUpdateForm = (updatedForm: FormTemplate) => {
    setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
    setShowEditForm(false);
    setSelectedForm(null);
  };

  const handleViewResults = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setSelectedForm(form);
      setShowViewResults(true);
    }
  };

  const handleAssignForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setSelectedForm(form);
      setShowAssignForm(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddUser(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => setShowFormBuilder(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Form
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeForms}</div>
            <p className="text-xs text-muted-foreground">3 pending assignments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProcessingTime}</div>
            <p className="text-xs text-muted-foreground">-0.2s improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Templates</CardTitle>
              <CardDescription>Manage your organization's forms and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium">{form.title}</h3>
                      <p className="text-sm text-muted-foreground">{form.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Created: {form.createdAt.toLocaleDateString()}</span>
                        <Badge variant="secondary">{form.architecture}</Badge>
                        <Badge variant="outline">{form.fields.length} fields</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleAssignForm(form.id)}>
                        Assign
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewResults(form.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditForm(form.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>Add, remove, and manage organization members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {employee.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
          </DialogHeader>
          <FormBuilder 
            onSave={handleCreateForm}
            onCancel={() => setShowFormBuilder(false)}
          />
        </DialogContent>
      </Dialog>

      <AddUserDialog 
        open={showAddUser}
        onOpenChange={setShowAddUser}
        onSave={handleAddUser}
      />

      <AssignFormDialog 
        open={showAssignForm}
        onOpenChange={setShowAssignForm}
        form={selectedForm}
        employees={employees}
      />

      <EditFormDialog 
        open={showEditForm}
        onOpenChange={setShowEditForm}
        form={selectedForm}
        onSave={handleUpdateForm}
      />

      <ViewResultsDialog 
        open={showViewResults}
        onOpenChange={setShowViewResults}
        form={selectedForm}
      />
    </div>
  );
};

export default AdminDashboard;
