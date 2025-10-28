import React, { useState, useEffect, useMemo } from 'react';
import { getCustomers, getUninvoicedMemosByCustomer, createSummaryInvoice } from '../../services/googleScriptMock';
import { Customer, MemoData } from '../../types';
import { useToast } from '../../hooks/useToast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import ComboBox from '../ui/ComboBox';
import Input from '../ui/Input';

interface CreateInvoiceFormProps {
    onInvoiceCreated: () => void;
}

const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ onInvoiceCreated }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [memos, setMemos] = useState<MemoData[]>([]);
    const [selectedMemoIds, setSelectedMemoIds] = useState<Set<string>>(new Set());
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
    const [isLoadingMemos, setIsLoadingMemos] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const customerData = await getCustomers();
                setCustomers(customerData);
            } catch (error) {
                addToast('Failed to load customers.', 'error');
            } finally {
                setIsLoadingCustomers(false);
            }
        };
        fetchCustomers();
    }, [addToast]);

    useEffect(() => {
        const fetchMemos = async () => {
            if (!selectedCustomer) {
                setMemos([]);
                setSelectedMemoIds(new Set());
                return;
            }
            setIsLoadingMemos(true);
            try {
                const memoData = await getUninvoicedMemosByCustomer(selectedCustomer);
                setMemos(memoData);
                setSelectedMemoIds(new Set());
            } catch (error) {
                addToast(`Failed to load memos for ${selectedCustomer}.`, 'error');
            } finally {
                setIsLoadingMemos(false);
            }
        };
        fetchMemos();
    }, [selectedCustomer, addToast]);

    const handleMemoSelection = (memoId: string) => {
        setSelectedMemoIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(memoId)) {
                newSet.delete(memoId);
            } else {
                newSet.add(memoId);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = () => {
        if (selectedMemoIds.size === memos.length) {
            setSelectedMemoIds(new Set());
        } else {
            setSelectedMemoIds(new Set(memos.map(m => m.trips_memo_no)));
        }
    }

    const totalAmount = useMemo(() => {
        return memos
            .filter(memo => selectedMemoIds.has(memo.trips_memo_no))
            .reduce((sum, memo) => sum + (parseFloat(memo.trips_balance) || 0), 0);
    }, [memos, selectedMemoIds]);

    const handleSubmit = async () => {
        if (selectedMemoIds.size === 0) {
            addToast('Please select at least one memo.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await createSummaryInvoice(selectedCustomer, Array.from(selectedMemoIds), invoiceDate);
            addToast('Summary invoice created successfully!', 'success');
            onInvoiceCreated();
        } catch (error) {
            addToast('Failed to create invoice.', 'error');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Card title="Create Summary Invoice">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="mb-2 font-medium text-sm text-gray-700 block">Customer</label>
                         <ComboBox
                            options={customers.map(c => ({ value: c.customers_name, label: c.customers_name }))}
                            value={selectedCustomer}
                            onChange={setSelectedCustomer}
                            placeholder="Select a customer..."
                        />
                    </div>
                     <div>
                        <Input
                            id="invoiceDate"
                            label="Invoice Date"
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                        />
                    </div>
                </div>

                {isLoadingMemos && <div className="flex justify-center items-center h-40"><Spinner /></div>}
                
                {!isLoadingMemos && selectedCustomer && memos.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No uninvoiced memos found for this customer.</p>
                    </div>
                )}
                
                {!isLoadingMemos && memos.length > 0 && (
                    <div>
                         <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-semibold">Select Memos to Include</h4>
                            <Button onClick={handleSelectAll} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-1 text-sm">
                                {selectedMemoIds.size === memos.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <div className="overflow-x-auto max-h-[45vh] border rounded-lg">
                            <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-200 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-2 w-12"><input type="checkbox" checked={selectedMemoIds.size === memos.length && memos.length > 0} onChange={handleSelectAll} /></th>
                                        <th className="px-2 py-2 text-left">S.No</th>
                                        <th className="px-2 py-2 text-left">Date</th>
                                        <th className="px-2 py-2 text-left">Memo No</th>
                                        <th className="px-2 py-2 text-left">St Time</th>
                                        <th className="px-2 py-2 text-left">Cl Time</th>
                                        <th className="px-2 py-2 text-right">St KM</th>
                                        <th className="px-2 py-2 text-right">Cl KM</th>
                                        <th className="px-2 py-2 text-right">Total Hours</th>
                                        <th className="px-2 py-2 text-right">Total KM</th>
                                        <th className="px-2 py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memos.map((memo, index) => (
                                        <tr key={memo.trips_memo_no} className="border-b hover:bg-gray-50">
                                            <td className="px-2 py-2"><input type="checkbox" checked={selectedMemoIds.has(memo.trips_memo_no)} onChange={() => handleMemoSelection(memo.trips_memo_no)} /></td>
                                            <td className="px-2 py-2">{index + 1}</td>
                                            <td className="px-2 py-2">{memo.trip_operated_date1}</td>
                                            <td className="px-2 py-2 font-medium">{memo.trips_memo_no}</td>
                                            <td className="px-2 py-2">{memo.trips_starting_time1}</td>
                                            <td className="px-2 py-2">{memo.trips_closing_time1}</td>
                                            <td className="px-2 py-2 text-right">{memo.trips_startingKm1}</td>
                                            <td className="px-2 py-2 text-right">{memo.trips_closingKm1}</td>
                                            <td className="px-2 py-2 text-right">{memo.trips_total_hours}</td>
                                            <td className="px-2 py-2 text-right">{memo.trips_totalKm}</td>
                                            <td className="px-2 py-2 text-right">{parseFloat(memo.trips_balance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end items-center mt-4 space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-lg">
                                <span className="font-semibold">Selected Memos:</span> {selectedMemoIds.size}
                            </div>
                            <div className="text-xl font-bold">
                                <span className="font-semibold">Total:</span> {totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end mt-6">
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedMemoIds.size === 0}>
                        {isSubmitting ? <Spinner /> : 'Create Invoice'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default CreateInvoiceForm;