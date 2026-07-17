import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MuseApp } from "@/components/muse/MuseApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }
  return <MuseApp />;
}
