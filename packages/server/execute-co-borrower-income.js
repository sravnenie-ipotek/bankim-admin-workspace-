const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

// Database configuration for content database
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const section4_1_9_ContentItems = [
  // Page Structure
  { content_key: 'co_borrower_income.title', component_type: 'text', category: 'heading', description: 'Co-borrower income form title' },
  { content_key: 'co_borrower_income.subtitle', component_type: 'text', category: 'heading', description: 'Co-borrower income form subtitle' },
  { content_key: 'co_borrower_income.description', component_type: 'text', category: 'text', description: 'Co-borrower income form description' },
  
  // Employment Information
  { content_key: 'co_borrower_income.field.employment_status', component_type: 'text', category: 'form', description: 'Co-borrower employment status field' },
  { content_key: 'co_borrower_income.field.employer_name', component_type: 'text', category: 'form', description: 'Co-borrower employer name field' },
  { content_key: 'co_borrower_income.field.job_title', component_type: 'text', category: 'form', description: 'Co-borrower job title field' },
  { content_key: 'co_borrower_income.field.employment_type', component_type: 'text', category: 'form', description: 'Co-borrower employment type field' },
  { content_key: 'co_borrower_income.field.work_experience', component_type: 'text', category: 'form', description: 'Co-borrower work experience field' },
  
  // Income Information
  { content_key: 'co_borrower_income.field.monthly_salary', component_type: 'text', category: 'form', description: 'Co-borrower monthly salary field' },
  { content_key: 'co_borrower_income.field.annual_income', component_type: 'text', category: 'form', description: 'Co-borrower annual income field' },
  { content_key: 'co_borrower_income.field.additional_income', component_type: 'text', category: 'form', description: 'Co-borrower additional income field' },
  { content_key: 'co_borrower_income.field.income_source', component_type: 'text', category: 'form', description: 'Co-borrower additional income source field' },
  { content_key: 'co_borrower_income.field.net_monthly_income', component_type: 'text', category: 'form', description: 'Co-borrower net monthly income field' },
  
  // Dropdown Options - Employment Status
  { content_key: 'co_borrower_income.dropdown.employment.employed', component_type: 'dropdown', category: 'form', description: 'Employed status option' },
  { content_key: 'co_borrower_income.dropdown.employment.self_employed', component_type: 'dropdown', category: 'form', description: 'Self-employed status option' },
  { content_key: 'co_borrower_income.dropdown.employment.unemployed', component_type: 'dropdown', category: 'form', description: 'Unemployed status option' },
  { content_key: 'co_borrower_income.dropdown.employment.retired', component_type: 'dropdown', category: 'form', description: 'Retired status option' },
  { content_key: 'co_borrower_income.dropdown.employment.student', component_type: 'dropdown', category: 'form', description: 'Student status option' },
  
  // Dropdown Options - Employment Type
  { content_key: 'co_borrower_income.dropdown.employment_type.permanent', component_type: 'dropdown', category: 'form', description: 'Permanent employment option' },
  { content_key: 'co_borrower_income.dropdown.employment_type.contract', component_type: 'dropdown', category: 'form', description: 'Contract employment option' },
  { content_key: 'co_borrower_income.dropdown.employment_type.temporary', component_type: 'dropdown', category: 'form', description: 'Temporary employment option' },
  
  // Validation Messages
  { content_key: 'co_borrower_income.validation.employment_required', component_type: 'text', category: 'validation', description: 'Employment status required validation' },
  { content_key: 'co_borrower_income.validation.salary_required', component_type: 'text', category: 'validation', description: 'Salary amount required validation' },
  { content_key: 'co_borrower_income.validation.salary_format', component_type: 'text', category: 'validation', description: 'Salary format validation' },
  { content_key: 'co_borrower_income.validation.employer_required', component_type: 'text', category: 'validation', description: 'Employer name required validation' },
  { content_key: 'co_borrower_income.validation.income_consistency', component_type: 'text', category: 'validation', description: 'Income consistency validation' },
  
  // Action Buttons
  { content_key: 'co_borrower_income.button.next', component_type: 'text', category: 'action', description: 'Next button text' },
  { content_key: 'co_borrower_income.button.back', component_type: 'text', category: 'action', description: 'Back button text' },
  { content_key: 'co_borrower_income.button.skip', component_type: 'text', category: 'action', description: 'Skip co-borrower income button' },
  
  // Help Text
  { content_key: 'co_borrower_income.help.income_verification', component_type: 'text', category: 'text', description: 'Income verification help text' },
  { content_key: 'co_borrower_income.help.multiple_income_sources', component_type: 'text', category: 'text', description: 'Multiple income sources help text' },
  { content_key: 'co_borrower_income.help.documents_required', component_type: 'text', category: 'text', description: 'Required documents help text' }
];

