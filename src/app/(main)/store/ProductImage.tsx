import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="aspect-square w-full rounded-t-sm bg-gray-100 flex items-center justify-center overflow-hidden">
        <ImageOff className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full rounded-t-sm overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="50vw"
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export default ProductImage;
