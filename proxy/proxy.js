import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 8082

// TTL de caché en ms (evita demasiadas peticiones durante desarrollo)
const CACHE_TTL = Number(process.env.CACHE_TTL_MS || 60_000)
let cache = { ts: 0, data: null }

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

app.get('/products', async (req, res) => {
  // Devuelve caché si todavía es válido
  if (cache.data && (Date.now() - cache.ts) < CACHE_TTL) {
    console.log('♻️  Sirviendo desde caché')
    return res.json(cache.data)
  }

  const url = 'https://www.massimodutti.com/itxrest/3/catalog/store/34009450/30359536/productsArray?languageId=-5&appId=1&productIds=56869922%2C56870189%2C53563003%2C53563004%2C56298434%2C53026462%2C56203131%2C55179903%2C55504699%2C55179904%2C56869936%2C56535993'

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.massimodutti.com/',
    'Origin': 'https://www.massimodutti.com',
    // Cabeceras “client hint” y fetch que algunos servidores esperan
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Sec-CH-UA': '"Chromium";v="120", "Not A Brand";v="24"',
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"Windows"',
    // Emular petición XHR/ajax
    'X-Requested-With': 'XMLHttpRequest',
    'Connection': 'keep-alive'
  }

  // Si has obtenido cookies válidas desde el navegador, pásalas por env var MD_COOKIES
  if (process.env.MD_COOKIES) {
    headers['Cookie'] = process.env.MD_COOKIES
    console.log('🔐 Usando cookies desde MD_COOKIES (env var)')
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow'
    })

    // Si falla, devuelvo cuerpo/fragmento para debug
    if (!response.ok) {
      const bodyText = await response.text().catch(() => '')
      console.error(`❌ Fetch failed: ${response.status} ${response.statusText}`)
      console.error('Response snippet:', bodyText.slice(0, 1000))
      return res.status(response.status).json({
        error: 'Error al obtener productos de Massimo Dutti',
        status: response.status,
        statusText: response.statusText,
        bodySnippet: bodyText.slice(0, 1000)
      })
    }

    const data = await response.json()
    cache = { ts: Date.now(), data }
    console.log('✅ Datos recibidos y cacheados')
    return res.json(data)
  } catch (err) {
    console.error('❌ Error interno en proxy:', err)
    return res.status(500).json({ error: 'Error interno en el proxy', details: err.message })
  }
})

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`✅ Proxy corriendo en http://localhost:${PORT}`)
  console.log('Endpoints: GET /products  GET /health')
})
