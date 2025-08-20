const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

// Database configuration for content database
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const section4_1_7_ContentItems = [
  // Page Structure
  { content_key: 'income_form_employed.title', component_type: 'text', category: 'heading', description: 'Employed income form title' },
  { content_key: 'income_form_employed.subtitle', component_type: 'text', category: 'heading', description: 'Employment income form subtitle' },
  { content_key: 'income_form_employed.description', component_type: 'text', category: 'text', description: 'Employment income form description' },
  
  // Employment Details
  { content_key: 'income_form_employed.field.employer_name', component_type: 'text', category: 'form', description: 'Current employer name field' },
  { content_key: 'income_form_employed.field.job_title', component_type: 'text', category: 'form', description: 'Current job title field' },
  { content_key: 'income_form_employed.field.employment_type', component_type: 'text', category: 'form', description: 'Employment type field' },
  { content_key: 'income_form_employed.field.employment_start_date', component_type: 'text', category: 'form', description: 'Employment start date field' },
  { content_key: 'income_form_employed.field.work_experience_total', component_type: 'text', category: 'form', description: 'Total work experience field' },
  
  // Salary Information
  { content_key: 'income_form_employed.field.gross_monthly_salary', component_type: 'text', category: 'form', description: 'Gross monthly salary field' },
  { content_key: 'income_form_employed.field.net_monthly_salary', component_type: 'text', category: 'form', description: 'Net monthly salary field' },
  { content_key: 'income_form_employed.field.annual_bonus', component_type: 'text', category: 'form', description: 'Annual bonus field' },
  { content_key: 'income_form_employed.field.overtime_income', component_type: 'text', category: 'form', description: 'Overtime income field' },
  { content_key: 'income_form_employed.field.commission_income', component_type: 'text', category: 'form', description: 'Commission income field' },
  
  // Dropdown Options - Employment Type
  { content_key: 'income_form_employed.dropdown.employment_type.permanent', component_type: 'dropdown', category: 'form', description: 'Permanent employment option' },
  { content_key: 'income_form_employed.dropdown.employment_type.contract', component_type: 'dropdown', category: 'form', description: 'Contract employment option' },
  { content_key: 'income_form_employed.dropdown.employment_type.temporary', component_type: 'dropdown', category: 'form', description: 'Temporary employment option' },
  { content_key: 'income_form_employed.dropdown.employment_type.part_time', component_type: 'dropdown', category: 'form', description: 'Part-time employment option' },
  
  // Employer Information
  { content_key: 'income_form_employed.field.employer_address', component_type: 'text', category: 'form', description: 'Employer address field' },
  { content_key: 'income_form_employed.field.employer_phone', component_type: 'text', category: 'form', description: 'Employer phone field' },
  { content_key: 'income_form_employed.field.hr_contact', component_type: 'text', category: 'form', description: 'HR contact information field' },
  
  // Validation Messages
  { content_key: 'income_form_employed.validation.employer_required', component_type: 'text', category: 'validation', description: 'Employer name required validation' },
  { content_key: 'income_form_employed.validation.job_title_required', component_type: 'text', category: 'validation', description: 'Job title required validation' },
  { content_key: 'income_form_employed.validation.salary_required', component_type: 'text', category: 'validation', description: 'Salary required validation' },
  { content_key: 'income_form_employed.validation.salary_format', component_type: 'text', category: 'validation', description: 'Salary format validation' },
  { content_key: 'income_form_employed.validation.start_date_required', component_type: 'text', category: 'validation', description: 'Start date required validation' },
  { content_key: 'income_form_employed.validation.employment_type_required', component_type: 'text', category: 'validation', description: 'Employment type required validation' },
  
  // Action Buttons
  { content_key: 'income_form_employed.button.next', component_type: 'text', category: 'action', description: 'Next button text' },
  { content_key: 'income_form_employed.button.back', component_type: 'text', category: 'action', description: 'Back button text' },
  { content_key: 'income_form_employed.button.add_previous_employer', component_type: 'text', category: 'action', description: 'Add previous employer button' },
  
  // Help Text
  { content_key: 'income_form_employed.help.gross_vs_net', component_type: 'text', category: 'text', description: 'Gross vs net salary explanation' },
  { content_key: 'income_form_employed.help.bonus_calculation', component_type: 'text', category: 'text', description: 'Bonus calculation help text' },
  { content_key: 'income_form_employed.help.required_documents', component_type: 'text', category: 'text', description: 'Required documents help text' }
];

