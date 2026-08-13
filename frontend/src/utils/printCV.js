/**
 * Opens the browser print dialog for vector-quality PDF export.
 * Uses @media print rules in cv-base.css — only the CV page is printed.
 */
export function printCV({ title = 'Resume' } = {}) {
    const previousTitle = document.title;
    document.body.classList.add('cv-print-mode');
    document.title = title;

    let cleaned = false;
    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        document.body.classList.remove('cv-print-mode');
        document.title = previousTitle;
        window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.setTimeout(() => {
        if (document.body.classList.contains('cv-print-mode')) cleanup();
    }, 5000);

    window.print();
}
