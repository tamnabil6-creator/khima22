/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tent, LogIn, Sparkles, ShieldCheck, Cloud } from 'lucide-react';
import { auth, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, signInAnonymously, signInWithRedirect } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('تم حظر النافذة المنبثقة. يرجى السماح بالمنبثقات لهذا الموقع أو المحاولة من متصفح آخر.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('تم إلغاء عملية تسجيل الدخول.');
      } else if (err.code === 'auth/internal-error') {
        setError('حدث خطأ داخلي. يرجى المحاولة مرة أخرى.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('هذا النطاق غير مصرح به في إعدادات Firebase. يرجى إضافة النطاق الحالي إلى قائمة النطاقات المصرح بها.');
      } else {
        setError(`خطأ: ${err.message || 'حدث خطأ غير متوقع'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
      // No need for onLoginSuccess here as it will redirect back
    } catch (err: any) {
      console.error("Redirect login error:", err);
      setError(`خطأ: ${err.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Guest login error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`هذا النطاق غير مصرح به. يرجى إضافة "${window.location.hostname}" إلى قائمة النطاقات المصرح بها في Firebase Console.`);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('تسجيل الدخول كضيف غير مفعل. يرجى تفعيل "Anonymous" في إعدادات Firebase Authentication.');
      } else {
        setError(`فشل الدخول كضيف: ${err.message || 'يرجى المحاولة لاحقاً'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Sophisticated Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700" />
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-lg space-y-12 text-center relative z-10"
      >
        <div className="space-y-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-32 h-32 bg-primary text-primary-foreground rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 border-4 border-white relative group"
          >
            <Tent size={64} className="group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-white text-primary rounded-2xl flex items-center justify-center shadow-xl border border-border">
              <Sparkles size={20} />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h1 className="text-7xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
              أرتي تام
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-primary/20" />
              <p className="text-xs font-black text-primary uppercase tracking-[0.4em]">نظام إدارة كراء الخيام</p>
              <div className="h-px w-8 bg-primary/20" />
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-12 rounded-[4rem] border border-border shadow-2xl shadow-black/5 space-y-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-foreground tracking-tight">مرحباً بكِ مجدداً</h2>
            <p className="text-muted-foreground font-bold text-lg leading-relaxed">
              اضغطي على الزر أدناه للبدء في إدارة حجوزاتكِ بكل سهولة وأمان
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 bg-red-50 border-2 border-red-100 rounded-3xl text-red-600 text-sm font-bold flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 px-10 py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {loading ? (
                <div className="w-8 h-8 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={28} />
                  <span>دخول المسؤول (Google)</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-foreground text-background rounded-[2rem] font-black text-lg shadow-xl shadow-foreground/10 hover:shadow-foreground/20 transition-all disabled:opacity-50 relative group overflow-hidden"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={22} />
                  <span>دخول سريع (زائر)</span>
                </>
              )}
            </motion.button>
          </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center gap-2 py-4 bg-muted/50 rounded-2xl border border-border/50">
                <Cloud size={16} className="text-primary/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">حفظ سحابي</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-4 bg-muted/50 rounded-2xl border border-border/50">
                <ShieldCheck size={16} className="text-primary/60" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">أمان عالي</span>
              </div>
            </div>

          <div className="pt-4">
            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
              جميع بياناتكِ محفوظة بشكل آمن ومشفر في السحابة
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.3em]">
            بواسطة <span className="text-primary">أرتي تام</span> • ٢٠٢٦
          </p>
          <div className="w-12 h-1 bg-primary/10 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
