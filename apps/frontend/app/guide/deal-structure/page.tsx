import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/** Старый URL ведёт на страницу параметров релиза в каталоге. */
export default function LegacyGuideDealStructureRedirectPage() {
  redirect(ROUTES.catalogReleaseParameters);
}
