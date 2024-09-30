import { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const requestKey = req.headers.get("X-AUTH-TOKEN");
  const apiKey = Netlify.env.get("X_AUTH_TOKEN");

  if (requestKey === apiKey) {
      return context.next();
  }

  return new Response("Access denied.", { status: 403 });
};

export const config: Config = {
  path: ["/*"]
};
