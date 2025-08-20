const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

// Database configuration for content database
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const section4_1_4_ContentItems = [
  // Page Structure
  { content_key: 'personal_data_form.title', component_type: 'text', category: 'heading', description: 'Personal data form page title' },
  { content_key: 'personal_data_form.subtitle', component_type: 'text', category: 'heading', description: 'Personal data form subtitle' },
  { content_key: 'personal_data_form.description', component_type: 'text', category: 'text', description: 'Form description text' },
  
  // Form Fields
  { content_key: 'personal_data_form.field.first_name', component_type: 'text', category: 'form', description: 'First name field label' },
  { content_key: 'personal_data_form.field.last_name', component_type: 'text', category: 'form', description: 'Last name field label' },
  { content_key: 'personal_data_form.field.id_number', component_type: 'text', category: 'form', description: 'ID number field label' },
  { content_key: 'personal_data_form.field.gender', component_type: 'text', category: 'form', description: 'Gender field label' },
  { content_key: 'personal_data_form.field.id_type', component_type: 'text', category: 'form', description: 'ID type field label' },
  
  // Dropdown Options - Gender
  { content_key: 'personal_data_form.dropdown.gender.male', component_type: 'dropdown', category: 'form', description: 'Male gender option' },
  { content_key: 'personal_data_form.dropdown.gender.female', component_type: 'dropdown', category: 'form', description: 'Female gender option' },
  { content_key: 'personal_data_form.dropdown.gender.other', component_type: 'dropdown', category: 'form', description: 'Other gender option' },
  
  // Dropdown Options - ID Type
  { content_key: 'personal_data_form.dropdown.id_type.israeli_id', component_type: 'dropdown', category: 'form', description: 'Israeli ID option' },
  { content_key: 'personal_data_form.dropdown.id_type.passport', component_type: 'dropdown', category: 'form', description: 'Passport option' },
  { content_key: 'personal_data_form.dropdown.id_type.foreign_id', component_type: 'dropdown', category: 'form', description: 'Foreign ID option' },
  
  // Validation Messages
  { content_key: 'personal_data_form.validation.first_name_required', component_type: 'text', category: 'validation', description: 'First name required validation' },
  { content_key: 'personal_data_form.validation.last_name_required', component_type: 'text', category: 'validation', description: 'Last name required validation' },
  { content_key: 'personal_data_form.validation.id_number_required', component_type: 'text', category: 'validation', description: 'ID number required validation' },
  { content_key: 'personal_data_form.validation.id_number_invalid', component_type: 'text', category: 'validation', description: 'ID number format validation' },
  { content_key: 'personal_data_form.validation.gender_required', component_type: 'text', category: 'validation', description: 'Gender selection required validation' },
  { content_key: 'personal_data_form.validation.id_type_required', component_type: 'text', category: 'validation', description: 'ID type selection required validation' },
  
  // Action Buttons
  { content_key: 'personal_data_form.button.next', component_type: 'text', category: 'action', description: 'Next button text' },
  { content_key: 'personal_data_form.button.back', component_type: 'text', category: 'action', description: 'Back button text' },
  
  // Help Text
  { content_key: 'personal_data_form.help.id_number', component_type: 'text', category: 'text', description: 'ID number help text' },
  { content_key: 'personal_data_form.help.general', component_type: 'text', category: 'text', description: 'General form help text' }
];

