import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function DashboardActivityPage() {
  redirect(ROUTES.dashboardActivity);
}
