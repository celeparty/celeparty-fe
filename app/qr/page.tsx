"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

function getStatus(eventDate: string) {
  try {
    const [day, month, year] = eventDate.split('-').map(Number);
    const event = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0,0,0,0);
    event.setHours(0,0,0,0);
    return today <= event ? 'active' : 'not active';
  } catch (error) {
    return 'not active';
  }
}

function QRPageContent() {
  const params = useSearchParams();
  const { data: session } = useSession();
  const order_id = params.get('order_id') || '';
  const event_date = params.get('event_date') || '';
  const customer_name = params.get('customer_name') || '';
  const email = params.get('email') || '';
  const event_type = params.get('event_type') || '';
  const status = event_date !== '' ? getStatus(event_date) : '';

  const [notif, setNotif] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [canVerify, setCanVerify] = useState(false);

  // Check if user is logged in
  const isLoggedIn = !!session;

  useEffect(() => {
    const check = async () => {
      if (!isLoggedIn) {
        setCanVerify(false);
        return;
      }
      if (status !== 'active' || order_id === '') {
        setCanVerify(false);
        return;
      }
      try {
        const res = await fetch(`/api/qr-verify?order_id=${order_id}`);
        const data = await res.json();
        if (res.ok && data.data && data.data.payment_status === 'settlement') {
          setTransactionData(data.data);
          setCanVerify(true);
        } else {
          setCanVerify(false);
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
        setCanVerify(false);
      }
    };
    check();
  }, [isLoggedIn, status, order_id]);

  const handleVerify = async () => {
    if (!canVerify || !transactionData?.id) {
      setNotif('Tidak dapat melakukan verifikasi.');
      return;
    }
    setNotif(null);
    setLoading(true);
    
    try {
      const findRes = await fetch(`/api/qr-verify?order_id=${order_id}`);
      const findData = await findRes.json();
      
      if (!findRes.ok || !findData.data) {
        setNotif('Order ID tidak ditemukan di database.');
        setLoading(false);
        return;
      }
      
      const documentId = findData.data.documentId;
      if (!documentId) {
        setNotif('Document ID tidak ditemukan.');
        setLoading(false);
        return;
      }
      
      // 2. PUT ke Strapi dengan documentId
      const updateRes = await fetch(`/api/update-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentId: documentId 
        }),
      });
      
      const updateData = await updateRes.json();
      
      if (updateRes.ok) {
        setNotif('Tiket berhasil diverifikasi!');
      } else {
        setNotif(`Gagal verifikasi tiket: ${updateData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setNotif('Terjadi error saat verifikasi.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto my-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">E-Ticket Celeparty</h1>
      <div className="mb-2"><b>Order ID:</b> {order_id}</div>
      <div className="mb-2"><b>Nama Pemesan:</b> {decodeURIComponent(customer_name)}</div>
      <div className="mb-2"><b>Email:</b> {email}</div>
      <div className="mb-2"><b>Event Type:</b> {event_type}</div>
      <div className="mb-2"><b>Tanggal Acara:</b> {event_date}</div>
      <div className="mb-2"><b>Status Tiket:</b> <span className={status === 'active' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{status}</span></div>
      {!session && (
        <div className="mt-4 text-center text-sm text-red-600">
          Silakan login untuk melakukan verifikasi.
        </div>
      )}
      {session && !isLoggedIn && (
        <div className="mt-4 text-center text-sm text-red-600">
          Silakan login untuk melakukan verifikasi.
        </div>
      )}
      {session && isLoggedIn && !canVerify && (
        <div className="mt-4 text-center text-sm text-red-600">
          Tiket tidak dapat diverifikasi. Pastikan status pembayaran settlement dan tiket aktif.
        </div>
      )}
      <div className="mt-6 text-center">
        {canVerify && (
          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </button>
        )}
        {notif && <div className="mt-4 text-center text-sm font-semibold text-red-600">{notif}</div>}
      </div>
    </div>
  )
}

export default function QRPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto my-16 p-6 bg-white rounded shadow text-center">Loading...</div>}>
      <QRPageContent />
    </Suspense>
  )
} 