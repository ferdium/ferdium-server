import edge from 'edge.js'

export function fakeCsrfField(): void {
  // Create fake csrField function in the view
  edge.global('csrfField', () => '')
}
