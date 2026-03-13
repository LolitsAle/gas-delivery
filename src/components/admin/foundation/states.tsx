import { AlertTriangle, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminEmptyState({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 p-6 text-muted-foreground">
        <Inbox className="h-4 w-4" /> {title}
      </CardContent>
    </Card>
  );
}

export function AdminErrorState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 p-6 text-destructive">
        <AlertTriangle className="h-4 w-4" /> {message}
      </CardContent>
    </Card>
  );
}

export function AdminLoadingSkeleton() {
  return <Skeleton className="h-40 w-full" />;
}
