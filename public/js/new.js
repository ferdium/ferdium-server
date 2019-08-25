const elDrop = document.getElementById('dropzone');
const submitBtn = document.getElementById('submitbutton');
const fileInput = document.getElementById('files');

elDrop.addEventListener('dragover', function (event) {
  event.preventDefault();
});

elDrop.addEventListener('drop', async function (event) {
  event.preventDefault();

  submitBtn.disabled = true;

  fileInput.files = event.dataTransfer.files;

  elDrop.innerText = `✓ ${fileInput.files.length} files selected`;
  elDrop.style.height = 'inherit';

  submitBtn.disabled = false;
});
elDrop.addEventListener('click', () => {
    fileInput.click();
})