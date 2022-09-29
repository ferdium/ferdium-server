import { CloudinaryConfig } from '@ioc:Adonis/Addons/Cloudinary'

export default interface CloudinaryDriverConfig
  extends Partial<Omit<CloudinaryConfig, 'apiKey' | 'apiSecret'>> {
  driver: 'cloudinary'
  key: string
  secret: string
  visibility: 'public' | 'private'
  root?: string
}
