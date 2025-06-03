import express from "express";
import { createServer } from "vite";

async function startServer() {
  const app = express();
  
  // CORS 설정
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  try {
    // Vite 개발 서버 설정
    const vite = await createServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 24678
        }
      },
      appType: 'spa',
      root: './client'
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    const server = app.listen(5000, '0.0.0.0', () => {
      console.log("Frontend server running on http://0.0.0.0:5000");
      console.log("Spring Boot microservices endpoints:");
      console.log("- User Service: http://localhost:8081");
      console.log("- Recipe Service: http://localhost:8082");
      console.log("- Ingredient Service: http://localhost:8083");
      console.log("- Board Service: http://localhost:8084");
    });

    return server;
  } catch (error) {
    console.error("Failed to start Vite server:", error);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});