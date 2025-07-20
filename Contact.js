function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
.then(() => {
  console.log(`Copied text to clipboard: ${text}`);
  alert(`Copied text to clipboard: ${text}`);
})
.catch((error) => {
  console.error(`Could not copy text: ${error}`);
});
}