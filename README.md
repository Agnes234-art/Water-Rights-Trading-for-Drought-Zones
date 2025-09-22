# 💧 Water Rights Trading Platform

A decentralized platform for trading water allocations during drought conditions, built on the Stacks blockchain using Clarity smart contracts.

## 🌊 Overview

The Water Rights Trading Platform allows farmers and water rights holders to:
- 📝 Register water allocations with regional metadata
- 💰 Create listings to sell surplus water rights
- 🛒 Purchase water rights from other users
- 📊 Track trading statistics and market analytics
- 🔄 Transfer water rights between users
- 📈 Monitor platform-wide usage metrics

## 🚀 Features

### Core Functionality
- ✅ **Water Allocation Registration**: Register water rights with amount, region, and expiry
- ✅ **Marketplace Trading**: Create listings and buy/sell water rights
- ✅ **Direct Transfers**: Transfer water rights between users
- ✅ **Statistics Tracking**: Comprehensive user and platform analytics
- ✅ **Regional Support**: Track water rights by geographic region
- ✅ **Expiry Management**: Time-based listing and allocation expiry

### Smart Contract Features
- 🔐 **Secure Trading**: Platform fee collection and secure STX transfers
- 📊 **Analytics**: Real-time statistics for users, regions, and platform
- ⏰ **Time-based Logic**: Block height-based expiry system
- 💳 **Fee Management**: Configurable platform fees (default 0.25%)
- 🔄 **State Management**: Comprehensive mapping of allocations and listings

## 🛠️ Technical Stack

- **Smart Contract**: Clarity (Stacks Blockchain)
- **Frontend**: HTML5, CSS3, JavaScript
- **Testing**: Clarinet Framework
- **Deployment**: Stacks Mainnet/Testnet

## ⚠️ Known Issues

- **Block Height**: Temporarily using simplified block height logic for compatibility. Can be enhanced with proper `stacks-block-height` implementation in future versions.

## 📁 Project Structure

```
Water-Rights-Trading-for-Drought-Zones/
├── contracts/
│   └── Water-Right-Trading.clar     # Main smart contract
├── ui/
│   ├── index.html                   # Web interface
│   ├── style.css                    # Responsive styling
│   └── script.js                    # Frontend logic
├── tests/
│   └── (test files)
├── settings/
│   └── (configuration files)
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet) installed
- Node.js and npm (for UI development)
- Stacks wallet (for testnet/mainnet deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Water-Rights-Trading-for-Drought-Zones.git
   cd Water-Rights-Trading-for-Drought-Zones
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Clarinet console**
   ```bash
   clarinet console
   ```

4. **Deploy contract locally**
   ```clarity
   ::deploy_contract
   ```

## 💻 Usage

### Smart Contract Functions

#### Public Functions

**Register Water Allocation**
```clarity
(register-water-allocation 
  (total-allocation uint) 
  (region (string-ascii 50)) 
  (expiry-date uint))
```

**Create Listing**
```clarity
(create-listing 
  (amount uint) 
  (price-per-unit uint) 
  (expiry-blocks uint))
```

**Buy Water Rights**
```clarity
(buy-water-rights (listing-id uint))
```

**Transfer Rights**
```clarity
(transfer-water-rights 
  (recipient principal) 
  (amount uint))
```

**Cancel Listing**
```clarity
(cancel-listing (listing-id uint))
```

#### Read-Only Functions

**Get Allocation**
```clarity
(get-water-allocation (owner principal))
```

**Get Listing**
```clarity
(get-water-listing (listing-id uint))
```

**Get Statistics**
```clarity
(get-user-statistics (user principal))
(get-region-statistics (region (string-ascii 50)))
(get-platform-statistics)
```

### Web Interface

1. **Open the UI**
   ```bash
   cd ui
   python -m http.server 8000
   # or
   npx serve .
   ```

2. **Navigate to** `http://localhost:8000`

3. **Use the interface to**:
   - 📊 View dashboard with your water rights
   - 📝 Register new water allocations
   - 🛒 Browse and purchase from marketplace
   - 📈 Monitor trading statistics

## 📊 Contract Data Structures

### Water Allocations
```clarity
{
  total-allocation: uint,
  available-balance: uint,
  region: (string-ascii 50),
  allocation-date: uint,
  expiry-date: uint
}
```

### Listings
```clarity
{
  seller: principal,
  amount: uint,
  price-per-unit: uint,
  region: (string-ascii 50),
  expiry-block: uint,
  active: bool
}
```

### User Statistics
```clarity
{
  total-sold: uint,
  total-bought: uint,
  total-earned: uint,
  total-spent: uint,
  trades-count: uint
}
```

## 🧪 Testing

Run contract tests:
```bash
clarinet test
```

Run specific test file:
```bash
clarinet test tests/water-rights-test.ts
```

## 🌐 Deployment

### Testnet Deployment
```bash
clarinet deploy --testnet
```

### Mainnet Deployment
```bash
clarinet deploy --mainnet
```

## 🔧 Configuration

### Platform Fee
Default platform fee is 0.25% (25 basis points). Contract owner can modify:
```clarity
(set-platform-fee-rate u50)  ;; 0.50%
```

### Error Codes
- `u100`: Unauthorized access
- `u101`: Invalid amount
- `u102`: Insufficient balance
- `u103`: Invalid price
- `u104`: Invalid allocation
- `u105`: Listing not found
- `u106`: Cannot buy own listing
- `u107`: Invalid expiry
- `u108`: Listing expired
- `u109`: Allocation not found
- `u110`: Invalid region

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Stacks Foundation for the blockchain infrastructure
- Clarinet team for the development framework
- The agricultural community for inspiring this solution

## 🔗 Links

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)

---

Built with ❤️ for sustainable water management during drought conditions.
