"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChainItem, GoldRushClient } from "@covalenthq/client-sdk";
import { GOLDRUSH_API_KEY } from "@/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { ChainSelector } from "@/components/chain/chain-selector";

export default function HomePage() {
  const [allChains, setAllChains] = useState<{
    foundational: ChainItem[];
    frontier: ChainItem[];
    community: ChainItem[];
  }>({
    foundational: [],
    frontier: [],
    community: [],
  });

  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState<boolean>(false);
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [chainName, setChainName] = useState<string>("Ethereum Mainnet");
  const [value, setValue] = useState("eth-mainnet");
  const { toast } = useToast();

  const handleAllChains = async () => {
    setBusy(true);
    if (!GOLDRUSH_API_KEY) return;

    const client = new GoldRushClient(GOLDRUSH_API_KEY);
    try {
      const allChainsResp = await client.BaseService.getAllChains();
      if (allChainsResp.error) {
        toast({
          title: "Something went wrong.",
          description: allChainsResp.error_message,
        });
      }

      if (allChainsResp.data && allChainsResp.data.items) {
        const foundational: ChainItem[] = [];
        const frontier: ChainItem[] = [];
        const community: ChainItem[] = [];

        allChainsResp.data.items.forEach((chain: ChainItem) => {
          if (chain.name && chain.priority_label === "Foundational") {
            foundational.push(chain);
          } else if (chain.name && chain.priority_label === "Frontier") {
            frontier.push(chain);
          } else {
            community.push(chain);
          }
        });

        setAllChains({
          foundational,
          frontier,
          community,
        });
      }
    } catch (error) {
      console.error(error);
    }
    setBusy(false);
  };

  useEffect(() => {
    handleAllChains();
  }, []);

  return (
    <section className="container flex flex-col justify-center gap-6 md:py-10 h-[calc(100vh-150px)] items-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Transaction Risk Monitor
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Analyze and monitor blockchain transactions for potential risks and
          fraud patterns.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/tx/${value}/${address}`);
          }}
        >
          <div className="flex flex-col gap-3">
            <ChainSelector
              open={open}
              value={value}
              chainName={chainName}
              busy={busy}
              allChains={allChains}
              setValue={setValue}
              setOpen={setOpen}
              setChainName={setChainName}
            />

            <Label htmlFor="tx_hash">Transaction Hash</Label>
            <Input
              type="text"
              id="tx_hash"
              placeholder="Enter transaction hash"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <Button
              disabled={address.length === 0 || !value || busy}
              type="submit"
            >
              Analyze Transaction
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
