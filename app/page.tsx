"use client"

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calculator,
  CreditCard,
  FileDown,
  Goal,
  Landmark,
  Menu,
  Paperclip,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Section =
  | "dashboard"
  | "transacoes"
  | "orcamento"
  | "cartoes"
  | "metas"
  | "relatorios"
  | "planejamento"
  | "patrimonio"
  | "configuracoes"

type Transaction = {
  id: string
  description: string
  category: string
  account: string
  amount: number
  recurring: boolean
}

type AppState = {
  projectName: string
  month: string
  currentUser: string
  invitedEmail: string
  notifications: boolean
  openFinance: boolean
  dashboardCards: {
    balance: boolean
    income: boolean
    expense: boolean
    alerts: boolean
  }
  categories: string[]
  accounts: { name: string; balance: number }[]
  budgets: { category: string; limit: number; alert: number }[]
  transactions: Transaction[]
  cards: { name: string; limit: number; invoice: number; dueDay: number }[]
  goals: { name: string; target: number; current: number }[]
  assets: { name: string; value: number }[]
  debts: { name: string; value: number }[]
}

const initialState: AppState = {
  projectName: "Economy",
  month: new Date().toISOString().slice(0, 7),
  currentUser: "Dono",
  invitedEmail: "",
  notifications: true,
  openFinance: false,
  dashboardCards: {
    balance: true,
    income: true,
    expense: true,
    alerts: true,
  },
  categories: ["Receita", "Moradia", "Mercado", "Transporte", "Lazer"],
  accounts: [
    { name: "Conta principal", balance: 0 },
    { name: "Cartao casal", balance: 0 },
  ],
  budgets: [
    { category: "Moradia", limit: 3000, alert: 80 },
    { category: "Mercado", limit: 1600, alert: 80 },
  ],
  transactions: [],
  cards: [{ name: "Cartao principal", limit: 5000, invoice: 0, dueDay: 10 }],
  goals: [{ name: "Reserva", target: 10000, current: 0 }],
  assets: [],
  debts: [],
}

const navItems = [
  ["Dashboard", "dashboard", Wallet],
  ["Transacoes", "transacoes", Banknote],
  ["Orcamento", "orcamento", TrendingUp],
  ["Cartoes", "cartoes", CreditCard],
  ["Metas", "metas", Goal],
  ["Relatorios", "relatorios", FileDown],
  ["Planejamento", "planejamento", Calculator],
  ["Patrimonio", "patrimonio", Landmark],
  ["Configuracoes", "configuracoes", Settings],
] as const

