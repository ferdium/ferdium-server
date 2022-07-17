import View from '@ioc:Adonis/Core/View';

export function fakeCsrfField(): void {
  // Create fake csrField function in the view
  View.global('csrfField', () => '');
}
