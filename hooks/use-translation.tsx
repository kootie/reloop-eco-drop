"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type Language, type Translations, translations } from "@/lib/translations"

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
