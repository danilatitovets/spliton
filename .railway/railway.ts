import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  const web = service("web", {
    source: github("danilachat27-oss/spliton"),
  });

  return project("spliton", {
    resources: [web],
  });
});
