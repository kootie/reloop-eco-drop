"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Eye,
  User,
  Wallet,
  Calendar,
  Coins,
  AlertTriangle,
  CheckSquare,
  Square,
  Loader2,
  Users,
} from "lucide-react";

interface PendingSubmission {
  id: string;
  dropId: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  userCardanoAddress?: string;
  deviceType: string;
  deviceName: string;
  deviceCategory: string;
  estimatedRewardAda: number;
  actualWeightKg?: number;
  photo: string;
  submittedAt: string;
  binLocation: string;
  userLocation: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}

interface AdminVerificationProps {
  admin: {
    username: string;
    role: string;
    token: string;
  };
}

export default function AdminVerification({ admin }: AdminVerificationProps) {
  const [pendingSubmissions, setPendingSubmissions] = useState<
    PendingSubmission[]
  >([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<PendingSubmission | null>(null);
  const [batchNotes, setBatchNotes] = useState("");
  const [filter, setFilter] = useState<
    "all" | "verified-users" | "unverified-users"
  >("all");

  const loadPendingSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const url =
        filter === "all"
          ? "/api/admin/submissions/pending"
          : `/api/admin/submissions/pending?userFilter=${filter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPendingSubmissions(data.submissions);
      } else {
        console.error("Failed to load submissions:", data.error);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, admin.token]);

  useEffect(() => {
    loadPendingSubmissions();
  }, [loadPendingSubmissions]);

  const toggleSubmissionSelection = (submissionId: string) => {
    const newSelection = new Set(selectedSubmissions);
    if (newSelection.has(submissionId)) {
      newSelection.delete(submissionId);
    } else {
      newSelection.add(submissionId);
    }
    setSelectedSubmissions(newSelection);
  };

  const selectAllSubmissions = () => {
    if (selectedSubmissions.size === pendingSubmissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(pendingSubmissions.map((s) => s.id)));
    }
  };

  const processBatchApproval = async () => {
    if (selectedSubmissions.size === 0) {
      alert("Please select at least one submission to approve");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve ${selectedSubmissions.size} submissions and process ADA payments?`,
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const selectedSubmissionsList = pendingSubmissions.filter((s) =>
        selectedSubmissions.has(s.id),
      );

      const requestBody = {
        submissions: selectedSubmissionsList.map((s) => ({
          dropId: s.dropId,
          userId: s.userId,
          actualRewardAda: s.estimatedRewardAda, // Use estimated as actual for batch approval
          actualWeightKg: s.actualWeightKg || 1.0,
        })),
        batchNotes,
        adminUsername: admin.username,
      };

      const response = await fetch("/api/admin/submissions/batch-approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Successfully approved ${data.processedCount} submissions and processed ${data.totalAda} ADA in payments!`,
        );

        // Refresh the list
        await loadPendingSubmissions();
        setSelectedSubmissions(new Set());
        setBatchNotes("");
      } else {
        alert(`Batch processing failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Batch processing error:", error);
      alert("Network error during batch processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalRewardForSelected = () => {
    return pendingSubmissions
      .filter((s) => selectedSubmissions.has(s.id))
      .reduce((total, s) => total + s.estimatedRewardAda, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceTypeBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      "Cables & Chargers": "bg-blue-100 text-blue-800",
      "Small Electronics": "bg-green-100 text-green-800",
      "Medium Electronics": "bg-yellow-100 text-yellow-800",
      "Large Electronics": "bg-orange-100 text-orange-800",
      "Batteries & Hazardous": "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={categoryColors[category] || "bg-gray-100 text-gray-800"}
      >
        {category}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-blue-600">
          Loading pending submissions...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Users className="w-5 h-5" />
            E-Waste Submission Verification
          </CardTitle>
          <CardDescription>
            Review and approve user submissions for ADA rewards. Use checkboxes
            for batch processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Filter Controls */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All Users ({pendingSubmissions.length})
              </Button>
              <Button
                size="sm"
                variant={filter === "verified-users" ? "default" : "outline"}
                onClick={() => setFilter("verified-users")}
              >
                Verified Users Only
              </Button>
              <Button
                size="sm"
                variant={filter === "unverified-users" ? "default" : "outline"}
                onClick={() => setFilter("unverified-users")}
              >
                Unverified Users
              </Button>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={selectAllSubmissions}
                className="flex items-center gap-2"
              >
                {selectedSubmissions.size === pendingSubmissions.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All
              </Button>

              {selectedSubmissions.size > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {selectedSubmissions.size} selected •{" "}
                  {getTotalRewardForSelected().toFixed(2)} ADA
                </Badge>
              )}
            </div>
          </div>

          {/* Batch Processing Controls */}
          {selectedSubmissions.size > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="batchNotes" className="text-sm font-medium">
                    Batch Approval Notes (optional)
                  </Label>
                  <Textarea
                    id="batchNotes"
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    placeholder="Add notes for this batch approval..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={processBatchApproval}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve {selectedSubmissions.size} Submissions & Process
                      ADA ({getTotalRewardForSelected().toFixed(2)} ADA)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Pending Submissions</CardTitle>
          <CardDescription>
            Click checkboxes to select multiple submissions for batch approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No pending submissions found</p>
              <p className="text-sm text-gray-500 mt-1">
                All submissions have been reviewed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedSubmissions.has(submission.id)
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSubmissionSelection(submission.id)}
                      className="mt-1 p-1 rounded hover:bg-gray-100"
                    >
                      {selectedSubmissions.has(submission.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Submission Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          Drop #{submission.dropId}
                        </h4>
                        {getDeviceTypeBadge(submission.deviceCategory)}
                        <Badge variant="outline" className="text-green-700">
                          {submission.estimatedRewardAda} ADA
                        </Badge>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            <strong>{submission.userFullName}</strong> (
                            {submission.userEmail})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(submission.submittedAt)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4" />
                          <span>{submission.deviceName}</span>
                        </div>

                        {submission.userCardanoAddress ? (
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">
                              Wallet Connected
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-600">
                              No Wallet Connected
                            </span>
                          </div>
                        )}
                      </div>

                      {submission.userCardanoAddress && (
                        <div className="text-xs text-gray-500 mb-2">
                          <span className="font-medium">Wallet:</span>{" "}
                          {submission.userCardanoAddress.substring(0, 20)}...
                        </div>
                      )}
                    </div>

                    {/* Photo Preview */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSubmission(submission)}
                        className="border-blue-200 text-blue-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Submission Details - Drop #{selectedSubmission.dropId}
              </CardTitle>
              <CardDescription>
                Submitted by {selectedSubmission.userFullName} on{" "}
                {formatDate(selectedSubmission.submittedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Submitted Photo
                </Label>
                <img
                  src={selectedSubmission.photo}
                  alt="E-waste submission"
                  className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
                  loading="lazy"
                />
              </div>

              {/* User Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    User
                  </Label>
                  <p className="text-gray-600">
                    {selectedSubmission.userFullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedSubmission.userEmail}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Device
                  </Label>
                  <p className="text-gray-600">
                    {selectedSubmission.deviceName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedSubmission.deviceCategory}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Estimated Reward
                  </Label>
                  <p className="text-gray-600">
                    {selectedSubmission.estimatedRewardAda} ADA
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Wallet Status
                  </Label>
                  {selectedSubmission.userCardanoAddress ? (
                    <div>
                      <p className="text-green-600 flex items-center gap-1">
                        <Wallet className="w-4 h-4" />
                        Connected
                      </p>
                      <p className="text-xs text-gray-500 mt-1 break-all">
                        {selectedSubmission.userCardanoAddress}
                      </p>
                    </div>
                  ) : (
                    <p className="text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      No Wallet Connected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    toggleSubmissionSelection(selectedSubmission.id);
                    setSelectedSubmission(null);
                  }}
                  className={
                    selectedSubmissions.has(selectedSubmission.id)
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                >
                  {selectedSubmissions.has(selectedSubmission.id)
                    ? "Remove from Selection"
                    : "Add to Selection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
