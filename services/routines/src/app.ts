import { routinesRoutes } from "@acme/backend-routines";
import { Hono } from "hono";

export const app = new Hono().route("/api", routinesRoutes);