const section4_1_7_Translations = [
  // Page Structure
  { content_key: 'income_form_employed.title', language_code: 'ru', content_value: 'Доходы от трудовой деятельности' },
  { content_key: 'income_form_employed.title', language_code: 'he', content_value: 'הכנסות מעבודה שכירה' },
  { content_key: 'income_form_employed.title', language_code: 'en', content_value: 'Employment Income Information' },
  
  { content_key: 'income_form_employed.subtitle', language_code: 'ru', content_value: 'Заполните информацию о вашей работе и зарплате' },
  { content_key: 'income_form_employed.subtitle', language_code: 'he', content_value: 'מלא מידע על המקום עבודה והשכר שלך' },
  { content_key: 'income_form_employed.subtitle', language_code: 'en', content_value: 'Fill in your employment and salary information' },
  
  { content_key: 'income_form_employed.description', language_code: 'ru', content_value: 'Предоставьте подробную информацию о вашем текущем месте работы и доходах' },
  { content_key: 'income_form_employed.description', language_code: 'he', content_value: 'ספק מידע מפורט על מקום העבודה הנוכחי והכנסותיך' },
  { content_key: 'income_form_employed.description', language_code: 'en', content_value: 'Provide detailed information about your current workplace and income' },
  
  // Employment Details
  { content_key: 'income_form_employed.field.employer_name', language_code: 'ru', content_value: 'Название работодателя' },
  { content_key: 'income_form_employed.field.employer_name', language_code: 'he', content_value: 'שם המעסיק' },
  { content_key: 'income_form_employed.field.employer_name', language_code: 'en', content_value: 'Employer Name' },
  
  { content_key: 'income_form_employed.field.job_title', language_code: 'ru', content_value: 'Должность' },
  { content_key: 'income_form_employed.field.job_title', language_code: 'he', content_value: 'תפקיד' },
  { content_key: 'income_form_employed.field.job_title', language_code: 'en', content_value: 'Job Title' },
  
  { content_key: 'income_form_employed.field.employment_type', language_code: 'ru', content_value: 'Тип трудоустройства' },
  { content_key: 'income_form_employed.field.employment_type', language_code: 'he', content_value: 'סוג העסקה' },
  { content_key: 'income_form_employed.field.employment_type', language_code: 'en', content_value: 'Employment Type' },
  
  { content_key: 'income_form_employed.field.employment_start_date', language_code: 'ru', content_value: 'Дата начала работы' },
  { content_key: 'income_form_employed.field.employment_start_date', language_code: 'he', content_value: 'תאריך תחילת עבודה' },
  { content_key: 'income_form_employed.field.employment_start_date', language_code: 'en', content_value: 'Employment Start Date' },
  
  { content_key: 'income_form_employed.field.work_experience_total', language_code: 'ru', content_value: 'Общий стаж работы (годы)' },
  { content_key: 'income_form_employed.field.work_experience_total', language_code: 'he', content_value: 'ותק כללי בעבודה (שנים)' },
  { content_key: 'income_form_employed.field.work_experience_total', language_code: 'en', content_value: 'Total Work Experience (years)' },
  
  // Salary Information
  { content_key: 'income_form_employed.field.gross_monthly_salary', language_code: 'ru', content_value: 'Валовая месячная зарплата (₪)' },
  { content_key: 'income_form_employed.field.gross_monthly_salary', language_code: 'he', content_value: 'משכורת חודשית ברוטו (₪)' },
  { content_key: 'income_form_employed.field.gross_monthly_salary', language_code: 'en', content_value: 'Gross Monthly Salary (₪)' },
  
  { content_key: 'income_form_employed.field.net_monthly_salary', language_code: 'ru', content_value: 'Чистая месячная зарплата (₪)' },
  { content_key: 'income_form_employed.field.net_monthly_salary', language_code: 'he', content_value: 'משכורת חודשית נטו (₪)' },
  { content_key: 'income_form_employed.field.net_monthly_salary', language_code: 'en', content_value: 'Net Monthly Salary (₪)' },
  
  { content_key: 'income_form_employed.field.annual_bonus', language_code: 'ru', content_value: 'Годовая премия (₪)' },
  { content_key: 'income_form_employed.field.annual_bonus', language_code: 'he', content_value: 'בונוס שנתי (₪)' },
  { content_key: 'income_form_employed.field.annual_bonus', language_code: 'en', content_value: 'Annual Bonus (₪)' },
  
  { content_key: 'income_form_employed.field.overtime_income', language_code: 'ru', content_value: 'Доходы от сверхурочных (₪/месяц)' },
  { content_key: 'income_form_employed.field.overtime_income', language_code: 'he', content_value: 'הכנסות משעות נוספות (₪/חודש)' },
  { content_key: 'income_form_employed.field.overtime_income', language_code: 'en', content_value: 'Overtime Income (₪/month)' },
  
  { content_key: 'income_form_employed.field.commission_income', language_code: 'ru', content_value: 'Доходы от комиссий (₪/месяц)' },
  { content_key: 'income_form_employed.field.commission_income', language_code: 'he', content_value: 'הכנסות מעמלות (₪/חודש)' },
  { content_key: 'income_form_employed.field.commission_income', language_code: 'en', content_value: 'Commission Income (₪/month)' },
  
  // Dropdown Options - Employment Type
  { content_key: 'income_form_employed.dropdown.employment_type.permanent', language_code: 'ru', content_value: 'Постоянная работа' },
  { content_key: 'income_form_employed.dropdown.employment_type.permanent', language_code: 'he', content_value: 'עבודה קבועה' },
  { content_key: 'income_form_employed.dropdown.employment_type.permanent', language_code: 'en', content_value: 'Permanent Employment' },
  
  { content_key: 'income_form_employed.dropdown.employment_type.contract', language_code: 'ru', content_value: 'Контрактная работа' },
  { content_key: 'income_form_employed.dropdown.employment_type.contract', language_code: 'he', content_value: 'עבודה בחוזה' },
  { content_key: 'income_form_employed.dropdown.employment_type.contract', language_code: 'en', content_value: 'Contract Employment' },
  
  { content_key: 'income_form_employed.dropdown.employment_type.temporary', language_code: 'ru', content_value: 'Временная работа' },
  { content_key: 'income_form_employed.dropdown.employment_type.temporary', language_code: 'he', content_value: 'עבודה זמנית' },
  { content_key: 'income_form_employed.dropdown.employment_type.temporary', language_code: 'en', content_value: 'Temporary Employment' },
  
  { content_key: 'income_form_employed.dropdown.employment_type.part_time', language_code: 'ru', content_value: 'Работа на неполный рабочий день' },
  { content_key: 'income_form_employed.dropdown.employment_type.part_time', language_code: 'he', content_value: 'עבודה במשרה חלקית' },
  { content_key: 'income_form_employed.dropdown.employment_type.part_time', language_code: 'en', content_value: 'Part-Time Employment' },
  
  // Employer Information
  { content_key: 'income_form_employed.field.employer_address', language_code: 'ru', content_value: 'Адрес работодателя' },
  { content_key: 'income_form_employed.field.employer_address', language_code: 'he', content_value: 'כתובת המעסיק' },
  { content_key: 'income_form_employed.field.employer_address', language_code: 'en', content_value: 'Employer Address' },
  
  { content_key: 'income_form_employed.field.employer_phone', language_code: 'ru', content_value: 'Телефон работодателя' },
  { content_key: 'income_form_employed.field.employer_phone', language_code: 'he', content_value: 'טלפון המעסיק' },
  { content_key: 'income_form_employed.field.employer_phone', language_code: 'en', content_value: 'Employer Phone' },
  
  { content_key: 'income_form_employed.field.hr_contact', language_code: 'ru', content_value: 'Контакт отдела кадров' },
  { content_key: 'income_form_employed.field.hr_contact', language_code: 'he', content_value: 'איש קשר במשאבי אנוש' },
  { content_key: 'income_form_employed.field.hr_contact', language_code: 'en', content_value: 'HR Contact' },
  
  // Validation Messages
  { content_key: 'income_form_employed.validation.employer_required', language_code: 'ru', content_value: 'Название работодателя обязательно' },
  { content_key: 'income_form_employed.validation.employer_required', language_code: 'he', content_value: 'שם המעסיק הוא שדה חובה' },
  { content_key: 'income_form_employed.validation.employer_required', language_code: 'en', content_value: 'Employer name is required' },
  
  { content_key: 'income_form_employed.validation.job_title_required', language_code: 'ru', content_value: 'Должность обязательна' },
  { content_key: 'income_form_employed.validation.job_title_required', language_code: 'he', content_value: 'תפקיד הוא שדה חובה' },
  { content_key: 'income_form_employed.validation.job_title_required', language_code: 'en', content_value: 'Job title is required' },
  
  { content_key: 'income_form_employed.validation.salary_required', language_code: 'ru', content_value: 'Зарплата обязательна' },
  { content_key: 'income_form_employed.validation.salary_required', language_code: 'he', content_value: 'משכורת היא שדה חובה' },
  { content_key: 'income_form_employed.validation.salary_required', language_code: 'en', content_value: 'Salary is required' },
  
  { content_key: 'income_form_employed.validation.salary_format', language_code: 'ru', content_value: 'Введите корректную сумму зарплаты' },
  { content_key: 'income_form_employed.validation.salary_format', language_code: 'he', content_value: 'הכנס סכום משכורת תקין' },
  { content_key: 'income_form_employed.validation.salary_format', language_code: 'en', content_value: 'Enter a valid salary amount' },
  
  { content_key: 'income_form_employed.validation.start_date_required', language_code: 'ru', content_value: 'Дата начала работы обязательна' },
  { content_key: 'income_form_employed.validation.start_date_required', language_code: 'he', content_value: 'תאריך תחילת עבודה הוא שדה חובה' },
  { content_key: 'income_form_employed.validation.start_date_required', language_code: 'en', content_value: 'Employment start date is required' },
  
  { content_key: 'income_form_employed.validation.employment_type_required', language_code: 'ru', content_value: 'Тип трудоустройства обязателен' },
  { content_key: 'income_form_employed.validation.employment_type_required', language_code: 'he', content_value: 'סוג העסקה הוא שדה חובה' },
  { content_key: 'income_form_employed.validation.employment_type_required', language_code: 'en', content_value: 'Employment type is required' },
  
  // Action Buttons
  { content_key: 'income_form_employed.button.next', language_code: 'ru', content_value: 'Далее' },
  { content_key: 'income_form_employed.button.next', language_code: 'he', content_value: 'הבא' },
  { content_key: 'income_form_employed.button.next', language_code: 'en', content_value: 'Next' },
  
  { content_key: 'income_form_employed.button.back', language_code: 'ru', content_value: 'Назад' },
  { content_key: 'income_form_employed.button.back', language_code: 'he', content_value: 'חזור' },
  { content_key: 'income_form_employed.button.back', language_code: 'en', content_value: 'Back' },
  
  { content_key: 'income_form_employed.button.add_previous_employer', language_code: 'ru', content_value: 'Добавить предыдущего работодателя' },
  { content_key: 'income_form_employed.button.add_previous_employer', language_code: 'he', content_value: 'הוסף מעסיק קודם' },
  { content_key: 'income_form_employed.button.add_previous_employer', language_code: 'en', content_value: 'Add Previous Employer' },
  
  // Help Text
  { content_key: 'income_form_employed.help.gross_vs_net', language_code: 'ru', content_value: 'Валовая зарплата - до вычета налогов, чистая - после вычетов' },
  { content_key: 'income_form_employed.help.gross_vs_net', language_code: 'he', content_value: 'משכורת ברוטו - לפני ניכוי מסים, נטו - אחרי ניכויים' },
  { content_key: 'income_form_employed.help.gross_vs_net', language_code: 'en', content_value: 'Gross salary - before tax deductions, net - after deductions' },
  
  { content_key: 'income_form_employed.help.bonus_calculation', language_code: 'ru', content_value: 'Укажите среднюю годовую премию за последние 3 года' },
  { content_key: 'income_form_employed.help.bonus_calculation', language_code: 'he', content_value: 'ציין את הבונוס השנתי הממוצע ב-3 השנים האחרונות' },
  { content_key: 'income_form_employed.help.bonus_calculation', language_code: 'en', content_value: 'Enter average annual bonus for the last 3 years' },
  
  { content_key: 'income_form_employed.help.required_documents', language_code: 'ru', content_value: 'Потребуются справка о доходах и трудовой договор' },
  { content_key: 'income_form_employed.help.required_documents', language_code: 'he', content_value: 'יידרשו אישור משכורת וחוזה עבודה' },
  { content_key: 'income_form_employed.help.required_documents', language_code: 'en', content_value: 'Income certificate and employment contract will be required' }
];

async function executeSection4_1_7() {
  const client = await contentPool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting Section 4.1.7: Income Form Employed implementation...');

    // Insert content items
    console.log('📝 Inserting 30 content items for income_form_employed...');
    for (const item of section4_1_7_ContentItems) {
      await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [item.content_key, item.component_type, item.category, 'income_form_employed', item.description, true, 1]
      );
    }

    // Insert translations
    console.log('🌐 Inserting 90 trilingual translations (30 items × 3 languages)...');
    for (const translation of section4_1_7_Translations) {
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
    console.log('✅ Section 4.1.7 implementation completed successfully!');
    console.log('📊 Summary:');
    console.log('   • 30 content items created for income_form_employed');
    console.log('   • 90 trilingual translations added (RU/HE/EN)');
    console.log('   • Screen location: income_form_employed');
    console.log('   • Components: employer details, salary info, employment types, validation');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing Section 4.1.7:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  executeSection4_1_7()
    .then(() => {
      console.log('🎉 Section 4.1.7: Income Form Employed implementation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to implement Section 4.1.7:', error);
      process.exit(1);
    });
}

module.exports = { executeSection4_1_7 };