const section4_1_9_Translations = [
  // Page Structure
  { content_key: 'co_borrower_income.title', language_code: 'ru', content_value: 'Доходы созаемщика' },
  { content_key: 'co_borrower_income.title', language_code: 'he', content_value: 'הכנסות הלווה השותף' },
  { content_key: 'co_borrower_income.title', language_code: 'en', content_value: 'Co-Borrower Income Information' },
  
  { content_key: 'co_borrower_income.subtitle', language_code: 'ru', content_value: 'Укажите информацию о доходах созаемщика' },
  { content_key: 'co_borrower_income.subtitle', language_code: 'he', content_value: 'ציין מידע על הכנסות הלווה השותף' },
  { content_key: 'co_borrower_income.subtitle', language_code: 'en', content_value: 'Provide co-borrower income information' },
  
  { content_key: 'co_borrower_income.description', language_code: 'ru', content_value: 'Доходы созаемщика учитываются при расчете общей платежеспособности' },
  { content_key: 'co_borrower_income.description', language_code: 'he', content_value: 'הכנסות הלווה השותף נלקחות בחשבון בחישוב היכולת הכלכלית הכוללת' },
  { content_key: 'co_borrower_income.description', language_code: 'en', content_value: 'Co-borrower income is considered in total repayment capacity calculation' },
  
  // Employment Information
  { content_key: 'co_borrower_income.field.employment_status', language_code: 'ru', content_value: 'Статус занятости созаемщика' },
  { content_key: 'co_borrower_income.field.employment_status', language_code: 'he', content_value: 'מצב תעסוקה של הלווה השותף' },
  { content_key: 'co_borrower_income.field.employment_status', language_code: 'en', content_value: 'Co-Borrower Employment Status' },
  
  { content_key: 'co_borrower_income.field.employer_name', language_code: 'ru', content_value: 'Название работодателя' },
  { content_key: 'co_borrower_income.field.employer_name', language_code: 'he', content_value: 'שם המעסיק' },
  { content_key: 'co_borrower_income.field.employer_name', language_code: 'en', content_value: 'Employer Name' },
  
  { content_key: 'co_borrower_income.field.job_title', language_code: 'ru', content_value: 'Должность' },
  { content_key: 'co_borrower_income.field.job_title', language_code: 'he', content_value: 'תפקיד' },
  { content_key: 'co_borrower_income.field.job_title', language_code: 'en', content_value: 'Job Title' },
  
  { content_key: 'co_borrower_income.field.employment_type', language_code: 'ru', content_value: 'Тип трудоустройства' },
  { content_key: 'co_borrower_income.field.employment_type', language_code: 'he', content_value: 'סוג העסקה' },
  { content_key: 'co_borrower_income.field.employment_type', language_code: 'en', content_value: 'Employment Type' },
  
  { content_key: 'co_borrower_income.field.work_experience', language_code: 'ru', content_value: 'Стаж работы (годы)' },
  { content_key: 'co_borrower_income.field.work_experience', language_code: 'he', content_value: 'ותק בעבודה (שנים)' },
  { content_key: 'co_borrower_income.field.work_experience', language_code: 'en', content_value: 'Work Experience (years)' },
  
  // Income Information
  { content_key: 'co_borrower_income.field.monthly_salary', language_code: 'ru', content_value: 'Месячная зарплата (₪)' },
  { content_key: 'co_borrower_income.field.monthly_salary', language_code: 'he', content_value: 'משכורת חודשית (₪)' },
  { content_key: 'co_borrower_income.field.monthly_salary', language_code: 'en', content_value: 'Monthly Salary (₪)' },
  
  { content_key: 'co_borrower_income.field.annual_income', language_code: 'ru', content_value: 'Годовой доход (₪)' },
  { content_key: 'co_borrower_income.field.annual_income', language_code: 'he', content_value: 'הכנסה שנתית (₪)' },
  { content_key: 'co_borrower_income.field.annual_income', language_code: 'en', content_value: 'Annual Income (₪)' },
  
  { content_key: 'co_borrower_income.field.additional_income', language_code: 'ru', content_value: 'Дополнительные доходы (₪)' },
  { content_key: 'co_borrower_income.field.additional_income', language_code: 'he', content_value: 'הכנסות נוספות (₪)' },
  { content_key: 'co_borrower_income.field.additional_income', language_code: 'en', content_value: 'Additional Income (₪)' },
  
  { content_key: 'co_borrower_income.field.income_source', language_code: 'ru', content_value: 'Источник дополнительного дохода' },
  { content_key: 'co_borrower_income.field.income_source', language_code: 'he', content_value: 'מקור הכנסה נוספת' },
  { content_key: 'co_borrower_income.field.income_source', language_code: 'en', content_value: 'Additional Income Source' },
  
  { content_key: 'co_borrower_income.field.net_monthly_income', language_code: 'ru', content_value: 'Чистый месячный доход (₪)' },
  { content_key: 'co_borrower_income.field.net_monthly_income', language_code: 'he', content_value: 'הכנסה חודשית נטו (₪)' },
  { content_key: 'co_borrower_income.field.net_monthly_income', language_code: 'en', content_value: 'Net Monthly Income (₪)' },
  
  // Dropdown Options - Employment Status
  { content_key: 'co_borrower_income.dropdown.employment.employed', language_code: 'ru', content_value: 'Работник по найму' },
  { content_key: 'co_borrower_income.dropdown.employment.employed', language_code: 'he', content_value: 'עובד שכיר' },
  { content_key: 'co_borrower_income.dropdown.employment.employed', language_code: 'en', content_value: 'Employed' },
  
  { content_key: 'co_borrower_income.dropdown.employment.self_employed', language_code: 'ru', content_value: 'Самозанятый/Предприниматель' },
  { content_key: 'co_borrower_income.dropdown.employment.self_employed', language_code: 'he', content_value: 'עצמאי/יזם' },
  { content_key: 'co_borrower_income.dropdown.employment.self_employed', language_code: 'en', content_value: 'Self-Employed' },
  
  { content_key: 'co_borrower_income.dropdown.employment.unemployed', language_code: 'ru', content_value: 'Безработный' },
  { content_key: 'co_borrower_income.dropdown.employment.unemployed', language_code: 'he', content_value: 'מובטל' },
  { content_key: 'co_borrower_income.dropdown.employment.unemployed', language_code: 'en', content_value: 'Unemployed' },
  
  { content_key: 'co_borrower_income.dropdown.employment.retired', language_code: 'ru', content_value: 'Пенсионер' },
  { content_key: 'co_borrower_income.dropdown.employment.retired', language_code: 'he', content_value: 'פנסיונר' },
  { content_key: 'co_borrower_income.dropdown.employment.retired', language_code: 'en', content_value: 'Retired' },
  
  { content_key: 'co_borrower_income.dropdown.employment.student', language_code: 'ru', content_value: 'Студент' },
  { content_key: 'co_borrower_income.dropdown.employment.student', language_code: 'he', content_value: 'סטודנט' },
  { content_key: 'co_borrower_income.dropdown.employment.student', language_code: 'en', content_value: 'Student' },
  
  // Dropdown Options - Employment Type
  { content_key: 'co_borrower_income.dropdown.employment_type.permanent', language_code: 'ru', content_value: 'Постоянная работа' },
  { content_key: 'co_borrower_income.dropdown.employment_type.permanent', language_code: 'he', content_value: 'עבודה קבועה' },
  { content_key: 'co_borrower_income.dropdown.employment_type.permanent', language_code: 'en', content_value: 'Permanent Employment' },
  
  { content_key: 'co_borrower_income.dropdown.employment_type.contract', language_code: 'ru', content_value: 'Контрактная работа' },
  { content_key: 'co_borrower_income.dropdown.employment_type.contract', language_code: 'he', content_value: 'עבודה בחוזה' },
  { content_key: 'co_borrower_income.dropdown.employment_type.contract', language_code: 'en', content_value: 'Contract Employment' },
  
  { content_key: 'co_borrower_income.dropdown.employment_type.temporary', language_code: 'ru', content_value: 'Временная работа' },
  { content_key: 'co_borrower_income.dropdown.employment_type.temporary', language_code: 'he', content_value: 'עבודה זמנית' },
  { content_key: 'co_borrower_income.dropdown.employment_type.temporary', language_code: 'en', content_value: 'Temporary Employment' },
  
  // Validation Messages
  { content_key: 'co_borrower_income.validation.employment_required', language_code: 'ru', content_value: 'Выбор статуса занятости обязателен' },
  { content_key: 'co_borrower_income.validation.employment_required', language_code: 'he', content_value: 'בחירת מצב תעסוקה היא שדה חובה' },
  { content_key: 'co_borrower_income.validation.employment_required', language_code: 'en', content_value: 'Employment status selection is required' },
  
  { content_key: 'co_borrower_income.validation.salary_required', language_code: 'ru', content_value: 'Указание зарплаты обязательно' },
  { content_key: 'co_borrower_income.validation.salary_required', language_code: 'he', content_value: 'ציון משכורת הוא שדה חובה' },
  { content_key: 'co_borrower_income.validation.salary_required', language_code: 'en', content_value: 'Salary amount is required' },
  
  { content_key: 'co_borrower_income.validation.salary_format', language_code: 'ru', content_value: 'Введите корректную сумму зарплаты' },
  { content_key: 'co_borrower_income.validation.salary_format', language_code: 'he', content_value: 'הכנס סכום משכורת תקין' },
  { content_key: 'co_borrower_income.validation.salary_format', language_code: 'en', content_value: 'Enter a valid salary amount' },
  
  { content_key: 'co_borrower_income.validation.employer_required', language_code: 'ru', content_value: 'Название работодателя обязательно' },
  { content_key: 'co_borrower_income.validation.employer_required', language_code: 'he', content_value: 'שם המעסיק הוא שדה חובה' },
  { content_key: 'co_borrower_income.validation.employer_required', language_code: 'en', content_value: 'Employer name is required' },
  
  { content_key: 'co_borrower_income.validation.income_consistency', language_code: 'ru', content_value: 'Проверьте соответствие месячного и годового дохода' },
  { content_key: 'co_borrower_income.validation.income_consistency', language_code: 'he', content_value: 'בדוק התאמה בין הכנסה חודשית ושנתית' },
  { content_key: 'co_borrower_income.validation.income_consistency', language_code: 'en', content_value: 'Check consistency between monthly and annual income' },
  
  // Action Buttons
  { content_key: 'co_borrower_income.button.next', language_code: 'ru', content_value: 'Далее' },
  { content_key: 'co_borrower_income.button.next', language_code: 'he', content_value: 'הבא' },
  { content_key: 'co_borrower_income.button.next', language_code: 'en', content_value: 'Next' },
  
  { content_key: 'co_borrower_income.button.back', language_code: 'ru', content_value: 'Назад' },
  { content_key: 'co_borrower_income.button.back', language_code: 'he', content_value: 'חזור' },
  { content_key: 'co_borrower_income.button.back', language_code: 'en', content_value: 'Back' },
  
  { content_key: 'co_borrower_income.button.skip', language_code: 'ru', content_value: 'Пропустить доходы созаемщика' },
  { content_key: 'co_borrower_income.button.skip', language_code: 'he', content_value: 'דלג על הכנסות הלווה השותף' },
  { content_key: 'co_borrower_income.button.skip', language_code: 'en', content_value: 'Skip Co-Borrower Income' },
  
  // Help Text
  { content_key: 'co_borrower_income.help.income_verification', language_code: 'ru', content_value: 'Потребуются справки о доходах созаемщика для подтверждения' },
  { content_key: 'co_borrower_income.help.income_verification', language_code: 'he', content_value: 'יידרשו אישורי הכנסה של הלווה השותף לצורך אימות' },
  { content_key: 'co_borrower_income.help.income_verification', language_code: 'en', content_value: 'Co-borrower income certificates will be required for verification' },
  
  { content_key: 'co_borrower_income.help.multiple_income_sources', language_code: 'ru', content_value: 'Укажите все источники дохода для точного расчета' },
  { content_key: 'co_borrower_income.help.multiple_income_sources', language_code: 'he', content_value: 'ציין את כל מקורות ההכנסה לחישוב מדויק' },
  { content_key: 'co_borrower_income.help.multiple_income_sources', language_code: 'en', content_value: 'Include all income sources for accurate calculation' },
  
  { content_key: 'co_borrower_income.help.documents_required', language_code: 'ru', content_value: 'Справка о зарплате и трудовая книжка созаемщика' },
  { content_key: 'co_borrower_income.help.documents_required', language_code: 'he', content_value: 'אישור שכר ופנקס עבודה של הלווה השותף' },
  { content_key: 'co_borrower_income.help.documents_required', language_code: 'en', content_value: 'Salary certificate and employment record of co-borrower' }
];

