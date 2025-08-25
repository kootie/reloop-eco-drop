"use client";

import QRBinInfo from "@/components/qr-bin-info";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function QRPage({
  params,
}: {
  params: Promise<{ qrCode: string }>;
}) {
  const search = useSearchParams();
  const [qrCode, setQrCode] = useState<string>("");
  const name = search.get("name");

  useEffect(() => {
    params.then((p) => setQrCode(p.qrCode));
  }, [params]);

  // We simply render the info component; it fetches details via API by qrCode
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-3xl mx-auto">
        {name && (
          <div className="mb-4 text-center text-green-800 font-semibold">
            {name}
          </div>
        )}
        <QRBinInfo qrCode={qrCode} />
      </div>
    </div>
  );
}
