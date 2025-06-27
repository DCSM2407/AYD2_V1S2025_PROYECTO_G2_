// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react'

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Error en la petición')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    fetchData
  }
}
