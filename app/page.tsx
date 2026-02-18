"use client";

import { useState, useEffect } from "react";

// NOTE: Mobile support (Expo / React Native) will be added later.
// This is currently a web-only Next.js app deployed on Vercel.

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("meerly-transactions");
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        "meerly-transactions",
        JSON.stringify(transactions)
      );
    }
  }, [transactions, mounted]);

  const addTransaction = () => {
    if (!description || !amount) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription("");
    setAmount("");
    setShowForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toFixed(2);
    return value < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  return (
    <main className="max-w-md mx-auto min-h-screen flex flex-col pb-6">
      {/* Header */}
      <div className="p-5 pb-2.5">
        <h1 className="text-2xl font-bold text-[#2d3748] text-center">
          Meerly Finance
        </h1>
      </div>

      {/* Balance Card */}
      <div className="bg-white mx-5 mt-2.5 rounded-2xl p-5 shadow-md">
        <p className="text-sm text-[#718096] text-center">Current Balance</p>
        <p
          className={`text-4xl font-bold text-center my-2.5 ${
            balance < 0 ? "text-[#f56565]" : "text-[#48bb78]"
          }`}
        >
          {mounted ? formatCurrency(balance) : "$0.00"}
        </p>
        <div className="flex justify-around mt-2.5 pt-4 border-t border-[#edf2f7]">
          <div className="text-center">
            <p className="text-base font-semibold text-[#48bb78]">
              +{mounted ? formatCurrency(income) : "$0.00"}
            </p>
            <p className="text-xs text-[#a0aec0] mt-0.5">Income</p>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-[#f56565]">
              -{mounted ? formatCurrency(expenses) : "$0.00"}
            </p>
            <p className="text-xs text-[#a0aec0] mt-0.5">Expenses</p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 bg-white mx-5 mt-5 rounded-2xl p-5 pb-0 shadow-md overflow-hidden">
        <h2 className="text-lg font-semibold text-[#2d3748] mb-4">
          Recent Transactions
        </h2>
        {transactions.length === 0 ? (
          <p className="text-center text-[#a0aec0] py-8">
            No transactions yet
          </p>
        ) : (
          <div className="overflow-y-auto max-h-80">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex justify-between items-center py-3 border-b border-[#edf2f7] mb-1 border-l-[3px] pl-3 ${
                  transaction.type === "income"
                    ? "border-l-[#48bb78]"
                    : "border-l-[#f56565]"
                }`}
              >
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-[#2d3748]">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-[#a0aec0] mt-0.5">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`text-[15px] font-semibold ${
                      transaction.type === "income"
                        ? "text-[#48bb78]"
                        : "text-[#f56565]"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="ml-2.5 p-1.5 text-[#fc8181] hover:text-[#f56565] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mx-5 mt-4 py-4 bg-[#4299e1] hover:bg-[#3182ce] text-white text-base font-semibold rounded-xl transition-colors"
        >
          + Add Transaction
        </button>
      )}

      {/* Add Transaction Form */}
      {showForm && (
        <div className="bg-white mx-5 mt-4 rounded-2xl p-5 shadow-md">
          <h2 className="text-lg font-semibold text-[#2d3748] mb-4">
            Add Transaction
          </h2>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#f7fafc] border border-[#e2e8f0] rounded-lg p-3 text-base mb-3 text-[#2d3748] placeholder-[#a0aec0] outline-none focus:border-[#4299e1] transition-colors"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#f7fafc] border border-[#e2e8f0] rounded-lg p-3 text-base mb-3 text-[#2d3748] placeholder-[#a0aec0] outline-none focus:border-[#4299e1] transition-colors"
          />
          <div className="flex gap-2.5 mb-4">
            <button
              onClick={() => setType("expense")}
              className={`flex-1 p-3 rounded-lg border font-semibold transition-colors ${
                type === "expense"
                  ? "bg-[#4299e1] border-[#4299e1] text-white"
                  : "border-[#e2e8f0] text-[#718096] hover:bg-[#f7fafc]"
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setType("income")}
              className={`flex-1 p-3 rounded-lg border font-semibold transition-colors ${
                type === "income"
                  ? "bg-[#4299e1] border-[#4299e1] text-white"
                  : "border-[#e2e8f0] text-[#718096] hover:bg-[#f7fafc]"
              }`}
            >
              Income
            </button>
          </div>
          <button
            onClick={addTransaction}
            className="w-full bg-[#48bb78] hover:bg-[#38a169] text-white text-base font-semibold p-4 rounded-lg transition-colors"
          >
            Save Transaction
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="w-full mt-2.5 p-4 text-[#a0aec0] hover:text-[#718096] text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </main>
  );
}
