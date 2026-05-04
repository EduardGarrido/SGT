import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const HeaderContext = createContext(null)

export function HeaderProvider({ children }) {
  const contentRef = useRef(null)
  const notifyRef = useRef(null)

  const setHeaderContent = useCallback((content) => {
    contentRef.current = content
    notifyRef.current?.()
  }, [])

  return (
    <HeaderContext.Provider value={{ contentRef, notifyRef, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader(content = null) {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error('useHeader debe usarse dentro de HeaderProvider')

  const { setHeaderContent } = ctx

  useEffect(() => {
    setHeaderContent(content)
  })

  useEffect(() => {
    return () => setHeaderContent(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function useHeaderContent() {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error('useHeaderContent debe usarse dentro de HeaderProvider')

  const { contentRef, notifyRef } = ctx
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    notifyRef.current = () => forceUpdate((n) => n + 1)
    return () => { notifyRef.current = null }
  }, [notifyRef])

  return contentRef.current
}
