import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@focus/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";

import { ApiStatus } from "#src/components/api-status.tsx";

const HomePage = () => (
  <Card>
    <CardHeader>
      <CardTitle>focus</CardTitle>
      <CardDescription>
        React, Elysia, SQLite and Drizzle on Vite+.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <span>API status</span>
      <ApiStatus />
    </CardContent>
  </Card>
);

export const Route = createFileRoute("/")({
  component: HomePage,
});
