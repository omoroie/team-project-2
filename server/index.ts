// Frontend-only server using Vite
import { createServer } from 'vite'

async function startServer() {
  const server = await createServer({
    configFile: './vite.config.ts',
    server: {
      host: '0.0.0.0',
      port: 5000
    }
  })

  await server.listen()
  console.log('Frontend server running on http://0.0.0.0:5000')
}

startServer().catch(console.error)