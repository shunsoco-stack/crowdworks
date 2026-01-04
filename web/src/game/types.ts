export type OfferKind = "investment" | "side_hustle" | "skill" | "safety";

export type Role = {
  id: string;
  name: string;
  salary: number;
  fixed_expenses: number;
  starting_cash: number;
  starting_passive_income?: number;
  starting_net_worth?: number;
};

export type Offer = {
  id: string;
  name: string;
  kind: OfferKind;
  description: string;
  down_payment: number;
  cash_delta: number;
  passive_income_delta: number;
  salary_delta: number;
  net_worth_delta: number;
};

export type EventCard = {
  id: string;
  name: string;
  description: string;
  cash_delta: number;
  salary_delta: number;
  fixed_expenses_delta: number;
  passive_income_delta: number;
};

export type PortfolioItem = Pick<
  Offer,
  "id" | "name" | "kind" | "down_payment" | "cash_delta" | "passive_income_delta" | "salary_delta" | "net_worth_delta"
>;

export type GameState = {
  month: number;
  inMonth: boolean;
  roleId: string;
  roleName: string;

  cash: number;
  salary: number;
  fixedExpenses: number;
  passiveIncome: number;
  netWorth: number;

  seed: number;
  log: string[];
  portfolio: PortfolioItem[];

  currentEvent?: EventCard;
  currentOffers?: Offer[];
};

