// components/invox/ConnectionStatus.tsx
interface Props {
  status: "pending" | "success" | "error";
}

export function ConnectionStatus({ status }: Props) {
  if (status === "pending") return null;

  return (
    <p className={`mb-6 font-medium ${status === "success" ? "text-green-600" : "text-red-600"}`}>
      {status === "success" ? "✅ Backend is reachable" : "❌ Failed to reach backend"}
    </p>
  );
}
