type Transaction = {
    type: 'deposit' | 'withdrawal' | 'transfer';
    amount: number;
    date: Date;
    balance: number;
}

export {};

interface Transactable {
    deposit(amount: number): void;
    withdraw(amount: number): void;
    getBalance(): number;
    getTransactions(): Transaction[];
}

interface Transferable {
    transfer(target: BankAccount, amount: number): void;
}

abstract class BankAccount implements Transactable {
    protected balance: number;
    private transactions: Transaction[] = [];
    readonly accountId: string;
    readonly owner: string;

    constructor(
        accountId: string,
        owner: string,
        initialDeposit: number,
    ) {
        this.accountId = accountId;
        this.owner = owner;
        this.balance = 0;
        this.deposit(initialDeposit);
    }

    abstract getAccountType(): string;
    abstract getInterestRate(): number;

    deposit(amount: number): void {
        this.validateAmount(amount);
        this.balance += amount;
        this.recordTransaction('deposit', amount);
    }

    withdraw(amount: number): void {
        this.validateAmount(amount);
        this.validateWithdrawal(amount);
        this.balance -= amount;
        this.recordTransaction('withdrawal', amount);
    }

    getBalance(): number {
        return this.balance;
    }

    getTransactions(): Transaction[] {
        return this.transactions.map(transaction => ({ ...transaction }));
    }

    protected validateAmount(amount: number): void {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('يجب أن يكون المبلغ رقمًا موجبًا.');
        }
    }

    protected validateWithdrawal(amount: number): void {
        if (amount > this.balance) {
            throw new Error('الرصيد غير كافٍ.');
        }
    }

    protected recordTransaction(type: Transaction['type'], amount: number): void {
        this.transactions.push({
            type,
            amount,
            date: new Date(),
            balance: this.balance,
        });
    }

    protected transferTo(target: BankAccount, amount: number): void {
        this.validateAmount(amount);
        if (target === this) {
            throw new Error('لا يمكن التحويل إلى الحساب نفسه.');
        }

        this.validateWithdrawal(amount);
        this.balance -= amount;
        this.recordTransaction('transfer', amount);
        target.balance += amount;
        target.recordTransaction('transfer', amount);
    }
}

class SavingsAccount extends BankAccount implements Transferable {
    private static readonly interestRate = 0.05;

    getAccountType(): string {
        return 'Savings';
    }

    getInterestRate(): number {
        return SavingsAccount.interestRate;
    }

    transfer(target: BankAccount, amount: number): void {
        this.transferTo(target, amount);
    }

    applyInterest(): void {
        this.deposit(this.balance * this.getInterestRate());
    }
}

class CheckingAccount extends BankAccount implements Transferable {
    private readonly overdraftLimit: number;

    constructor(
        accountId: string,
        owner: string,
        initialDeposit: number,
        overdraftLimit = 5000,
    ) {
        super(accountId, owner, initialDeposit);
        if (!Number.isFinite(overdraftLimit) || overdraftLimit < 0) {
            throw new Error('حد السحب على المكشوف يجب أن يكون صفرًا أو أكثر.');
        }
        this.overdraftLimit = overdraftLimit;
    }

    getAccountType(): string {
        return 'Checking';
    }

    getInterestRate(): number {
        return 0;
    }

    transfer(target: BankAccount, amount: number): void {
        this.transferTo(target, amount);
    }

    protected validateWithdrawal(amount: number): void {
        if (amount > this.balance + this.overdraftLimit) {
            throw new Error('تجاوز حد السحب على المكشوف.');
        }
    }
}

class FixedDepositAccount extends BankAccount {
    private readonly maturityDate: Date;

    constructor(
        accountId: string,
        owner: string,
        initialDeposit: number,
        maturityDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    ) {
        super(accountId, owner, initialDeposit);
        this.maturityDate = maturityDate;
    }

    getAccountType(): string {
        return 'Fixed Deposit';
    }

    getInterestRate(): number {
        return 0.07;
    }

    withdraw(amount: number): void {
        if (new Date() < this.maturityDate) {
            throw new Error('لا يمكن السحب من الوديعة قبل تاريخ الاستحقاق.');
        }
        super.withdraw(amount);
    }
}

type AccountType = 'savings' | 'checking' | 'fixed';

class Bank {
    private static readonly accounts = new Map<string, BankAccount>();
    private static nextAccountId = 1;

    static createAccount(
        type: AccountType,
        owner: string,
        initialDeposit: number,
    ): BankAccount {
        if (!owner.trim()) {
            throw new Error('اسم صاحب الحساب مطلوب.');
        }

        const accountId = `ACC-${String(this.nextAccountId++).padStart(4, '0')}`;
        let account: BankAccount;

        switch (type) {
            case 'savings':
                account = new SavingsAccount(accountId, owner, initialDeposit);
                break;
            case 'checking':
                account = new CheckingAccount(accountId, owner, initialDeposit);
                break;
            case 'fixed':
                account = new FixedDepositAccount(accountId, owner, initialDeposit);
                break;
            default:
                throw new Error(`نوع حساب غير مدعوم: ${type}`);
        }

        this.accounts.set(accountId, account);
        return account;
    }

    static findAccount(accountId: string): BankAccount {
        const account = this.accounts.get(accountId);
        if (!account) {
            throw new Error(`الحساب ${accountId} غير موجود.`);
        }
        return account;
    }

    static getTotalDeposits(): number {
        return Array.from(this.accounts.values()).reduce(
            (total, account) => total + account.getBalance(),
            0,
        );
    }
}

const savings = Bank.createAccount('savings', 'عبدالله', 5000);
const checking = Bank.createAccount('checking', 'أحمد', 3000);
const fixed = Bank.createAccount('fixed', 'سارة', 10000);

console.log(`إجمالي الودائع عند إنشاء الحسابات: ${Bank.getTotalDeposits()}`);

savings.deposit(500);
console.log(`رصيد savings بعد الإيداع: ${savings.getBalance()}`);

checking.withdraw(1000);
console.log(`رصيد checking بعد السحب: ${checking.getBalance()}`);

if (savings instanceof SavingsAccount) {
    savings.transfer(checking, 1000);
    console.log('تحويل 1000 من savings إلى checking ✅');
}

checking.withdraw(5000);
console.log('سحب 5000 من checking (overdraft) ✅');

try {
    fixed.withdraw(1000);
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`سحب من fixed قبل النضج ❌ ${message}`);
}

console.log(`إجمالي الأرصدة الحالي: ${Bank.getTotalDeposits()}`);