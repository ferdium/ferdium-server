import Cloudinary from 'adonisjs-cloudinary/build/src/Cloudinary'
import {
  ContentHeaders,
  DriveFileStats,
  DriverContract,
  Visibility,
  WriteOptions,
} from '@ioc:Adonis/Core/Drive'
import { v2, ConfigAndUrlOptions, TransformationOptions, UploadApiOptions } from 'cloudinary'
import { parse } from 'path'
import { PathPrefixer } from '@adonisjs/core/build/standalone'
import CloudinaryDriverConfig from './config'
import { Readable } from 'stream'
import * as https from 'https'
import { string as Helpers } from '@ioc:Adonis/Core/Helpers'

export type CloudinaryWriteOptions = WriteOptions & Partial<UploadApiOptions> & { metadata : Record<string, string> }

export type CloudinaryContentHeaders = ContentHeaders & ConfigAndUrlOptions & TransformationOptions

export default interface CloudinaryDriverContract extends DriverContract {
  name: 'cloudinary'

  makePath(locations: string): string

  put(location: string,
    contents: string | Buffer,
    options?: Partial<CloudinaryWriteOptions>): Promise<void>

  putStream(location: string,
    contents: NodeJS.ReadableStream,
    options?: Partial<CloudinaryWriteOptions>): Promise<void>;

  getSignedUrl(
    location: string,
    options?: (CloudinaryContentHeaders & { expiresIn?: string | number })
  ): Promise<string>;

  getUrl(location: string, options?: CloudinaryContentHeaders): Promise<string>;
}

const escapeMetadata = (value: string): string => value.replace(/[^\\]"/, '\"').replace(/[^\\]=/, '\=')

const stringifyMetadata = (metadata?: Record<string, string>): string => metadata
  ? Object.keys(metadata)
    .map(_ => `${Helpers.snakeCase(Helpers.condenseWhitespace(_))}=${escapeMetadata(metadata[_])}`)
    .join('|')
  : ''

export class CloudinaryDriver implements CloudinaryDriverContract {
  public name: 'cloudinary' = 'cloudinary'

  private cloudinary: typeof v2
  private prefixer: PathPrefixer

  constructor (private adapter: Cloudinary, private config: CloudinaryDriverConfig) {
    this.cloudinary = this.adapter.getCloudinary()
    this.prefixer = PathPrefixer.fromPath(this.config.root || '')
  }

  private async getResource (location): Promise<any> {
    const fullLocation = this.makePath(location)
    return await this.cloudinary.search
      .expression(`public_id="${fullLocation}"`)
      .max_results(1)
      .execute()
  }

  private makePath (location: string): string {
    return this.prefixer.prefixPath(location)
  }

  public async exists (location: string): Promise<boolean> {
    return (await this.getResource(location)).total_count > 0
  }
  public async get (location: string): Promise<Buffer> {
    const stream = await this.getStream(location)
    const buffer = []
    return new Promise((r, rj) => {
      stream.on('data', buffer.push)
      stream.on('error', rj)
      stream.on('end', () => r(Buffer.concat(buffer)))
    })
  }
  public async getStream (location: string): Promise<NodeJS.ReadableStream> {
    const url = this.cloudinary.utils.private_download_url(this.makePath(location), 'auto', {
      attachment: true,
    })
    return new Promise((r, _rj) => {
      https.get(url, (stream) => {
        r(stream)
      })
    })
  }
  public async getVisibility (location: string): Promise<Visibility> {
    const resource = await this.getResource(location)
    return resource?.resources?.at(0)?.access_mode === 'public' ? 'public' : 'private'
  }
  public async getStats (location: string): Promise<DriveFileStats> {
    const resources = await this.getResource(location)
    const resource = resources.resources[0]

    return {
      size: resource?.bytes || 0, // number;
      modified: new Date(resource?.updated_at || 0), // Date;
      isFile: false, // boolean;
      etag: undefined, // string | undefined;
    }
  }
  public async getSignedUrl (
    location: string,
    options?: Partial<(CloudinaryContentHeaders & { expiresIn: string | number })>,
  ): Promise<string> {
    return this.cloudinary.url(this.makePath(location), {
      resource_type: options?.resource_type || 'raw',
      sign_url: true,
      type: options?.type || 'authenticated',
    })
  }
  public async getUrl (location: string, options?: Partial<CloudinaryContentHeaders>): Promise<string> {
    return this.cloudinary.url(this.makePath(location), { ...options, sign_url: false })
  }
  public async put (
    location: string,
    contents: string | Buffer,
    options?: Partial<CloudinaryWriteOptions>,
  ): Promise<void> {
    if (typeof contents !== 'string') {
      contents = contents.toString((options?.contentEncoding || 'utf-8') as BufferEncoding)
    }
    return this.putStream(location, Readable.from(contents), options)
  }
  public async putStream (
    location: string,
    contents: NodeJS.ReadableStream,
    options?: Partial<CloudinaryWriteOptions>,
  ): Promise<void> {
    // const fullLocation = this.makePath(location)
    // const { base } = parse(fullLocation)
    const { metadata, ...otherOptions } = options || {}
    if (options?.metadata) {
      let fields = await this.cloudinary.api.list_metadata_fields()
      let fieldKeys = fields.metadata_fields.map(field => field.external_id)
      let missingFields = Object.keys(options?.metadata || {}).filter(key => {
        return !fieldKeys.includes(key)
      })
      if (missingFields.length > 0) {
        for (const field of missingFields) {
          await this.cloudinary.api.add_metadata_field({ external_id: field, mandatory: false, label: Helpers.sentenceCase(field), type: 'string' })
        }
      }
    }
    return new Promise((r, rj) => {
      const stream = this.cloudinary.uploader.upload_stream(
        {
          ...otherOptions,
          resource_type: options?.resource_type || 'auto',
          use_filename: true,
          unique_filename: false,
          metadata: '',
          access_mode: options?.access_mode || (options?.visibility === 'public' ? 'public' : 'authenticated'),
        }, async (err, _result) => {
          if (err) {
            rj(err)
          } else {
            await this.cloudinary.uploader.update_metadata(stringifyMetadata(metadata), [this.makePath(location)], {
              ...otherOptions,
              resource_type: options?.resource_type || 'auto',
              use_filename: true,
              unique_filename: false,
              metadata: '',
              access_mode: options?.access_mode || (options?.visibility === 'public' ? 'public' : 'authenticated'),
            })
            r()
          }
        },
      )
      contents.pipe(stream)
    })
  }
  public async setVisibility (location: string, visibility: Visibility): Promise<void> {
    const fullLocation = this.makePath(location)
    const resource = await this.getResource(location)
    await this.cloudinary.uploader.update_metadata(resource.metadata, [fullLocation], {
      type: visibility === 'private' ? 'authenticated' : 'public',
    })
  }
  public async delete (location: string): Promise<void> {
    return this.cloudinary.uploader.destroy(this.makePath(location), { invalidate: true })
  }
  public async copy (
    source: string,
    destination: string,
    options?: WriteOptions,
  ): Promise<void> {
    return this.put(destination, await this.get(source), options)
  }
  public async move (
    source: string,
    destination: string,
    _options?: WriteOptions,
  ): Promise<void> {
    return this.cloudinary.uploader.rename(this.makePath(source), this.makePath(destination))
  }
}
