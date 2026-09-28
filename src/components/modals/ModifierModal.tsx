import { useState } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { useCartStore } from '@/stores/useCartStore'
import { PRODUCT_MODIFIERS } from '@/data/mockData'
import { generateCartItemId, formatCurrency } from '@/lib/utils'
import type { CartItemModifier } from '@/types/pos.types'
import './ModifierModal.css'

export function ModifierModal() {
  const product = useUIStore((s) => s.selectedProduct)
  const closeModal = useUIStore((s) => s.closeModal)
  const addItem = useCartStore((s) => s.addItem)

  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  // selectedOptions: groupId → selected modifier options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, CartItemModifier[]>>({})

  if (!product) return null

  const modifierGroups = PRODUCT_MODIFIERS[product.id] ?? []

  function toggleOption(groupId: string, option: CartItemModifier, multiSelect: boolean) {
    setSelectedOptions((prev) => {
      const current = prev[groupId] ?? []
      if (multiSelect) {
        const exists = current.some((o) => o.id === option.id)
        return {
          ...prev,
          [groupId]: exists
            ? current.filter((o) => o.id !== option.id)
            : [...current, option],
        }
      } else {
        // Single-select: toggle off if already selected
        const alreadySelected = current.length === 1 && current[0].id === option.id
        return { ...prev, [groupId]: alreadySelected ? [] : [option] }
      }
    })
  }

  const allModifiers = Object.values(selectedOptions).flat()
  const modifierExtra = allModifiers.reduce((s, m) => s + m.price, 0)
  const unitTotal = product.price + modifierExtra
  const lineTotal = unitTotal * quantity

  function handleAddToCart() {
    if (!product) return
    addItem({
      id: generateCartItemId(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      modifiers: allModifiers.length > 0 ? allModifiers : undefined,
      note: note.trim() || undefined,
    })
    closeModal()
  }

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal modifier-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <div>
            <p className="modal__title">{product.name}</p>
            <p className="modifier-modal__base-price">{formatCurrency(product.price)}</p>
          </div>
          <button className="modal__close" onClick={closeModal}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {modifierGroups.map((group) => {
            const selected = selectedOptions[group.id] ?? []
            return (
              <div key={group.id} className="modifier-group">
                <p className="modifier-group__label">
                  {group.name}
                  {group.multiSelect && (
                    <span className="modifier-group__hint"> · choose multiple</span>
                  )}
                </p>
                <div className="modifier-group__options">
                  {group.options.map((option) => {
                    const isSelected = selected.some((o) => o.id === option.id)
                    return (
                      <button
                        key={option.id}
                        className={`modifier-option no-select ${isSelected ? 'modifier-option--selected' : ''}`}
                        onClick={() =>
                          toggleOption(group.id, option, group.multiSelect ?? false)
                        }
                      >
                        <span>{option.name}</span>
                        {option.price > 0 && (
                          <span className="modifier-option__price">
                            +{formatCurrency(option.price)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Special Instructions */}
          <div className="form-group modifier-modal__note">
            <label className="form-label">Special Instructions</label>
            <textarea
              className="form-input form-textarea"
              placeholder="e.g. no onions, extra sauce…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
            />
          </div>
        </div>

        {/* Footer: qty stepper + Add to Cart */}
        <div className="modal__footer">
          <div className="modifier-modal__qty">
            <button
              className="modifier-modal__qty-btn no-select"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus size={12} />
            </button>
            <span className="modifier-modal__qty-value">{quantity}</span>
            <button
              className="modifier-modal__qty-btn no-select"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            className="btn btn--primary btn--full btn--lg"
            onClick={handleAddToCart}
          >
            Add to Cart &nbsp;·&nbsp; {formatCurrency(lineTotal)}
          </button>
        </div>
      </div>
    </div>
  )
}
