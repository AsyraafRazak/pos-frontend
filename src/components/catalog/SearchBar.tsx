import { Search, X, Scan } from 'lucide-react'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onBarcode: (barcode: string) => void
  onSubmit?: () => void
}

export function SearchBar({ value, onChange, onBarcode, onSubmit }: SearchBarProps) {
  useBarcodeScanner(onBarcode)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit()
    }
  }

  return (
    <div className="searchbar">
      <Search size={15} className="searchbar__icon" />
      <input
        className="searchbar__input"
        type="text"
        placeholder="Search products or scan barcode..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {value ? (
        <button className="searchbar__clear no-select" onClick={() => onChange('')} aria-label="Clear search">
          <X size={14} />
        </button>
      ) : (
        <Scan size={14} className="searchbar__scan-icon" />
      )}
    </div>
  )
}
