import React from 'react';
import dayjs from 'dayjs';

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  subtotal: number;
  note?: string;
}

export interface ReceiptData {
  tenantName: string;
  tenantAddress?: string;
  tenantPhone?: string;
  invoiceNo: string;
  createdAt: string | Date;
  cashierName: string;
  customerName?: string;
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | string;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  grandTotal: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
  footerNote?: string;
}

interface ReceiptTemplateProps {
  data: ReceiptData;
  paperWidth?: '58mm' | '80mm';
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
  data,
  paperWidth = '58mm',
}) => {
  const is58mm = paperWidth === '58mm';

  console.log({ data })

  return (
    <>
      {/* 💡 CSS KHUSUS PRINT */}
      <style>{`
        @page {
          size: ${paperWidth} auto;
          margin: 0; /* Hapus header/footer tanggal & URL bawaan browser */
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
            font-family: 'Courier New', Courier, monospace, sans-serif;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* 🧾 CONTAINER STRUK */}
      <div
        className={`bg-white text-black font-mono p-2 text-xs leading-tight mx-auto ${
          is58mm ? 'w-[58mm] max-w-[58mm]' : 'w-[80mm] max-w-[80mm]'
        }`}
        style={{ fontSize: '11px' }}
      >
        {/* 1. HEADER OUTLET */}
        <div className="text-center mb-2">
          <h1 className="font-extrabold text-sm uppercase tracking-wide">
            {data.tenantName}
          </h1>
          {data.tenantAddress && (
            <p className="text-[10px] mt-0.5">{data.tenantAddress}</p>
          )}
          {data.tenantPhone && (
            <p className="text-[10px]">Telp: {data.tenantPhone}</p>
          )}
        </div>

        {/* GARIS PEMBATAS DASHED */}
        <div className="border-b border-dashed border-black my-1.5" />

        {/* 2. METADATA TRANSAKSI */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>No: {data.invoiceNo}</span>
            <span className="font-bold">
              {data.orderType ? data.orderType.toUpperCase() : 'TAKEAWAY'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Waktu:</span>
            <span>{dayjs(data.createdAt).format('DD/MM/YY HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir: {data.cashierName}</span>
            {data.customerName && (
              <span>Plg: {data.customerName.slice(0, 10)}</span>
            )}
          </div>
        </div>

        <div className="border-b border-dashed border-black my-1.5" />

        {/* 3. DAFTAR ITEM DIBELI */}
        <div className="space-y-1">
          {data.items.map((item, index) => (
            <div key={index} className="text-[10px]">
              <div className="font-bold uppercase leading-tight">
                {item.name}
              </div>
              <div className="flex justify-between text-[10px] pl-1">
                <span>
                  {item.qty} x Rp {item.price.toLocaleString('id-ID')}
                </span>
                <span className="font-semibold">
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              {item.note && (
                <div className="text-[9px] italic pl-1 text-gray-700">
                  * {item.note}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-black my-1.5" />

        {/* 4. TOTAL & PEMBAYARAN */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {data.subtotal.toLocaleString('id-ID')}</span>
          </div>

          {Boolean(data.discount && data.discount > 0) && (
            <div className="flex justify-between">
              <span>Diskon:</span>
              <span>-Rp {data.discount?.toLocaleString('id-ID')}</span>
            </div>
          )}

          <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-black my-0.5">
            <span>TOTAL:</span>
            <span>Rp {data.grandTotal.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between pt-0.5">
            <span>Bayar ({data.paymentMethod.toUpperCase()}):</span>
            <span>Rp {data.paidAmount.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between">
            <span>Kembali:</span>
            <span>Rp {data.changeAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-2" />

        {/* 5. FOOTER */}
        <div className="text-center text-[9px] space-y-1">
          <p className="font-semibold">{data.footerNote || 'Terima kasih atas kunjungan Anda!'}</p>
          <p className="text-[8px] tracking-widest uppercase">
            Powered by Julu POS
          </p>
        </div>
      </div>
    </>
  );
};