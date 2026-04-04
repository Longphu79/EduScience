import { Container } from "@mantine/core";

import { SiteHeader } from "./site-header";

export function PublicShell({ children }) {
  return (
    <Container size={1320} py="md">
      <SiteHeader />
      {children}
    </Container>
  );
}
