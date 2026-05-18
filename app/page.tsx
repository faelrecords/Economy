"use client"

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Bell,
  Calculator,
  CalendarClock,
  CreditCard,
  FileDown,
  Goal,
  Landmark,
  Menu,
  Paperclip,
  Plus,
  Settings,
  ShieldCheck,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from "lucide-react"
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
import { useMemo, useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const cashFlow = [
  { day: "01", income: 4200, expense: 2300, balance: 1900 },
  { day: "05", income: 1200, expense: 3100, balance: 0 },
  { day: "10", income: 7000, expense: 4200, balance: 2800 },
  { day: "15", income: 1500, expense: 5100, balance: -800 },
  { day: "20", income: 2200, expense: 2900, balance: 500 },
  { day: "25", income: 3300, expense: 3600, balance: 200 },
  { day: "30", income: 5200, expense: 4100, balance: 1300 },
]

const categories = [
  { name: "Moradia", value: 3200, fill: "var(--chart-1)" },
  { name: "Mercado", value: 1850, fill: "var(--chart-2)" },
  { name: "Transporte", value: 920, fill: "var(--chart-3)" },
  { name: "Lazer", value: 740, fill: "var(--chart-4)" },
]

const initialTransactions = [
  {
    id: "1",
    description: "Salario",
    category: "Receita",
    account: "Conta principal",
    amount: 12400,
    status: "Conciliado",
  },
  {
    id: "2",
    description: "Aluguel",
    category: "Moradia",
    account: "Nubank",
    amount: -2850,
    status: "Recorrente",
  },
  {
    id: "3",
    description: "Mercado",
    category: "Alimentacao",
    account: "Cartao casal",
    amount: -421.9,
    status: "IA",
  },
  {
    id: "4",
    description: "ETF mensal",
    category: "Investimento",
    account: "Corretora",
    amount: -1200,
    status: "Agendado",
  },
  {
    id: "5",
    description: "Freela",
    category: "Receita",
    account: "Conta PJ",
    amount: 3100,
    status: "Pendente",
  },
]

const navItems = [
  ["Dashboard", "transacoes", Wallet],
  ["Transacoes", "transacoes", Banknote],
  ["Orcamento", "orcamento", TrendingUp],
  ["Cartoes", "cartoes", CreditCard],
  ["Metas", "metas", Goal],
  ["Relatorios", "relatorios", FileDown],
  ["Planejamento", "planejamento", Calculator],
  ["Patrimonio", "transacoes", Landmark],
  ["Configuracoes", "transacoes", Settings],
] as const

const budgets = [
  ["Moradia", 74, "R$ 3.200 / R$ 4.300"],
  ["Mercado", 92, "R$ 1.850 / R$ 2.000"],
  ["Transporte", 41, "R$ 920 / R$ 2.200"],
  ["Lazer", 64, "R$ 740 / R$ 1.150"],
]

const chartConfig = {
  income: { label: "Receitas", color: "var(--chart-2)" },
  expense: { label: "Despesas", color: "var(--chart-4)" },
  balance: { label: "Saldo", color: "var(--chart-3)" },
  value: { label: "Valor", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function Page() {
  const formRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("transacoes")
  const [transactions, setTransactions] = useState(initialTransactions)
  const [editId, setEditId] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [kind, setKind] = useState("expense")
  const [recurring, setRecurring] = useState(false)

  const formTitle = editId ? "Editar lancamento" : "Lancamento rapido"
  const monthlyIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((total, transaction) => total + transaction.amount, 0),
    [transactions]
  )
  const monthlyExpense = useMemo(
    () =>
      Math.abs(
        transactions
          .filter((transaction) => transaction.amount < 0)
          .reduce((total, transaction) => total + transaction.amount, 0)
      ),
    [transactions]
  )

  function resetForm() {
    setEditId(null)
    setDescription("")
    setAmount("")
    setCategory("")
    setKind("expense")
    setRecurring(false)
  }

  function saveTransaction() {
    const numericAmount = Number(amount.replace(",", "."))

    if (!description || !category || !Number.isFinite(numericAmount)) {
      return
    }

    const signedAmount =
      kind === "income" ? Math.abs(numericAmount) : -Math.abs(numericAmount)

    if (editId) {
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === editId
            ? {
                ...transaction,
                description,
                category,
                amount: signedAmount,
                status: recurring ? "Recorrente" : "Manual",
              }
            : transaction
        )
      )
    } else {
      setTransactions((current) => [
        {
          id: crypto.randomUUID(),
          description,
          category,
          account: "Conta principal",
          amount: signedAmount,
          status: recurring ? "Recorrente" : "Manual",
        },
        ...current,
      ])
    }

    resetForm()
  }

  function editTransaction(transaction: (typeof initialTransactions)[number]) {
    setActiveTab("transacoes")
    setEditId(transaction.id)
    setDescription(transaction.description)
    setAmount(String(Math.abs(transaction.amount)))
    setCategory(transaction.category.toLowerCase())
    setKind(transaction.amount > 0 ? "income" : "expense")
    setRecurring(transaction.status === "Recorrente")
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
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
                <p className="truncate text-sm font-semibold">Economy</p>
                <p className="truncate text-xs text-muted-foreground">
                  Projeto familiar
                </p>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-1 p-3 text-sm">
                {navItems.map(([label, tab, Icon]) => (
                  <Button
                    key={label}
                    variant={activeTab === tab ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab(tab)}
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
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">Dono</p>
                  <p className="truncate text-xs text-muted-foreground">
                    isolado por RLS
                  </p>
                </div>
                <Badge variant="secondary">Pro</Badge>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 border-b bg-background/95 backdrop-blur">
            <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu />
                </Button>
                <div>
                  <h1 className="text-base font-semibold">
                    Dashboard financeiro
                  </h1>
                  <p className="text-xs text-muted-foreground">Maio 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="familia">
                  <SelectTrigger className="w-[148px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="familia">Familia</SelectItem>
                      <SelectItem value="pj">PJ</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Bell />
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("transacoes")
                    formRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                  }}
                >
                  <Plus data-icon="inline-start" />
                  Lancar
                </Button>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-5 p-4 lg:p-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Metric
                title="Saldo consolidado"
                value="R$ 84.920,44"
                delta="+8,4%"
                icon={Wallet}
              />
              <Metric
                title="Receitas mes"
                value={formatCurrency(monthlyIncome)}
                delta="+12,1%"
                icon={ArrowUpRight}
              />
              <Metric
                title="Despesas mes"
                value={formatCurrency(monthlyExpense)}
                delta="-3,8%"
                icon={ArrowDownRight}
              />
              <Metric
                title="Pendencias"
                value="7"
                delta="3 criticas"
                icon={AlertCircle}
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de caixa</CardTitle>
                  <CardDescription>Janela 30/90 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[280px] w-full"
                  >
                    <AreaChart data={cashFlow}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={48} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        dataKey="income"
                        type="monotone"
                        stroke="var(--color-income)"
                        fill="var(--color-income)"
                        fillOpacity={0.18}
                      />
                      <Area
                        dataKey="expense"
                        type="monotone"
                        stroke="var(--color-expense)"
                        fill="var(--color-expense)"
                        fillOpacity={0.12}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas</CardTitle>
                  <CardDescription>
                    Limites, faturas, recorrencias
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Alert>
                    <AlertCircle />
                    <AlertTitle>Mercado em 92%</AlertTitle>
                    <AlertDescription>Limite quase atingido.</AlertDescription>
                  </Alert>
                  <Alert>
                    <CalendarClock />
                    <AlertTitle>Fatura fecha em 3 dias</AlertTitle>
                    <AlertDescription>R$ 4.812,90 previstos.</AlertDescription>
                  </Alert>
                  <Alert>
                    <ShieldCheck />
                    <AlertTitle>Convite pendente</AlertTitle>
                    <AlertDescription>
                      Usuario casal aguarda aceite.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col gap-4"
            >
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="transacoes">Transacoes</TabsTrigger>
                <TabsTrigger value="orcamento">Orcamento</TabsTrigger>
                <TabsTrigger value="cartoes">Cartoes</TabsTrigger>
                <TabsTrigger value="metas">Metas</TabsTrigger>
                <TabsTrigger value="relatorios">Relatorios</TabsTrigger>
                <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
              </TabsList>

              <TabsContent
                value="transacoes"
                className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]"
              >
                <Card>
                  <CardHeader className="flex-row items-center justify-between gap-3">
                    <div>
                      <CardTitle>Ultimas transacoes</CardTitle>
                      <CardDescription>Manual, OFX, CSV, IA</CardDescription>
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
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>{transaction.account}</TableCell>
                            <TableCell>
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editTransaction(transaction)}
                              >
                                Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card ref={formRef}>
                  <CardHeader>
                    <CardTitle>{formTitle}</CardTitle>
                    <CardDescription>Receita ou despesa</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Input
                      placeholder="Descricao"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                    <Input
                      placeholder="Valor"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                    <Select value={kind} onValueChange={setKind}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="income">Receita</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="moradia">Moradia</SelectItem>
                          <SelectItem value="receita">Receita</SelectItem>
                          <SelectItem value="mercado">Mercado</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-between border p-3">
                      <span className="text-sm">Recorrente</span>
                      <Switch
                        checked={recurring}
                        onCheckedChange={setRecurring}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveTransaction}>Salvar</Button>
                      {editId ? (
                        <Button variant="outline" onClick={resetForm}>
                          Cancelar
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="orcamento"
                className="grid gap-5 xl:grid-cols-[1fr_1fr]"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Limites por categoria</CardTitle>
                    <CardDescription>Progresso do mes</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {budgets.map(([label, value, caption]) => (
                      <div
                        key={label as string}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex justify-between gap-3 text-sm">
                          <span>{label as string}</span>
                          <span className="text-muted-foreground">
                            {caption as string}
                          </span>
                        </div>
                        <Progress value={value as number} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por categoria</CardTitle>
                    <CardDescription>Periodo customizavel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={chartConfig}
                      className="h-[260px] w-full"
                    >
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={categories}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                        >
                          {categories.map((item) => (
                            <Cell key={item.name} fill={item.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="cartoes"
                className="grid gap-5 md:grid-cols-3"
              >
                {["Nubank", "Itau Black", "Inter"].map((card, index) => (
                  <Card key={card}>
                    <CardHeader>
                      <CardTitle>{card}</CardTitle>
                      <CardDescription>
                        Vence dia {10 + index * 5}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="text-2xl font-semibold">
                        R$ {(4812 + index * 730).toLocaleString("pt-BR")}
                      </p>
                      <Progress value={46 + index * 12} />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Atual vs fechada</span>
                        <span>{46 + index * 12}% limite</span>
                      </div>
                      <Separator />
                      <Badge variant="secondary">
                        Parcelas abertas: {index + 2}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="metas" className="grid gap-5 md:grid-cols-3">
                {[
                  ["Reserva", 68, "R$ 34.000 / R$ 50.000"],
                  ["Entrada imovel", 22, "R$ 44.000 / R$ 200.000"],
                  ["Viagem", 81, "R$ 8.100 / R$ 10.000"],
                ].map(([name, progress, caption]) => (
                  <Card key={name as string}>
                    <CardHeader>
                      <CardTitle>{name as string}</CardTitle>
                      <CardDescription>{caption as string}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <Progress value={progress as number} />
                      <p className="text-sm text-muted-foreground">
                        Conclusao projetada em 7 meses.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent
                value="relatorios"
                className="grid gap-5 xl:grid-cols-[1fr_1fr]"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>DRE pessoal</CardTitle>
                    <CardDescription>Receitas, despesas, sobra</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={chartConfig}
                      className="h-[260px] w-full"
                    >
                      <BarChart data={cashFlow}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                        />
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
                    <CardDescription>PDF e Excel</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Button variant="outline">
                      <FileDown data-icon="inline-start" />
                      Exportar PDF
                    </Button>
                    <Button variant="outline">
                      <FileDown data-icon="inline-start" />
                      Exportar Excel
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="planejamento"
                className="grid gap-5 md:grid-cols-3"
              >
                {["Corte mensal", "Fluxo futuro", "Juros e financiamento"].map(
                  (item) => (
                    <Card key={item}>
                      <CardHeader>
                        <CardTitle>{item}</CardTitle>
                        <CardDescription>Simulador anual</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        <Input placeholder="Valor" />
                        <Input placeholder="Prazo" />
                        <Button variant="outline">
                          <Calculator data-icon="inline-start" />
                          Calcular
                        </Button>
                      </CardContent>
                    </Card>
                  )
                )}
              </TabsContent>
            </Tabs>

            <div className="grid gap-5 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Contas e patrimonio</CardTitle>
                  <CardDescription>Bancos, investimentos, bens</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <Row label="Contas bancarias" value="R$ 28.420,44" />
                  <Row label="Investimentos" value="R$ 52.300,00" />
                  <Row label="Bens" value="R$ 430.000,00" />
                  <Row label="Dividas" value="- R$ 18.900,00" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usuarios</CardTitle>
                  <CardDescription>Projeto compartilhado</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dono</p>
                      <p className="text-xs text-muted-foreground">owner</p>
                    </div>
                    <Badge>Ativo</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>CA</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Convidado</p>
                      <p className="text-xs text-muted-foreground">editor</p>
                    </div>
                    <Badge variant="outline">Pendente</Badge>
                  </div>
                  <Button variant="outline">
                    <Users data-icon="inline-start" />
                    Convidar usuario
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuracoes</CardTitle>
                  <CardDescription>Categorias, alertas, plano</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Row label="Categorias customizadas" value="23" />
                  <Row label="Notificacoes" value="Ativas" />
                  <Row label="Open Finance" value="Pendente" />
                  <Row label="Plano" value="Pro mensal" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
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
        <Badge variant="secondary" className="w-fit">
          {delta}
        </Badge>
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
