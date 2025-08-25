"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Zap,
  Skull,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import LanguageSwitcher from "@/components/language-switcher";
import Link from "next/link";

interface RiskLevel {
  level: number;
  name: string;
  risk: string;
  materials: string;
  examples: string[];
  disposal: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const riskLevels: RiskLevel[] = [
  {
    level: 1,
    name: "Safe",
    risk: "Minimal environmental impact",
    materials: "Mostly non-toxic materials like plastic, copper, and aluminum",
    examples: ["USB cables", "Phone chargers", "Audio cables", "HDMI cables"],
    disposal: "Easy to recycle with standard electronic waste processes",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    level: 2,
    name: "Low Risk",
    risk: "Low environmental risk",
    materials: "Some rare earth elements but mostly safe materials",
    examples: [
      "LED bulbs",
      "CFL lights",
      "Small electronics",
      "Computer mice",
      "Keyboards",
    ],
    disposal:
      "Requires specialized recycling for glass and phosphor components",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    level: 3,
    name: "Medium Risk",
    risk: "Moderate environmental impact",
    materials: "Contains lithium, cobalt, and moderately toxic elements",
    examples: [
      "Smartphones",
      "Small appliances",
      "Wireless devices",
      "Bluetooth speakers",
    ],
    disposal:
      "Professional e-waste recycling required for safe material recovery",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    level: 4,
    name: "High Risk",
    risk: "High environmental risk",
    materials:
      "Heavy metals, complex electronic components, and rare earth elements",
    examples: ["Laptops", "Tablets", "Gaming devices", "Monitors"],
    disposal:
      "Specialized facility required for safe dismantling and material recovery",
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    level: 5,
    name: "Very High Risk",
    risk: "Very high environmental risk",
    materials:
      "Lithium-ion cells, heavy metals, toxic electrolytes, and complex circuits",
    examples: [
      "Power banks",
      "Laptop batteries",
      "Electric tool batteries",
      "UPS batteries",
    ],
    disposal:
      "Hazardous waste protocols required. Special handling for battery components",
    icon: Skull,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export default function GuidelinesPage() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const { isHydrated } = useTranslation();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getLevelBadgeVariant = (level: number) => {
    switch (level) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      case 4:
        return "destructive";
      case 5:
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-green-800">
              E-Waste Safety Guidelines
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              E-Waste Collection Guidelines
            </CardTitle>
            <CardDescription>
              Understanding the environmental impact and proper disposal methods
              for different types of electronic waste. All items are categorized
              by risk level to ensure safe handling and processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-green-700 mb-2">
                  Why Proper E-Waste Disposal Matters:
                </h3>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Prevents toxic materials from entering landfills</li>
                  <li>
                    • Recovers valuable materials like rare earth elements
                  </li>
                  <li>• Reduces environmental contamination</li>
                  <li>• Supports circular economy principles</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-green-700 mb-2">
                  Earn Cardano Rewards:
                </h3>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Higher risk levels = Higher ADA rewards</li>
                  <li>
                    • All items properly processed by certified facilities
                  </li>
                  <li>• Track your environmental impact</li>
                  <li>• Contribute to a cleaner Georgia</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Level Overview */}
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          {riskLevels.map((level) => {
            const IconComponent = level.icon;
            return (
              <Card
                key={level.level}
                className={`cursor-pointer transition-all border-2 ${
                  selectedLevel === level.level
                    ? "ring-2 ring-green-500 border-green-500"
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() =>
                  setSelectedLevel(
                    selectedLevel === level.level ? null : level.level,
                  )
                }
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-12 h-12 ${level.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}
                  >
                    <IconComponent className={`w-6 h-6 ${level.color}`} />
                  </div>
                  <Badge
                    variant={getLevelBadgeVariant(level.level)}
                    className="mb-2"
                  >
                    Level {level.level}
                  </Badge>
                  <h3 className="font-semibold text-sm mb-1">{level.name}</h3>
                  <p className="text-xs text-gray-600">{level.risk}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Information */}
        {selectedLevel && (
          <Card className="mb-8 border-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                {(() => {
                  const level = riskLevels.find(
                    (l) => l.level === selectedLevel,
                  )!;
                  const IconComponent = level.icon;
                  return (
                    <>
                      <div
                        className={`w-10 h-10 ${level.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <IconComponent className={`w-5 h-5 ${level.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-green-800">
                          Level {selectedLevel}:{" "}
                          {
                            riskLevels.find((l) => l.level === selectedLevel)
                              ?.name
                          }
                        </CardTitle>
                        <CardDescription>
                          {
                            riskLevels.find((l) => l.level === selectedLevel)
                              ?.risk
                          }
                        </CardDescription>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const level = riskLevels.find(
                  (l) => l.level === selectedLevel,
                )!;
                return (
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3">
                        Materials Composition
                      </h4>
                      <p className="text-sm text-green-600 mb-4">
                        {level.materials}
                      </p>

                      <h4 className="font-semibold text-green-700 mb-3">
                        Example Items
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {level.examples.map((item, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-700 mb-3">
                        Disposal Requirements
                      </h4>
                      <p className="text-sm text-green-600">{level.disposal}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-700 mb-3">
                        Reward Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Base Rate:</span>
                          <span className="font-semibold text-green-700">
                            {(selectedLevel * 0.5).toFixed(1)} ADA/kg
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">
                            Processing Time:
                          </span>
                          <span className="font-semibold text-green-700">
                            {selectedLevel <= 2
                              ? "24-48h"
                              : selectedLevel <= 4
                                ? "48-72h"
                                : "72-96h"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* All Items List */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              Complete Item Categories
            </CardTitle>
            <CardDescription>
              Browse all accepted e-waste items organized by safety level. Click
              on a level above for detailed information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {riskLevels.map((level) => {
                const IconComponent = level.icon;
                return (
                  <div
                    key={level.level}
                    className={`p-4 rounded-lg ${level.bgColor} border border-gray-200`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent className={`w-5 h-5 ${level.color}`} />
                      <h3 className="font-semibold text-lg">
                        Level {level.level}: {level.name}
                      </h3>
                      <Badge variant={getLevelBadgeVariant(level.level)}>
                        {(level.level * 0.5).toFixed(1)} ADA/kg
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Accepted Items:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {level.examples.map((item, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Safety Information:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {level.materials}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Important Safety Notice */}
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">
                  Important Safety Notice
                </h3>
                <div className="text-sm text-red-700 space-y-1">
                  <p>
                    • Never attempt to disassemble electronic devices yourself
                  </p>
                  <p>
                    • Handle batteries with extreme care - avoid puncturing or
                    crushing
                  </p>
                  <p>
                    • If you notice any leaking fluids or strong odors, do not
                    handle the item
                  </p>
                  <p>
                    • Contact our support team for guidance on unusual or
                    damaged items
                  </p>
                  <p>
                    • All items are processed by certified e-waste recycling
                    facilities
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
