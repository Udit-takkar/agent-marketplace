"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

// Define supported chains with their proper identifiers
const SUPPORTED_CHAINS = {
  foundational: [
    { chain_id: 1, chain_name: "eth-mainnet", label: "Ethereum" },
    { chain_id: 137, chain_name: "matic-mainnet", label: "Polygon" },
    { chain_id: 56, chain_name: "bsc-mainnet", label: "BNB Chain" },
    { chain_id: 43114, chain_name: "avalanche-mainnet", label: "Avalanche" },
  ],
  frontier: [
    { chain_id: 42161, chain_name: "arbitrum-mainnet", label: "Arbitrum" },
    { chain_id: 10, chain_name: "optimism-mainnet", label: "Optimism" },
    { chain_id: 250, chain_name: "fantom-mainnet", label: "Fantom" },
    { chain_id: 42220, chain_name: "celo-mainnet", label: "Celo" },
  ],
};

interface ChainSelectorProps {
  open: boolean;
  value: string;
  chainName: string;
  busy: boolean;
  setValue: (value: string) => void;
  setOpen: (open: boolean) => void;
  setChainName: (name: string) => void;
}

export function ChainSelector({
  open,
  value,
  chainName,
  busy,
  setValue,
  setOpen,
  setChainName,
}: ChainSelectorProps) {
  const handleSelect = (chain: (typeof SUPPORTED_CHAINS.foundational)[0]) => {
    setValue(chain.chain_name);
    setChainName(chain.label);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={busy}
        >
          {value ? chainName : "Select chain..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search chain..." />
          <CommandEmpty>No chain found.</CommandEmpty>
          <CommandGroup heading="Foundational">
            {SUPPORTED_CHAINS.foundational.map((chain) => (
              <CommandItem
                key={chain.chain_id}
                value={chain.chain_name}
                onSelect={() => handleSelect(chain)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === chain.chain_name ? "opacity-100" : "opacity-0"
                  )}
                />
                {chain.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Frontier">
            {SUPPORTED_CHAINS.frontier.map((chain) => (
              <CommandItem
                key={chain.chain_id}
                value={chain.chain_name}
                onSelect={() => handleSelect(chain)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === chain.chain_name ? "opacity-100" : "opacity-0"
                  )}
                />
                {chain.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
