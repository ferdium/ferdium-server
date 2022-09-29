declare module '@ioc:Adonis/Core/Application' {
  import Json from '@ioc:Adonis/Lucid/Json'

  interface ContainerBindings {
    'Adonis/Lucid/Json': typeof Json
  }
}
