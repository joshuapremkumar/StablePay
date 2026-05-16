import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/trade")({
  beforeLoad: () => {
    throw redirect({ to: "/trade-finance" });
  },
});
