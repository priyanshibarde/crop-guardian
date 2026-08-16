import { app } from './app.js'
import { env } from './config/env.js'

app.listen(env.port, () => {
  console.info(`Crop Guardian API listening on http://localhost:${env.port}`)
})
