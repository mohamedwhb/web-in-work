import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList } from "@/components/ui/tabs"

export default function SecuritySettingsLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
        </TabsList>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-[120px] ml-auto" />
          </CardFooter>
        </Card>
      </Tabs>
    </div>
  )
}
