
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormTemplate } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ViewResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormTemplate | null;
}

// Mock data for demonstration
const mockResults = [
  {
    id: '1',
    employeeName: 'John Doe',
    submittedAt: new Date('2024-06-05'),
    status: 'completed',
    processingTime: '2.1s',
    tokenCost: 150,
    responses: ['Great product', '8', 'Yes, definitely']
  },
  {
    id: '2',
    employeeName: 'Jane Smith',
    submittedAt: new Date('2024-06-04'),
    status: 'completed',
    processingTime: '1.8s',
    tokenCost: 120,
    responses: ['Good quality', '7', 'Maybe']
  }
];

const ViewResultsDialog: React.FC<ViewResultsDialogProps> = ({ 
  open, 
  onOpenChange, 
  form 
}) => {
  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Results: {form.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockResults.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.95s</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Token Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">270</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Token Cost</TableHead>
                    <TableHead>Responses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.employeeName}</TableCell>
                      <TableCell>{result.submittedAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="default">{result.status}</Badge>
                      </TableCell>
                      <TableCell>{result.processingTime}</TableCell>
                      <TableCell>{result.tokenCost}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {result.responses.join(' | ')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewResultsDialog;
