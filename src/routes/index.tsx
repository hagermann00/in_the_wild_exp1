import { createFileRoute } from "@tanstack/react-router";
import { WildApp } from "@/components/wild/wild-app";

export const Route = createFileRoute("/")({ component: WildApp });
