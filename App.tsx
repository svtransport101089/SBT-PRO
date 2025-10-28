import React, { useState, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import PageWrapper from './components/layout/PageWrapper';
import CustomerCRUD from './components/CustomerCRUD';
import ViewServices from './components/ViewServices';
import MemoForm from './components/forms/MemoForm';
import { ToastProvider } from './hooks/useToast';
import { Page } from './types';
import Dashboard from './components/Dashboard';
import AreasCRUD from './components/AreasCRUD';
import CalculationsCRUD from './components/CalculationsCRUD';
import MemoCRUD from './components/MemoCRUD';
import LookupCRUD from './components/LookupCRUD';
import CreateInvoiceForm from './components/forms/CreateInvoiceForm';
import InvoiceCRUD from './components/InvoiceCRUD';
import InvoiceView from './components/InvoiceView';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [editingMemoNo, setEditingMemoNo] = useState<string | null>(null);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<number | null>(null);
  const [printOnLoad, setPrintOnLoad] = useState(false);

  const handleNavigate = (page: Page) => {
    setEditingMemoNo(null);
    setViewingInvoiceId(null);
    setPrintOnLoad(false);
    setCurrentPage(page);
  };
  
  const handleCreateMemo = () => {
    setEditingMemoNo(null);
    setPrintOnLoad(false);
    setCurrentPage(Page.MEMO);
  };

  const handleEditMemo = (memoNo: string) => {
    setEditingMemoNo(memoNo);
    setPrintOnLoad(false);
    setCurrentPage(Page.MEMO);
  };

  const handleDownloadMemo = (memoNo: string) => {
    setEditingMemoNo(memoNo);
    setPrintOnLoad(true);
    setCurrentPage(Page.MEMO);
  };

  const handleMemoFormClose = () => {
    setEditingMemoNo(null);
    setPrintOnLoad(false);
    setCurrentPage(Page.MANAGE_MEMOS);
  };
  
  const handleInvoiceCreated = () => {
    setCurrentPage(Page.MANAGE_INVOICES);
  };
  
  const handleViewInvoice = (invoiceId: number) => {
    setViewingInvoiceId(invoiceId);
    setCurrentPage(Page.VIEW_INVOICE);
  };
  
  const handleCloseInvoiceView = () => {
    setViewingInvoiceId(null);
    setCurrentPage(Page.MANAGE_INVOICES);
  }

  const renderPage = useMemo(() => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard />;
      case Page.MEMO:
        return <MemoForm 
                  memoToLoad={editingMemoNo} 
                  onSaveSuccess={handleMemoFormClose}
                  onCancel={handleMemoFormClose} 
                  printOnLoad={printOnLoad}
                  onPrinted={handleMemoFormClose}
               />;
      case Page.MANAGE_MEMOS:
        return <MemoCRUD onEditMemo={handleEditMemo} onDownloadMemo={handleDownloadMemo} />;
      case Page.CREATE_INVOICE:
        return <CreateInvoiceForm onInvoiceCreated={handleInvoiceCreated} />;
      case Page.MANAGE_INVOICES:
        return <InvoiceCRUD onViewInvoice={handleViewInvoice} />;
      case Page.VIEW_INVOICE:
        return <InvoiceView invoiceId={viewingInvoiceId!} onBack={handleCloseInvoiceView} />;
      case Page.MANAGE_CUSTOMERS:
        return <CustomerCRUD />;
      case Page.VIEW_ALL_SERVICES:
        return <ViewServices />;
      case Page.MANAGE_AREAS:
        return <AreasCRUD />;
      case Page.MANAGE_CALCULATIONS:
        return <CalculationsCRUD />;
      case Page.MANAGE_LOOKUP:
        return <LookupCRUD />;
      default:
        return <Dashboard />;
    }
  }, [currentPage, editingMemoNo, printOnLoad, viewingInvoiceId]);

  const pageTitle = useMemo(() => {
    if (currentPage === Page.MEMO && editingMemoNo) {
      return printOnLoad ? `Download Memo: ${editingMemoNo}` : `Edit Memo: ${editingMemoNo}`;
    }
    const pageName = currentPage.replace(/_/g, ' ');
    return pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase();
  }, [currentPage, editingMemoNo, printOnLoad]);


  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar currentPage={currentPage} setCurrentPage={handleNavigate} onCreateMemo={handleCreateMemo} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={pageTitle} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <PageWrapper>
              {renderPage}
            </PageWrapper>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default App;