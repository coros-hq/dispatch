type Variant = "digest" | "launch" | "promo";

export function TemplatePreview({ variant }: { variant: Variant }) {
  if (variant === "digest") {
    return (
      <div className="h-full w-full overflow-hidden bg-[#f4f4f4] flex items-start justify-center pt-6 px-4">
        <div className="w-full bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-white p-5">
            <p
              className="text-[11px] font-bold text-gray-900 mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Your Newsletter
            </p>
            <p className="text-[9px] text-gray-500 mb-3">
              Welcome to this week's edition.
            </p>
            <div className="bg-gray-900 text-white text-[8px] px-3 py-1.5 rounded inline-block">
              Read More
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "launch") {
    return (
      <div className="h-full w-full overflow-hidden bg-[#f4f4f4] flex items-start justify-center pt-6 px-4">
        <div className="w-full bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-gray-900 p-4">
            <div className="bg-gray-700 h-16 rounded mb-0" />
          </div>
          <div className="bg-white p-4">
            <p
              className="text-[11px] font-bold text-gray-900 mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Introducing Our New Product
            </p>
            <p className="text-[9px] text-gray-500 mb-3">
              We've been building something special.
            </p>
            <div className="bg-gray-900 text-white text-[8px] px-3 py-1.5 rounded inline-block">
              Get Early Access
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-[#f4f4f4] flex items-start justify-center pt-6 px-4">
      <div className="w-full bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-blue-600 p-5">
          <p className="text-[9px] text-white/70 mb-1">🎉 Limited Time Offer</p>
          <p
            className="text-[18px] font-bold text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            50% OFF
          </p>
          <p className="text-[9px] text-white/80">Use code DISPATCH50</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-[10px] font-bold text-gray-900 mb-1">
            Don't miss out
          </p>
          <p className="text-[9px] text-gray-500 mb-3">
            This offer expires in 48 hours.
          </p>
          <div className="bg-blue-600 text-white text-[8px] px-3 py-1.5 rounded inline-block">
            Claim Discount
          </div>
        </div>
      </div>
    </div>
  );
}
