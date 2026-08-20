import React from 'react';
import { pdf } from '@react-pdf/renderer';
import CVPdfDocument from '../Components/Pdf/CVPdfDocument';
import { parseCV } from './parseCV';

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

/**
 * Generate and download a vector PDF using @react-pdf/renderer.
 */
export async function exportCvPdf({ markdown, format = 'Professional', filename = 'Resume' }) {
    const data = parseCV(markdown);
    const doc = React.createElement(CVPdfDocument, { data, format });
    const blob = await pdf(doc).toBlob();
    triggerDownload(blob, filename);
}
