export { ContentTable } from './ContentTable';
export type { ContentTableProps, ContentTableColumn } from './ContentTable';
export { ContentListPage } from './ContentListPage';
export type { ContentListPageProps, TabConfig } from './ContentListPage';
// ⚠️ SharedTextEdit should NEVER be used directly in routes!
// Always use through wrapper components (e.g., CreditTextEdit, MortgageTextEdit)
// See src/shared/components/SharedTextEdit/README.md for usage guide
export { SharedTextEdit } from './SharedTextEdit';
export type { SharedTextEditProps, TextEditData, BreadcrumbItem } from './SharedTextEdit';