import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function DeliveryNotesLoading() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
      </header>

      <div className="flex gap-2 items-center">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-4 flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="p-4 flex-1">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="p-4 flex justify-end items-center gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
