import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

// Transaction type
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [showForm, setShowForm] = useState(false);

  // Load from localStorage on web
  useEffect(() => {
    const saved = localStorage.getItem("meerly-transactions");
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem("meerly-transactions", JSON.stringify(transactions));
  }, [transactions]);

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
    Keyboard.dismiss();
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
    const formatted = value.toFixed(2);
    return value < 0 ? `-$${Math.abs(formatted)}` : `$${formatted}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Meerly Finance</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text
          style={[
            styles.balance,
            balance < 0 && styles.balanceNegative,
          ]}
        >
          {formatCurrency(balance)}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIncome}>+{formatCurrency(income)}</Text>
            <Text style={styles.summaryLabel}>Income</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryExpense}>-{formatCurrency(expenses)}</Text>
            <Text style={styles.summaryLabel}>Expenses</Text>
          </View>
        </View>
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsCard}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          <ScrollView style={styles.transactionList}>
            {transactions.map((transaction) => (
              <View
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  transaction.type === "income" && styles.transactionIncome,
                  transaction.type === "expense" && styles.transactionExpense,
                ]}
              >
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.type === "income" && styles.amountIncome,
                      transaction.type === "expense" && styles.amountExpense,
                    ]}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteTransaction(transaction.id)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Add Button */}
      {!showForm && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Transaction</Text>
        </TouchableOpacity>
      )}

      {/* Add Transaction Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add Transaction</Text>
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#a0aec0"
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#a0aec0"
          />
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "expense" && styles.typeBtnActive,
              ]}
              onPress={() => setType("expense")}
            >
              <Text
                style={[
                  styles.typeText,
                  type === "expense" && styles.typeTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "income" && styles.typeBtnActive,
              ]}
              onPress={() => setType("income")}
            >
              <Text
                style={[
                  styles.typeText,
                  type === "income" && styles.typeTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={addTransaction}>
            <Text style={styles.submitBtnText}>Save Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowForm(false)}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2d3748",
    textAlign: "center",
  },
  balanceCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
  },
  balance: {
    fontSize: 36,
    fontWeight: "700",
    color: "#48bb78",
    textAlign: "center",
    marginVertical: 10,
  },
  balanceNegative: {
    color: "#f56565",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryIncome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#48bb78",
  },
  summaryExpense: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f56565",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#a0aec0",
    marginTop: 2,
  },
  transactionsCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#a0aec0",
    paddingVertical: 30,
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
    marginBottom: 5,
  },
  transactionIncome: {
    borderLeftWidth: 3,
    borderLeftColor: "#48bb78",
    paddingLeft: 12,
  },
  transactionExpense: {
    borderLeftWidth: 3,
    borderLeftColor: "#f56565",
    paddingLeft: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2d3748",
  },
  transactionDate: {
    fontSize: 12,
    color: "#a0aec0",
    marginTop: 2,
  },
  transactionRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  amountIncome: {
    color: "#48bb78",
  },
  amountExpense: {
    color: "#f56565",
  },
  deleteBtn: {
    marginLeft: 10,
    padding: 5,
  },
  deleteText: {
    color: "#fc8181",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#4299e1",
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#2d3748",
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 15,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  typeBtnActive: {
    backgroundColor: "#4299e1",
    borderColor: "#4299e1",
  },
  typeText: {
    color: "#718096",
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#fff",
  },
  submitBtn: {
    backgroundColor: "#48bb78",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    marginTop: 10,
    padding: 15,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#a0aec0",
    fontSize: 14,
  },
});
