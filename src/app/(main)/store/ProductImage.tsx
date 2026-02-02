import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-20 rounded-lg bg-gray-100 flex items-center justify-center">
        <ImageOff className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-20">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="80px"
        className="object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
}

export default ProductImage;
