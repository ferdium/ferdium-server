import { Exception } from '@adonisjs/core/build/standalone'
import { JsonColumnDecorator, JsonColumnOptions } from '@ioc:Adonis/Lucid/Json'
import { LucidModel, LucidRow } from '@ioc:Adonis/Lucid/Orm'

function prepareJsonColumn (options?: Partial<JsonColumnOptions & {
  skipExceptions: boolean,
  replacer: ((this: any, key: string, value: any) => any),
  space: number | string,
}>) {
  if (options?.prepare) {
    return options?.prepare
  }

  return (value: string, attribute: string, model: LucidRow) => {
    /**
     * Return string or missing values as it is. If `auto` is set to true on
     * the column, then the hook will always initialize the date
     */
    if (!value) {
      return value
    }

    const modelName = model.constructor.name

    try {
      return JSON.stringify(value, options?.replacer, options?.space)
    } catch (error) {
      if (!options?.skipExceptions) {
        throw new Exception(`Invalid value for "${modelName}.${attribute}". ${error}`, 500, 'E_INVALID_JSON_COLUMN_VALUE')
      } else {
        return options?.isArray === true ? [] : null
      }
    }
  }
}

function consumeJsonColumn (options?: Partial<JsonColumnOptions & {
  skipExceptions: boolean,
  reviver: ((this: any, key: string, value: any) => any),
}>) {
  if (options?.consume) {
    return options?.consume
  }

  return (value: any, attribute: string, model: LucidRow) => {
    /**
     * Bypass null columns
     */
    if (!value) {
      return value
    }

    const modelName = model.constructor.name

    try {
      return JSON.parse(value, options?.reviver)
    } catch (error) {
      if (!options?.skipExceptions) {
        throw new Exception(`Cannot format "${modelName}.${attribute}" ${typeof value} value to an instance of "luxon.DateTime"`, 500, 'E_INVALID_JSON_COLUMN_VALUE')
      }
    }

    return options?.isArray === true ? '[]' : null
  }
}

function serializeJsonColumn (options?: Partial<JsonColumnOptions & {
  skipExceptions: boolean,
  replacer: ((this: any, key: string, value: any) => any),
  space: number | string,
}>) {
  if (options?.serialize) {
    return options?.serialize
  }

  return (value: any, attribute: string, model: LucidRow) => {
    /**
     * Bypass null columns
     */
    if (!value) {
      return value
    }

    const modelName = model.constructor.name

    try {
      return JSON.stringify(value, options?.replacer, options?.space)
    } catch (error) {
      if (!options?.skipExceptions) {
        throw new Exception(`Cannot format "${modelName}.${attribute}" ${typeof value} value to an instance of "luxon.DateTime"`, 500, 'E_INVALID_JSON_COLUMN_VALUE')
      }
    }

    return options?.isArray === true ? '[]' : null
  }
}

export const jsonColumn: JsonColumnDecorator = (options) => {
  return (target, property): void => {
    const columnOptions = options || {} as any

    const Model = target.constructor as LucidModel
    Model.boot()

    const normalizedOptions = {
      ...columnOptions,
      prepare: prepareJsonColumn(columnOptions),
      consume: consumeJsonColumn(columnOptions),
      serialize: serializeJsonColumn(columnOptions),
      meta: {} as any,
    }

    /**
     * Type always has to be a date
     */
    normalizedOptions.meta.type = 'json'
    normalizedOptions.meta.isArray = columnOptions?.isArray === true
    Model.$addColumn(property, normalizedOptions)
  }
}
