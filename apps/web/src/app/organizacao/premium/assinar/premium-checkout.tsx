"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { OrganizerShell } from "@/components/organizer-shell";
import {
  apiFetch,
  type PremiumPayment,
  type PremiumPaymentResult,
  type PremiumSubscription,
} from "@/lib/api";
import { saveSession } from "@/lib/auth-session";
import { useRequiredSession } from "@/lib/use-required-session";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function PremiumCheckout() {
  const user = useRequiredSession("ORGANIZATION");
  const [payment, setPayment] = useState<PremiumPayment | null>(null);
  const [subscription, setSubscription] =
    useState<PremiumSubscription | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const applyResult = useCallback(
    (result: PremiumPaymentResult) => {
      setPayment((current) => ({ ...current, ...result.payment }));
      if (result.payment.status === "PAID" && result.subscription && user) {
        saveSession({ ...user, isPremium: true });
        setSubscription(result.subscription);
      }
    },
    [user],
  );

  useEffect(() => {
    if (!user || !payment || payment.status !== "PENDING") return;

    const interval = window.setInterval(async () => {
      try {
        const result = await apiFetch<PremiumPaymentResult>(
          `/premium/payments/${payment.id}/status?organizerUserId=${user.id}`,
        );
        applyResult(result);
      } catch {
        // O botão manual permanece disponível se uma consulta falhar.
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [applyResult, payment, user]);

  async function createPayment() {
    if (!user) return;
    setPending(true);
    setError("");
    try {
      const created = await apiFetch<PremiumPayment>("/premium/payments/pix", {
        method: "POST",
        body: JSON.stringify({ organizerUserId: user.id }),
        fallbackError: "Não foi possível gerar o PIX.",
      });
      setPayment(created);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível conectar à API.",
      );
    } finally {
      setPending(false);
    }
  }

  async function checkPayment(simulate = false) {
    if (!user || !payment) return;
    setPending(true);
    setError("");
    try {
      const result = await apiFetch<PremiumPaymentResult>(
        simulate
          ? `/premium/payments/${payment.id}/simulate`
          : `/premium/payments/${payment.id}/status?organizerUserId=${user.id}`,
        simulate
          ? {
              method: "POST",
              body: JSON.stringify({ organizerUserId: user.id }),
            }
          : undefined,
      );
      applyResult(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível verificar o pagamento.",
      );
    } finally {
      setPending(false);
    }
  }

  async function copyPix() {
    if (!payment?.brCode) return;
    await navigator.clipboard.writeText(payment.brCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!user) return <div className="min-h-screen bg-slate-50" />;

  if (subscription) {
    return (
      <OrganizerShell user={{ ...user, isPremium: true }}>
        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-emerald-100">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="size-8" />
          </span>
          <h1 className="mt-6 font-display text-4xl">Pagamento confirmado!</h1>
          <p className="mt-3 text-slate-500">
            A AbacatePay confirmou seu PIX e o acesso Premium já está ativo.
          </p>
          <Link
            className="mt-7 inline-flex rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white"
            href="/organizacao"
          >
            Destacar uma oportunidade
          </Link>
        </div>
      </OrganizerShell>
    );
  }

  return (
    <OrganizerShell user={user}>
      <Link
        className="inline-flex items-center gap-1.5 text-sm text-slate-500"
        href="/organizacao/premium"
      >
        <ArrowLeft className="size-4" /> Voltar aos benefícios
      </Link>

      <div className="mx-auto mt-6 grid max-w-4xl gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold text-emerald-700">
            Pagamento seguro via AbacatePay
          </p>
          <h1 className="mt-1 font-display text-4xl">
            {payment ? "Pague com PIX" : "Ative seu Premium"}
          </h1>

          {!payment ? (
            <>
              <div className="mt-7 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5 ring-4 ring-emerald-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-bold text-emerald-950">Premium mensal</span>
                    <p className="mt-1 text-sm text-slate-500">Acesso completo, renovado mensalmente</p>
                  </div>
                  <p className="text-right text-2xl font-bold text-emerald-950">R$ 30,00<span className="block text-xs font-normal text-slate-500">por mês</span></p>
                </div>
                <p className="mt-4 border-t border-emerald-200 pt-4 text-xs text-slate-500">A taxa operacional de R$ 0,80 por pagamento é absorvida pela plataforma e não será adicionada ao valor cobrado.</p>
              </div>
              <div className="mt-7 rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold">Como funciona</p>
                <ol className="mt-3 space-y-2 text-sm text-slate-500">
                  <li>1. Geramos uma cobrança PIX na AbacatePay.</li>
                  <li>2. Você paga pelo QR Code ou copia-e-cola.</li>
                  <li>3. O Premium é ativado após a confirmação.</li>
                </ol>
              </div>
              <button
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:opacity-60"
                disabled={pending}
                onClick={createPayment}
              >
                <QrCode className="size-5" />
                {pending ? "Gerando PIX..." : "Gerar QR Code PIX"}
              </button>
            </>
          ) : (
            <div className="mt-7 text-center">
              {payment.brCodeBase64 && (
                <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <Image
                    alt="QR Code PIX da assinatura Premium"
                    height={220}
                    src={payment.brCodeBase64}
                    unoptimized
                    width={220}
                  />
                </div>
              )}
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-amber-700">
                <Clock3 className="size-4" /> Aguardando pagamento
              </p>
              {payment.brCode && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
                  <p className="truncate text-xs text-slate-500">
                    {payment.brCode}
                  </p>
                  <button
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm"
                    onClick={copyPix}
                  >
                    {copied ? <CheckCircle2 className="size-4" /> : <Clipboard className="size-4" />}
                    {copied ? "Código copiado" : "Copiar PIX copia-e-cola"}
                  </button>
                </div>
              )}
              <button
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold disabled:opacity-60"
                disabled={pending}
                onClick={() => checkPayment(false)}
              >
                <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
                Já paguei, verificar
              </button>
              {payment.devMode && (
                <button
                  className="mt-3 w-full rounded-xl bg-amber-100 px-5 py-3 text-sm font-bold text-amber-900 disabled:opacity-60"
                  disabled={pending}
                  onClick={() => checkPayment(true)}
                >
                  Simular pagamento aprovado (sandbox)
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </section>

        <aside className="h-fit rounded-2xl bg-[#063d2c] p-6 text-white sm:p-8">
          <QrCode className="size-7 text-amber-300" />
          <h2 className="mt-5 text-xl font-bold">Resumo</h2>
          <div className="mt-6 flex justify-between border-b border-white/15 pb-5">
            <span>Premium Mensal</span>
            <strong>R$ 30,00</strong>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-emerald-50/80">
            {["Até 3 anúncios destacados por vez", "Prioridade para talentos compatíveis", "Pagamento PIX processado pela AbacatePay"].map((item) => (
              <li className="flex gap-2" key={item}>
                <Check className="size-4 text-amber-300" /> {item}
              </li>
            ))}
          </ul>
          {payment && (
            <p className="mt-6 rounded-lg bg-white/10 p-3 text-sm">
              Valor da cobrança: {money.format(payment.amountCents / 100)}
            </p>
          )}
          <p className="mt-7 flex gap-2 text-xs leading-5 text-emerald-50/60">
            <ShieldCheck className="size-5 shrink-0" />
            A chave da AbacatePay permanece protegida no servidor. Nenhum dado de pagamento sensível passa pelo navegador.
          </p>
        </aside>
      </div>
    </OrganizerShell>
  );
}
