import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<Card key={i} className="h-full overflow-hidden">
					<div className="aspect-[16/9] w-full">
						<Skeleton className="h-full w-full" />
					</div>
					<CardHeader>
						<Skeleton className="h-6 w-2/3" />
					</CardHeader>
					<CardContent>
						<Skeleton className="mb-2 h-4 w-full" />
						<Skeleton className="h-4 w-1/2" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
