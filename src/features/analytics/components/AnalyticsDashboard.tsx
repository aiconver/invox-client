
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  // Mock analytics data
  const analyticsData = {
    totalSubmissions: 142,
    avgProcessingTime: 2.3,
    totalTokenCost: 15420,
    accuracyRate: 94.2,
    trends: {
      submissions: 12.5,
      processingTime: -8.3,
      tokenCost: 5.7,
      accuracy: 2.1
    }
  };

  const formPerformance = [
    { name: 'Customer Feedback Survey', submissions: 45, avgTime: '2.1s', accuracy: 96.2 },
    { name: 'Employee Onboarding', submissions: 32, avgTime: '1.8s', accuracy: 98.1 },
    { name: 'Weekly Report', submissions: 65, avgTime: '2.7s', accuracy: 91.3 }
  ];

  const architectureStats = [
    { type: 'Single-shot', usage: 45, avgCost: 85, avgTime: '1.2s' },
    { type: 'One-by-one', usage: 30, avgCost: 120, avgTime: '2.1s' },
    { type: 'Multi-agent', usage: 25, avgCost: 200, avgTime: '3.5s' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analyticsData.trends.submissions}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgProcessingTime}s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{analyticsData.trends.processingTime}%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Token Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalTokenCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+{analyticsData.trends.tokenCost}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.accuracyRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analyticsData.trends.accuracy}%</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Form Performance</CardTitle>
          <CardDescription>Performance metrics by form template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formPerformance.map((form, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{form.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {form.submissions} submissions • {form.avgTime} avg time
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={form.accuracy > 95 ? 'default' : 'secondary'}>
                    {form.accuracy}% accuracy
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Performance */}
      <Card>
        <CardHeader>
          <CardTitle>AI Architecture Performance</CardTitle>
          <CardDescription>Comparison of different processing architectures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {architectureStats.map((arch, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{arch.type}</h3>
                  <p className="text-sm text-muted-foreground">
                    {arch.usage}% usage • {arch.avgTime} avg time
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{arch.avgCost} tokens avg</div>
                  <Badge variant="outline">Cost efficiency</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
