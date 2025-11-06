import React, { useState, useEffect } from 'react';
import { getInvoiceById, getMemosByIds, getCustomers } from '../services/googleScriptMock';
import { Invoice, MemoData, Customer } from '../types';
import { useToast } from '../hooks/useToast';
import Spinner from './ui/Spinner';
import Button from './ui/Button';
import { numberToWords } from '../utils/numberToWords';

interface InvoiceViewProps {
    invoiceId: number;
    onBack: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoiceId, onBack }) => {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [memos, setMemos] = useState<MemoData[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const invoiceData = await getInvoiceById(invoiceId);
                if (!invoiceData) {
                    addToast('Invoice not found.', 'error');
                    onBack();
                    return;
                }
                setInvoice(invoiceData);

                const memoData = await getMemosByIds(invoiceData.memoIds);
                setMemos(memoData);
                
                const allCustomers = await getCustomers();
                const currentCustomer = allCustomers.find(c => c.customers_name === invoiceData.customerName) || null;
                setCustomer(currentCustomer);

            } catch (error) {
                addToast('Failed to load invoice details.', 'error');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [invoiceId, addToast, onBack]);

    const handleDownload = () => {
        window.print();
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (!invoice) {
        return <div className="text-center py-10">Invoice data could not be loaded.</div>;
    }
    
    const emptyRowCount = Math.max(0, 10 - memos.length);

    return (
        <div className="invoice-print-container">
            <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-300 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start border border-gray-400 p-2">
                    <div className="flex items-center">
                         <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAE0AmoDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAABQACAwQGAQcI/8QAVxAAAQMCBAMFAwgHBgMEBwgLAQIDEQAEIRIxBUFRBWFxEyKBkQYyobHB0fAUI0JS4fEVM2JyFlOCkqKyF0Rjc4OzwjVUdMPiJTRzpEVkhLTDRbTC4v/EABoBAQEBAQEBAQAAAAAAAAAAAAABAgMEBQb/xAAyEQEBAAICAAQEBgMAAwEAAAAAAQIREiEDMUEEURMiMmFxFIGRseHwFCNCwdHxUpLi/9oADAMBAAIRAxEAPwD5GqUoBSlKAUqYpQCpClAKlKUApSlKAUUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUAqYpQClKUApSlAKUpQClKUApSlAKUpQClKUAqUqYoBUhSgFSqlAKUpQClKUApSlAKlKUAqYpQCpClAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUAqUqUAqUqUApUqUApUqYoBUhSgFKlAKlKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQCpUqUApUqUApUqYoBUhSgFKlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQCpUqUApUqUApUqYoBUhSgFKlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQCpUqUApUqUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApUqUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUp- //wAARCAEBAJADASIAAhEBAxEB/9oADAMBAAIRAxEAPwD5G//gAAAAABgAAAAAYAAAYAAAGAADAAAAAAYAAAGAAYAAAGAADAAAGAAYAAAYAAAAAGAABgAAGAAAYABgAAGAAAYABgAAGAAAAABgAAYAAAYAAAAAGAAYAAAGAAYAAAAAAYABgAAGAAAAAAYABgAAGAAAAAAYABgAAGAAAAAAYABgAAGAAAAAAYABgAAGAAAAAAYABgAAGAAAAAAGAAYAAAYABgAAGAAYAAAGAAYABgAAGAAYAAAYABgAAGAAYAAAGAAYAAAYABgAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAAAAYAAAYAAAGAAAAAAwAAAwAAGAAAGAAwAABgAAGAAAGAAAAABgAAYAAAwAAGAAAAABgAAGAAAGAAAGAAAGAAYAAAYABgAAGAAAAABgAAGAAAGAAAAABgAAGAAAGAAAGAAYAAAYABgAAGAAAAABgAAGAAAGAAAGAAAGAAYAAAYAAAAAGAAYAAAYAAAAAAGAAYAAAYAAAAAAGAAYAAAYABgAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAGAAYAAAAAAYAAAYAAAAA//2Q==" alt="SBT Transport Logo" className="h-24 w-auto mr-4"/>
                        <div>
                            <h1 className="text-xl font-bold text-blue-700">SRI BALAJI TRANSPORT</h1>
                            <p className="text-xs font-bold">NO:3/96, Kumaran Kudil Annex 3rd Street, Thuraipakkam, Chennai-97</p>
                            <p className="text-xs font-bold">Phone: 87789-92624, 97907-24160 | Email: sbttransport.75@gmail.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold">INVOICE</h2>
                        <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
                        <p><strong>Date:</strong> {invoice.invoiceDate}</p>
                    </div>
                </div>

                {/* Bill To */}
                <div className="border border-t-0 border-gray-400 p-2">
                    <h3 className="font-bold text-sm">BILL TO:</h3>
                    <p className="font-bold">{customer?.customers_name}</p>
                    <p>{customer?.customers_address1}</p>
                    <p>{customer?.customers_address2}</p>
                </div>

                {/* Memos Table */}
                <div className="border border-t-0 border-gray-400 flex-grow">
                     <table className="min-w-full text-sm">
                        <thead className="bg-green-200 font-bold text-center text-xs">
                            <tr>
                                <th className="p-1 border-r border-gray-400">S.No</th>
                                <th className="p-1 border-r border-gray-400 text-left">Date</th>
                                <th className="p-1 border-r border-gray-400 text-left">Hire Memo No</th>
                                <th className="p-1 border-r border-gray-400">ST Time</th>
                                <th className="p-1 border-r border-gray-400">CL Time</th>
                                <th className="p-1 border-r border-gray-400">ST KM</th>
                                <th className="p-1 border-r border-gray-400">CL KM</th>
                                <th className="p-1 border-r border-gray-400">Total Hours</th>
                                <th className="p-1 border-r border-gray-400">Total KM</th>
                                <th className="p-1 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memos.map((memo, index) => (
                                <tr key={memo.trips_memo_no} className="border-b border-gray-300">
                                    <td className="p-1 border-r border-gray-400 text-center">{index + 1}</td>
                                    <td className="p-1 border-r border-gray-400">{memo.trip_operated_date1}</td>
                                    <td className="p-1 border-r border-gray-400">{memo.trips_memo_no}</td>
                                    <td className="p-1 border-r border-gray-400 text-center">{memo.trips_starting_time1}</td>
                                    <td className="p-1 border-r border-gray-400 text-center">{memo.trips_closing_time1}</td>
                                    <td className="p-1 border-r border-gray-400 text-right">{memo.trips_startingKm1}</td>
                                    <td className="p-1 border-r border-gray-400 text-right">{memo.trips_closingKm1}</td>
                                    <td className="p-1 border-r border-gray-400 text-center">{memo.trips_total_hours}</td>
                                    <td className="p-1 border-r border-gray-400 text-right">{memo.trips_totalKm}</td>
                                    <td className="p-1 text-right">{parseFloat(memo.trips_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                            {Array.from({ length: emptyRowCount }).map((_, index) => (
                                <tr key={`empty-${index}`} className="border-b border-gray-300">
                                    <td className="p-1 border-r border-gray-400 h-6">&nbsp;</td>
                                    <td className="p-1 border-r border-gray-400">&nbsp;</td>
                                    <td className="p-1 border-r border-gray-400">&nbsp;</td>
                                    <td className="p-1 border-r border-gray-400">&nbsp;</td>
                                    <td className="p-1 border-r border-gray-400">&nbsp;</td>
                                    <td className="p-1 border-r border-gray-400">&nbsp;</td>
                                    <td className="p-1 border-r border-gray-400">&nbsp;</td>
                                    <td className="p-1 border-r border-gray-400">&nbsp;</td>
                                    <td className="p-1 border-r border-gray-400">&nbsp;</td>
                                    <td className="p-1">&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-gray-100">
                                <td colSpan={9} className="p-2 text-right">Grand Total</td>
                                <td className="p-2 text-right">{invoice.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                 <div className="grid grid-cols-12 border border-t-0 border-gray-400">
                    <div className="col-span-12 p-2 border-b border-gray-400">
                       <p className="text-sm"><strong>Amount in Words:</strong> {numberToWords(Math.round(invoice.totalAmount))}</p>
                    </div>
                    <div className="col-span-8 p-2 border-r border-gray-400">
                         <h5 className="font-bold text-sm">BANK DETAILS:</h5>
                        <p className="text-xs"><strong>Bank Name:</strong> STATE BANK OF INDIA</p>
                        <p className="text-xs"><strong>Branch:</strong> ELDAMS ROAD BRANCH ALWARPET</p>
                        <p className="text-xs"><strong>A/C No:</strong> 42804313699</p>
                        <p className="text-xs"><strong>IFSC:</strong> SBIN0002209</p>
                    </div>
                    <div className="col-span-4 p-2 text-center self-end">
                        <p className="font-bold">SRI BALAJI TRANSPORT</p>
                        <p className="text-sm mt-8 border-t border-gray-500 pt-1">Authorized Signatory</p>
                    </div>
                 </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6 print-hide">
                <Button type="button" onClick={onBack} className="bg-gray-500 hover:bg-gray-600">Back</Button>
                <Button type="button" onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PDF
                </Button>
            </div>
        </div>
    );
};

export default InvoiceView;