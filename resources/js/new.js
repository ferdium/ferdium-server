/* eslint-env browser */
const elDrop = document.getElementById('dropzone')
const elEmptyDrop = document.querySelector('#dropzone .emptyDropzone')
const elNotEmptyDrop = document.querySelector('#dropzone .notEmptyDropzone')
const submitBtn = document.getElementById('submitbutton')
const fileInput = document.getElementById('files')

fileInput.addEventListener('change', () => {
  hasFiles(event, fileInput.files)
})

elDrop.addEventListener('dragover', (event) => {
  event.preventDefault()
})

elDrop.addEventListener('drop', async (event) => {
  hasFiles(event, event.dataTransfer.files)
})

elDrop.addEventListener('click', () => {
  fileInput.click()
})

function hasFiles(event, files) {
  event.preventDefault()

  submitBtn.disabled = (files?.length || 0) === 0;

  fileInput.files = files

  if (files.length > 0) {
    elNotEmptyDrop.innerHTML = Array.from(files).map(file => {
      return `✓ ${file.name}`;
    }).join('<br />');
    elNotEmptyDrop.style.display = null;
    elEmptyDrop.style.display = 'none';
  } else {
    elNotEmptyDrop.innerHTML = '';
    elNotEmptyDrop.style.display = 'none';
    elEmptyDrop.style.display = null;
  }
  
  submitBtn.disabled = false
}
