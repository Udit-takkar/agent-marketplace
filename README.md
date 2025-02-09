# Blockchain Transaction Risk Monitor and Personality based on Transaction History

A sophisticated blockchain transaction monitoring system that uses AI, machine learning, and The Graph protocol to detect scams, fraudulent patterns, and potential security risks in real-time.

## Features

### 🔍 Transaction Analysis

- Real-time transaction monitoring
- Multi-chain support (Ethereum, Polygon, BSC, etc.)
- DEX transaction tracking
- Historical transaction analysis

### 🛡️ Security Features

- AI-powered scam detection
- Pattern recognition for sophisticated attacks
- Risk level assessment
- Real-time security alerts

### 🤖 Machine Learning Capabilities

- Flash loan attack detection
- Front-running pattern recognition
- Sandwich attack identification
- Pump and dump scheme detection
- Rug pull early warning system

### 📊 Trading Profile Analysis

- Trading behavior patterns
- Risk profile assessment
- Transaction frequency analysis
- Preferred DEX tracking

### 🕸️ The Graph Protocol Integration (In Progress)

- Decentralized indexing of scam reports
- Pattern detection and storage
- Community-driven scam reporting
- Evidence submission and verification
- Reputation system for reporters
- Historical pattern analysis

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: shadcn/ui
- **Blockchain Data**:
  - Covalent API
  - The Graph Protocol
- **Smart Contracts**: Solidity
- **AI/ML**: OpenAI GPT-3.5
- **Authentication**: Web3 Wallet Connect
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Web3 wallet (MetaMask recommended)
- API Keys:
  - OPENAI_API_KEY
  - GOLDRUSH_API_KEY
  - Hardhat for contract deployment

### Environment Variables

```env
NEXT_PUBLIC_GOLDRUSH_API_KEY=your_goldrush_api_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SCAM_SUBGRAPH_URL=your_subgraph_url
PRIVATE_KEY=your_deployment_wallet_private_key
```

## The Graph Protocol Integration

The project uses The Graph protocol for efficient indexing and querying of blockchain data, particularly for scam detection and pattern analysis. This integration is currently under development and includes:

### Subgraph Components

- **Schema**: Defines entities for scam reports, evidence, patterns, and addresses
- **Smart Contract**: ScamDetector contract for on-chain report submission
- **Mappings**: Transform blockchain events into structured data

### Use Cases

1. **Scam Reporting**

   - Submit and track scam reports
   - Provide evidence for reported scams
   - Community voting system
   - Reporter reputation tracking

2. **Pattern Detection**

   - Index and store detected scam patterns
   - Track pattern frequency and evolution
   - Calculate risk scores for addresses

3. **Historical Analysis**
   - Query historical scam data
   - Analyze pattern trends
   - Track repeat offenders

### Current Status

The Graph integration is partially implemented with:

- Basic schema design
- Smart contract implementation
- Subgraph manifest
- Service layer for frontend integration

Pending implementation:

- Complete subgraph deployment
- Frontend components for scam reporting
- Integration with existing risk analysis
- Community voting system
- Pattern analysis dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

## Acknowledgments

- [Covalent API](https://www.covalenthq.com/) for blockchain data
- [The Graph Protocol](https://thegraph.com/) for data indexing
- [OpenAI](https://openai.com/) for AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## Roadmap

- [ ] Complete The Graph protocol integration
- [ ] Deploy ScamDetector contract
- [ ] Implement scam reporting UI
- [ ] Add community voting system
- [ ] Enhance ML model with more training data
- [ ] Add API endpoints for external integrations
- [ ] Implement collaborative filtering
