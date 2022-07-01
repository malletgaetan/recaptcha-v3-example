import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { renderFile } from 'ejs'

const __filename = fileURLToPath(import.meta.url)

const app = express()

app.use(express.json())
app.set('views', path.join(path.dirname(__filename), 'views'))
app.engine('html', renderFile)
app.set('view engine', 'html')

const PORT = process.argv[2] || 3000

const site_secret = process.env.SITE_SECRET
const site_public = process.env.SITE_PUBLIC
if(!(site_secret && site_public)) throw new Error('missing SITE_SECRET and SITE_PUBLIC env vars')

app.get('/', (_, response) => response.render('index.html', { SITE_PUBLIC: site_public }))

app.post('/getSmthg', async (request, response) => {
  const { token } = request.body
  if(!token) return response.status(405).json({message: "bro where's my token"})
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${site_secret}&response=${token}` // can send ip of client too, see https://developers.google.com/recaptcha/docs/verify
  }
  const reqResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', options).then(res => res.json())
  response.json(reqResponse)
})

app.listen(PORT, () => console.log(`listening at localhost:${PORT}`))
