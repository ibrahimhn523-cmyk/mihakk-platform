"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

interface FormData {
  full_name: string;
  grade: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_phone2: string;
  notes: string;
}

const INITIAL: FormData = {
  full_name: "",
  grade: "",
  guardian_name: "",
  guardian_phone: "",
  guardian_phone2: "",
  notes: "",
};

export default function NewStudentPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.full_name.trim()) e.full_name = "الاسم مطلوب";
    if (!form.guardian_name.trim()) e.guardian_name = "اسم ولي الأمر مطلوب";
    if (!form.guardian_phone.trim()) e.guardian_phone = "رقم الجوال مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("students").insert({
      full_name: form.full_name.trim(),
      grade: form.grade.trim() || null,
      guardian_name: form.guardian_name.trim(),
      guardian_phone: form.guardian_phone.trim(),
      guardian_phone2: form.guardian_phone2.trim() || null,
      notes: form.notes.trim() || null,
      status: "active",
    });

    setLoading(false);
    if (error) {
      setErrors({ full_name: "حدث خطأ، يرجى المحاولة مجدداً" });
      return;
    }
    router.push("/students");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إضافة طالب جديد</h1>

      <Card>
        <CardHeader title="بيانات الطالب" />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="الاسم الكامل"
              required
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              error={errors.full_name}
              placeholder="محمد أحمد العمري"
            />
            <Input
              label="الصف الدراسي"
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
              placeholder="الصف الثالث متوسط"
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">بيانات ولي الأمر</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="اسم ولي الأمر"
                required
                value={form.guardian_name}
                onChange={(e) => set("guardian_name", e.target.value)}
                error={errors.guardian_name}
                placeholder="أحمد محمد العمري"
              />
              <Input
                label="رقم الجوال"
                required
                type="tel"
                value={form.guardian_phone}
                onChange={(e) => set("guardian_phone", e.target.value)}
                error={errors.guardian_phone}
                placeholder="05XXXXXXXX"
              />
              <Input
                label="رقم الجوال البديل"
                type="tel"
                value={form.guardian_phone2}
                onChange={(e) => set("guardian_phone2", e.target.value)}
                placeholder="05XXXXXXXX"
              />
            </div>
          </div>

          <Input
            label="ملاحظات"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="أي ملاحظات إضافية..."
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              حفظ الطالب
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
