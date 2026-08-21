import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getCustomers, getCustomerById, updateCustomerPreferences, addCustomerFeedback } from '../api/rufus';
import { PageTitle, Card, Button, Input, ErrorText, StatusPill, EmptyState } from '../components/ui';
import { colors, font, radius } from '../styles/tokens';
import { Users, Star } from 'lucide-react';

const SEGMENT_COLOR = { new: '#3498db', regular: '#f5a623', vip: '#4caf50' };

export default function CustomerProfileStaff() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [prefsInput, setPrefsInput] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  const openCustomer = async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    setSaveError('');
    try {
      const data = await getCustomerById(id);
      setDetail(data);
      setPrefsInput((data.preferences || []).join(', '));
    } catch (err) {
      setSaveError('Failed to load customer details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaveError('');
    try {
      const preferences = prefsInput.split(',').map(p => p.trim()).filter(Boolean);
      const updated = await updateCustomerPreferences(selectedId, preferences);
      setDetail({ ...detail, preferences: updated.preferences });
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update preferences');
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setSaveError('');
    try {
      const updated = await addCustomerFeedback(selectedId, { comment: feedbackComment, rating: feedbackRating });
      setDetail({ ...detail, feedback: updated.feedback });
      setFeedbackComment('');
      setFeedbackRating(5);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to add feedback');
    }
  };

  return (
    <AdminLayout>
      <PageTitle subtitle="Staff view — order history, preferences, and feedback log">
        Customer Profiles
      </PageTitle>

      {error && <ErrorText>{error}</ErrorText>}

      <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1fr 1.2fr' : '1fr', gap: '20px', alignItems: 'start' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '20px' }}>Loading customers...</p>
          ) : customers.length === 0 ? (
            <EmptyState icon={Users} title="No customers yet" />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: font.body, fontSize: '14px' }}>
              <thead>
                <tr style={{ background: colors.panelAlt, borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '14px 16px', color: colors.textMuted, fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '14px 16px', color: colors.textMuted, fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '14px 16px', color: colors.textMuted, fontWeight: 600 }}>Segment</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => openCustomer(c._id)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      background: selectedId === c._id ? colors.panelAlt : 'transparent',
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{c.user?.name || '—'}</td>
                    <td style={{ padding: '14px 16px', color: colors.textMuted }}>{c.user?.email || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusPill status={c.segment} color={SEGMENT_COLOR[c.segment] || colors.textMuted} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {selectedId && (
          <Card>
            {detailLoading ? (
              <p>Loading details...</p>
            ) : detail ? (
              <>
                <h3 style={{ margin: '0 0 4px 0', fontFamily: font.display }}>{detail.user?.name}</h3>
                <p style={{ margin: '0 0 20px 0', color: colors.textMuted, fontSize: '13px' }}>{detail.user?.email}</p>

                {saveError && <ErrorText>{saveError}</ErrorText>}

                <div style={{ marginBottom: '20px' }}>
                  <Input
                    label="Preferences (comma-separated)"
                    value={prefsInput}
                    onChange={(e) => setPrefsInput(e.target.value)}
                  />
                  <Button variant="soft" style={{ marginTop: '10px' }} onClick={savePreferences}>Save Preferences</Button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Order History
                  </h4>
                  {(detail.orderHistory || []).length === 0 ? (
                    <p style={{ color: colors.textMuted, fontSize: '13px' }}>No orders yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {detail.orderHistory.map((o) => (
                        <div
                          key={o._id}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 12px', background: colors.panelAlt, borderRadius: radius.sm, fontSize: '13px',
                          }}
                        >
                          <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                          <StatusPill status={o.status} color={colors.textMuted} />
                          <span style={{ fontWeight: 600 }}>${(o.totalAmount || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Feedback Log
                  </h4>
                  {(detail.feedback || []).map((f, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        {Array.from({ length: f.rating || 0 }).map((_, s) => (
                          <Star key={s} size={12} fill={colors.accent} color={colors.accent} />
                        ))}
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: colors.text }}>{f.comment}</p>
                    </div>
                  ))}

                  <form onSubmit={submitFeedback} style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        label="Add feedback"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Feedback comment"
                        required
                      />
                    </div>
                    <Input
                      label="Rating"
                      type="number"
                      min="1"
                      max="5"
                      value={feedbackRating}
                      onChange={(e) => setFeedbackRating(Number(e.target.value))}
                      style={{ width: '70px' }}
                    />
                    <Button type="submit">Add</Button>
                  </form>
                </div>
              </>
            ) : null}
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}