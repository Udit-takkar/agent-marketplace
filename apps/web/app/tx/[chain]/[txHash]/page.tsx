import { TransactionView } from "@/components/transaction/transaction-view";
import { RiskAssessmentView } from "@/components/transaction/risk-assessment-view";

export default function TransactionPage({
  params,
}: {
  params: { chain: string; txHash: string };
}) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <TransactionView chain={params.chain} txHash={params.txHash} />

      <RiskAssessmentView
        chain={params.chain}
        transactionHash={params.txHash}
      />
    </div>
  );
}
