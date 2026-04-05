/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { LayoutDashboard, Users, PlusCircle, Search, Menu, X, Settings, Heart, Tent, LogOut, Cloud, ShieldCheck, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User | null;
}

export default function Layout({ children, activeTab, setActiveTab, user }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'customers', label: 'سجل الزبائن', icon: Users },
    { id: 'bookings', label: 'الحجوزات', icon: Search },
    { id: 'challenge', label: 'التحدي', icon: Target },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
    { id: 'shams', label: 'شمس', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-6 border-b border-border/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 border-2 border-white">
            <Tent size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground">أرتي تام</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-3 bg-muted hover:bg-muted/80 rounded-2xl transition-all active:scale-90"
        >
          {isSidebarOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-border/50 transform transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 shadow-2xl shadow-black/5",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col">
            <div className="p-10">
              <div className="flex flex-col items-center gap-6 mb-16">
                <div className="w-28 h-28 bg-primary text-primary-foreground rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 border-4 border-white">
                  <Tent size={56} />
                </div>
                <div className="text-center space-y-1">
                  <h1 className="text-3xl font-black tracking-tighter text-foreground">أرتي تام</h1>
                  <p className="text-[11px] font-black text-primary uppercase tracking-[0.25em]">لكراء الخيام والديكورات</p>
                </div>
              </div>

              <nav className="space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                      activeTab === item.id 
                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon size={20} className={cn("transition-transform duration-300", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
                    <span className="relative z-10">{item.label}</span>
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* User Info & Logout */}
            <div className="mt-auto p-10 space-y-8">
              <div className="p-6 bg-muted/50 rounded-3xl border border-border/50 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden border-2 border-white shadow-lg shadow-black/5">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary bg-primary/5">
                        <Users size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate">مديرة أعمالي شمس</p>
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <Cloud size={10} />
                      <p className="text-[10px] font-black uppercase tracking-widest">سحابي نشط</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">قاعدة البيانات متصلة</span>
                </div>
              </div>

              <button
                onClick={() => signOut(auth)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all duration-300 active:scale-95"
              >
                <LogOut size={20} />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-6 lg:p-16 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveTab('new-booking')}
        className="fixed bottom-10 right-10 w-20 h-20 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-500 z-50 group border-4 border-white"
      >
        <PlusCircle size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
