"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Camera,
  QrCode,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import LanguageSwitcher from "@/components/language-switcher";

interface BinLocation {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  qrCode: string;
  status: "active" | "inactive";
  totalDrops: number;
}

interface DropProcessProps {
  user: { userId: string; email: string; cardanoAddress?: string };
  selectedBin: BinLocation | null;
  onBack: () => void;
  onComplete: () => void;
}

type DropStep =
  | "scan-qr"
  | "take-photo"
  | "select-item"
  | "confirm"
  | "success";

export default function DropProcess({
  user,
  selectedBin,
  onBack,
  onComplete,
}: DropProcessProps) {
  const [currentStep, setCurrentStep] = useState<DropStep>("scan-qr");
  const [scannedQR, setScannedQR] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { t, isHydrated } = useTranslation();

  useEffect(() => {
    if (!isHydrated) return;

    getCurrentUserLocation();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getCurrentUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation({ lat: 42.5092, lng: 41.8712 });
        },
      );
    }
  };

  const steps = [
    {
      id: "scan-qr",
      title: t.drop.scanQR,
      description: t.drop.scanQRDescription,
    },
    {
      id: "take-photo",
      title: t.drop.takePhoto,
      description: t.drop.takePhotoDescription,
    },
    {
      id: "select-item",
      title: t.drop.selectItem,
      description: t.drop.selectItemDescription,
    },
    {
      id: "confirm",
      title: t.drop.confirmDrop,
      description: t.drop.reviewDetails,
    },
    {
      id: "success",
      title: t.common.success,
      description: t.drop.dropSuccessDescription,
    },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex((step) => step.id === currentStep);

  const submitDrop = async () => {
    if (!selectedBin || !capturedPhoto || !selectedItem || !userLocation) {
      setError("Missing required information");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert photo to blob
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("photo", blob, "ewaste-photo.jpg");
      formData.append("userId", user.userId);
      formData.append("binQrCode", scannedQR || selectedBin.qrCode);
      formData.append("binLocation", JSON.stringify(selectedBin.coordinates));
      formData.append("userLocation", JSON.stringify(userLocation));
      formData.append("deviceType", selectedItem);

      const dropResponse = await fetch("/api/drops/submit", {
        method: "POST",
        body: formData,
      });

      const data = await dropResponse.json();

      if (data.success) {
        setCurrentStep("success");
      } else {
        setError(data.error || "Failed to submit drop");
      }
    } catch (error) {
      console.error("Drop submission error:", error);
      setError(t.auth.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemOptions = () => {
    return [
      { id: "smartphone", label: t.items.smartphone, reward: "3 ADA" },
      { id: "laptop", label: t.items.laptop, reward: "5 ADA" },
      { id: "phone_charger", label: t.items.phoneCharger, reward: "1 ADA" },
      { id: "headphones", label: t.items.headphones, reward: "1.5 ADA" },
      { id: "tablet", label: t.items.tablet, reward: "5 ADA" },
      { id: "other", label: t.items.other, reward: "Variable" },
    ];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "scan-qr":
        return (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <QrCode className="w-5 h-5" />
                {t.drop.scanQR}
              </CardTitle>
              <CardDescription>
                {t.drop.scanQRDescription}: {selectedBin?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-100 rounded-lg p-8 text-center border-2 border-dashed border-green-300">
                <QrCode className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-green-700 font-medium mb-2">
                  {t.drop.pointCamera}
                </p>
                <p className="text-green-600 text-sm mb-4">
                  {t.drop.expectedQR}: {selectedBin?.qrCode.slice(0, 20)}...
                </p>
                <Button
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      if (selectedBin) {
                        setScannedQR(selectedBin.qrCode);
                        setCurrentStep("take-photo");
                      }
                      setIsLoading(false);
                    }, 2000);
                  }}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.drop.scanning}
                    </>
                  ) : (
                    t.drop.simulateQRScan
                  )}
                </Button>
              </div>
              {scannedQR && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{t.drop.qrScanned}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "take-photo":
        return (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Camera className="w-5 h-5" />
                {t.drop.takePhoto}
              </CardTitle>
              <CardDescription>{t.drop.takePhotoDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "environment" },
                      });
                      streamRef.current = stream;
                      if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                      }
                    } catch (error) {
                      console.error("Error accessing camera:", error);
                      setError(
                        "Unable to access camera. Please check permissions.",
                      );
                    }
                  }}
                  variant="outline"
                  className="border-green-200 text-green-700"
                >
                  {t.drop.startCamera}
                </Button>
                <Button
                  onClick={() => {
                    if (videoRef.current && canvasRef.current) {
                      const canvas = canvasRef.current;
                      const video = videoRef.current;
                      const context = canvas.getContext("2d");

                      if (context) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        context.drawImage(video, 0, 0);

                        const photoDataUrl = canvas.toDataURL(
                          "image/jpeg",
                          0.8,
                        );
                        setCapturedPhoto(photoDataUrl);
                        if (streamRef.current) {
                          streamRef.current
                            .getTracks()
                            .forEach((track) => track.stop());
                          streamRef.current = null;
                        }
                        setCurrentStep("select-item");
                      }
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!streamRef.current}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t.drop.capturePhoto}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "select-item":
        return (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">
                {t.drop.selectItem}
              </CardTitle>
              <CardDescription>{t.drop.selectItemDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {capturedPhoto && (
                <div className="mb-4">
                  <img
                    src={capturedPhoto || "/placeholder.svg"}
                    alt="Captured e-waste"
                    className="w-full h-32 object-cover rounded-lg border border-green-200"
                  />
                </div>
              )}
              <div className="grid gap-3">
                {getItemOptions().map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className={`justify-between border-green-200 text-left h-auto p-4 ${
                      selectedItem === item.id
                        ? "bg-green-50 border-green-500"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedItem(item.id);
                      setCurrentStep("confirm");
                    }}
                  >
                    <div>
                      <p className="font-medium text-green-800">{item.label}</p>
                      <p className="text-sm text-green-600">
                        Reward: {item.reward}
                      </p>
                    </div>
                    {selectedItem === item.id && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "confirm":
        return (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">
                {t.drop.confirmDrop}
              </CardTitle>
              <CardDescription>{t.drop.reviewDetails}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                  <span className="text-green-700">{t.drop.binLocation}</span>
                  <span className="text-green-800 font-medium">
                    {selectedBin?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                  <span className="text-green-700">{t.drop.itemType}</span>
                  <span className="text-green-800 font-medium capitalize">
                    {selectedItem &&
                      t.items[selectedItem as keyof typeof t.items]}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                  <span className="text-green-700">
                    {t.drop.estimatedReward}
                  </span>
                  <Badge className="bg-green-600">
                    {selectedItem === "smartphone"
                      ? "3 ADA"
                      : selectedItem === "laptop"
                        ? "5 ADA"
                        : selectedItem === "tablet"
                          ? "5 ADA"
                          : selectedItem === "headphones"
                            ? "1.5 ADA"
                            : selectedItem === "phone_charger"
                              ? "1 ADA"
                              : "Variable"}
                  </Badge>
                </div>
              </div>
              {capturedPhoto && (
                <div>
                  <p className="text-sm text-green-700 mb-2">{t.drop.photo}:</p>
                  <img
                    src={capturedPhoto || "/placeholder.svg"}
                    alt="E-waste item"
                    className="w-full h-32 object-cover rounded-lg border border-green-200"
                  />
                </div>
              )}
              <Button
                onClick={submitDrop}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.drop.submittingDrop}
                  </>
                ) : (
                  t.drop.submitAndEarn
                )}
              </Button>
            </CardContent>
          </Card>
        );

      case "success":
        return (
          <Card className="border-green-500 bg-green-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                {t.drop.youAreHero}
              </CardTitle>
              <CardDescription className="text-green-700">
                {t.drop.dropSuccessDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <p className="text-green-800 font-semibold mb-2">
                  {t.drop.rewardEarned}
                </p>
                <Badge className="bg-green-600 text-lg px-4 py-2">
                  {selectedItem === "smartphone"
                    ? "3 ADA"
                    : selectedItem === "laptop"
                      ? "5 ADA"
                      : selectedItem === "tablet"
                        ? "5 ADA"
                        : selectedItem === "headphones"
                          ? "1.5 ADA"
                          : selectedItem === "phone_charger"
                            ? "1 ADA"
                            : "1 ADA"}
                </Badge>
              </div>
              <p className="text-green-600 text-sm">
                {t.drop.rewardProcessing}
              </p>
              <Button
                onClick={onComplete}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {t.drop.returnHome}
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-green-700 hover:text-green-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.common.back}
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-green-800">
                {t.drop.dropProcess}
              </h1>
              <p className="text-sm text-green-600">{selectedBin?.name}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        <Card className="mb-6 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">
                {t.drop.stepOf} {getCurrentStepIndex() + 1} of {steps.length}
              </span>
              <span className="text-sm text-green-600">
                {steps[getCurrentStepIndex()]?.title}
              </span>
            </div>
            <Progress
              value={((getCurrentStepIndex() + 1) / steps.length) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        {renderStepContent()}
      </main>
    </div>
  );
}
