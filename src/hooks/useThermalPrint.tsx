import { useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { ReceiptTemplate, ReceiptData } from '@/components/receipt/ReceiptTemplate';

export const useThermalPrint = () => {
  const printReceipt = useCallback((receiptData: ReceiptData, paperWidth: '58mm' | '80mm' = '58mm') => {
    // 1. Buat iframe tersembunyi
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // 2. Salin seluruh CSS dari document utama ke iframe (agar Tailwind & CSS @media print terbawa)
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Struk - ${receiptData.invoiceNo}</title>
          ${Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((node) => node.outerHTML)
            .join('')}
        </head>
        <body>
          <div id="receipt-root"></div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // 3. Render komponen ReceiptTemplate ke dalam iframe
    const container = iframeDoc.getElementById('receipt-root');
    if (container) {
      const root = ReactDOM.createRoot(container);
      root.render(<ReceiptTemplate data={receiptData} paperWidth={paperWidth} />);

      // 4. Eksekusi window.print() setelah komponen ter-render
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Bersihkan iframe dari DOM setelah dialog print ditutup
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
    }
  }, []);

  return { printReceipt };
};