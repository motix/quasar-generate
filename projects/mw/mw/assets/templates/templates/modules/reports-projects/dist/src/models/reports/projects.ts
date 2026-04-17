import type { Project } from 'models/finance/index.js';
import type { AllYearsReport, MonthlyReport, YearlyReport } from 'models/reports/index.js';

export type ProjectsReport = Project[];

export type ProjectsMonthlyReport = MonthlyReport<ProjectsReport>;

export type ProjectsYearlyReport = YearlyReport<ProjectsReport>;

export type ProjectsAllYearsReport = AllYearsReport<ProjectsReport>;
