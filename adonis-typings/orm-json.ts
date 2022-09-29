declare module '@ioc:Adonis/Lucid/Json' {
  import { ColumnOptions, DecoratorFn } from '@ioc:Adonis/Lucid/Orm'
  export type JsonColumnOptions = ColumnOptions & {
    isArray: boolean;
  }
  export type JsonColumnDecorator = (options?: Partial<JsonColumnOptions>) => DecoratorFn
  export const jsonColumn: JsonColumnDecorator
  export default jsonColumn
}
