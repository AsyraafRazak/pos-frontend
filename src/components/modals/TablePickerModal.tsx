import { useEffect, useState } from 'react'
import { X, Users, RefreshCw } from 'lucide-react'
import { useTableStore } from '@/stores/useTableStore'
import { useCartStore } from '@/stores/useCartStore'
import { useUIStore } from '@/stores/useUIStore'
import type { RestaurantTable } from '@/types/pos.types'
import './TablePickerModal.css'

export function TablePickerModal() {
  const closeModal = useUIStore((s) => s.closeModal)
  const { tables, isLoading, loadTables } = useTableStore()
  const { selectedTableId, setTable } = useCartStore()

  const [selectedZone, setSelectedZone] = useState<string>('All')

  useEffect(() => {
    loadTables()
  }, [loadTables])

  // Extract unique zones
  const zones = ['All', ...Array.from(new Set(tables.map((t) => t.zone)))]

  const filteredTables =
    selectedZone === 'All'
      ? tables
      : tables.filter((t) => t.zone.toLowerCase() === selectedZone.toLowerCase())

  function handleSelect(table: RestaurantTable) {
    setTable(table.id, table.tableNumber)
    closeModal()
  }

  function handleClearTable() {
    setTable(undefined, undefined)
    closeModal()
  }

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div
        className="modal-card table-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="modal-title">Select Table</h2>
            <button
              className="btn btn--ghost btn--sm btn--icon"
              onClick={() => loadTables()}
              title="Refresh tables"
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            </button>
          </div>
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={16} />
          </button>
        </div>

        {/* Zones */}
        <div className="table-picker__zones">
          {zones.map((zone) => (
            <button
              key={zone}
              className={`table-picker__zone-pill ${selectedZone === zone ? 'active' : ''}`}
              onClick={() => setSelectedZone(zone)}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Table Grid */}
        <div className="table-picker__body">
          {isLoading && tables.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              Loading tables...
            </div>
          ) : filteredTables.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              No tables found in this zone.
            </div>
          ) : (
            <div className="table-picker__grid">
              {filteredTables.map((table) => {
                const isSelected = selectedTableId === table.id
                const isOccupied = table.status === 'Occupied'

                let cardClass = 'table-card'
                if (isSelected) cardClass += ' table-card--selected'
                else if (isOccupied) cardClass += ' table-card--occupied'
                else cardClass += ' table-card--available'

                return (
                  <div
                    key={table.id}
                    className={cardClass}
                    onClick={() => handleSelect(table)}
                  >
                    <div className="table-card__number">{table.tableNumber}</div>
                    <div className="table-card__zone">{table.zone}</div>
                    <span className="table-card__status">{table.status}</span>
                    <div className="table-card__capacity">
                      <Users size={10} style={{ display: 'inline', marginRight: '3px' }} />
                      {table.capacity} seats
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="table-picker__footer">
          <div className="table-picker__legend">
            <div className="table-picker__legend-item">
              <div className="table-picker__dot table-picker__dot--available" />
              <span>Available</span>
            </div>
            <div className="table-picker__legend-item">
              <div className="table-picker__dot table-picker__dot--occupied" />
              <span>Occupied</span>
            </div>
            <div className="table-picker__legend-item">
              <div className="table-picker__dot table-picker__dot--selected" />
              <span>Selected</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedTableId && (
              <button
                className="btn btn--outline btn--sm"
                onClick={handleClearTable}
              >
                Clear Table
              </button>
            )}
            <button className="btn btn--ghost btn--sm" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