const section4_1_4_Translations = [
  // Page Structure
  { content_key: 'personal_data_form.title', language_code: 'ru', content_value: 'Персональные данные' },
  { content_key: 'personal_data_form.title', language_code: 'he', content_value: 'נתונים אישיים' },
  { content_key: 'personal_data_form.title', language_code: 'en', content_value: 'Personal Data' },
  
  { content_key: 'personal_data_form.subtitle', language_code: 'ru', content_value: 'Заполните ваши персональные данные' },
  { content_key: 'personal_data_form.subtitle', language_code: 'he', content_value: 'מלא את הנתונים האישיים שלך' },
  { content_key: 'personal_data_form.subtitle', language_code: 'en', content_value: 'Fill in your personal data' },
  
  { content_key: 'personal_data_form.description', language_code: 'ru', content_value: 'Пожалуйста, введите ваши точные персональные данные как указано в удостоверении личности' },
  { content_key: 'personal_data_form.description', language_code: 'he', content_value: 'אנא הכנס את הנתונים האישיים המדויקים שלך כפי שמופיעים בתעודת הזהות' },
  { content_key: 'personal_data_form.description', language_code: 'en', content_value: 'Please enter your accurate personal data as shown on your ID document' },
  
  // Form Fields
  { content_key: 'personal_data_form.field.first_name', language_code: 'ru', content_value: 'Имя' },
  { content_key: 'personal_data_form.field.first_name', language_code: 'he', content_value: 'שם פרטי' },
  { content_key: 'personal_data_form.field.first_name', language_code: 'en', content_value: 'First Name' },
  
  { content_key: 'personal_data_form.field.last_name', language_code: 'ru', content_value: 'Фамилия' },
  { content_key: 'personal_data_form.field.last_name', language_code: 'he', content_value: 'שם משפחה' },
  { content_key: 'personal_data_form.field.last_name', language_code: 'en', content_value: 'Last Name' },
  
  { content_key: 'personal_data_form.field.id_number', language_code: 'ru', content_value: 'Номер удостоверения личности' },
  { content_key: 'personal_data_form.field.id_number', language_code: 'he', content_value: 'מספר תעודת זהות' },
  { content_key: 'personal_data_form.field.id_number', language_code: 'en', content_value: 'ID Number' },
  
  { content_key: 'personal_data_form.field.gender', language_code: 'ru', content_value: 'Пол' },
  { content_key: 'personal_data_form.field.gender', language_code: 'he', content_value: 'מגדר' },
  { content_key: 'personal_data_form.field.gender', language_code: 'en', content_value: 'Gender' },
  
  { content_key: 'personal_data_form.field.id_type', language_code: 'ru', content_value: 'Тип удостоверения личности' },
  { content_key: 'personal_data_form.field.id_type', language_code: 'he', content_value: 'סוג תעודת זהות' },
  { content_key: 'personal_data_form.field.id_type', language_code: 'en', content_value: 'ID Type' },
  
  // Dropdown Options - Gender
  { content_key: 'personal_data_form.dropdown.gender.male', language_code: 'ru', content_value: 'Мужской' },
  { content_key: 'personal_data_form.dropdown.gender.male', language_code: 'he', content_value: 'זכר' },
  { content_key: 'personal_data_form.dropdown.gender.male', language_code: 'en', content_value: 'Male' },
  
  { content_key: 'personal_data_form.dropdown.gender.female', language_code: 'ru', content_value: 'Женский' },
  { content_key: 'personal_data_form.dropdown.gender.female', language_code: 'he', content_value: 'נקבה' },
  { content_key: 'personal_data_form.dropdown.gender.female', language_code: 'en', content_value: 'Female' },
  
  { content_key: 'personal_data_form.dropdown.gender.other', language_code: 'ru', content_value: 'Другой' },
  { content_key: 'personal_data_form.dropdown.gender.other', language_code: 'he', content_value: 'אחר' },
  { content_key: 'personal_data_form.dropdown.gender.other', language_code: 'en', content_value: 'Other' },
  
  // Dropdown Options - ID Type
  { content_key: 'personal_data_form.dropdown.id_type.israeli_id', language_code: 'ru', content_value: 'Израильское удостоверение личности' },
  { content_key: 'personal_data_form.dropdown.id_type.israeli_id', language_code: 'he', content_value: 'תעודת זהות ישראלית' },
  { content_key: 'personal_data_form.dropdown.id_type.israeli_id', language_code: 'en', content_value: 'Israeli ID' },
  
  { content_key: 'personal_data_form.dropdown.id_type.passport', language_code: 'ru', content_value: 'Паспорт' },
  { content_key: 'personal_data_form.dropdown.id_type.passport', language_code: 'he', content_value: 'דרכון' },
  { content_key: 'personal_data_form.dropdown.id_type.passport', language_code: 'en', content_value: 'Passport' },
  
  { content_key: 'personal_data_form.dropdown.id_type.foreign_id', language_code: 'ru', content_value: 'Зарубежное удостоверение личности' },
  { content_key: 'personal_data_form.dropdown.id_type.foreign_id', language_code: 'he', content_value: 'תעודת זהות זרה' },
  { content_key: 'personal_data_form.dropdown.id_type.foreign_id', language_code: 'en', content_value: 'Foreign ID' },
  
  // Validation Messages
  { content_key: 'personal_data_form.validation.first_name_required', language_code: 'ru', content_value: 'Имя обязательно для заполнения' },
  { content_key: 'personal_data_form.validation.first_name_required', language_code: 'he', content_value: 'שם פרטי הוא שדה חובה' },
  { content_key: 'personal_data_form.validation.first_name_required', language_code: 'en', content_value: 'First name is required' },
  
  { content_key: 'personal_data_form.validation.last_name_required', language_code: 'ru', content_value: 'Фамилия обязательна для заполнения' },
  { content_key: 'personal_data_form.validation.last_name_required', language_code: 'he', content_value: 'שם משפחה הוא שדה חובה' },
  { content_key: 'personal_data_form.validation.last_name_required', language_code: 'en', content_value: 'Last name is required' },
  
  { content_key: 'personal_data_form.validation.id_number_required', language_code: 'ru', content_value: 'Номер удостоверения личности обязателен' },
  { content_key: 'personal_data_form.validation.id_number_required', language_code: 'he', content_value: 'מספר תעודת זהות הוא שדה חובה' },
  { content_key: 'personal_data_form.validation.id_number_required', language_code: 'en', content_value: 'ID number is required' },
  
  { content_key: 'personal_data_form.validation.id_number_invalid', language_code: 'ru', content_value: 'Неверный формат номера удостоверения личности' },
  { content_key: 'personal_data_form.validation.id_number_invalid', language_code: 'he', content_value: 'פורמט מספר תעודת זהות לא תקין' },
  { content_key: 'personal_data_form.validation.id_number_invalid', language_code: 'en', content_value: 'Invalid ID number format' },
  
  { content_key: 'personal_data_form.validation.gender_required', language_code: 'ru', content_value: 'Выбор пола обязателен' },
  { content_key: 'personal_data_form.validation.gender_required', language_code: 'he', content_value: 'בחירת מגדר היא שדה חובה' },
  { content_key: 'personal_data_form.validation.gender_required', language_code: 'en', content_value: 'Gender selection is required' },
  
  { content_key: 'personal_data_form.validation.id_type_required', language_code: 'ru', content_value: 'Выбор типа удостоверения личности обязателен' },
  { content_key: 'personal_data_form.validation.id_type_required', language_code: 'he', content_value: 'בחירת סוג תעודת זהות היא שדה חובה' },
  { content_key: 'personal_data_form.validation.id_type_required', language_code: 'en', content_value: 'ID type selection is required' },
  
  // Action Buttons
  { content_key: 'personal_data_form.button.next', language_code: 'ru', content_value: 'Далее' },
  { content_key: 'personal_data_form.button.next', language_code: 'he', content_value: 'הבא' },
  { content_key: 'personal_data_form.button.next', language_code: 'en', content_value: 'Next' },
  
  { content_key: 'personal_data_form.button.back', language_code: 'ru', content_value: 'Назад' },
  { content_key: 'personal_data_form.button.back', language_code: 'he', content_value: 'חזור' },
  { content_key: 'personal_data_form.button.back', language_code: 'en', content_value: 'Back' },
  
  // Help Text
  { content_key: 'personal_data_form.help.id_number', language_code: 'ru', content_value: 'Введите номер как указано в вашем удостоверении личности' },
  { content_key: 'personal_data_form.help.id_number', language_code: 'he', content_value: 'הכנס את המספר כפי שמופיע בתעודת הזהות שלך' },
  { content_key: 'personal_data_form.help.id_number', language_code: 'en', content_value: 'Enter the number as shown on your ID document' },
  
  { content_key: 'personal_data_form.help.general', language_code: 'ru', content_value: 'Все поля обязательны для заполнения' },
  { content_key: 'personal_data_form.help.general', language_code: 'he', content_value: 'כל השדות נדרשים למילוי' },
  { content_key: 'personal_data_form.help.general', language_code: 'en', content_value: 'All fields are required' }
];

async function executeSection4_1_4() {
  const client = await contentPool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting Section 4.1.4: Personal Data Form implementation...');

    // Insert content items
    console.log('📝 Inserting 25 content items for personal_data_form...');
    for (const item of section4_1_4_ContentItems) {
      await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [item.content_key, item.component_type, item.category, 'personal_data_form', item.description, true, 1]
      );
    }

    // Insert translations
    console.log('🌐 Inserting 75 trilingual translations (25 items × 3 languages)...');
    for (const translation of section4_1_4_Translations) {
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
    console.log('✅ Section 4.1.4 implementation completed successfully!');
    console.log('📊 Summary:');
    console.log('   • 25 content items created for personal_data_form');
    console.log('   • 75 trilingual translations added (RU/HE/EN)');
    console.log('   • Screen location: personal_data_form');
    console.log('   • Components: form fields, dropdowns, validation, buttons, help text');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing Section 4.1.4:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  executeSection4_1_4()
    .then(() => {
      console.log('🎉 Section 4.1.4: Personal Data Form implementation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to implement Section 4.1.4:', error);
      process.exit(1);
    });
}

module.exports = { executeSection4_1_4 };