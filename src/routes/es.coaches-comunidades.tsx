import { createFileRoute } from "@tanstack/react-router";
import { ParticipationPage, participationHead } from "./coaches-comunidades";
export const Route = createFileRoute("/es/coaches-comunidades")({
  head: () => participationHead("es"),
  component: ParticipationPage,
});
