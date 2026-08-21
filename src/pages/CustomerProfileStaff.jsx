import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { PageTitle, Card, EmptyState } from '../components/ui';
import { Users } from 'lucide-react';

export default function CustomerProfileStaff() {
  return (
    <AdminLayout>
      <PageTitle>Customer Profiles</PageTitle>
      <Card>
        <EmptyState
          icon={Users}
          title="Coming soon"
          hint="Staff view of customer order history, preferences, and feedback log — built by Rufus (SRS 3.6)."
        />
      </Card>
    </AdminLayout>
  );
}