const chartConfig = {
  income: { label: "Receitas", color: "var(--chart-2)" },
  expense: { label: "Despesas", color: "var(--chart-4)" },
  balance: { label: "Saldo", color: "var(--chart-3)" },
  value: { label: "Valor", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function Page() {
  const formRef = useRef<HTMLDivElement>(null)
  const [section, setSection] = useState<Section>("dashboard")
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === "undefined") {
      return initialState
    }

    const saved = window.localStorage.getItem("economy-state")
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState
  })
  const [editId, setEditId] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(initialState.categories[0])
  const [account, setAccount] = useState(initialState.accounts[0].name)
  const [kind, setKind] = useState("expense")
  const [recurring, setRecurring] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newAccount, setNewAccount] = useState("")

  useEffect(() => {
    window.localStorage.setItem("economy-state", JSON.stringify(state))
  }, [state])

  const totals = useMemo(() => {
    const income = state.transactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((total, transaction) => total + transaction.amount, 0)
    const expense = Math.abs(
      state.transactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((total, transaction) => total + transaction.amount, 0)
    )
    const assets = state.assets.reduce((total, item) => total + item.value, 0)
    const debts = state.debts.reduce((total, item) => total + item.value, 0)
    const accounts = state.accounts.reduce((total, item) => total + item.balance, 0)

    return {
      income,
      expense,
      balance: accounts + income - expense + assets - debts,
    }
  }, [state])

  const categoryChart = useMemo(() => {
    return state.categories
      .map((name, index) => ({
        name,
        value: Math.abs(
          state.transactions
            .filter(
              (transaction) =>
                transaction.category === name && transaction.amount < 0
            )
            .reduce((total, transaction) => total + transaction.amount, 0)
        ),
        fill: `var(--chart-${(index % 5) + 1})`,
      }))
      .filter((item) => item.value > 0)
  }, [state])

  const cashFlow = useMemo(() => {
    return state.transactions
      .slice()
      .reverse()
      .reduce<
        {
          day: string
          income: number
          expense: number
          balance: number
        }[]
      >((items, transaction, index) => {
        const previousBalance = items.at(-1)?.balance ?? 0
        const balance = previousBalance + transaction.amount
        items.push({
          day: String(index + 1).padStart(2, "0"),
          income: transaction.amount > 0 ? transaction.amount : 0,
          expense: transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
          balance,
        })
        return items
      }, [])
  }, [state.transactions])

  function updateState(patch: Partial<AppState>) {
    setState((current) => ({ ...current, ...patch }))
  }

  function openSection(next: Section) {
    setSection(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function resetForm() {
    setEditId(null)
    setDescription("")
    setAmount("")
    setCategory(state.categories[0] ?? "")
    setAccount(state.accounts[0]?.name ?? "")
    setKind("expense")
    setRecurring(false)
  }

  function saveTransaction() {
    const numericAmount = Number(amount.replace(",", "."))

    if (!description || !category || !account || !Number.isFinite(numericAmount)) {
      return
    }

    const signedAmount =
      kind === "income" ? Math.abs(numericAmount) : -Math.abs(numericAmount)

    const nextTransaction = {
      id: editId ?? crypto.randomUUID(),
      description,
      category,
      account,
      amount: signedAmount,
      recurring,
    }

    setState((current) => ({
      ...current,
      transactions: editId
        ? current.transactions.map((transaction) =>
            transaction.id === editId ? nextTransaction : transaction
          )
        : [nextTransaction, ...current.transactions],
    }))

    resetForm()
  }

  function editTransaction(transaction: Transaction) {
    setSection("transacoes")
    setEditId(transaction.id)
    setDescription(transaction.description)
    setAmount(String(Math.abs(transaction.amount)))
    setCategory(transaction.category)
    setAccount(transaction.account)
    setKind(transaction.amount > 0 ? "income" : "expense")
    setRecurring(transaction.recurring)
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    )
  }

  function removeTransaction(id: string) {
    setState((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.id !== id),
    }))
  }

  function addCategory() {
    const value = newCategory.trim()
    if (!value || state.categories.includes(value)) {
      return
    }
    updateState({ categories: [...state.categories, value] })
    setNewCategory("")
  }

  function addAccount() {
    const value = newAccount.trim()
    if (!value || state.accounts.some((item) => item.name === value)) {
      return
    }
    updateState({ accounts: [...state.accounts, { name: value, balance: 0 }] })
    setNewAccount("")
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="grid min-h-svh lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r bg-sidebar lg:block">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center gap-3 border-b px-4">
              <div className="flex size-8 items-center justify-center border bg-primary text-primary-foreground">
                <Wallet />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{state.projectName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  workspace local
                </p>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-1 p-3 text-sm">
                {navItems.map(([label, value, Icon]) => (
                  <Button
                    key={value}
                    variant={section === value ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => openSection(value)}
                  >
                    <Icon data-icon="inline-start" />
                    {label}
                  </Button>
                ))}
              </nav>
            </ScrollArea>
            <div className="border-t p-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {state.currentUser.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{state.currentUser}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    dados no navegador
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
            <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu />
                </Button>
                <div>
                  <h1 className="text-base font-semibold">{titleFor(section)}</h1>
                  <p className="text-xs text-muted-foreground">{state.month}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  className="hidden w-[150px] md:block"
                  type="month"
                  value={state.month}
                  onChange={(event) => updateState({ month: event.target.value })}
                />
                <Button
                  onClick={() => {
                    openSection("transacoes")
                    requestAnimationFrame(() =>
                      formRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    )
                  }}
                >
                  <Plus data-icon="inline-start" />
                  Lancar
                </Button>
              </div>
            </div>
            <ScrollArea className="border-t lg:hidden">
              <nav className="flex gap-1 p-2">
                {navItems.map(([label, value, Icon]) => (
                  <Button
                    key={value}
                    variant={section === value ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => openSection(value)}
                  >
                    <Icon data-icon="inline-start" />
                    {label}
                  </Button>
                ))}
              </nav>
            </ScrollArea>
          </header>

          <div className="flex flex-col gap-5 p-4 lg:p-6">
            {section === "dashboard" ? (
              <Dashboard
                state={state}
                totals={totals}
                cashFlow={cashFlow}
                categoryChart={categoryChart}
                formatCurrency={formatCurrency}
              />
            ) : null}

            {section === "transacoes" ? (
              <Transactions
                state={state}
                formRef={formRef}
                editId={editId}
                description={description}
                amount={amount}
                category={category}
                account={account}
                kind={kind}
                recurring={recurring}
                setDescription={setDescription}
                setAmount={setAmount}
                setCategory={setCategory}
                setAccount={setAccount}
                setKind={setKind}
                setRecurring={setRecurring}
                saveTransaction={saveTransaction}
                resetForm={resetForm}
                editTransaction={editTransaction}
                removeTransaction={removeTransaction}
                formatCurrency={formatCurrency}
              />
            ) : null}

            {section === "orcamento" ? (
              <Budget state={state} updateState={updateState} totals={totals} />
            ) : null}

            {section === "cartoes" ? (
              <SimpleCollection
                title="Cartoes"
                description="Controle de fatura, limite e vencimento"
                rows={state.cards.map((card) => [
                  card.name,
                  formatCurrency(card.invoice),
                  `${Math.round((card.invoice / Math.max(card.limit, 1)) * 100)}% limite`,
                  `vence dia ${card.dueDay}`,
                ])}
              />
            ) : null}

            {section === "metas" ? (
              <Goals state={state} updateState={updateState} formatCurrency={formatCurrency} />
            ) : null}

            {section === "relatorios" ? (
              <Reports
                state={state}
                totals={totals}
                categoryChart={categoryChart}
                cashFlow={cashFlow}
                formatCurrency={formatCurrency}
              />
            ) : null}

            {section === "planejamento" ? <Planning totals={totals} /> : null}

            {section === "patrimonio" ? (
              <Wealth
                state={state}
                updateState={updateState}
                formatCurrency={formatCurrency}
              />
            ) : null}

            {section === "configuracoes" ? (
              <SettingsView
                state={state}
                updateState={updateState}
                newCategory={newCategory}
                newAccount={newAccount}
                setNewCategory={setNewCategory}
                setNewAccount={setNewAccount}
                addCategory={addCategory}
                addAccount={addAccount}
                resetAll={() => setState(initialState)}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}

function Dashboard({
  state,
  totals,
  cashFlow,
  categoryChart,
  formatCurrency,
}: {
  state: AppState
  totals: { income: number; expense: number; balance: number }
  cashFlow: { day: string; income: number; expense: number; balance: number }[]
  categoryChart: { name: string; value: number; fill: string }[]
  formatCurrency: (value: number) => string
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {state.dashboardCards.balance ? (
          <Metric title="Saldo" value={formatCurrency(totals.balance)} delta="calculado" icon={Wallet} />
        ) : null}
        {state.dashboardCards.income ? (
          <Metric title="Receitas" value={formatCurrency(totals.income)} delta="periodo" icon={ArrowUpRight} />
        ) : null}
        {state.dashboardCards.expense ? (
          <Metric title="Despesas" value={formatCurrency(totals.expense)} delta="periodo" icon={ArrowDownRight} />
        ) : null}
        {state.dashboardCards.alerts ? (
          <Metric title="Alertas" value={String(alertCount(state))} delta="orcamento" icon={AlertCircle} />
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de caixa</CardTitle>
            <CardDescription>Baseado nas transacoes lancadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={cashFlow}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={48} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="balance" type="monotone" stroke="var(--color-balance)" fill="var(--color-balance)" fillOpacity={0.16} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
            <CardDescription>Sem dados falsos</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChart.length ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={categoryChart} dataKey="value" nameKey="name" innerRadius={58}>
                    {categoryChart.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyText text="Sem despesas lancadas." />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function Transactions({
  state,
  formRef,
  editId,
  description,
  amount,
  category,
  account,
  kind,
  recurring,
  setDescription,
  setAmount,
  setCategory,
  setAccount,
  setKind,
  setRecurring,
  saveTransaction,
  resetForm,
  editTransaction,
  removeTransaction,
  formatCurrency,
}: {
  state: AppState
  formRef: React.RefObject<HTMLDivElement | null>
  editId: string | null
  description: string
  amount: string
  category: string
  account: string
  kind: string
  recurring: boolean
  setDescription: (value: string) => void
  setAmount: (value: string) => void
  setCategory: (value: string) => void
  setAccount: (value: string) => void
  setKind: (value: string) => void
  setRecurring: (value: boolean) => void
  saveTransaction: () => void
  resetForm: () => void
  editTransaction: (transaction: Transaction) => void
  removeTransaction: (id: string) => void
  formatCurrency: (value: number) => string
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Transacoes</CardTitle>
            <CardDescription>Crie, edite e remova lancamentos</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload data-icon="inline-start" />
              OFX/CSV
            </Button>
            <Button variant="outline">
              <Paperclip data-icon="inline-start" />
              Anexo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {state.transactions.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.account}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.recurring ? "Recorrente" : "Manual"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editTransaction(transaction)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeTransaction(transaction.id)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyText text="Nenhuma transacao criada." />
          )}
        </CardContent>
      </Card>

      <Card ref={formRef}>
        <CardHeader>
          <CardTitle>{editId ? "Editar lancamento" : "Novo lancamento"}</CardTitle>
          <CardDescription>Dados ficam salvos no navegador</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input placeholder="Descricao" value={description} onChange={(event) => setDescription(event.target.value)} />
          <Input placeholder="Valor" value={amount} onChange={(event) => setAmount(event.target.value)} />
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {state.categories.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={account} onValueChange={setAccount}>
            <SelectTrigger><SelectValue placeholder="Conta" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {state.accounts.map((item) => (
                  <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between border p-3">
            <span className="text-sm">Recorrente</span>
            <Switch checked={recurring} onCheckedChange={setRecurring} />
          </div>
          <div className="flex gap-2">
            <Button onClick={saveTransaction}>Salvar</Button>
            {editId ? <Button variant="outline" onClick={resetForm}>Cancelar</Button> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Budget({
  state,
  updateState,
  totals,
}: {
  state: AppState
  updateState: (patch: Partial<AppState>) => void
  totals: { expense: number }
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Orcamento</CardTitle>
          <CardDescription>Limites editaveis por categoria</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {state.budgets.map((budget, index) => {
            const used = Math.abs(
              state.transactions
                .filter((item) => item.category === budget.category && item.amount < 0)
                .reduce((total, item) => total + item.amount, 0)
            )
            const percent = Math.round((used / Math.max(budget.limit, 1)) * 100)
            return (
              <div key={budget.category} className="flex flex-col gap-2 border p-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span>{budget.category}</span>
                  <span className="text-muted-foreground">{percent}%</span>
                </div>
                <Progress value={Math.min(percent, 100)} />
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    value={budget.limit}
                    onChange={(event) => {
                      const budgets = [...state.budgets]
                      budgets[index] = { ...budget, limit: Number(event.target.value) }
                      updateState({ budgets })
                    }}
                  />
                  <Input
                    value={budget.alert}
                    onChange={(event) => {
                      const budgets = [...state.budgets]
                      budgets[index] = { ...budget, alert: Number(event.target.value) }
                      updateState({ budgets })
                    }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
          <CardDescription>Gasto total no periodo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{totals.expense.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function Goals({
  state,
  updateState,
  formatCurrency,
}: {
  state: AppState
  updateState: (patch: Partial<AppState>) => void
  formatCurrency: (value: number) => string
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {state.goals.map((goal, index) => {
        const percent = Math.round((goal.current / Math.max(goal.target, 1)) * 100)
        return (
          <Card key={goal.name}>
            <CardHeader>
              <CardTitle>{goal.name}</CardTitle>
              <CardDescription>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Progress value={Math.min(percent, 100)} />
              <Input
                value={goal.current}
                onChange={(event) => {
                  const goals = [...state.goals]
                  goals[index] = { ...goal, current: Number(event.target.value) }
                  updateState({ goals })
                }}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function Reports({
  totals,
  cashFlow,
  formatCurrency,
}: {
  state: AppState
  totals: { income: number; expense: number; balance: number }
  categoryChart: { name: string; value: number; fill: string }[]
  cashFlow: { day: string; income: number; expense: number; balance: number }[]
  formatCurrency: (value: number) => string
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>DRE pessoal</CardTitle>
          <CardDescription>{formatCurrency(totals.income - totals.expense)} de resultado</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={cashFlow}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="income" fill="var(--color-income)" />
              <Bar dataKey="expense" fill="var(--color-expense)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Exportacao</CardTitle>
          <CardDescription>Preparado para PDF/Excel</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline"><FileDown data-icon="inline-start" />Exportar PDF</Button>
          <Button variant="outline"><FileDown data-icon="inline-start" />Exportar Excel</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Planning({ totals }: { totals: { income: number; expense: number } }) {
  const surplus = totals.income - totals.expense
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {[
        ["Sobra mensal", surplus],
        ["Corte 10%", totals.expense * 0.1],
        ["Sobra apos corte", surplus + totals.expense * 0.1],
      ].map(([label, value]) => (
        <Card key={label as string}>
          <CardHeader>
            <CardTitle>{label as string}</CardTitle>
            <CardDescription>Simulador simples</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Wealth({
  state,
  updateState,
  formatCurrency,
}: {
  state: AppState
  updateState: (patch: Partial<AppState>) => void
  formatCurrency: (value: number) => string
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Contas</CardTitle>
          <CardDescription>Saldos editaveis</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {state.accounts.map((item, index) => (
            <div key={item.name} className="grid gap-2 md:grid-cols-[1fr_160px]">
              <Input
                value={item.name}
                onChange={(event) => {
                  const accounts = [...state.accounts]
                  accounts[index] = { ...item, name: event.target.value }
                  updateState({ accounts })
                }}
              />
              <Input
                value={item.balance}
                onChange={(event) => {
                  const accounts = [...state.accounts]
                  accounts[index] = { ...item, balance: Number(event.target.value) }
                  updateState({ accounts })
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <SimpleCollection
        title="Patrimonio"
        description="Resumo de bens e dividas"
        rows={[
          ["Contas", formatCurrency(state.accounts.reduce((total, item) => total + item.balance, 0)), "", ""],
          ["Bens", formatCurrency(state.assets.reduce((total, item) => total + item.value, 0)), "", ""],
          ["Dividas", formatCurrency(state.debts.reduce((total, item) => total + item.value, 0)), "", ""],
        ]}
      />
    </div>
  )
}

function SettingsView({
  state,
  updateState,
  newCategory,
  newAccount,
  setNewCategory,
  setNewAccount,
  addCategory,
  addAccount,
  resetAll,
}: {
  state: AppState
  updateState: (patch: Partial<AppState>) => void
  newCategory: string
  newAccount: string
  setNewCategory: (value: string) => void
  setNewAccount: (value: string) => void
  addCategory: () => void
  addAccount: () => void
  resetAll: () => void
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Projeto</CardTitle>
          <CardDescription>Personalizacao geral</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input value={state.projectName} onChange={(event) => updateState({ projectName: event.target.value })} />
          <Input value={state.currentUser} onChange={(event) => updateState({ currentUser: event.target.value })} />
          <Input placeholder="Email convidado" value={state.invitedEmail} onChange={(event) => updateState({ invitedEmail: event.target.value })} />
          <div className="flex items-center justify-between border p-3">
            <span className="text-sm">Notificacoes</span>
            <Switch checked={state.notifications} onCheckedChange={(notifications) => updateState({ notifications })} />
          </div>
          <div className="flex items-center justify-between border p-3">
            <span className="text-sm">Open Finance</span>
            <Switch checked={state.openFinance} onCheckedChange={(openFinance) => updateState({ openFinance })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Cards visiveis</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Object.entries(state.dashboardCards).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between border p-3">
              <span className="text-sm">{key}</span>
              <Switch
                checked={value}
                onCheckedChange={(checked) =>
                  updateState({
                    dashboardCards: { ...state.dashboardCards, [key]: checked },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
          <CardDescription>Usadas em lancamentos e orcamento</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nova categoria" />
            <Button onClick={addCategory}>Adicionar</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.categories.map((item) => (
              <Badge key={item} variant="secondary">{item}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas</CardTitle>
          <CardDescription>Origem dos lancamentos</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input value={newAccount} onChange={(event) => setNewAccount(event.target.value)} placeholder="Nova conta" />
            <Button onClick={addAccount}>Adicionar</Button>
          </div>
          {state.accounts.map((item) => (
            <Row key={item.name} label={item.name} value={String(item.balance)} />
          ))}
          <Separator />
          <Button variant="destructive" onClick={resetAll}>Limpar dados locais</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SimpleCollection({
  title,
  description,
  rows,
}: {
  title: string
  description: string
  rows: string[][]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.join("-")} className="flex items-center justify-between gap-3 border p-3 text-sm">
            <span>{row[0]}</span>
            <span className="text-muted-foreground">{row.filter(Boolean).slice(1).join(" | ")}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Metric({
  title,
  value,
  delta,
  icon: Icon,
}: {
  title: string
  value: string
  delta: string
  icon: typeof Wallet
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-2">
        <CardDescription>{title}</CardDescription>
        <Icon className="text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardTitle className="text-2xl">{value}</CardTitle>
        <Badge variant="secondary" className="w-fit">{delta}</Badge>
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center border text-sm text-muted-foreground">
      {text}
    </div>
  )
}

function alertCount(state: AppState) {
  return state.budgets.filter((budget) => {
    const used = Math.abs(
      state.transactions
        .filter((item) => item.category === budget.category && item.amount < 0)
        .reduce((total, item) => total + item.amount, 0)
    )
    return used >= budget.limit * (budget.alert / 100)
  }).length
}

function titleFor(section: Section) {
  return navItems.find((item) => item[1] === section)?.[0] ?? "Economy"
}
