import { useEffect, useState } from 'react';
import { LifeBuoy, MessageSquarePlus } from 'lucide-react';
import { getSupportTickets, createSupportTicket, updateSupportTicket } from '../api/rufus';
import { colors, statusColor, radius, font } from '../styles/tokens';
import AdminLayout from '../components/AdminLayout';
import { Card, Select, Input, Button, StatusPill, PageTitle, ErrorText, EmptyState } from '../components/ui';

const STATUSES = ['open', 'in-progress', 'resolved'];

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getSupportTickets()
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id, status) => {
    setError('');
    try {
      await updateSupportTicket(id, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createSupportTicket({ subject, customerName, message });
      setSubject('');
      setCustomerName('');
      setMessage('');
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const counts = STATUSES.map((s) => ({ status: s, n: tickets.filter((t) => t.status === s).length }));
  const resolvedCount = counts.find((c) => c.status === 'resolved')?.n ?? 0;
  const visibleTickets = showResolved ? tickets : tickets.filter((t) => t.status !== 'resolved');

  return (
    <AdminLayout title="Support Tickets">
      <PageTitle
        subtitle={`${tickets.length} tickets logged`}
        action={
          <Button onClick={() => setFormOpen((v) => !v)}>
            <MessageSquarePlus size={15} />
            {formOpen ? 'Cancel' : 'New Ticket'}
          </Button>
        }
      >
        Support Tickets
      </PageTitle>

      {formOpen && (
        <Card style={{ marginBottom: '20px' }}>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Who's this for?"
              />
              <Input
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary"
                required
              />
            </div>
            <Input
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What did the customer say or ask?"
              required
            />
            <div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Logging…' : 'Log Ticket'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {counts.map(({ status, n }) => (
          <Card key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: `${statusColor(status)}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: statusColor(status),
              }}
            >
              <LifeBuoy size={18} />
            </div>
            <div>
              <div style={{ fontFamily: font.display, fontSize: '20px', fontWeight: 700 }}>{n}</div>
              <div style={{ color: colors.textMuted, fontSize: '11px', textTransform: 'capitalize' }}>{status}</div>
            </div>
          </Card>
        ))}
      </div>

      {resolvedCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={() => setShowResolved((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: radius.pill,
              border: `1px solid ${colors.border}`,
              background: showResolved ? `${colors.accent}15` : colors.panel,
              color: showResolved ? colors.accent : colors.textMuted,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showResolved ? 'Hide resolved' : `Show resolved (${resolvedCount})`}
          </button>
        </div>
      )}

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading tickets…</div>
      ) : tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No tickets yet" hint="Customer support requests and feedback will appear here." />
      ) : visibleTickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No open tickets"
          hint={`All ${resolvedCount} tickets are resolved. Toggle "Show resolved" above to see them.`}
        />
      ) : (
        visibleTickets.map((ticket) => (
          <Card key={ticket._id} hover style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: font.display, fontWeight: 700 }}>
                  {ticket.subject}
                  {ticket.customerName ? ` · ${ticket.customerName}` : ''}
                </div>
                <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '5px', maxWidth: '520px' }}>
                  {ticket.message}
                </div>
                <div style={{ color: colors.textMuted, fontSize: '11px', marginTop: '8px' }}>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <StatusPill status={ticket.status} color={statusColor(ticket.status)} />
                <Select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                  style={{ padding: '9px 12px', width: 'auto', borderRadius: radius.pill }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>
        ))
      )}
    </AdminLayout>
  );
}