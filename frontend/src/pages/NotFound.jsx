import { AlertTriangle } from "lucide-react";
import PageShell from "../components/PageShell";

export default function NotFound() {
  return (
    <PageShell
      icon={<AlertTriangle size={32} />}
      badge="404"
      title="Page Not Found"
      description="The page you are looking for does not exist or has been moved."
      backTo="/"
      backLabel="Return Home"
    />
  );
}
