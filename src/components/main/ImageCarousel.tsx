"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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

  /* 🔥 Preload next image */
  useEffect(() => {
    if (images.length <= 1) return;

    const nextIndex = (index + 1) % images.length;
    const img = new window.Image();
    img.src = images[nextIndex];
  }, [index, images]);

  const paginate = useCallback(
    (newDirection: number) => {
      setIndex(([prev]) => [
        (prev + newDirection + images.length) % images.length,
        newDirection,
      ]);
    },
    [images.length],
  );

  /* 🔁 Auto play */
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      if (!isDragging.current) paginate(1);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [images.length, paginate]);

  return (
    <div className="mt-[5vw] px-[6vw]">
      <div className="relative w-full h-[30vh] overflow-hidden rounded-xl bg-black/5">
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
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            style={{ touchAction: "pan-y" }}
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
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Pagination dots */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex([i, i > index ? 1 : -1])}
              className={`h-2 w-2 rounded-full transition-all ${
                i === index ? "bg-white scale-110" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
