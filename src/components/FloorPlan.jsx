import { colors } from '../styles/tokens';

export default function FloorPlan({ tables, bookedTableIds, selectedTableId, onSelectTable }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        background: colors.bg,
        border: `1px solid ${colors.border || '#e5e5e5'}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {tables.map((table) => {
        const isBooked = bookedTableIds.has(table._id);
        const isSelected = table._id === selectedTableId;

        return (
          <button
            key={table._id}
            type="button"
            disabled={isBooked}
            onClick={() => onSelectTable(table)}
            title={`Table ${table.tableNumber} · seats ${table.capacity}`}
            style={{
              position: 'absolute',
              left: `${table.x}%`,
              top: `${table.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '56px',
              height: '56px',
              borderRadius: table.shape === 'round' ? '50%' : '8px',
              border: isSelected ? `2px solid ${colors.accent}` : '2px solid transparent',
              background: isBooked ? '#e57373' : isSelected ? colors.accent : '#81c784',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isBooked ? 'not-allowed' : 'pointer',
              opacity: isBooked ? 0.7 : 1,
            }}
          >
            <span>#{table.tableNumber}</span>
            <span style={{ fontSize: '10px', fontWeight: 400 }}>{table.capacity} seats</span>
          </button>
        );
      })}
    </div>
  );
}