"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage, isHydrated } = useTranslation();

  if (!isHydrated) {
    return <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>;
  }

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ka" : "en");
  };

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
  );
}
