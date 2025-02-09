"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { ChainSelector } from "@/components/chain/chain-selector";
import { useToast } from "@workspace/ui/hooks/use-toast";

export default function AnalyzePage() {
  const [txHash, setTxHash] = useState("");
  const [chain, setChain] = useState("eth-mainnet");
  const [chainName, setChainName] = useState("Ethereum Mainnet");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!txHash) {
        throw new Error("Please enter a transaction hash");
      }

      // Redirect to transaction analysis page
      router.push(`/tx/${chain}/${txHash}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analyze Transaction</h1>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Chain</label>
              <ChainSelector
                open={open}
                value={chain}
                chainName={chainName}
                busy={isLoading}
                allChains={{
                  foundational: [],
                  frontier: [],
                  community: [],
                }}
                setValue={setChain}
                setOpen={setOpen}
                setChainName={setChainName}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Hash</label>
              <Input
                placeholder="Enter transaction hash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !txHash}
            >
              {isLoading ? "Analyzing..." : "Analyze Transaction"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
