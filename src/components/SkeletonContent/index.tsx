import { Card, Skeleton } from "@heroui/react";

const SECTION_KEYS = ["section-1", "section-2"] as const;
const CARD_KEYS = [
  "card-1",
  "card-2",
  "card-3",
  "card-4",
  "card-5",
  "card-6",
  "card-7",
  "card-8",
] as const;
const TAG_KEYS = ["tag-1", "tag-2", "tag-3"] as const;

export default function SkeletonContent() {
  return (
    <div className="w-full flex-1 space-y-6">
      {SECTION_KEYS.map((sectionKey) => (
        <div key={sectionKey} className="space-y-4">
          <Skeleton className="h-5 w-30 rounded-lg" />
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]">
            {CARD_KEYS.map((cardKey) => (
              <Card key={cardKey}>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36 rounded-lg" />
                    <div className="flex items-center gap-1">
                      {TAG_KEYS.map((tagKey) => (
                        <Skeleton
                          key={`${cardKey}-${tagKey}`}
                          className="h-5 w-10 rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-md space-y-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
