"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function TodoManager() {
  const [tasks] = useState([
    { id: 1, title: "Setup Authentication System", completed: true },
    { id: 2, title: "Build Map with Bin Locations", completed: true },
    { id: 3, title: "Create Camera and QR Scanner", completed: true },
    { id: 4, title: "Build Item Selection Interface", completed: true },
    { id: 5, title: "Add Translation System", completed: true },
    { id: 6, title: "Integrate Backend APIs", completed: true },
  ]);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Project Complete!
        </CardTitle>
        <CardDescription>
          All Reloop frontend integration tasks have been completed
          successfully.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 bg-white rounded-md"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 text-sm">{task.title}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">
            Integration Summary:
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✅ User authentication with Fireblocks wallet creation</li>
            <li>✅ Interactive map with Zugdidi bin locations</li>
            <li>✅ Camera and QR code scanning functionality</li>
            <li>✅ Complete item selection with reward system</li>
            <li>✅ English/Georgian translation system</li>
            <li>✅ Full backend API integration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
