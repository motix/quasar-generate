export type Rule = {
  checker: Checker;
  checkerKey?: string;
  title: string;
  caption: string;
  checking: boolean;
  checkingFailed: boolean;
  result?: boolean | undefined;
  successes: string[];
  errors: string[];
  info: string[];
};

export type Checker = (rule: Rule, key: string) => Promise<void>;

export type Health = {
  admin: Rule[];
  production1: Rule[];
  production2: Rule[];
  production3: Rule[];
  finance1: Rule[];
  finance2: Rule[];
  finance3: Rule[];
  finance4: Rule[];
  hr: Rule[];
};

export interface HealthCheckResult {
  successes: string[];
  errors: string[];
  info: string[];
}
