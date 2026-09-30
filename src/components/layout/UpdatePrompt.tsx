import { RefreshCw } from 'lucide-react'
import './UpdatePrompt.css'

interface UpdatePromptProps {
  onUpdate: () => void
  onDismiss: () => void
}

export function UpdatePrompt({ onUpdate, onDismiss }: UpdatePromptProps) {
  return (
    <div className="update-prompt" role="alert" aria-live="polite">
      <RefreshCw size={16} className="update-prompt__icon" />
      <span className="update-prompt__text">A new version is available.</span>
      <button className="update-prompt__btn update-prompt__btn--primary" onClick={onUpdate}>
        Update now
      </button>
      <button className="update-prompt__btn update-prompt__btn--dismiss" onClick={onDismiss} aria-label="Dismiss update notification">
        Later
      </button>
    </div>
  )
}
