import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { mainnet, sepolia, base, polygon } from "wagmi/chains";

const config = getDefaultConfig({
  appName: "Transaction Risk Monitor",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains: [mainnet, sepolia, base, polygon],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export { config };

export const chains = [mainnet, sepolia, base, polygon];
