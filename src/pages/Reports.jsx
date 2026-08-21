import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { PageTitle, Card, EmptyState } from '../components/ui';
import { FileDown } from 'lucide-react';

export default function Reports() {
  return (
    <AdminLayout>
      <PageTitle>Reports</PageTitle>
      <Card>
        <EmptyState
          icon={FileDown}
          title="Coming soon"
          hint="Select report type + date range, trigger export — built by Rufus (SRS 3.7)."
        />
      </Card>
    </AdminLayout>
  );
}