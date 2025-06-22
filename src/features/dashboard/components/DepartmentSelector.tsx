
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText } from 'lucide-react';
import { Department } from '@/types';

interface DepartmentSelectorProps {
  departments: Department[];
  onSelectDepartment: (departmentId: string) => void;
  formCounts: { [departmentId: string]: number };
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  departments,
  onSelectDepartment,
  formCounts
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Select Department</h2>
        <p className="text-muted-foreground">
          Choose a department to view its assigned forms
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Card 
            key={department.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectDepartment(department.id)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{department.name}</CardTitle>
              {department.description && (
                <CardDescription>{department.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{formCounts[department.id] || 0} forms</span>
                </div>
                <Button size="sm" variant="outline">
                  View Forms
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentSelector;
