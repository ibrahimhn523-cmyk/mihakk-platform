"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

interface FormData {
  name: string;
  season: string;
  start_date: string;
  end_date: string;
  price_full: string;
  price_first: string;
  price_second: string;
  price_trial: string;
}

const INITIAL: FormData = {
  name: "",
  season: "",
  start_date: "",
  end_date: "",
  price_full: "",
  price_first: "",
  price_second: "",
  price_trial: "",
};

export default function NewProgramPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "اسم البرنامج مطلوب";
    if (!form.start_date) e.start_date = "تاريخ البدء مطلوب";
    if (!form.end_date) e.end_date = "تاريخ الانتهاء مطلوب";
    if (!form.price_full || isNaN(Number(form.price_full))) e.price_full = "السعر الكامل مطلوب";
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
    const { error } = await supabase.from("programs").insert({
      name: form.name.trim(),
      season: form.season.trim() || null,
      start_date: form.start_date,
      end_date: form.end_date,
      price_full: Number(form.price_full),
      price_first: Number(form.price_first) || 0,
      price_second: Number(form.price_second) || 0,
      price_trial: Number(form.price_trial) || 0,
      status: "upcoming",
    });

    setLoading(false);
    if (error) {
      setErrors({ name: "حدث خطأ، يرجى المحاولة مجدداً" });
      return;
    }
    router.push("/programs");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إضافة برنامج جديد</h1>

      <Card>
        <CardHeader title="بيانات البرنامج" />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم البرنامج"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
              placeholder="دورة القرآن الكريم"
            />
            <Input
              label="الموسم"
              value={form.season}
              onChange={(e) => set("season", e.target.value)}
              placeholder="صيف ١٤٤٦"
            />
            <Input
              label="تاريخ البدء"
              required
              type="date"
              value={form.start_date}
              onChange={(e) => set("start_date", e.target.value)}
              error={errors.start_date}
            />
            <Input
              label="تاريخ الانتهاء"
              required
              type="date"
              value={form.end_date}
              onChange={(e) => set("end_date", e.target.value)}
              error={errors.end_date}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">الأسعار (ر.س)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="السعر الكامل"
                required
                type="number"
                min="0"
                value={form.price_full}
                onChange={(e) => set("price_full", e.target.value)}
                error={errors.price_full}
                placeholder="1200"
              />
              <Input
                label="الشطر الأول"
                type="number"
                min="0"
                value={form.price_first}
                onChange={(e) => set("price_first", e.target.value)}
                placeholder="700"
              />
              <Input
                label="الشطر الثاني"
                type="number"
                min="0"
                value={form.price_second}
                onChange={(e) => set("price_second", e.target.value)}
                placeholder="600"
              />
              <Input
                label="تجريبي"
                type="number"
                min="0"
                value={form.price_trial}
                onChange={(e) => set("price_trial", e.target.value)}
                placeholder="200"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>حفظ البرنامج</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>إلغاء</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
