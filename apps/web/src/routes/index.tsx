import { createFileRoute } from "@tanstack/react-router";
import { api } from "../lib/api";

export const Route = createFileRoute("/")({
  loader: async () => {
    const res = await api.health.$get();
    return res.json();
  },
  component: IndexRoute,
});

function IndexRoute() {
  const { status } = Route.useLoaderData();
  return <p>API: {status}</p>;
}
