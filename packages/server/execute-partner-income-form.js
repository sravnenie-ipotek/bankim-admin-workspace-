const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

// Database configuration for content database
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const section4_1_6_ContentItems = [
  // Page Structure
  { content_key: 'partner_income_form.title', component_type: 'text', category: 'heading', description: 'Partner income form title' },
  { content_key: 'partner_income_form.subtitle', component_type: 'text', category: 'heading', description: 'Partner income form subtitle' },
  { content_key: 'partner_income_form.description', component_type: 'text', category: 'text', description: 'Partner income form description' },
  
  // Employment Information
  { content_key: 'partner_income_form.field.employment_status', component_type: 'text', category: 'form', description: 'Partner employment status field' },
  { content_key: 'partner_income_form.field.employer_name', component_type: 'text', category: 'form', description: 'Partner employer name field' },
  { content_key: 'partner_income_form.field.job_title', component_type: 'text', category: 'form', description: 'Partner job title field' },
  { content_key: 'partner_income_form.field.work_experience', component_type: 'text', category: 'form', description: 'Partner work experience field' },
  
  // Income Information
  { content_key: 'partner_income_form.field.monthly_salary', component_type: 'text', category: 'form', description: 'Partner monthly salary field' },
  { content_key: 'partner_income_form.field.annual_income', component_type: 'text', category: 'form', description: 'Partner annual income field' },
  { content_key: 'partner_income_form.field.additional_income', component_type: 'text', category: 'form', description: 'Partner additional income field' },
  { content_key: 'partner_income_form.field.income_source', component_type: 'text', category: 'form', description: 'Additional income source field' },
  
  // Dropdown Options - Employment Status
  { content_key: 'partner_income_form.dropdown.employment.employed', component_type: 'dropdown', category: 'form', description: 'Employed status option' },
  { content_key: 'partner_income_form.dropdown.employment.self_employed', component_type: 'dropdown', category: 'form', description: 'Self-employed status option' },
  { content_key: 'partner_income_form.dropdown.employment.unemployed', component_type: 'dropdown', category: 'form', description: 'Unemployed status option' },
  { content_key: 'partner_income_form.dropdown.employment.retired', component_type: 'dropdown', category: 'form', description: 'Retired status option' },
  { content_key: 'partner_income_form.dropdown.employment.student', component_type: 'dropdown', category: 'form', description: 'Student status option' },
  
  // Validation Messages
  { content_key: 'partner_income_form.validation.employment_required', component_type: 'text', category: 'validation', description: 'Employment status required validation' },
  { content_key: 'partner_income_form.validation.salary_required', component_type: 'text', category: 'validation', description: 'Salary amount required validation' },
  { content_key: 'partner_income_form.validation.salary_format', component_type: 'text', category: 'validation', description: 'Salary format validation' },
  { content_key: 'partner_income_form.validation.employer_required', component_type: 'text', category: 'validation', description: 'Employer name required validation' },
  
  // Action Buttons
  { content_key: 'partner_income_form.button.next', component_type: 'text', category: 'action', description: 'Next button text' },
  { content_key: 'partner_income_form.button.back', component_type: 'text', category: 'action', description: 'Back button text' },
  { content_key: 'partner_income_form.button.skip', component_type: 'text', category: 'action', description: 'Skip partner income button' },
  
  // Help Text
  { content_key: 'partner_income_form.help.salary_calculation', component_type: 'text', category: 'text', description: 'Salary calculation help text' },
  { content_key: 'partner_income_form.help.additional_income', component_type: 'text', category: 'text', description: 'Additional income help text' },
  { content_key: 'partner_income_form.help.income_verification', component_type: 'text', category: 'text', description: 'Income verification help text' }
];

