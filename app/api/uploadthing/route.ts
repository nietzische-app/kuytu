import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Serves GET/POST for the Uploadthing client (presigned uploads + callbacks).
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
