"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "../_components/OnboardingShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "eventu_onboarding_v1";

type PaymentMethod = "card" | "apple_pay";

type Draft = {
  hobbies: string[];
  availabilityBlocks: { day: string; start: string; end: string }[];
  depositAcknowledged: boolean;

  // mock payment fields (MVP UX only)
  paymentMethod?: PaymentMethod;
  paymentLast4?: string;
};

const DEFAULT_DRAFT: Draft = {
  hobbies: [],
  availabilityBlocks: [],
  depositAcknowledged: false,
  paymentMethod: undefined,
  paymentLast4: undefined,
};

function loadDraft(): Draft {
  try {
    if (typeof window === "undefined") return DEFAULT_DRAFT;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? ({ ...DEFAULT_DRAFT, ...(JSON.parse(raw) as Draft) } as Draft) : DEFAULT_DRAFT;
  } catch {
    return DEFAULT_DRAFT;
  }
}

function saveDraft(d: Draft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function formatCardNumber(raw: string) {
  const d = digitsOnly(raw).slice(0, 19); // allow up to 19 digits
  // group in 4s: 1234 5678 9012 3456 7
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const d = digitsOnly(raw).slice(0, 4); // MMYY
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function isValidExpiry(mmYY: string) {
  const d = digitsOnly(mmYY);
  if (d.length !== 4) return false;
  const mm = Number(d.slice(0, 2));
  const yy = Number(d.slice(2, 4));
  if (mm < 1 || mm > 12) return false;

  // basic "not in the past" check using current month/year
  const now = new Date();
  const curYY = now.getFullYear() % 100;
  const curMM = now.getMonth() + 1;

  if (yy < curYY) return false;
  if (yy === curYY && mm < curMM) return false;
  return true;
}

export default function DepositClient() {
  const router = useRouter();

  const [ack, setAck] = useState(false);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);


  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingZip, setBillingZip] = useState("");

  const [applePayLinked, setApplePayLinked] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    setDraft(d);
    setAck(!!d.depositAcknowledged);

    // if they previously "linked" something, reflect it
    if (d.paymentMethod === "apple_pay") {
      setMethod("apple_pay");
      setApplePayLinked(true);
    } else if (d.paymentMethod === "card") {
      setMethod("card");
      // we only store last4, so nothing else to hydrate
    }
  }, []);

  const subtitle = useMemo(
    () =>
      "This is a lightweight commitment tool. For MVP, this screen is a mock (no real payments).",
    []
  );

  const cardDigits = useMemo(() => digitsOnly(cardNumber), [cardNumber]);
  const last4 = useMemo(() => (cardDigits.length >= 4 ? cardDigits.slice(-4) : ""), [cardDigits]);

  const canSaveCard =
    cardName.trim().length > 1 &&
    cardDigits.length >= 12 && // loose check (supports various lengths)
    isValidExpiry(expiry) &&
    digitsOnly(cvc).length >= 3 &&
    digitsOnly(billingZip).length >= 5;

  const hasPaymentMethod = useMemo(() => {
    if (method === "apple_pay") return applePayLinked;
    return draft.paymentMethod === "card" || canSaveCard; // allow saving + finishing in one go
  }, [method, applePayLinked, draft.paymentMethod, canSaveCard]);

  const saveMockPayment = async () => {
    setSavingPayment(true);
    try {
      // Fake network delay
      await new Promise((r) => setTimeout(r, 700));

      const next: Draft =
        method === "apple_pay"
          ? { ...draft, paymentMethod: "apple_pay", paymentLast4: undefined }
          : { ...draft, paymentMethod: "card", paymentLast4: last4 || undefined };

      saveDraft(next);
      setDraft(next);

      if (method === "apple_pay") setApplePayLinked(true);

      // Clear sensitive fields from memory (even though it's mock UX)
      setCardNumber("");
      setExpiry("");
      setCvc("");
    } finally {
      setSavingPayment(false);
    }
  };

  const onFinish = () => {
    const next = { ...draft, depositAcknowledged: ack };
    saveDraft(next);

    // MVP: just send them to dashboard.
    // Later: write hobbies/availability to DB + mark onboardingComplete = true.
    router.push("/dashboard");
  };

  const finishDisabled = !ack || !hasPaymentMethod;

  return (
    <OnboardingShell step={3} title="Commitment deposit" subtitle={subtitle}>
      <div className="space-y-4">
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-sm font-medium">$5 deposit</div>
          <p className="text-sm text-muted-foreground">
            If you <span className="text-foreground font-medium">miss</span> an event you accepted,
            the $5 goes to charity. If you attend, you keep it.
          </p>
          <p className="text-xs text-muted-foreground">
            MVP note: No payments are processed yet—this is just the UX + policy.
          </p>
        </div>

        <Separator />

        {/* Mock payment method UI */}
        <div className="rounded-xl border p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Add a payment method</div>
              <p className="text-xs text-muted-foreground">
                This is UI-only. We store only a method + optional last 4 in localStorage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={[
                "h-11 rounded-lg border px-3 text-sm text-left",
                method === "card" ? "border-foreground" : "border-border",
              ].join(" ")}
            >
              Credit / debit card
              {draft.paymentMethod === "card" && draft.paymentLast4 ? (
                <span className="ml-2 text-xs text-muted-foreground">•••• {draft.paymentLast4}</span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setMethod("apple_pay")}
              className={[
                "h-11 rounded-lg border px-3 text-sm text-left",
                method === "apple_pay" ? "border-foreground" : "border-border",
              ].join(" ")}
            >
              Apple Pay
              {applePayLinked || draft.paymentMethod === "apple_pay" ? (
                <span className="ml-2 text-xs text-muted-foreground">Linked</span>
              ) : null}
            </button>
          </div>

          {method === "card" ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Name on card</Label>
                <Input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Levi Loseke"
                  autoComplete="cc-name"
                />
              </div>

              <div className="space-y-1">
                <Label>Card number</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Expiry</Label>
                  <Input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                </div>

                <div className="space-y-1">
                  <Label>CVC</Label>
                  <Input
                    value={cvc}
                    onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0, 4))}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                  />
                </div>

                <div className="space-y-1">
                  <Label>ZIP</Label>
                  <Input
                    value={billingZip}
                    onChange={(e) => setBillingZip(digitsOnly(e.target.value).slice(0, 10))}
                    placeholder="68508"
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                </div>
              </div>

              <Button
                type="button"
                className="h-11 w-full"
                disabled={!canSaveCard || savingPayment}
                onClick={saveMockPayment}
              >
                {savingPayment ? "Saving…" : "Save card"}
              </Button>

              {draft.paymentMethod === "card" && draft.paymentLast4 ? (
                <p className="text-xs text-muted-foreground">
                  Saved: card ending in <span className="text-foreground font-medium">{draft.paymentLast4}</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  We don’t store full card details.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Apple Pay</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Clicking “Link Apple Pay” simulates a successful wallet connection.
                </p>
              </div>

              <Button
                type="button"
                className="h-11 w-full"
                disabled={savingPayment || applePayLinked || draft.paymentMethod === "apple_pay"}
                onClick={saveMockPayment}
              >
                {savingPayment
                  ? "Linking…"
                  : applePayLinked || draft.paymentMethod === "apple_pay"
                  ? "Apple Pay linked"
                  : "Link Apple Pay"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Later: this would be a Stripe Payment Element / Apple Pay session.
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="rounded-xl border p-4 space-y-3">
          <div className="text-sm font-medium">Quick summary</div>
          <div className="text-sm text-muted-foreground">
            <div>
              <span className="text-foreground font-medium">Hobbies:</span>{" "}
              {draft.hobbies?.length ? draft.hobbies.join(", ") : "None selected"}
            </div>
            <div className="mt-1">
              <span className="text-foreground font-medium">Availability windows:</span>{" "}
              {draft.availabilityBlocks?.length ? draft.availabilityBlocks.length : 0}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border p-4">
          <Checkbox id="ack" checked={ack} onCheckedChange={(v) => setAck(v === true)} />
          <label htmlFor="ack" className="text-sm leading-snug">
            I understand: if I accept an event and no-show, the $5 deposit is forfeited to charity.
          </label>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-full"
            onClick={() => router.push("/onboarding/availability")}
          >
            Back
          </Button>
          <Button type="button" className="h-12 w-full text-base" disabled={finishDisabled} onClick={onFinish}>
            Finish setup
          </Button>
        </div>

        {!hasPaymentMethod ? (
          <p className="text-xs text-muted-foreground">
            Add a payment method (card or Apple Pay) to continue.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Next: you’ll land on the dashboard. Later we’ll persist this to SQL and enforce deposit logic.
          </p>
        )}
      </div>
    </OnboardingShell>
  );
}