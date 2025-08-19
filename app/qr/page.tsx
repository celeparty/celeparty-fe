"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { axiosUser } from "@/lib/services";

function getStatus(eventDate: string) {
  try {
    // Backend format: YYYY-MM-DD
    const [year, month, day] = eventDate.split('-').map(Number);
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
  const [userData, setUserData] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(null);

  // Check if user is logged in
  const isLoggedIn = !!session;
  
  // Debug: log user role information
  console.log('Session:', session);
  console.log('User data from API:', userData);

  // Get user data from API
  useEffect(() => {
    const getUserData = async () => {
      if (isLoggedIn && session?.jwt) {
        try {
          const userResponse = await axiosUser("GET", "/api/users/me", session.jwt);
          console.log('User API Response:', userResponse);
          setUserData(userResponse);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    getUserData();
  }, [isLoggedIn, session?.jwt]);

  useEffect(() => {
    const check = async () => {
      console.log('=== CHECKING VERIFICATION CONDITIONS ===');
      console.log('isLoggedIn:', isLoggedIn);
      console.log('userData:', userData);
      console.log('userRole:', userData?.role?.type);
      console.log('status:', status);
      console.log('order_id:', order_id);
      
      if (!isLoggedIn) {
        console.log('❌ User not logged in');
        setCanVerify(false);
        return;
      }
      
      // Check if user has vendor role using API data
      const userRole = userData?.role?.type;
      console.log('Checking user role:', userRole);
      if (userRole !== 'vendor') {
        console.log('❌ User is not vendor, role is:', userRole);
        setCanVerify(false);
        return;
      }
      console.log('✅ User is vendor');
      
      if (status !== 'active' || order_id === '') {
        console.log('❌ Status not active or order_id empty. Status:', status, 'Order ID:', order_id);
        setCanVerify(false);
        return;
      }
      console.log('✅ Status is active and order_id exists');
      
      try {
        const res = await fetch(`/api/qr-verify?order_id=${order_id}`);
        const data = await res.json();
        console.log('QR API Response:', data); // Debug: log full response
        console.log('Payment status:', data.data?.payment_status); // Debug: log payment status
        
        if (res.ok && data.data && (data.data.payment_status === 'settlement' || data.data.payment_status === 'Settlement')) {
          console.log('✅ Payment status is settlement, setting canVerify to true');
          setTransactionData(data.data);
          setCanVerify(true);
          // Set verification status
          setVerificationStatus(data.data.verification || false);
        } else {
          console.log('❌ Payment status check failed. Response ok:', res.ok, 'Data exists:', !!data.data, 'Payment status:', data.data?.payment_status);
          setCanVerify(false);
          setVerificationStatus(null);
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
        setCanVerify(false);
      }
    };
    check();
  }, [isLoggedIn, status, order_id, userData]);

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
        setVerificationStatus(true); // Update verification status to true
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
      {verificationStatus !== null && (
        <div className="mb-2">
          <b>Status Verifikasi:</b> 
          <span className={verificationStatus ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
            {verificationStatus ? ' Sudah Diverifikasi' : ' Belum Diverifikasi'}
          </span>
        </div>
      )}
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
      {session && isLoggedIn && userData?.role?.type !== 'vendor' && (
        <div className="mt-4 text-center text-sm text-red-600">
          Hanya user dengan level vendor yang dapat melakukan verifikasi tiket.
        </div>
      )}
      {session && isLoggedIn && userData?.role?.type === 'vendor' && !canVerify && (
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