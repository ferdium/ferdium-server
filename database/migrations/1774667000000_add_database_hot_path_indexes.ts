import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  public async up(): Promise<void> {
    this.schema.alterTable('services', table => {
      table.index(['userId'], 'services_user_id_index');
      table.index(['serviceId'], 'services_service_id_index');
    });

    this.schema.alterTable('workspaces', table => {
      table.index(['userId'], 'workspaces_user_id_index');
    });

    this.schema.alterTable('tokens', table => {
      table.index(
        ['user_id', 'type', 'is_revoked', 'updated_at'],
        'tokens_user_id_type_is_revoked_updated_at_index',
      );
    });
  }

  public async down(): Promise<void> {
    this.schema.alterTable('tokens', table => {
      table.dropIndex(
        ['user_id', 'type', 'is_revoked', 'updated_at'],
        'tokens_user_id_type_is_revoked_updated_at_index',
      );
    });

    this.schema.alterTable('workspaces', table => {
      table.dropIndex(['userId'], 'workspaces_user_id_index');
    });

    this.schema.alterTable('services', table => {
      table.dropIndex(['serviceId'], 'services_service_id_index');
      table.dropIndex(['userId'], 'services_user_id_index');
    });
  }
}
