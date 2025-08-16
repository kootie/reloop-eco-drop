"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import { Languages } from "lucide-react"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ka" : "en")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-green-700 hover:text-green-800 hover:bg-green-50"
    >
      <Languages className="w-4 h-4 mr-2" />
      {language === "en" ? "ქართული" : "English"}
    </Button>
  )
}
