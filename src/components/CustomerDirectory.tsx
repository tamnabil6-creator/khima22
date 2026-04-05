/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Phone, MessageSquare, Calendar, User, ArrowRight, Trash2, Users } from 'lucide-react';
import { Customer, Booking } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerDirectoryProps {
  customers: Customer[];
  bookings: Booking[];
  onDeleteCustomer: (id: string) => void;
}

export default function CustomerDirectory({ customers, bookings, onDeleteCustomer }: CustomerDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const getCustomerStats = (customerId: string) => {
    const customerBookings = bookings.filter(b => b.customerId === customerId);
    return {
      totalBookings: customerBookings.length,
      lastBooking: customerBookings.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0],
    };
  };

  const sendWhatsApp = (customer: Customer, booking?: Booking) => {
    let message = `مرحباً ${customer.name}، تفاصيل حجزك في خيمتي:\n`;
    if (booking) {
      message += `خيمة رقم: ${booking.tentId}\n`;
      message += `تاريخ البداية: ${booking.startDate}\n`;
      message += `المبلغ المتبقي: ${booking.remaining} د.ج\n`;
    }
    const url = `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
            <Users size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-4xl font-black tracking-tighter text-foreground">سجل الزبائن</h2>
            <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest opacity-60">إدارة بيانات الزبائن وتاريخ حجوزاتهم</p>
          </div>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-white border-2 border-transparent rounded-3xl focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground shadow-sm placeholder:text-muted-foreground/40"
          />
        </div>
      </motion.div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCustomers.map((customer, index) => {
            const stats = getCustomerStats(customer.id);
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                key={customer.id}
                className="group bg-white p-10 rounded-[3.5rem] border border-border/50 hover:border-primary/30 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col gap-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-20 h-20 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-primary/20">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-3">
                    <a 
                      href={`tel:${customer.phone}`}
                      className="w-12 h-12 bg-muted hover:bg-primary hover:text-primary-foreground rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90"
                    >
                      <Phone size={20} />
                    </a>
                    <button 
                      onClick={() => sendWhatsApp(customer, stats.lastBooking)}
                      className="w-12 h-12 bg-muted hover:bg-emerald-500 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90"
                    >
                      <MessageSquare size={20} />
                    </button>
                    <button 
                      onClick={() => onDeleteCustomer(customer.id)}
                      className="w-12 h-12 bg-muted hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <h4 className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{customer.name}</h4>
                  <p className="text-sm font-black text-muted-foreground tracking-widest opacity-60">{customer.phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border/50 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">إجمالي الحجوزات</p>
                    <p className="text-2xl font-black text-foreground">{stats.totalBookings}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">آخر حجز</p>
                    <p className="text-sm font-black text-foreground">
                      {stats.lastBooking ? format(new Date(stats.lastBooking.startDate), 'd MMM yyyy', { locale: ar }) : 'لا يوجد'}
                    </p>
                  </div>
                </div>

                <button className="w-full py-5 bg-muted text-foreground rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-3 group/btn relative z-10">
                  عرض السجل الكامل
                  <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
