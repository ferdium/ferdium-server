import { defineConfig } from '@adonisjs/static'

const staticConfig = defineConfig({
  enabled: true,
  dotFiles: 'ignore',
  etag: true,
  lastModified: true,
})

export default staticConfig
