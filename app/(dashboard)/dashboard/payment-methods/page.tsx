import { PaymentMethodsForm } from "@/components/dashboard/payment-methods-form";
import { PaymentMethodsList } from "@/components/dashboard/payment-methods-list";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/session";

export default async function DashboardPaymentMethodsPage() {
  const user = await requireCurrentUser();

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: {
      paymentMethods: {
        select: {
          id: true,
          type: true,
          label: true,
          value: true,
          network: true,
          description: true,
          sortOrder: true,
          isVisible: true
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!profile) {
    return <p className="text-sm text-red-300">Profile not found.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Payment Methods</h1>
        <p className="text-sm text-muted">
          Add, edit, reorder, and toggle payment methods. Validation is format-based only and not authoritative.
        </p>
      </header>

      <PaymentMethodsForm />
      <PaymentMethodsList methods={profile.paymentMethods} />
    </section>
  );
}
