# Blockchain Transaction Risk Monitor and Personality based on Transaction History

A sophisticated blockchain transaction monitoring system that uses AI and machine learning to detect scams, fraudulent patterns, and potential security risks.

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

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: shadcn/ui
- **Blockchain Data**: Covalent API
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

### Environment Variables

```env
NEXT_PUBLIC_GOLDRUSH_API_KEY=your_goldrush_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Project Structure

```
├── apps
│   └── web
│       ├── app
│       ├── components
│       ├── lib
│       └── public
├── packages
│   └── ui
└── package.json
```

## Key Components

### Transaction Collector Service

Handles blockchain data collection and analysis:

- Transaction history retrieval
- DEX trade identification
- Pattern analysis
- Risk assessment

### Risk Analysis

Multiple layers of security checks:

- Basic pattern recognition
- AI-powered analysis
- Machine learning pattern detection
- Historical data comparison

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

## Acknowledgments

- [Covalent API](https://www.covalenthq.com/) for blockchain data
- [OpenAI](https://openai.com/) for AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## Roadmap

- [ ] Add community-driven scam reporting
- [ ] Enhance ML model with more training data
- [ ] Add API endpoints for external integrations
- [ ] Implement collaborative filtering
