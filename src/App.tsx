/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BookingForm from './components/BookingForm';
import CustomerDirectory from './components/CustomerDirectory';
import Challenge from './components/Challenge';
import Login from './components/Login';
import Modal from './components/Modal';
import { LayoutDashboard, Users, PlusCircle, Search, Menu, X, Trash2, CheckCircle2, AlertCircle, Heart, Star, Target } from 'lucide-react';
import { Booking, Customer, ChallengeData } from './types';
import { cn } from './lib/utils';
import { differenceInHours, parseISO, isBefore, addHours } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import { db, auth, signInAnon, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, updateDoc, getDocs } from 'firebase/firestore';

// Mock Data
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_BOOKINGS: Booking[] = [];

const LOCATIONS = [
  '5 جويلة',
  'سرسوف',
  'تافسيت',
  'قطع الواد',
  'الشموع',
  'ادريان',
  'سرسوف الفراي',
  'مالطا',
  'الجزيرة',
  'فيراج انكوف',
  'انكوف',
  'الوئام'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [pendingReminders, setPendingReminders] = useState<Array<{ booking: Booking, type: '24h' | '1h' }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [showMassDeleteConfirm, setShowMassDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);

  // Auth listener
  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect result error:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore listeners
  useEffect(() => {
    if (!user) return;

    const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Booking);
      setBookings(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookings'));

    const customersQuery = query(collection(db, 'customers'), orderBy('name', 'asc'));
    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Customer);
      setCustomers(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'customers'));

    const unsubscribeChallenge = onSnapshot(doc(db, 'challenges', 'marriage_challenge'), (snapshot) => {
      const defaultAppliances = [
        { id: 'tv', name: 'تلفاز', bought: false },
        { id: 'ac', name: 'مكيف', bought: false },
        { id: 'wm', name: 'غسالة', bought: false },
        { id: 'fridge', name: 'فريجدار', bought: false },
        { id: 'heater', name: 'سخان', bought: false },
        { id: 'oven', name: 'فور', bought: false },
        { id: 'microwave', name: 'ميكروويف', bought: false },
        { id: 'vacuum', name: 'مكنسة', bought: false },
        { id: 'iron', name: 'مكواة', bought: false },
        { id: 'blender', name: 'خلاط', bought: false },
        { id: 'dishwasher', name: 'غسالة أواني', bought: false },
        { id: 'stove', name: 'طباخة', bought: false },
        { id: 'hood', name: 'شفاط مطبخ', bought: false },
        { id: 'coffee', name: 'محضرة قهوة', bought: false },
        { id: 'mixer', name: 'عجانة', bought: false }
      ];

      if (snapshot.exists()) {
        const data = snapshot.data() as ChallengeData;
        // Migration: Add missing appliances
        if (!data.appliances || data.appliances.length < defaultAppliances.length) {
          const existingIds = new Set(data.appliances?.map(a => a.id) || []);
          const missingAppliances = defaultAppliances.filter(a => !existingIds.has(a.id));
          
          if (missingAppliances.length > 0) {
            const updatedAppliances = [...(data.appliances || []), ...missingAppliances];
            updateDoc(doc(db, 'challenges', 'marriage_challenge'), {
              appliances: updatedAppliances,
              updatedAt: new Date().toISOString()
            }).catch(err => console.error("Error migrating appliances:", err));
          }
        }
        setChallengeData({ id: snapshot.id, ...data } as ChallengeData);
      } else {
        const initialChallenge: ChallengeData = {
          id: 'marriage_challenge',
          targetAmount: 50000000,
          currentAmount: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(2026, 9, 1).toISOString(),
          updatedAt: new Date().toISOString(),
          appliances: defaultAppliances
        };
        setDoc(doc(db, 'challenges', 'marriage_challenge'), initialChallenge)
          .catch(err => console.error("Error initializing challenge:", err));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'challenges/marriage_challenge'));

    return () => {
      unsubscribeBookings();
      unsubscribeCustomers();
      unsubscribeChallenge();
    };
  }, [user]);

  // Automated Reminder Check Logic
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const newReminders: Array<{ booking: Booking, type: '24h' | '1h' }> = [];

      bookings.forEach(booking => {
        if (booking.status !== 'active') return;

        const startDateTime = parseISO(`${booking.startDate}T${booking.pickupTime}`);
        const hoursToStart = differenceInHours(startDateTime, now);

        // 24h Reminder
        if (hoursToStart <= 24 && hoursToStart > 1 && !booking.reminder24hSent) {
          newReminders.push({ booking, type: '24h' });
        }

        // 1h Reminder
        if (hoursToStart <= 1 && hoursToStart > 0 && !booking.reminder1hSent) {
          newReminders.push({ booking, type: '1h' });
        }
      });

      setPendingReminders(newReminders);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [bookings]);

  const handleSendReminder = (booking: Booking, type: '24h' | '1h') => {
    let message = '';
    if (type === '24h') {
      message = `تذكير: حجزك لخيمة رقم ${booking.tentId} يبدأ غداً في تمام الساعة ${booking.pickupTime}. المبلغ المتبقي: ${booking.remaining} د.ج. نتطلع لرؤيتك!`;
    } else {
      message = `تذكير: موعد استلام خيمتك (رقم ${booking.tentId}) بعد ساعة واحدة. يرجى التواجد في الموقع. المبلغ المتبقي: ${booking.remaining} د.ج.`;
    }

    const url = `https://wa.me/${booking.customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Mark as sent
    const bookingRef = doc(db, 'bookings', booking.id);
    updateDoc(bookingRef, {
      [type === '24h' ? 'reminder24hSent' : 'reminder1hSent']: true
    }).catch(error => handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`));
  };

  const handleSaveBooking = async (bookingData: Partial<Booking>) => {
    if (!user) {
      alert("يرجى الانتظار حتى يتم تسجيل الدخول...");
      return;
    }

    try {
      if (editingBooking) {
        const bookingRef = doc(db, 'bookings', editingBooking.id);
        const updatedData = {
          ...editingBooking,
          ...bookingData,
          updatedAt: new Date().toISOString()
        };
        await setDoc(bookingRef, updatedData, { merge: true });
      } else {
        // Find or create customer
        let customerId = bookingData.customerId;
        const existingCustomer = customers.find(c => c.phone === bookingData.customerPhone);
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Create new customer
          const customerRef = doc(collection(db, 'customers'));
          customerId = customerRef.id;
          await setDoc(customerRef, {
            id: customerId,
            name: bookingData.customerName,
            phone: bookingData.customerPhone,
            lastBookingDate: new Date().toISOString()
          });
        }

        // Create new booking
        const bookingRef = doc(collection(db, 'bookings'));
        const newBooking: Booking = {
          ...bookingData,
          id: bookingRef.id,
          customerId: customerId,
          createdAt: new Date().toISOString(),
          status: bookingData.status || 'active',
          reminder24hSent: false,
          reminder1hSent: false
        } as Booking;
        
        await setDoc(bookingRef, newBooking);
      }
      setShowBookingForm(false);
      setEditingBooking(null);
      setActiveTab('dashboard');
      setSuccessMessage(editingBooking ? 'تم تحديث الحجز بنجاح.' : 'تم إضافة الحجز بنجاح.');
    } catch (error) {
      console.error("Error saving booking:", error);
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowBookingForm(true);
  };

  const handleDeleteBooking = (id: string) => {
    setBookingToDelete(id);
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      const loadingToast = toast.loading('جاري حذف الحجز...');
      try {
        await deleteDoc(doc(db, 'bookings', bookingToDelete));
        setBookingToDelete(null);
        toast.success('تم حذف الحجز بنجاح', { id: loadingToast });
      } catch (error) {
        toast.error('فشل الحذف. تأكد من صلاحياتك.', { id: loadingToast });
        handleFirestoreError(error, OperationType.DELETE, `bookings/${bookingToDelete}`);
      }
    }
  };

  const handleUpdateChallenge = async (amount: number) => {
    if (!challengeData) return;
    const challengeRef = doc(db, 'challenges', 'marriage_challenge');
    try {
      await updateDoc(challengeRef, {
        currentAmount: (challengeData.currentAmount || 0) + amount,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'challenges/marriage_challenge');
    }
  };

  const handleResetChallenge = async () => {
    const challengeRef = doc(db, 'challenges', 'marriage_challenge');
    try {
      await updateDoc(challengeRef, {
        currentAmount: 0,
        updatedAt: new Date().toISOString(),
        appliances: [
          { id: 'tv', name: 'تلفاز', bought: false },
          { id: 'ac', name: 'مكيف', bought: false },
          { id: 'wm', name: 'غسالة', bought: false },
          { id: 'fridge', name: 'فريجدار', bought: false },
          { id: 'heater', name: 'سخان', bought: false },
          { id: 'oven', name: 'فور', bought: false },
          { id: 'microwave', name: 'ميكروويف', bought: false },
          { id: 'vacuum', name: 'مكنسة', bought: false },
          { id: 'iron', name: 'مكواة', bought: false },
          { id: 'blender', name: 'خلاط', bought: false },
          { id: 'dishwasher', name: 'غسالة أواني', bought: false },
          { id: 'stove', name: 'طباخة', bought: false },
          { id: 'hood', name: 'شفاط مطبخ', bought: false },
          { id: 'coffee', name: 'محضرة قهوة', bought: false },
          { id: 'mixer', name: 'عجانة', bought: false }
        ]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'challenges/marriage_challenge');
    }
  };

  const handleToggleAppliance = async (applianceId: string) => {
    if (!challengeData || !challengeData.appliances) return;
    const challengeRef = doc(db, 'challenges', 'marriage_challenge');
    const updatedAppliances = challengeData.appliances.map(a => 
      a.id === applianceId ? { ...a, bought: !a.bought } : a
    );
    try {
      await updateDoc(challengeRef, {
        appliances: updatedAppliances,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'challenges/marriage_challenge');
    }
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomerToDelete(id);
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDelete) {
      const loadingToast = toast.loading('جاري حذف الزبون...');
      try {
        await deleteDoc(doc(db, 'customers', customerToDelete));
        setCustomerToDelete(null);
        toast.success('تم حذف الزبون بنجاح', { id: loadingToast });
      } catch (error) {
        toast.error('فشل الحذف. تأكد من صلاحياتك.', { id: loadingToast });
        handleFirestoreError(error, OperationType.DELETE, `customers/${customerToDelete}`);
      }
    }
  };

  const handleMarkAsCompleted = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'completed' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.customerPhone.includes(searchTerm);
    const matchesLocation = locationFilter === 'all' || b.location.includes(locationFilter);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const filteredTotalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      user={user}
      setActiveTab={(tab) => {
      if (tab === 'new-booking') {
        setEditingBooking(null);
        setShowBookingForm(true);
      } else {
        setActiveTab(tab);
      }
    }}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          bookings={bookings} 
          pendingReminders={pendingReminders}
          onEditBooking={handleEditBooking} 
          onSendReminder={handleSendReminder}
          onDeleteBooking={handleDeleteBooking}
          onViewAll={() => setActiveTab('bookings')}
          user={user}
        />
      )}
      
      {activeTab === 'customers' && (
        <CustomerDirectory 
          customers={customers} 
          bookings={bookings} 
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">سجل الحجوزات</h2>
              <p className="text-[#1A1A1A]/60 font-medium">البحث والفلترة في جميع الحجوزات</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="flex bg-[#1A1A1A]/5 p-1 rounded-2xl">
                <button 
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                    statusFilter === 'all' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                  )}
                >
                  الكل
                </button>
                <button 
                  onClick={() => setStatusFilter('active')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                    statusFilter === 'active' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                  )}
                >
                  نشط
                </button>
                <button 
                  onClick={() => setStatusFilter('completed')}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                    statusFilter === 'completed' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                  )}
                >
                  مكتمل
                </button>
              </div>
              <div className="relative w-full md:w-64">
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="w-full pl-14 pr-6 py-4 bg-white border border-[#1A1A1A]/5 rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] transition-all font-bold shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-6 py-4 bg-white border border-[#1A1A1A]/5 rounded-2xl font-bold shadow-sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="all">كل المواقع</option>
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Revenue Summary for Filtered View */}
          <div className="bg-[#1A1A1A] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl shadow-[#1A1A1A]/20">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">إجمالي مبالغ الحجوزات المعروضة</p>
              <h3 className="text-4xl font-bold tracking-tight">
                {filteredTotalRevenue.toLocaleString()} <span className="text-xl opacity-40">د.ج</span>
              </h3>
            </div>
            <div className="px-6 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-white/60">عدد الحجوزات: {filteredBookings.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white p-6 rounded-3xl border border-[#1A1A1A]/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-[#1A1A1A]/5 rounded-xl flex items-center justify-center font-bold">
                    {booking.tentId}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A]">{booking.customerName}</h4>
                    <p className="text-sm text-[#1A1A1A]/40">{booking.startDate} إلى {booking.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                    booking.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-[#1A1A1A]/5 text-[#1A1A1A]/40"
                  )}>
                    {booking.status === 'active' ? 'نشط' : 'مكتمل'}
                  </span>
                  {booking.status === 'active' && (
                    <button 
                      onClick={() => handleMarkAsCompleted(booking.id)}
                      className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      إكمال
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditBooking(booking)}
                    className="text-sm font-bold text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'challenge' && (
        <Challenge 
          data={challengeData}
          onUpdate={handleUpdateChallenge}
          onReset={handleResetChallenge}
          onToggleAppliance={handleToggleAppliance}
        />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">الإعدادات</h2>
            <p className="text-[#1A1A1A]/60 font-medium">إدارة التطبيق والبيانات</p>
          </div>

          <div className="bg-white p-12 rounded-[3rem] border border-[#1A1A1A]/5 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-500">منطقة الخطر</h3>
              <p className="text-[#1A1A1A]/60">سيؤدي مسح البيانات إلى حذف جميع الحجوزات والزبائن بشكل نهائي.</p>
              <button 
                onClick={() => setShowMassDeleteConfirm(true)}
                className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                مسح جميع البيانات
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shams' && (
        <div className="space-y-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">شمس</h2>
            <p className="text-[#1A1A1A]/60 font-medium">رسالة شكر وتقدير</p>
          </div>

          <div className="bg-white p-12 rounded-[3rem] border border-[#1A1A1A]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Heart size={200} fill="currentColor" />
            </div>
            
            <div className="relative z-10 space-y-8 text-center">
              <div className="w-24 h-24 bg-pink-100 text-pink-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-pink-500/20">
                <Heart size={48} fill="currentColor" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-[#1A1A1A]">شكراً لكِ يا شمس</h3>
                <div className="max-w-2xl mx-auto">
                  <p className="text-xl text-[#1A1A1A]/70 leading-relaxed font-medium">
                    إلى مديرة أعمالي الرائعة "شمس"، أود أن أعبر عن خالص شكري وامتناني لمجهوداتكِ العظيمة في تنظيم الخيام ودعمكِ المستمر لي.
                  </p>
                  <p className="text-xl text-[#1A1A1A]/70 leading-relaxed font-medium mt-4">
                    بفضلكِ أصبح العمل أكثر تنظيماً وسهولة. حفظكِ الله ورعاكِ يا جميلتي.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                {[1, 2, 3].map((i) => (
                  <Star key={i} size={24} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showMassDeleteConfirm}
        onClose={() => setShowMassDeleteConfirm(false)}
        title="تأكيد مسح البيانات"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <p className="text-[#1A1A1A]/60 font-medium">
            هل أنت متأكد من رغبتك في مسح جميع البيانات؟ سيتم حذف جميع الحجوزات والزبائن بشكل نهائي ولا يمكن التراجع عن هذه العملية.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowMassDeleteConfirm(false)}
              className="flex-1 py-4 bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-2xl font-bold hover:bg-[#1A1A1A]/10 transition-all"
            >
              إلغاء
            </button>
            <button 
              onClick={async () => {
                setShowMassDeleteConfirm(false);
                try {
                  const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
                  const customersSnapshot = await getDocs(collection(db, 'customers'));
                  
                  const deletePromises = [
                    ...bookingsSnapshot.docs.map(d => deleteDoc(d.ref)),
                    ...customersSnapshot.docs.map(d => deleteDoc(d.ref))
                  ];
                  
                  await Promise.all(deletePromises);
                  setSuccessMessage('تم مسح جميع البيانات بنجاح.');
                } catch (error) {
                  handleFirestoreError(error, OperationType.WRITE, 'mass-delete');
                }
              }}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
            >
              مسح الكل
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="نجاح"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-[#1A1A1A]/60 font-medium">{successMessage}</p>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:bg-[#1A1A1A]/90 transition-all"
          >
            حسناً
          </button>
        </div>
      </Modal>

      <AnimatePresence>
        {showBookingForm && (
          <BookingForm 
            booking={editingBooking}
            customers={customers}
            onSave={handleSaveBooking}
            onClose={() => {
              setShowBookingForm(false);
              setEditingBooking(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <Modal
        isOpen={!!bookingToDelete}
        onClose={() => setBookingToDelete(null)}
        title="تأكيد حذف الحجز"
      >
        <div className="space-y-8 text-center p-4">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-red-500/10 animate-pulse">
            <Trash2 size={48} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-[#1A1A1A]">هل أنت متأكد تماماً؟</h3>
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
              <p className="text-red-800 font-bold leading-relaxed">
                سيتم حذف هذا الحجز نهائياً من النظام. سيؤدي هذا إلى:
              </p>
              <ul className="text-red-700/80 text-sm font-bold mt-4 space-y-2 text-right list-disc list-inside">
                <li>إلغاء حجز الخيمة في هذا التاريخ</li>
                <li>حذف سجل المدفوعات الخاص بهذا الحجز</li>
                <li>لا يمكن استعادة هذه البيانات بعد الحذف</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setBookingToDelete(null)}
              className="flex-1 py-5 bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-2xl font-black hover:bg-[#1A1A1A]/10 transition-all active:scale-95"
            >
              تراجع (إلغاء)
            </button>
            <button 
              onClick={confirmDelete}
              className="flex-1 py-5 bg-red-500 text-white rounded-2xl font-black shadow-2xl shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              تأكيد الحذف النهائي
            </button>
          </div>
        </div>
      </Modal>

      {/* Customer Delete Confirmation Modal */}
      <Modal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        title="تأكيد حذف الزبون"
      >
        <div className="space-y-8 text-center p-4">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-red-500/10">
            <Users size={48} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-[#1A1A1A]">حذف ملف الزبون</h3>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
              <p className="text-amber-800 font-bold leading-relaxed">
                انتباه: سيتم حذف بيانات الاتصال الخاصة بالزبون.
              </p>
              <ul className="text-amber-700/80 text-sm font-bold mt-4 space-y-2 text-right list-disc list-inside">
                <li>ستبقى الحجوزات السابقة موجودة في السجل</li>
                <li>لن يكون لهذا الزبون ملف شخصي في الدليل</li>
                <li>ستحتاج لإعادة إدخال بياناته في حال الحجز مستقبلاً</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setCustomerToDelete(null)}
              className="flex-1 py-5 bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-2xl font-black hover:bg-[#1A1A1A]/10 transition-all active:scale-95"
            >
              إلغاء
            </button>
            <button 
              onClick={confirmDeleteCustomer}
              className="flex-1 py-5 bg-red-500 text-white rounded-2xl font-black shadow-2xl shadow-red-500/30 hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              حذف الزبون
            </button>
          </div>
        </div>
      </Modal>
      <Toaster position="top-center" />
    </Layout>
  );
}
