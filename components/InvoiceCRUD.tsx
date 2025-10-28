import React, { useState, useEffect, useMemo } from 'react';
import { getInvoices, deleteInvoice } from '../services/googleScriptMock';
import { Invoice } from '../types';
import { useToast } from '../hooks/useToast';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Input from './ui/Input';

interface InvoiceCRUDProps {
    onViewInvoice: (invoiceId: number) => void;
}

const InvoiceCRUD: React.FC<InvoiceCRUDProps> = ({ onViewInvoice }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getInvoices();
            setInvoices(data.sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber)));
        } catch (error) {
            addToast('Failed to fetch invoices.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm) {
            return invoices;
        }
        return invoices.filter(invoice =>
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [invoices, searchTerm]);

    const openDeleteConfirmation = (invoice: Invoice) => {
        setInvoiceToDelete(invoice);
        setIsDeleteConfirmOpen(true);
    };

    const closeDeleteConfirmation = () => {
        setInvoiceToDelete(null);
        setIsDeleteConfirmOpen(false);
    };

    const handleDelete = async () => {
        if (invoiceToDelete) {
            setIsSubmitting(true);
            try {
                await deleteInvoice(invoiceToDelete.id);
                addToast('Invoice deleted successfully', 'success');
                await fetchData();
            } catch (error) {
                addToast('Failed to delete invoice', 'error');
            } finally {
                setIsSubmitting(false);
                closeDeleteConfirmation();
            }
        }
    };

    const headers = ["Invoice No", "Date", "Customer Name", "Memo Count", "Total Amount", "Actions"];

    return (
        <Card title="Manage Summary Invoices">
            <div className="flex justify-between items-center mb-4">
                <Input
                    id="search"
                    label=""
                    placeholder="Search by Invoice No or Customer..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner /></div>
            ) : (
                <div className="overflow-x-auto max-h-[70vh]">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-200 sticky top-0">
                            <tr>
                                {headers.map((header) => (
                                    <th key={header} className="px-4 py-2 text-left font-semibold text-gray-700">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((invoice) => (
                                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{invoice.invoiceNumber}</td>
                                    <td className="px-4 py-2">{invoice.invoiceDate}</td>
                                    <td className="px-4 py-2">{invoice.customerName}</td>
                                    <td className="px-4 py-2 text-center">{invoice.memoIds.length}</td>
                                    <td className="px-4 py-2 text-right">{invoice.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex space-x-4">
                                            <button onClick={() => onViewInvoice(invoice.id)} className="text-blue-600 hover:underline">View</button>
                                            <button onClick={() => openDeleteConfirmation(invoice)} className="text-red-600 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
             {isDeleteConfirmOpen && invoiceToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p>Are you sure you want to delete invoice <strong>{invoiceToDelete.invoiceNumber}</strong>? Associated memos will become available for invoicing again. This action cannot be undone.</p>
                        <div className="flex justify-end mt-6 space-x-3">
                            <Button onClick={closeDeleteConfirmation} className="bg-gray-300 text-gray-800 hover:bg-gray-400">Cancel</Button>
                            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner/> : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default InvoiceCRUD;
