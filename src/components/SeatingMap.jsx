import { colors, radius, font } from '../styles/tokens';

// Status -> visual treatment. Matches the `availability` field returned by
// GET /api/reservations/availability (not table.status directly — that
// field tracks live floor state, this tracks bookability for one date+slot).
const STATUS_STYLES = {
  available: { bg: colors.success || '#4caf50', label: 'Available' },
  booked: { bg: '#e57373', label: 'Booked' },
  unavailable: { bg: colors.textMuted || '#888', label: 'Out of service' },
};

export default function SeatingMap({ tables, selectedTableId, onSelectTable }) {
  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '14px', fontSize: '12px', color: colors.textMuted }}>
        {Object.entries(STATUS_STYLES).map(([key, s]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.bg, display: 'inline-block' }} />
            {s.label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors.accent, display: 'inline-block' }} />
          Selected
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          background: colors.panelAlt,
          border: `1px solid ${colors.border || '#e5e5e5'}`,
          borderRadius: radius.md,
          overflow: 'hidden',
        }}
      >
        {tables.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, fontSize: '13px' }}>
            No tables set up yet.
          </div>
        )}

        {tables.map((table) => {
          const isSelected = table._id === selectedTableId;
          const isPickable = table.availability === 'available';
          const style = STATUS_STYLES[table.availability] || STATUS_STYLES.unavailable;

          return (
            <button
              key={table._id}
              type="button"
              disabled={!isPickable}
              onClick={() => onSelectTable(table)}
              title={`Table ${table.tableNumber} · seats ${table.capacity} · ${style.label}`}
              style={{
                position: 'absolute',
                left: `${table.x}%`,
                top: `${table.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '58px',
                height: '58px',
                borderRadius: table.shape === 'round' ? '50%' : '8px',
                border: isSelected ? `3px solid ${colors.accent}` : '2px solid rgba(255,255,255,0.25)',
                background: isSelected ? colors.accent : style.bg,
                color: '#fff',
                fontFamily: font.body,
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isPickable ? 'pointer' : 'not-allowed',
                opacity: isPickable || isSelected ? 1 : 0.55,
                transition: 'all .15s ease',
              }}
            >
              <span>#{table.tableNumber}</span>
              <span style={{ fontSize: '9.5px', fontWeight: 500 }}>{table.capacity} seats</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}