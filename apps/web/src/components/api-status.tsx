import { Badge } from "@focus/ui/components/badge";
import { useQuery } from "@tanstack/react-query";

import { app } from "#src/lib/api.ts";

export const ApiStatus = () => {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data, error } = await app.health.get();
      if (error) {
        throw new Error("Something went wrong");
      }
      return data;
    },
  });

  if (health.isPending) {
    return <Badge variant="outline">Checking</Badge>;
  }

  return health.isSuccess ? (
    <Badge>Connected</Badge>
  ) : (
    <Badge variant="destructive">Disconnected</Badge>
  );
};
