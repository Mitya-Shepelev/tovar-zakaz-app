import { prisma } from "@/lib/prisma";
import PlanForm from "@/components/admin/PlanForm";
import { notFound } from "next/navigation";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const plan = await prisma.plan.findUnique({
    where: { id },
  });

  if (!plan) {
    notFound();
  }

  // Convert Decimal/DB types if necessary, though Prisma returns JS types mostly correct.
  // Plan features is Json, need to cast to string[]
  const formattedPlan = {
    ...plan,
    features: plan.features as string[],
  };

  return <PlanForm initialData={formattedPlan} isEditing />;
}
