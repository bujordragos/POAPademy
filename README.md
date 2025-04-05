# 🎓 Welcome to POAPademy

**POAPademy** is an innovative decentralized education platform that redefines how academic achievements are **verified** and **preserved**.

🎥 [Watch the presentation video for an idea of how this works](https://www.youtube.com/watch?v=L8Q6gqO6rMc)

🚀 [Read the business plan here](https://github.com/gavrilaalexandru/POAPademy/blob/main/business%20plan%20poapademy.pdf)

We bridge the gap between traditional education and the emerging blockchain ecosystem by empowering universities, educators, and communities to:
- 🧠 Deliver **courses** and **quizzes**
- 🎯 Reward students with **verifiable certificates** in the form of **POAPs** (Proof of Attendance Protocol tokens)
---

## Hackathon description & Team members

- 💡 This project was built for the ETHBucharest 2025 Hackathon — an event that empowers hackers to create impactful solutions for real-world challenges, leveraging blockchain technology for transparency, traceability, and digital ownership.


### 👥 Team Members

| Name             | Role                     | Contact / Profile                            |
|------------------|--------------------------|----------------------------------------------|
| Gavrila Alexandru| Fullstack Dev            | [Github](https://github.com/gavrilaalexandru)|
| Ghetiu Tudor     | Smart Contract / Backend | [Github](https://github.com/GhetiuTudor)     |
| Bujor Dragos     | Marketing, PM & BizDev   | [Github](https://github.com/bujordragos)     |
| Bejan Ionut      | Visual & Media           | [Github](https://github.com/Bejan1234)       |

---

## 🔐 How It Works

1. Learners enroll in a course and take a quiz.
2. Upon scoring **at least 80%**, they receive a unique **POAP token**.
3. This token is minted on the **blockchain** and sent directly to the student’s **digital wallet**.
4. The result? A **permanent, tamper-proof** certificate of achievement — goodbye, forgery risks!

---

## ✅ Why POAPademy?

- 📜 **Immutable records** of educational progress  
- 🌍 **Open access** to credentialing  
- 🔗 **On-chain** verification for credibility and transparency  

---

## 🛠 Tech Stack

This project uses a modern web3 development stack with the following key technologies:

### Frontend
- **Next.js**: React framework for building the web application
- **React**: JavaScript library for building user interfaces
- **React Icons**: Icon library for adding icons to the application

### Blockchain Development
- **Hardhat**: Ethereum development environment for smart contract development
- **Ethers.js**: Library for interacting with Ethereum blockchain
- **OpenZeppelin Contracts**: Standard, reusable smart contract libraries

### Database
- **Prisma**: Modern database toolkit for TypeScript & Node.js
- **Database Client**: Configurable (specifics depend on your database setup)

### Development Tools
- **Yarn**: Package manager (version 3.2.3)
- **Node.js**: Runtime environment (version >=20.18.3)
- **Husky**: Git hooks for code quality checks
- **Lint-Staged**: Run linters on git staged files

### Additional Utilities
- **Axios**: HTTP client for API requests
- **dotenv**: Environment variable management

---

## Getting Started

### Prerequisites
- Node.js (v20.18.3 or later)
- Yarn package manager
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gavrilaalexandru/POAPademy && cd POAPademy
```

2. Install dependencies:
```bash
yarn install
```
---

### Development Scripts

- Initialize a local Blockchain
```bash
yarn chain
```

-Deploy Your Smart Contract
```bash
yarn deploy
```

- Start development server:
```bash
yarn start
```

---

## Environment Variables

Create a `.env` file in the root directory and add necessary environment variables. Refer to `.env.example` for required variables.

---

## Troubleshooting

- Ensure you're using the correct Node.js version
- Clear yarn cache if you encounter dependency issues:
```bash
yarn cache clean
```

---

## 📜 Dependencies
Dependencies:

@openzeppelin/contracts: A library of secure, reusable smart contracts

@prisma/client: The client to interact with the database using Prisma

axios: HTTP client for making requests

dotenv: For managing environment variables

ethers: A library for interacting with the Ethereum blockchain

react-icons: A library of icons for React

prisma: ORM for easy database management

Dev Dependencies:
husky: For Git hooks to improve workflow

lint-staged: For running linting tasks on staged files

@next/swc-darwin-arm64: Next.js specific dependency for Apple's ARM architecture (for M1/M2 Macs)

---
