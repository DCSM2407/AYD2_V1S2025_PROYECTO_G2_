// src/components/UI/ActionButtons.jsx
import Button from './Button'

const ActionButtons = ({
  onSave,
  onEdit,
  onCancel,
  showSave = true,
  showEdit = true,
  showCancel = true,
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`flex gap-3 ${className}`}>
      {showSave && (
        <Button
          onClick={onSave}
          disabled={disabled}
          variant="primary"
          className="flex items-center"
        >
          💾 Guardar
        </Button>
      )}
      {showEdit && (
        <Button
          onClick={onEdit}
          disabled={disabled}
          variant="secondary"
          className="flex items-center"
        >
          ✏️ Editar
        </Button>
      )}
      {showCancel && (
        <Button
          onClick={onCancel}
          disabled={disabled}
          variant="danger"
          className="flex items-center"
        >
          ❌ Cancelar
        </Button>
      )}
    </div>
  )
}

export default ActionButtons
