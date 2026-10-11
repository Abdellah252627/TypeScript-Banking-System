# TypeScript Banking System

TypeScript OOP demo with abstract classes, interfaces, inheritance, and encapsulation — Savings, Checking, and Fixed Deposit accounts with transactions, interest, and overdraft.

## Features

- **Account Types**: Savings, Checking, and Fixed Deposit accounts
- **Transaction Tracking**: Records deposits, withdrawals, and transfers
- **Interest Calculation**: Different interest rates per account type
- **Overdraft Support**: Checking accounts allow withdrawals beyond balance
- **Fixed Deposit Restrictions**: Prevents withdrawals before maturity date
- **Transfer Functionality**: Transfers between accounts with validation

## Project Structure

```
src/
  main.ts    # Implementation and demonstration
```

## Account Types

### SavingsAccount
- Interest rate: 5%
- Supports transfers
- `applyInterest()` method to apply interest to balance

### CheckingAccount
- Interest rate: 0%
- Overdraft limit: 5000 (default)
- Allows withdrawals exceeding balance up to overdraft limit

### FixedDepositAccount
- Interest rate: 7%
- Maturity date: 1 year from creation (default)
- Withdrawals blocked before maturity date

## Running the Demo

```bash
npx ts-node src/main.ts
```

Or compile and run:

```bash
npx tsc src/main.ts
node src/main.js
```

## Key OOP Concepts Demonstrated

- **Abstract Class**: `BankAccount` defines common behavior with abstract methods
- **Interfaces**: `Transactable` and `Transferable` define contracts
- **Inheritance**: Specialized account types extend the base class
- **Encapsulation**: Private fields with controlled access
- **Polymorphism**: Different withdrawal behaviors per account type
- **Static Members**: Bank registry and account counter

## Error Handling

Custom error messages in Arabic for:
- Invalid amounts (non-positive or non-finite)
- Insufficient balance
- Overdraft limit exceeded
- Transfers to self
- Early fixed deposit withdrawals
- Missing account owner name
- Unsupported account types