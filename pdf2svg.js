#!/usr/bin/env node

/* eslint-disable no-console */
/* eslint-disable no-use-before-define */

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

//
// Node tool to dump SVG output into a file.
// Usage: node pdf2svg.js pdfPath [outputPath]
// outputPath will be './' if not provided
//

const fs = require('fs');
const path = require('path');

// HACK few hacks to let PDF.js be loaded not as a module in global space.
global.window = global;
global.navigator = { userAgent: 'node' };
global.PDFJS = {};

require('./js/pdf.combined.js');
require('./js/domstubs.js');

// Loading file from file system into typed array
const pdfPath = process.argv[2];
if (pdfPath === undefined) {
  throw new Error('PDF path not provided.');
}
const outputPath = process.argv[3] || './';

const data = new Uint8Array(fs.readFileSync(pdfPath));

// Dumps svg outputs to outputPath
function writeToFile(svgdump, pageNum, isSinglePage) {
  fs.mkdir(outputPath, { recursive: true }, (err) => {
    if (!err || err.code === 'EEXIST') {
      fs.writeFile(
        path.join(outputPath, `${path.basename(pdfPath, path.extname(pdfPath))}${isSinglePage ? '' : `-${pageNum}`}.svg`),
        svgdump,
        (err2) => {
          if (err2) {
            console.error(`Error: ${err2}`);
          }
        },
      );
    }
  });
}

// Will be using promises to load document, pages and misc data instead of
// callback.
// eslint-disable-next-line no-undef
PDFJS.getDocument(data)
  .then((doc) => {
    const { numPages } = doc;
    console.log('# Document Loaded');
    console.log(`Number of Pages: ${numPages}`);
    console.log();

    let lastPromise = Promise.resolve(); // will be used to chain promises
    const loadPage = (pageNum) => doc.getPage(pageNum).then((page) => {
      console.log(`Current page: ${pageNum}`);
      const viewport = page.getViewport(1.0);
      return page.getOperatorList().then((opList) => {
        // eslint-disable-next-line no-undef
        const svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs);
        svgGfx.embedFonts = true;
        return svgGfx.getSVG(opList, viewport).then((svg) => {
          const svgDump = svg.toString();
          writeToFile(svgDump, pageNum, numPages === 1);
          console.log();
        });
      });
    });

    for (let i = 1; i <= numPages; i += 1) {
      lastPromise = lastPromise.then(loadPage.bind(null, i));
    }
    return lastPromise;
  })
  .then(
    () => {
      console.log('# End of Document');
    },
    (err) => {
      console.error(`Error: ${err}`);
    },
  );
