"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
}

const swipeConfidenceThreshold = 50;
const AUTO_PLAY_INTERVAL = 3000;

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function ImageCarousel({ images }: Props) {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);
  const isDragging = useRef(false);

  const paginate = (newDirection: number) => {
    setIndex(([prev]) => [
      (prev + newDirection + images.length) % images.length,
      newDirection,
    ]);
  };

  /* 🔁 Auto play */
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      if (!isDragging.current) {
        paginate(1);
      }
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-fill h-[36vw] mt-[5vw] overflow-hidden rounded-xl mx-[5vw]">
      {/* 🔥 Preload images (hidden) */}
      <div className="hidden">
        {images.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt=""
            width={10}
            height={10}
            priority={i === 0}
          />
        ))}
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          style={{ touchAction: "pan-y" }}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragStart={() => (isDragging.current = true)}
          onDragEnd={(_, info) => {
            isDragging.current = false;

            if (info.offset.x > swipeConfidenceThreshold) paginate(-1);
            else if (info.offset.x < -swipeConfidenceThreshold) paginate(1);
          }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
