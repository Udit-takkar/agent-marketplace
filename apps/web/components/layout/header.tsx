import { CustomConnectButton } from "@/components/connect-button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Transaction Risk Monitor</h1>
        <CustomConnectButton />
      </div>
    </header>
  );
}
