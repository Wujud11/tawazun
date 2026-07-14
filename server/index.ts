import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { nettingRouter } from './routes/netting.js'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
)
app.use(express.json({ limit: '1mb' }))

app.use('/api/ai', nettingRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`)
})
