import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Store, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتفعيل.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">محل الأناقة</h1>
          <p className="text-sm text-muted-foreground mt-1">نظام المحاسبة والفواتير</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          <h2 className="font-heading text-lg font-semibold mb-6 text-center">
            {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>

          {error && (
            <div className={`rounded-xl p-3 mb-4 text-sm ${error.includes("تم إنشاء") ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="example@email.com"
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••" minLength={6}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "جاري التحميل..." : isSignUp ? "إنشاء حساب" : "دخول"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-sm text-primary hover:underline">
              {isSignUp ? "لديك حساب؟ سجل دخول" : "ليس لديك حساب؟ أنشئ واحد"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
