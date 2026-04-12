import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Store, Lock, User } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const email = `${username.toLowerCase().trim()}@elegance.local`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/" });
    } catch (err: unknown) {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
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
          <h2 className="font-heading text-lg font-semibold mb-6 text-center">تسجيل الدخول</h2>

          {error && (
            <div className="rounded-xl p-3 mb-4 text-sm bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)} required
                  placeholder="اسم المستخدم"
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
                  placeholder="••••••••"
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "جاري التحميل..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
