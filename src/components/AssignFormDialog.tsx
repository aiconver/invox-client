
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormTemplate, Employee } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface AssignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormTemplate | null;
  employees: Employee[];
}

const AssignFormDialog: React.FC<AssignFormDialogProps> = ({ 
  open, 
  onOpenChange, 
  form, 
  employees 
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleAssign = () => {
    if (selectedEmployees.length > 0) {
      console.log('Assigning form', form?.id, 'to employees:', selectedEmployees);
      // TODO: Implement actual assignment logic
      setSelectedEmployees([]);
      onOpenChange(false);
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Form: {form.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Form Details</h3>
              <p className="text-sm text-muted-foreground">{form.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {form.fields.length} fields • {form.architecture} architecture
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Select Employees</Label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEmployees.includes(employee.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleEmployeeToggle(employee.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleEmployeeToggle(employee.id)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={selectedEmployees.length === 0}>
              Assign to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFormDialog;
