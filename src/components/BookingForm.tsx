/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Phone, User, Tent, MapPin, DollarSign, Calendar, Clock, Sparkles } from 'lucide-react';
import { Booking, TentSize, Customer } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BookingFormProps {
  booking?: Booking | null;
  customers: Customer[];
  onSave: (booking: Partial<Booking>) => Promise<void>;
  onClose: () => void;
}

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

export default function BookingForm({ booking, customers, onSave, onClose }: BookingFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Booking>>({
    tentId: '',
    tentSize: '12/12',
    location: '',
    customerName: '',
    customerPhone: '',
    totalPrice: 0,
    deposit: 0,
    remaining: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    pickupTime: '10:00',
    status: 'active',
  });

  useEffect(() => {
    if (booking) {
      setFormData(booking);
    }
  }, [booking]);

  useEffect(() => {
    const total = Number(formData.totalPrice) || 0;
    const dep = Number(formData.deposit) || 0;
    setFormData(prev => ({ ...prev, remaining: total - dep }));
  }, [formData.totalPrice, formData.deposit]);

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => {
      const existingCustomer = customers.find(c => c.phone === phone);
      if (existingCustomer) {
        return { 
          ...prev, 
          customerPhone: phone, 
          customerName: existingCustomer.name, 
          customerId: existingCustomer.id 
        };
      } else {
        // Clear customerId if phone doesn't match an existing customer
        const newData = { ...prev, customerPhone: phone };
        delete newData.customerId;
        return newData;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Form save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-black/60 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[4rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-border/50 relative"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl p-10 border-b border-border/50 flex items-center justify-between z-20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles size={32} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-4xl font-black tracking-tighter text-foreground">
                {booking ? 'تعديل حجز' : 'حجز خيمة جديد'}
              </h3>
              <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest opacity-60">أدخل تفاصيل الحجز والزبون بدقة</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-14 h-14 bg-muted hover:bg-red-50 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all active:scale-90"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 lg:p-16 space-y-16">
          {/* Section: Tent Info */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 text-primary rounded-xl">
                <Tent size={24} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">بيانات الخيمة</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">رقم الخيمة</label>
                <select
                  required
                  value={formData.tentId}
                  onChange={e => setFormData({ ...formData, tentId: e.target.value })}
                  className="w-full px-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg appearance-none cursor-pointer"
                >
                  <option value="">اختر خيمة</option>
                  <option value="1">خيمة 1</option>
                  <option value="2">خيمة 2</option>
                  <option value="3">خيمة 3</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">حجم الخيمة</label>
                <select
                  value={formData.tentSize}
                  onChange={e => setFormData({ ...formData, tentSize: e.target.value as TentSize })}
                  className="w-full px-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg appearance-none cursor-pointer"
                >
                  <option value="12/12">12/12</option>
                  <option value="9/12">9/12</option>
                  <option value="9/9">9/9</option>
                  <option value="12/15">12/15</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">المكان</label>
                <div className="relative">
                  <MapPin size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input
                    required
                    list="locations-list"
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-16 pr-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg placeholder:text-muted-foreground/40"
                    placeholder="اختر أو اكتب المكان..."
                  />
                  <datalist id="locations-list">
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Customer Info */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 text-primary rounded-xl">
                <User size={24} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">بيانات الزبون</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input
                    required
                    type="tel"
                    value={formData.customerPhone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg placeholder:text-muted-foreground/40"
                    placeholder="05XXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">اسم الزبون</label>
                <div className="relative">
                  <User size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input
                    required
                    type="text"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full pl-16 pr-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg placeholder:text-muted-foreground/40"
                    placeholder="الاسم الكامل"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Financials */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 text-primary rounded-xl">
                <DollarSign size={24} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">التفاصيل المالية</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">السعر الإجمالي</label>
                  <input
                    required
                    type="number"
                    value={formData.totalPrice}
                    onChange={e => setFormData({ ...formData, totalPrice: Number(e.target.value) })}
                    className="w-full px-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1600, 1800, 2000, 2600, 400].map(price => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setFormData({ ...formData, totalPrice: price })}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black transition-all border-2",
                        formData.totalPrice === price 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                          : "bg-white text-muted-foreground border-border/50 hover:border-primary/30"
                      )}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">العربون المدفوع</label>
                  <input
                    required
                    type="number"
                    value={formData.deposit}
                    onChange={e => setFormData({ ...formData, deposit: Number(e.target.value) })}
                    className="w-full px-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[400, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData({ ...formData, deposit: amount })}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black transition-all border-2",
                        formData.deposit === amount 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                          : "bg-white text-muted-foreground border-border/50 hover:border-primary/30"
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">المبلغ المتبقي</label>
                <div className="w-full px-8 py-5 bg-red-50 border-2 border-red-100 rounded-3xl font-black text-red-600 text-2xl flex items-center justify-center shadow-inner">
                  {formData.remaining?.toLocaleString()} د.ج
                </div>
              </div>
            </div>
          </div>

          {/* Section: Time & Date */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 text-primary rounded-xl">
                <Calendar size={24} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">الوقت والتاريخ</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">تاريخ البداية</label>
                <input
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">تاريخ النهاية</label>
                <input
                  required
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">ساعة الاستلام</label>
                <div className="relative">
                  <Clock size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input
                    required
                    type="time"
                    value={formData.pickupTime}
                    onChange={e => setFormData({ ...formData, pickupTime: e.target.value })}
                    className="w-full pl-16 pr-8 py-5 bg-muted/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-black text-foreground text-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-6 pt-12 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-10 py-5 text-muted-foreground font-black uppercase tracking-widest hover:text-foreground transition-all active:scale-95"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "px-16 py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 relative overflow-hidden group",
                isSaving && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isSaving ? (
                <div className="w-6 h-6 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={24} />
              )}
              <span className="relative z-10">{isSaving ? 'جاري الحفظ...' : 'حفظ الحجز'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
