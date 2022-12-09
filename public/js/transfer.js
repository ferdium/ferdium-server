/* eslint-env browser */
const submitBtn = document.querySelector('#submit');
const fileInput = document.querySelector('#file');
const fileOutput = document.querySelector('#fileoutput');

fileInput.addEventListener('change', () => {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const text = reader.result;
    fileOutput.value = text;
    submitBtn.disabled = false;
  });
  reader.readAsText(fileInput.files[0]);
});
