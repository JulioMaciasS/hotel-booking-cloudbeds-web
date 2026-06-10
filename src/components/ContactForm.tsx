"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}

const empty: FormState = { nombre: "", email: "", telefono: "", mensaje: "" };

export function ContactForm() {
  const t = useTranslations("contact");
  const [form, setForm] = useState<FormState>(empty);
  const [sent, setSent] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(
      t("form.mailSubject", { name: form.nombre }),
    );
    const body = encodeURIComponent(
      [
        t("form.mailName", { name: form.nombre }),
        t("form.mailEmail", { email: form.email }),
        form.telefono ? t("form.mailPhone", { phone: form.telefono }) : "",
        "",
        t("form.mailMessageLabel"),
        form.mensaje,
      ]
        .filter((line) => line !== undefined)
        .join("\n"),
    );
    window.open(
      `mailto:loslagoshotelcalafate@gmail.com?subject=${subject}&body=${body}`,
    );
    setSent(true);
    setForm(empty);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-[#edf3ef] px-8 py-14 text-center">
        <p className="text-lg font-semibold text-[#38645b]">{t("form.successTitle")}</p>
        <p className="text-sm leading-6 text-[#5f6e69]">
          {t("form.successBody")}
        </p>
        <button
          className="mt-3 text-sm font-medium text-[#38645b] underline underline-offset-2"
          onClick={() => setSent(false)}
          type="button"
        >
          {t("form.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-[#1f2b27]"
            htmlFor="nombre"
          >
            {t("form.nameLabel")}
          </label>
          <input
            required
            className="w-full rounded-lg border border-[#c8d4ce] bg-[#fafcfb] px-4 py-2.5 text-sm text-[#1f2b27] placeholder-[#a0aeaa] outline-none transition focus:border-[#38645b] focus:ring-2 focus:ring-[#38645b]/20"
            id="nombre"
            name="nombre"
            onChange={handleChange}
            placeholder={t("form.namePlaceholder")}
            type="text"
            value={form.nombre}
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-[#1f2b27]"
            htmlFor="email"
          >
            {t("form.emailLabel")}
          </label>
          <input
            required
            className="w-full rounded-lg border border-[#c8d4ce] bg-[#fafcfb] px-4 py-2.5 text-sm text-[#1f2b27] placeholder-[#a0aeaa] outline-none transition focus:border-[#38645b] focus:ring-2 focus:ring-[#38645b]/20"
            id="email"
            name="email"
            onChange={handleChange}
            placeholder={t("form.emailPlaceholder")}
            type="email"
            value={form.email}
          />
        </div>
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-medium text-[#1f2b27]"
          htmlFor="telefono"
        >
          {t("form.phoneLabel")}{" "}
          <span className="font-normal text-[#66736f]">{t("form.phoneOptional")}</span>
        </label>
        <input
          className="w-full rounded-lg border border-[#c8d4ce] bg-[#fafcfb] px-4 py-2.5 text-sm text-[#1f2b27] placeholder-[#a0aeaa] outline-none transition focus:border-[#38645b] focus:ring-2 focus:ring-[#38645b]/20"
          id="telefono"
          name="telefono"
          onChange={handleChange}
          placeholder={t("form.phonePlaceholder")}
          type="tel"
          value={form.telefono}
        />
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-medium text-[#1f2b27]"
          htmlFor="mensaje"
        >
          {t("form.messageLabel")}
        </label>
        <textarea
          required
          className="w-full resize-none rounded-lg border border-[#c8d4ce] bg-[#fafcfb] px-4 py-2.5 text-sm text-[#1f2b27] placeholder-[#a0aeaa] outline-none transition focus:border-[#38645b] focus:ring-2 focus:ring-[#38645b]/20"
          id="mensaje"
          name="mensaje"
          onChange={handleChange}
          placeholder={t("form.messagePlaceholder")}
          rows={5}
          value={form.mensaje}
        />
      </div>

      <button
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#38645b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049] active:scale-[0.99]"
        type="submit"
      >
        {t("form.submit")}
      </button>
    </form>
  );
}
