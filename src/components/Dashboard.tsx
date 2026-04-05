/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, Tent, Users, DollarSign, Phone, Calendar, MapPin, Bell, MessageSquare, Trash2, ArrowUpRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Booking } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';

interface DashboardProps {
  bookings: Booking[];
  pendingReminders: Array<{ booking: Booking, type: '24h' | '1h' }>;
  onEditBooking: (booking: Booking) => void;
  onSendReminder: (booking: Booking, type: '24h' | '1h') => void;
  onDeleteBooking: (id: string) => void;
  onViewAll: () => void;
  user?: User | null;
}

export default function Dashboard({ bookings, pendingReminders, onEditBooking, onSendReminder, onDeleteBooking, onViewAll, user }: DashboardProps) {
  const stats = {
    totalReserved: bookings.filter(b => b.status === 'active').length,
    availableTents: 3 - bookings.filter(b => b.status === 'active').length, // Total 3 tents
    totalRevenue: bookings.reduce((acc, b) => acc + b.totalPrice, 0),
    pendingPayments: bookings.reduce((acc, b) => acc + b.remaining, 0),
  };

  const activeBookings = bookings
    .filter(b => b.status === 'active')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const recentActivity = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            مرحباً بك يا مديرة أعمالي شمس
          </h2>
          <p className="text-muted-foreground font-medium text-lg">
            حفظكِ الله ورعاكِ يا جميلتي، إليكِ حالة الحجوزات اليوم
          </p>
        </div>
        <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 hidden md:flex border-4 border-white">
          <Tent size={48} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="الخيام المحجوزة" 
          value={stats.totalReserved} 
          icon={Tent} 
          trend="الحالة الحالية"
          color="bg-primary text-primary-foreground shadow-primary/20"
          index={0}
        />
        <StatCard 
          label="الخيام المتاحة" 
          value={stats.availableTents} 
          icon={TrendingUp} 
          trend="من أصل 3"
          color="bg-white border border-border"
          index={1}
        />
        <StatCard 
          label="إجمالي الإيرادات" 
          value={`${stats.totalRevenue.toLocaleString()} د.ج`} 
          icon={DollarSign} 
          trend="+12% هذا الشهر"
          color="bg-white border border-border"
          index={2}
        />
        <StatCard 
          label="المبالغ المتبقية" 
          value={`${stats.pendingPayments.toLocaleString()} د.ج`} 
          icon={Users} 
          trend="تحصيل 92%"
          color="bg-white border border-border"
          index={3}
        />
      </div>

      {/* Reminders Section */}
      <AnimatePresence>
        {pendingReminders.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                <Bell size={20} className="animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">تذكيرات معلقة ({pendingReminders.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReminders.map(({ booking, type }, idx) => (
                <motion.div 
                  key={`${booking.id}-${type}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-[2rem] border-2 border-red-500/10 flex items-center justify-between gap-4 shadow-xl shadow-red-500/5 hover:border-red-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center font-black text-lg">
                      {type === '24h' ? '24h' : '1h'}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg">{booking.customerName}</h4>
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Clock size={12} />
                        <span>خيمة {booking.tentId} • {booking.pickupTime}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSendReminder(booking, type)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <MessageSquare size={18} />
                    إرسال واتساب
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Bookings List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Calendar size={22} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">الحجوزات النشطة</h3>
            </div>
            <button 
              onClick={onViewAll}
              className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all"
            >
              عرض الكل
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeBookings.length > 0 ? (
              activeBookings.map((booking, idx) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  index={idx}
                  onClick={() => onEditBooking(booking)} 
                  onDelete={() => onDeleteBooking(booking.id)}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-16 text-center border-2 border-dashed border-border rounded-[3rem] bg-muted/30"
              >
                <Tent size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-bold text-lg">لا توجد حجوزات نشطة حالياً</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <TrendingUp size={22} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">آخر النشاطات</h3>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-border overflow-hidden shadow-2xl shadow-black/5">
            <div className="divide-y divide-border">
              {recentActivity.length > 0 ? (
                recentActivity.map((booking, idx) => (
                  <motion.div 
                    key={booking.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 flex items-center justify-between hover:bg-muted/30 transition-all group cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110",
                        booking.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                      )}>
                        {booking.tentId}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{booking.customerName}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          {booking.status === 'active' ? 'حجز جديد' : 'حجز مكتمل'} • {format(new Date(booking.createdAt), 'd MMM HH:mm', { locale: ar })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{booking.totalPrice.toLocaleString()} د.ج</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">الموقع: {booking.location}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-16 text-center">
                  <p className="text-muted-foreground font-bold">لا توجد نشاطات حديثة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color, index }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn("p-8 rounded-[2.5rem] flex flex-col gap-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden", color)}
    >
      {color.includes('bg-primary') && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
      )}
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500", color.includes('bg-primary') ? "bg-white/20" : "bg-primary/5 text-primary")}>
          <Icon size={28} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.15em] opacity-70">{trend}</span>
      </div>
      <div className="relative z-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2">{label}</p>
        <p className="text-4xl font-black tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}

interface BookingCardProps {
  key?: string;
  booking: Booking;
  index: number;
  onClick: () => void;
  onDelete: () => void;
}

function BookingCard({ booking, index, onClick, onDelete }: BookingCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group bg-white p-8 rounded-[3rem] border border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center gap-8 relative z-10">
        <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center text-3xl font-black text-primary transition-transform group-hover:scale-110 duration-500">
          {booking.tentId}
        </div>
        <div className="space-y-2">
          <h4 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">{booking.customerName}</h4>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-bold uppercase tracking-wider">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-primary/60" /> {booking.location}</span>
            <span className="flex items-center gap-2"><Tent size={16} className="text-primary/60" /> {booking.tentSize}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-10 relative z-10">
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">التاريخ</p>
          <div className="flex items-center gap-2.5 text-lg font-black text-foreground">
            <Calendar size={18} className="text-primary" />
            {format(new Date(booking.startDate), 'd MMMM', { locale: ar })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">المبلغ المتبقي</p>
          <p className={cn("text-lg font-black tracking-tight", booking.remaining > 0 ? "text-red-500" : "text-emerald-500")}>
            {booking.remaining.toLocaleString()} د.ج
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href={`tel:${booking.customerPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="w-14 h-14 bg-muted hover:bg-primary hover:text-primary-foreground rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg shadow-black/5 hover:shadow-primary/30 active:scale-90"
          >
            <Phone size={22} />
          </a>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-14 h-14 text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all duration-500 active:scale-90"
          >
            <Trash2 size={22} />
          </button>
          <button className="px-8 py-4 bg-foreground text-background rounded-2xl text-sm font-black shadow-xl shadow-foreground/10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 active:scale-95">
            التفاصيل
          </button>
        </div>
      </div>
    </motion.div>
  );
}
