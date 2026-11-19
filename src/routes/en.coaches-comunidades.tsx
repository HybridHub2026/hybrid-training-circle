import { createFileRoute } from "@tanstack/react-router";
import { ParticipationPage, participationHead } from "./coaches-comunidades";
export const Route = createFileRoute("/en/coaches-comunidades")({
  head: () => participationHead("en"),
  component: ParticipationPage,
});
