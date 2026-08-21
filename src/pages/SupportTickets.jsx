import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { PageTitle, Card, EmptyState } from '../components/ui';
import { LifeBuoy } from 'lucide-react';

export default function SupportTickets() {
  return (
    <AdminLayout>
      <PageTitle>Support Tickets</PageTitle>
      <Card>
        <EmptyState
          icon={LifeBuoy}
          title="Coming soon"
          hint="Support ticket / interaction tracker — built by Rufus (SRS 3.6)."
        />
      </Card>
    </AdminLayout>
  );
}