# pdf2svg

A PDF to SVG converter written using PDF.js.

## Usage

`node pdf2svg.js pdfPath [outputPath]`, `outputPath` will be `./` if not provided.

It will generate `originalName.svg` for a single page PDF file, `originalName-page.svg` for a multi-page PDF file.

## Make it available globally

```bash
npm link
```
Then you can run `pdf2svg pdfPath [outputPath]` globally.

See <https://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm> and <https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e>.

> If you are on Linux, to avoid conflict with pdf2svg in package manager, you may want to specify a different name for this package. To do this, modify `pdf2svg` in `"bin": {"pdf2svg": "pdf2svg.js"}` in `package.json` to another name before running `npm link`.

