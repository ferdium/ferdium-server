/**
 * Contract source: https://git.io/JBt3I
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import CloudinaryDriverConfig from 'providers/drive-cloudinary/config'
import CloudinaryDriverContract from 'providers/drive-cloudinary/provider'

declare module '@ioc:Adonis/Core/Drive' {
  interface DriversList {
    cloudinary: {
      config: CloudinaryDriverConfig
      implementation: CloudinaryDriverContract
    }
  }
  interface DisksList {
    local: {
      config: LocalDriverConfig
      implementation: LocalDriverContract
    }
    s3: {
      config: S3DriverConfig
      implementation: S3DriverContract
    }
    cloudinary: {
      config: CloudinaryDriverConfig
      implementation: CloudinaryDriverContract
    }
  }
}
