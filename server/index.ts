import { createServer } from "vite";
import path from "path";

async function startServer() {
  const vite = await createServer({
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
    server: {
      middlewareMode: false,
      host: "0.0.0.0",
      port: 5000,
    },
  });

  await vite.listen();
  console.log("Frontend server running on http://0.0.0.0:5000");
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});