async function executeSection4_1_9() {
  const client = await contentPool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting Section 4.1.9: Co-Borrower Income implementation...');

    // Insert content items
    console.log('📝 Inserting 31 content items for co_borrower_income...');
    for (const item of section4_1_9_ContentItems) {
      await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [item.content_key, item.component_type, item.category, 'co_borrower_income', item.description, true, 1]
      );
    }

    // Insert translations
    console.log('🌐 Inserting 93 trilingual translations (31 items × 3 languages)...');
    for (const translation of section4_1_9_Translations) {
      // Get content_item_id
      const itemResult = await client.query(
        'SELECT id FROM content_items WHERE content_key = $1',
        [translation.content_key]
      );
      
      if (itemResult.rows.length > 0) {
        await client.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())`,
          [itemResult.rows[0].id, translation.language_code, translation.content_value]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Section 4.1.9 implementation completed successfully!');
    console.log('📊 Summary:');
    console.log('   • 31 content items created for co_borrower_income');
    console.log('   • 93 trilingual translations added (RU/HE/EN)');
    console.log('   • Screen location: co_borrower_income');
    console.log('   • Components: employment status, salary info, income sources, validation');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing Section 4.1.9:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  executeSection4_1_9()
    .then(() => {
      console.log('🎉 Section 4.1.9: Co-Borrower Income implementation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to implement Section 4.1.9:', error);
      process.exit(1);
    });
}

module.exports = { executeSection4_1_9 };