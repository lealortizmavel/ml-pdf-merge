'use strict';
const fs = require('fs');
const path = 'src/public/documents/';
const { PDFDocument } = require('pdf-lib');

const merge = async (files, id, name, repeatHalf = false) => {
    // Filenames
    const folderName = path + id + '/';
    const filename = 'merge-' + id + '.pdf';
    const fullpath = folderName + filename;

    // PDF initialization
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setCreator('PDF ML by Daniel Jiménez 🤖');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setAuthor('Daniel Jiménez');
    pdfDoc.setTitle(name);

    // First pages merge
    for (const file of files) {
        const filepath = folderName + file;
        const firstDonorPdfBytes = fs.readFileSync(filepath);
        const firstDonorPdfDoc = await PDFDocument.load(firstDonorPdfBytes);
        const [firstDonorPage] = await pdfDoc.copyPages(firstDonorPdfDoc, [0]);
        if (repeatHalf) {
            const half = firstDonorPage.getWidth() / 2;
            const info = await pdfDoc.embedPage(firstDonorPage, {
                top: firstDonorPage.getHeight(),
                right: half,
                bottom: 0,
                left: 0,
            });
            firstDonorPage.drawPage(info, { x: half, y: 0, });
        }
        pdfDoc.addPage(firstDonorPage);
    }

    let y = 631.64;
    let counter = 0;
    let page = pdfDoc.addPage();
    // Second pages merge    
    for (const file of files) {

        const filepath = folderName + file;
        const secondPdfBytes = fs.readFileSync(filepath);
        const secondPdfDoc = await PDFDocument.load(secondPdfBytes);
        // Embed the second page of the constitution and clip the preamble
        const pages = secondPdfDoc.getPages();
        const hasTwoPages = pages.length == 2;
        const hasOnePage = pages.length == 1;
        if (!hasOnePage) {
            const pageInfoIndex = hasTwoPages ? 1 : 2;
            const productInfo = await pdfDoc.embedPage(pages[pageInfoIndex], {
                top: 841.89,
                right: 595.28,
                bottom: 631.64,
                left: 0,
            });

            // page dimensions: 595.28 x 841.89
            page.drawPage(productInfo, { x: 0, y, });

            // Loop variables
            counter++;
            y -= 210.25;
            if (counter == 4 && counter !== files.length) {
                y = 631.64;
                counter = 0;
                page = pdfDoc.addPage();
            }
        }
    }

    // PDF save
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(fullpath, pdfBytes);
    return filename;
}

module.exports = { merge }
