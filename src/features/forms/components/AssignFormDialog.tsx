
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormTemplate, Employee } from '@/types';
import { toast } from '@/hooks/use-toast';

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
    if (selectedEmployees.length === 0) {
      toast({
        title: "⚠️ No Employees Selected",
        description: "Please select at least one employee to assign the form to.",
        className: "border-yellow-200 bg-yellow-50 text-yellow-800",
      });
      return;
    }

    // Here you would typically send the assignment data to your backend
    console.log('Assigning form', form?.id, 'to employees', selectedEmployees);
    
    const selectedEmployeeNames = employees
      .filter(emp => selectedEmployees.includes(emp.id))
      .map(emp => emp.name)
      .join(', ');

    toast({
      title: "✅ Form Assigned Successfully",
      description: `"${form?.title}" has been assigned to ${selectedEmployeeNames}.`,
      className: "border-green-200 bg-green-50 text-green-800",
    });

    setSelectedEmployees([]);
    onOpenChange(false);
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Form: {form.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select employees to assign this form to:
          </p>
          
          <ScrollArea className="h-64 border rounded-md p-4">
            <div className="space-y-3">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={employee.id}
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={() => handleEmployeeToggle(employee.id)}
                  />
                  <label 
                    htmlFor={employee.id} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {employee.name}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    ({employee.email})
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>
              Assign Form ({selectedEmployees.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFormDialog;