const section4_1_6_Translations = [
  // Page Structure
  { content_key: 'partner_income_form.title', language_code: 'ru', content_value: 'Доходы супруга/партнера' },
  { content_key: 'partner_income_form.title', language_code: 'he', content_value: 'הכנסות בן/בת הזוג' },
  { content_key: 'partner_income_form.title', language_code: 'en', content_value: 'Partner Income Information' },
  
  { content_key: 'partner_income_form.subtitle', language_code: 'ru', content_value: 'Укажите информацию о доходах супруга/партнера' },
  { content_key: 'partner_income_form.subtitle', language_code: 'he', content_value: 'ציין מידע על הכנסות בן/בת הזוג' },
  { content_key: 'partner_income_form.subtitle', language_code: 'en', content_value: 'Provide partner income information' },
  
  { content_key: 'partner_income_form.description', language_code: 'ru', content_value: 'Информация о доходах партнера поможет улучшить условия кредита' },
  { content_key: 'partner_income_form.description', language_code: 'he', content_value: 'מידע על הכנסות בן/בת הזוג יעזור לשפר את תנאי ההלוואה' },
  { content_key: 'partner_income_form.description', language_code: 'en', content_value: 'Partner income information will help improve loan terms' },
  
  // Employment Information
  { content_key: 'partner_income_form.field.employment_status', language_code: 'ru', content_value: 'Статус занятости партнера' },
  { content_key: 'partner_income_form.field.employment_status', language_code: 'he', content_value: 'מצב תעסוקה של בן/בת הזוג' },
  { content_key: 'partner_income_form.field.employment_status', language_code: 'en', content_value: 'Partner Employment Status' },
  
  { content_key: 'partner_income_form.field.employer_name', language_code: 'ru', content_value: 'Название работодателя' },
  { content_key: 'partner_income_form.field.employer_name', language_code: 'he', content_value: 'שם המעסיק' },
  { content_key: 'partner_income_form.field.employer_name', language_code: 'en', content_value: 'Employer Name' },
  
  { content_key: 'partner_income_form.field.job_title', language_code: 'ru', content_value: 'Должность' },
  { content_key: 'partner_income_form.field.job_title', language_code: 'he', content_value: 'תפקיד' },
  { content_key: 'partner_income_form.field.job_title', language_code: 'en', content_value: 'Job Title' },
  
  { content_key: 'partner_income_form.field.work_experience', language_code: 'ru', content_value: 'Стаж работы (годы)' },
  { content_key: 'partner_income_form.field.work_experience', language_code: 'he', content_value: 'ותק בעבודה (שנים)' },
  { content_key: 'partner_income_form.field.work_experience', language_code: 'en', content_value: 'Work Experience (years)' },
  
  // Income Information
  { content_key: 'partner_income_form.field.monthly_salary', language_code: 'ru', content_value: 'Месячная зарплата (₪)' },
  { content_key: 'partner_income_form.field.monthly_salary', language_code: 'he', content_value: 'משכורת חודשית (₪)' },
  { content_key: 'partner_income_form.field.monthly_salary', language_code: 'en', content_value: 'Monthly Salary (₪)' },
  
  { content_key: 'partner_income_form.field.annual_income', language_code: 'ru', content_value: 'Годовой доход (₪)' },
  { content_key: 'partner_income_form.field.annual_income', language_code: 'he', content_value: 'הכנסה שנתית (₪)' },
  { content_key: 'partner_income_form.field.annual_income', language_code: 'en', content_value: 'Annual Income (₪)' },
  
  { content_key: 'partner_income_form.field.additional_income', language_code: 'ru', content_value: 'Дополнительные доходы (₪)' },
  { content_key: 'partner_income_form.field.additional_income', language_code: 'he', content_value: 'הכנסות נוספות (₪)' },
  { content_key: 'partner_income_form.field.additional_income', language_code: 'en', content_value: 'Additional Income (₪)' },
  
  { content_key: 'partner_income_form.field.income_source', language_code: 'ru', content_value: 'Источник дополнительного дохода' },
  { content_key: 'partner_income_form.field.income_source', language_code: 'he', content_value: 'מקור הכנסה נוספת' },
  { content_key: 'partner_income_form.field.income_source', language_code: 'en', content_value: 'Additional Income Source' },
  
  // Dropdown Options - Employment Status
  { content_key: 'partner_income_form.dropdown.employment.employed', language_code: 'ru', content_value: 'Работник по найму' },
  { content_key: 'partner_income_form.dropdown.employment.employed', language_code: 'he', content_value: 'עובד שכיר' },
  { content_key: 'partner_income_form.dropdown.employment.employed', language_code: 'en', content_value: 'Employed' },
  
  { content_key: 'partner_income_form.dropdown.employment.self_employed', language_code: 'ru', content_value: 'Самозанятый/Предприниматель' },
  { content_key: 'partner_income_form.dropdown.employment.self_employed', language_code: 'he', content_value: 'עצמאי/יזם' },
  { content_key: 'partner_income_form.dropdown.employment.self_employed', language_code: 'en', content_value: 'Self-Employed' },
  
  { content_key: 'partner_income_form.dropdown.employment.unemployed', language_code: 'ru', content_value: 'Безработный' },
  { content_key: 'partner_income_form.dropdown.employment.unemployed', language_code: 'he', content_value: 'מובטל' },
  { content_key: 'partner_income_form.dropdown.employment.unemployed', language_code: 'en', content_value: 'Unemployed' },
  
  { content_key: 'partner_income_form.dropdown.employment.retired', language_code: 'ru', content_value: 'Пенсионер' },
  { content_key: 'partner_income_form.dropdown.employment.retired', language_code: 'he', content_value: 'פנסיונר' },
  { content_key: 'partner_income_form.dropdown.employment.retired', language_code: 'en', content_value: 'Retired' },
  
  { content_key: 'partner_income_form.dropdown.employment.student', language_code: 'ru', content_value: 'Студент' },
  { content_key: 'partner_income_form.dropdown.employment.student', language_code: 'he', content_value: 'סטודנט' },
  { content_key: 'partner_income_form.dropdown.employment.student', language_code: 'en', content_value: 'Student' },
  
  // Validation Messages
  { content_key: 'partner_income_form.validation.employment_required', language_code: 'ru', content_value: 'Выбор статуса занятости обязателен' },
  { content_key: 'partner_income_form.validation.employment_required', language_code: 'he', content_value: 'בחירת מצב תעסוקה היא שדה חובה' },
  { content_key: 'partner_income_form.validation.employment_required', language_code: 'en', content_value: 'Employment status selection is required' },
  
  { content_key: 'partner_income_form.validation.salary_required', language_code: 'ru', content_value: 'Указание зарплаты обязательно' },
  { content_key: 'partner_income_form.validation.salary_required', language_code: 'he', content_value: 'ציון משכורת הוא שדה חובה' },
  { content_key: 'partner_income_form.validation.salary_required', language_code: 'en', content_value: 'Salary amount is required' },
  
  { content_key: 'partner_income_form.validation.salary_format', language_code: 'ru', content_value: 'Введите корректную сумму зарплаты' },
  { content_key: 'partner_income_form.validation.salary_format', language_code: 'he', content_value: 'הכנס סכום משכורת תקין' },
  { content_key: 'partner_income_form.validation.salary_format', language_code: 'en', content_value: 'Enter a valid salary amount' },
  
  { content_key: 'partner_income_form.validation.employer_required', language_code: 'ru', content_value: 'Название работодателя обязательно' },
  { content_key: 'partner_income_form.validation.employer_required', language_code: 'he', content_value: 'שם המעסיק הוא שדה חובה' },
  { content_key: 'partner_income_form.validation.employer_required', language_code: 'en', content_value: 'Employer name is required' },
  
  // Action Buttons
  { content_key: 'partner_income_form.button.next', language_code: 'ru', content_value: 'Далее' },
  { content_key: 'partner_income_form.button.next', language_code: 'he', content_value: 'הבא' },
  { content_key: 'partner_income_form.button.next', language_code: 'en', content_value: 'Next' },
  
  { content_key: 'partner_income_form.button.back', language_code: 'ru', content_value: 'Назад' },
  { content_key: 'partner_income_form.button.back', language_code: 'he', content_value: 'חזור' },
  { content_key: 'partner_income_form.button.back', language_code: 'en', content_value: 'Back' },
  
  { content_key: 'partner_income_form.button.skip', language_code: 'ru', content_value: 'Пропустить доходы партнера' },
  { content_key: 'partner_income_form.button.skip', language_code: 'he', content_value: 'דלג על הכנסות בן/בת הזוג' },
  { content_key: 'partner_income_form.button.skip', language_code: 'en', content_value: 'Skip Partner Income' },
  
  // Help Text
  { content_key: 'partner_income_form.help.salary_calculation', language_code: 'ru', content_value: 'Укажите среднюю месячную зарплату за последние 6 месяцев' },
  { content_key: 'partner_income_form.help.salary_calculation', language_code: 'he', content_value: 'ציין את הממוצע החודשי של השכר ב-6 החודשים האחרונים' },
  { content_key: 'partner_income_form.help.salary_calculation', language_code: 'en', content_value: 'Enter average monthly salary for the last 6 months' },
  
  { content_key: 'partner_income_form.help.additional_income', language_code: 'ru', content_value: 'Включите доходы от аренды, инвестиций, подработок' },
  { content_key: 'partner_income_form.help.additional_income', language_code: 'he', content_value: 'כלול הכנסות משכירות, השקעות, עבודות צד' },
  { content_key: 'partner_income_form.help.additional_income', language_code: 'en', content_value: 'Include income from rent, investments, side jobs' },
  
  { content_key: 'partner_income_form.help.income_verification', language_code: 'ru', content_value: 'Потребуются справки о доходах для подтверждения' },
  { content_key: 'partner_income_form.help.income_verification', language_code: 'he', content_value: 'יידרשו אישורי הכנסה לצורך אימות' },
  { content_key: 'partner_income_form.help.income_verification', language_code: 'en', content_value: 'Income certificates will be required for verification' }
];

async function executeSection4_1_6() {
  const client = await contentPool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting Section 4.1.6: Partner Income Form implementation...');

    // Insert content items
    console.log('📝 Inserting 26 content items for partner_income_form...');
    for (const item of section4_1_6_ContentItems) {
      await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [item.content_key, item.component_type, item.category, 'partner_income_form', item.description, true, 1]
      );
    }

    // Insert translations
    console.log('🌐 Inserting 78 trilingual translations (26 items × 3 languages)...');
    for (const translation of section4_1_6_Translations) {
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
    console.log('✅ Section 4.1.6 implementation completed successfully!');
    console.log('📊 Summary:');
    console.log('   • 26 content items created for partner_income_form');
    console.log('   • 78 trilingual translations added (RU/HE/EN)');
    console.log('   • Screen location: partner_income_form');
    console.log('   • Components: employment status, salary fields, income sources, validation');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing Section 4.1.6:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  executeSection4_1_6()
    .then(() => {
      console.log('🎉 Section 4.1.6: Partner Income Form implementation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to implement Section 4.1.6:', error);
      process.exit(1);
    });
}

module.exports = { executeSection4_1_6 };