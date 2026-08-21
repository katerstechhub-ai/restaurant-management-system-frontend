import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { PageTitle, Card, EmptyState } from '../components/ui';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <AdminLayout>
      <PageTitle>Analytics</PageTitle>
      <Card>
        <EmptyState
          icon={BarChart3}
          title="Coming soon"
          hint="Sales trends, top-selling dishes, customer segments — built by Rufus (SRS 3.7)."
        />
      </Card>
    </AdminLayout>
  );
}