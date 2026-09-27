"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, TickCircle, DocumentDownload } from "iconsax-react";

// TODO: swap for the logged-in vendor's real slug once the public
// vendor page is a dynamic route.
const VENDOR_SLUG = "mama-grace-kitchen";

export default function MenuQRCard() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = origin ? `${origin}/${VENDOR_SLUG}` : "";

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const canvas = wrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "bukka-menu-qr.png";
    a.click();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-8 flex flex-wrap items-center gap-6">
      <div
        ref={wrapperRef}
        className="shrink-0 bg-white p-3 rounded-xl border border-gray-100"
      >
        {link ? (
          <QRCodeCanvas
            value={link}
            size={128}
            bgColor="#ffffff"
            fgColor="#111827"
            level="M"
          />
        ) : (
          <div className="w-32 h-32" />
        )}
      </div>

      <div className="flex-1 min-w-[220px]">
        <p className="font-bold text-gray-900">Your menu link</p>
        <p className="mt-1 text-sm text-gray-500 break-all">
          {link || "Loading…"}
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-900 hover:border-gray-300 transition"
          >
            {copied ? (
              <TickCircle size={16} color="currentColor" variant="Bold" />
            ) : (
              <Copy size={16} color="currentColor" />
            )}
            {copied ? "Copied" : "Copy link"}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
          >
            <DocumentDownload size={16} color="currentColor" />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
