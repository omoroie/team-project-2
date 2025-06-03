import type { Express } from "express";
import { createServer, type Server } from "http";
import { createProxyMiddleware } from 'http-proxy-middleware';

export async function registerRoutes(app: Express): Promise<Server> {
  // Spring Boot 마이크로서비스 프록시 설정
  
  // 사용자 서비스 프록시 (8081)
  app.use('/api/users', createProxyMiddleware({
    target: 'http://localhost:8081',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('User Service Proxy Error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'User service unavailable. Please ensure the service is running on port 8081.' 
      });
    }
  }));

  // 레시피 서비스 프록시 (8082)
  app.use('/api/recipes', createProxyMiddleware({
    target: 'http://localhost:8082',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Recipe Service Proxy Error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Recipe service unavailable. Please ensure the service is running on port 8082.' 
      });
    }
  }));

  // 식재료 서비스 프록시 (8083)
  app.use('/api/ingredients', createProxyMiddleware({
    target: 'http://localhost:8083',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Ingredient Service Proxy Error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Ingredient service unavailable. Please ensure the service is running on port 8083.' 
      });
    }
  }));

  // 게시판 서비스 프록시 (8084)
  app.use('/api/board', createProxyMiddleware({
    target: 'http://localhost:8084',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Board Service Proxy Error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Board service unavailable. Please ensure the service is running on port 8084.' 
      });
    }
  }));

  // 인증 관련 엔드포인트도 사용자 서비스로 프록시
  app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:8081',
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/users'
    },
    onError: (err, req, res) => {
      console.error('Auth Service Proxy Error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Authentication service unavailable. Please ensure the user service is running on port 8081.' 
      });
    }
  }));

  // 헬스 체크 엔드포인트
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Proxy server is running',
      services: {
        userService: 'http://localhost:8081',
        recipeService: 'http://localhost:8082',
        ingredientService: 'http://localhost:8083',
        boardService: 'http://localhost:8084'
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}