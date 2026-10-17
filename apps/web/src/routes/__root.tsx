import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <Outlet />
    </main>
  );
}
