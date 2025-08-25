# 🛠️ Tools, Versions & Environments - Reloop Live

## 📋 Overview

This document lists all tools, versions, and environments used during the development, debugging, and testing phases of the Reloop Live e-waste recycling platform.

## 🔗 Blockchain Development Tools

### Aiken Smart Contract Development
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Aiken | v1.1.17+c3a7fba | Smart contract language | `aiken.toml` |
| Aiken CLI | v1.1.17+c3a7fba | Command-line interface | Contract management |

#### Aiken CLI Commands
```bash
# Static analysis and type checking
aiken check

# Contract compilation
aiken build

# Unit test execution with coverage reports
aiken test

# Code formatting and style consistency
aiken fmt

# Project initialization
aiken init

# Dependency management
aiken deps

# Documentation generation
aiken docs
```

### Cardano Development Tools
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Lucid-Cardano | 0.10.0+ | Cardano JavaScript SDK | Transaction building |
| Blockfrost | Latest | Cardano API provider | Network interaction |
| Cardano CLI | 8.0.0+ | Command-line interface | Transaction signing |

#### Transaction Building Tools
```typescript
// Off-chain transaction construction
import { Lucid, Blockfrost } from "lucid-cardano";

const lucid = await Lucid.new(
  new Blockfrost("https://cardano-mainnet.blockfrost.io/api/v0", projectId)
);

// Transaction building utilities
const tx = lucid.newTx()
  .payToAddress(address, { lovelace: amount })
  .attachMetadata(metadata)
  .complete();
```

#### Datum/Redeemer Handling
```typescript
// Type-safe data serialization
interface DropDatum {
  drop_id: string;
  user_id: string;
  reward_amount: number;
  location: string;
}

// Serialization utilities
const datum = Data.to(dropData, DropDatum);
const redeemer = Data.to(redeemerData, RedeemAction);
```

#### Wallet Integration
```typescript
// Testing with various wallet providers
import { Eternl } from "lucid-cardano";

// Eternl wallet integration
const eternl = new Eternl();
await eternl.connect();

// Multi-wallet support
const supportedWallets = [
  "eternl",
  "nami", 
  "flint",
  "yoroi"
];
```

#### Script Compilation
```bash
# Aiken to CBOR conversion utilities
aiken build --output cbor

# Script hash generation
aiken build --output hash

# Validator compilation
aiken build validators/treasury.ak
```

## 🎨 Frontend Development Tools

### Framework & Build Tools
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Next.js | 15.2.4 | React framework | `next.config.ts` |
| React | 19.0.0 | UI library | Server components |
| TypeScript | 5.0.0+ | Type safety | `tsconfig.json` |
| Turbopack | Latest | Build tool | Fast development |

### Styling & UI
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Tailwind CSS | 4.1.12 | Utility-first CSS | `tailwind.config.js` |
| Radix UI | 1.0.0+ | Headless UI components | Accessibility-first |
| Lucide Icons | 0.263.1 | Icon library | Consistent iconography |

## 🗄️ Database & Backend Tools

### Database Management
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Supabase | 2.55.0+ | Backend-as-a-Service | PostgreSQL, real-time |
| PostgreSQL | 15.0+ | Database engine | Supabase managed |

### API Development
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Express.js | 4.18.0+ | API framework | RESTful endpoints |
| JWT | 9.0.0+ | Authentication | Token-based auth |
| bcryptjs | 2.4.3 | Password hashing | Secure authentication |

## 🧪 Testing & Debugging Tools

### Unit Testing
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Jest | 29.0.0+ | JavaScript testing | `jest.config.js` |
| Aiken Test | v1.1.17+ | Smart contract testing | Unit tests, coverage |

### Debugging Tools
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Chrome DevTools | Latest | Browser debugging | Performance profiling |
| VS Code | 1.80.0+ | IDE with debugging | Breakpoints, watch |
| Node.js Inspector | Built-in | Server debugging | Remote debugging |

## 🚀 Deployment & DevOps Tools

### Cloud Platforms
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Vercel | Latest | Frontend deployment | `vercel.json` |
| Supabase | 2.55.0+ | Backend deployment | Managed infrastructure |

### Monitoring & Analytics
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Sentry | Latest | Error tracking | Performance monitoring |
| Lighthouse | Latest | Performance auditing | Core Web Vitals |

## 🌍 Environment Configurations

### Development Environment
```bash
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
BLOCKFROST_PROJECT_ID=your_blockfrost_id
BACKEND_WALLET_SEED=your_wallet_seed
```

### Staging Environment
```bash
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=staging_supabase_url
BLOCKFROST_PROJECT_ID=preview_testnet_id
```

### Production Environment
```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=production_supabase_url
BLOCKFROST_PROJECT_ID=mainnet_id
```

## 📋 Tool Installation & Setup

### Prerequisites
```bash
# Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Aiken installation
curl -sSL https://aiken-lang.org/install.sh | sh

# Git
sudo apt-get install git
```

### Project Setup
```bash
# Clone repository
git clone https://github.com/your-org/reloop-live.git
cd reloop-live

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Initialize Aiken project
aiken init

# Build contracts
aiken build
```

## 🔄 CI/CD Pipeline Tools

### Continuous Integration
| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| GitHub Actions | Latest | CI/CD pipeline | `.github/workflows/` |
| Jest | 29.0.0+ | Automated testing | Test coverage |
| ESLint | 9.0.0+ | Code quality checks | Linting rules |

## 🎯 Key Features by Tool

### Aiken Smart Contract Development
- **Static Analysis**: `aiken check` for type checking
- **Contract Compilation**: `aiken build` for validator compilation
- **Unit Testing**: `aiken test` with coverage reports
- **Code Formatting**: `aiken fmt` for style consistency

### Transaction Building
- **Off-chain Construction**: Lucid-Cardano SDK
- **Type-safe Serialization**: Datum/Redeemer handling
- **Multi-wallet Support**: Eternl, Nami, Flint, Yoroi
- **CBOR Conversion**: Aiken to Cardano binary format

### Development Workflow
- **Fast Development**: Next.js 15 with Turbopack
- **Type Safety**: TypeScript 5 with strict mode
- **Modern Styling**: Tailwind CSS v4 with utility classes
- **Component Library**: Radix UI for accessibility

---

## 📊 Summary

This tools and environments documentation provides:

- **Comprehensive Tool Inventory**: All tools used in development
- **Version Tracking**: Specific versions for reproducibility
- **Configuration Details**: Setup and configuration information
- **Best Practices**: Tool selection and usage guidelines

The document ensures consistent development environments and helps new team members quickly set up their development environment.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Total Tools**: 25+  
**Environments**: 3 (Development, Staging, Production)  
**Coverage**: 100% of development workflow
