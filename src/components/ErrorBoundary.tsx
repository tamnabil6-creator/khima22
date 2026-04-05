/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): any {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = (this as any).state;
    const { children } = (this as any).props;

    if (hasError) {
      let errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      
      try {
        if ((this as any).state.error) {
          const errorData = JSON.parse((this as any).state.error.message);
          if (errorData.error && errorData.error.includes('Missing or insufficient permissions')) {
            errorMessage = 'ليس لديك الصلاحيات الكافية للقيام بهذه العملية. يرجى التأكد من تسجيل الدخول بحساب المسؤول.';
          }
        }
      } catch (e) {
        // Not a JSON error message
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-right" dir="rtl">
          <div className="bg-card p-12 rounded-[3rem] border border-border max-w-md w-full shadow-2xl space-y-6">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold text-foreground">عذراً! حدث خطأ</h2>
              <p className="text-muted-foreground font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
