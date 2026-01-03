"use client";

import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
	images: string[];
	productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isZoomed, setIsZoomed] = useState(false);

	const handlePrevious = () => {
		setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	if (images.length === 0) {
		return (
			<div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
				<div className="flex aspect-square items-center justify-center rounded-2xl bg-secondary">
					<p className="text-muted-foreground">No images available</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
			<div className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary">
				<Image
					src={images[selectedIndex]!}
					alt={`${productName} - View ${selectedIndex + 1}`}
					fill
					className={cn(
						"object-cover transition-transform duration-500",
						isZoomed && "scale-150 cursor-zoom-out",
					)}
					onClick={() => setIsZoomed(!isZoomed)}
					priority
				/>

				{images.length > 1 && (
					<div className="-translate-y-1/2 absolute inset-x-4 top-1/2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
						<Button
							variant="secondary"
							size="icon"
							className="h-10 w-10 rounded-full bg-background/90 shadow-lg backdrop-blur-sm hover:bg-background"
							onClick={(e) => {
								e.stopPropagation();
								handlePrevious();
							}}
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<Button
							variant="secondary"
							size="icon"
							className="h-10 w-10 rounded-full bg-background/90 shadow-lg backdrop-blur-sm hover:bg-background"
							onClick={(e) => {
								e.stopPropagation();
								handleNext();
							}}
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
				)}

				<div className="absolute right-4 bottom-4 opacity-0 transition-opacity group-hover:opacity-100">
					<div className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 font-medium text-xs backdrop-blur-sm">
						<ZoomIn className="h-3.5 w-3.5" />
						Click to zoom
					</div>
				</div>

				{images.length > 1 && (
					<div className="absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1.5 font-medium text-xs backdrop-blur-sm">
						{selectedIndex + 1} / {images.length}
					</div>
				)}
			</div>

			{images.length > 1 && (
				<div className="-m-2 flex gap-3 overflow-x-auto p-2">
					{images.map((image, index) => (
						<button
							key={image}
							type="button"
							onClick={() => setSelectedIndex(index)}
							className={cn(
								"relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200",
								selectedIndex === index
									? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
									: "opacity-60 hover:opacity-100",
							)}
						>
							<Image
								src={image}
								alt={`${productName} thumbnail ${index + 1}`}
								fill
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
