import { createApiClient } from "@acme/api-client";
import { env } from "../env.js";

export const api = createApiClient(env.VITE_API_URL);
