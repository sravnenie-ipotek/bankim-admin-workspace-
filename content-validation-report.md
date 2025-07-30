# BankIM Content Database Validation Report

Generated on: January 30, 2025

## Database Overview

- **Total Content Items**: 983
- **Active Content Items**: 973
- **Inactive Content Items**: 10
- **Total Languages**: 3 (Russian - default, Hebrew, English)

## Content Distribution by Type

| Component Type | Total Count | Active Count | Percentage |
|----------------|-------------|--------------|------------|
| option | 303 | 303 | 30.82% |
| text | 252 | 243 | 25.64% |
| dropdown | 91 | 91 | 9.26% |
| label | 61 | 61 | 6.21% |
| button | 46 | 45 | 4.68% |
| placeholder | 44 | 44 | 4.48% |
| heading | 42 | 42 | 4.27% |
| validation_error | 34 | 34 | 3.46% |
| Other types | 110 | 110 | 11.18% |

## Data Quality Issues Summary

| Issue Type | Count | Severity |
|------------|-------|----------|
| Translations with draft status | 36 | Medium |
| Content items with incomplete translations (< 3 languages) | 25 | High |
| Content items without any translations | 21 | Critical |
| Inactive content items | 10 | Low |

## Critical Issues

### 1. Content Items Without Any Translations (21 items)

All 21 items are dropdowns that appear to be missing their translations entirely:

**Affected Screens:**
- `refinance_step1` (5 dropdowns)
- `mortgage_step3` (3 dropdowns)
- `refinance_credit_3` (3 dropdowns)
- `refinance_credit_1` (2 dropdowns)
- `tenders_for_lawyers` (2 dropdowns)
- `temporary_franchise` (2 dropdowns)
- `tenders_for_brokers` (2 dropdowns)
- `mortgage_step4` (1 dropdown)
- `cooperation` (1 dropdown)

**Specific Missing Dropdown Keys:**
- refinance_credit_bank, refinance_credit_why
- refinance_credit_debt_types, refinance_credit_additional_income, refinance_credit_main_source
- refinance_step1_bank, refinance_step1_program, refinance_step1_property_type
- refinance_step1_registration, refinance_step1_why
- mortgage_step3_main_source, mortgage_step3_additional_income, mortgage_step3_obligations
- mortgage_step4_filter
- temporary_franchise_includes, temporary_franchise_steps
- tenders_for_brokers_license_features, tenders_for_brokers_steps
- tenders_for_lawyers_process, tenders_for_lawyers_steps
- cooperation_steps

### 2. Translation Completeness by Screen

Screens with the lowest translation completeness (< 100%):

| Screen Location | Content Items | Translation Count | Completeness |
|-----------------|---------------|-------------------|--------------|
| refinance_step1 | 43 | 114 | 88% |
| refinance_credit_3 | 24 | 63 | 88% |
| mortgage_step3 | 60 | 171 | 95% |
| mortgage_step4 | 21 | 60 | 95% |
| tenders_for_brokers | 56 | 162 | 96% |
| refinance_credit_1 | 54 | 156 | 96% |
| tenders_for_lawyers | 78 | 228 | 97% |
| temporary_franchise | 59 | 171 | 97% |
| cooperation | 40 | 117 | 98% |

## Positive Findings

1. **No Duplicate Content Keys**: All content keys are unique
2. **No Orphaned Translations**: All translations are properly linked to content items
3. **No Empty Translations**: All existing translations have content values
4. **Good Translation Coverage**: Most screens (11 out of 20 major screens) have 100% translation completeness

## Recommendations

1. **Immediate Action Required**:
   - Add missing translations for the 21 dropdown items (Critical)
   - These affect key user flows like mortgage refinancing and step-by-step processes

2. **Short-term Actions**:
   - Review and approve the 36 draft translations
   - Complete translations for the 4 items that have partial translations

3. **Quality Improvements**:
   - Focus on screens with < 95% translation completeness
   - Implement automated checks to prevent missing translations for new content

4. **Database Structure**:
   - Consider adding the `application_contexts` table mentioned in CLAUDE.md
   - Implement the tab navigation functionality for content organization

## Technical Notes

- The database does not currently have the `application_contexts` table mentioned in the documentation
- All dropdown items without translations appear to be newer additions (IDs 1531-1551)
- The missing translations are concentrated in specific user flows (refinancing, mortgage steps, tenders)