/* eslint-env browser */
const elDrop = document.querySelector('#dropzone')
const submitBtn = document.querySelector('#submitbutton')
const fileInput = document.querySelector('#files')

elDrop.addEventListener('dragover', (event) => {
  event.preventDefault()
})

elDrop.addEventListener('drop', async (event) => {
  event.preventDefault()

  submitBtn.disabled = true

  fileInput.files = event.dataTransfer.files

  elDrop.textContent = `✓ ${fileInput.files.length} files selected`
  elDrop.style.height = 'inherit'

  submitBtn.disabled = false
})
elDrop.addEventListener('click', () => {
  fileInput.click()
})
