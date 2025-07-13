import { useCallback, useEffect, useState } from 'react'
import { ModelName, modelNameSchema } from '~/constants/ai-models'

const getPreferredModel = (): ModelName | undefined => {
  if (typeof localStorage === 'undefined') {
    return undefined
  }
  const result = modelNameSchema.safeParse(
    localStorage.getItem('preferredModel')
  )
  if (result.success) {
    return result.data
  }
  return 'gemini-2.5-flash'
}

export default function useSelectedModel() {
  const [selectedModel, setSelectedModel] = useState(getPreferredModel())

  useEffect(() => {
    console.log('useEffect', getPreferredModel())
    setSelectedModel(getPreferredModel()) // Overwrite default model on client
  }, [])

  const updateSelectedModel = useCallback((model: ModelName) => {
    localStorage.setItem('preferredModel', model)
    setSelectedModel(model)
  }, [])

  console.log('selectedModel', selectedModel, new Date().toISOString())
  return {
    selectedModel,
    updateSelectedModel,
  }
}
