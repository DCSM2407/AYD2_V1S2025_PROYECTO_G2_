// src/hooks/useConfirmation.js
import { useState, useCallback } from 'react'

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({})
  const [resolvePromise, setResolvePromise] = useState(null)

  const confirm = useCallback((options = {}) => {
    const {
      title = '¿Está seguro?',
      message = 'Esta acción no se puede deshacer',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      type = 'warning'
    } = options

    setConfig({
      title,
      message,
      confirmText,
      cancelText,
      type
    })
    setIsOpen(true)

    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    if (resolvePromise) {
      resolvePromise(true)
    }
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    if (resolvePromise) {
      resolvePromise(false)
    }
  }, [resolvePromise])

  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleCancel
  }
}
