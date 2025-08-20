const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

// Database configuration for content database
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const section4_1_5_ContentItems = [
  // Page Structure
  { content_key: 'partner_personal_data.title', component_type: 'text', category: 'heading', description: 'Partner personal data form title' },
  { content_key: 'partner_personal_data.subtitle', component_type: 'text', category: 'heading', description: 'Partner form subtitle' },
  { content_key: 'partner_personal_data.description', component_type: 'text', category: 'text', description: 'Partner form description' },
  
  // Form Fields
  { content_key: 'partner_personal_data.field.first_name', component_type: 'text', category: 'form', description: 'Partner first name field' },
  { content_key: 'partner_personal_data.field.last_name', component_type: 'text', category: 'form', description: 'Partner last name field' },
  { content_key: 'partner_personal_data.field.id_number', component_type: 'text', category: 'form', description: 'Partner ID number field' },
  { content_key: 'partner_personal_data.field.relationship', component_type: 'text', category: 'form', description: 'Relationship to main borrower field' },
  { content_key: 'partner_personal_data.field.gender', component_type: 'text', category: 'form', description: 'Partner gender field' },
  
  // Dropdown Options - Relationship
  { content_key: 'partner_personal_data.dropdown.relationship.spouse', component_type: 'dropdown', category: 'form', description: 'Spouse relationship option' },
  { content_key: 'partner_personal_data.dropdown.relationship.partner', component_type: 'dropdown', category: 'form', description: 'Partner relationship option' },
  { content_key: 'partner_personal_data.dropdown.relationship.other', component_type: 'dropdown', category: 'form', description: 'Other relationship option' },
  
  // Dropdown Options - Gender
  { content_key: 'partner_personal_data.dropdown.gender.male', component_type: 'dropdown', category: 'form', description: 'Male gender option' },
  { content_key: 'partner_personal_data.dropdown.gender.female', component_type: 'dropdown', category: 'form', description: 'Female gender option' },
  
  // Validation Messages
  { content_key: 'partner_personal_data.validation.first_name_required', component_type: 'text', category: 'validation', description: 'Partner first name required validation' },
  { content_key: 'partner_personal_data.validation.last_name_required', component_type: 'text', category: 'validation', description: 'Partner last name required validation' },
  { content_key: 'partner_personal_data.validation.id_number_required', component_type: 'text', category: 'validation', description: 'Partner ID number required validation' },
  { content_key: 'partner_personal_data.validation.relationship_required', component_type: 'text', category: 'validation', description: 'Relationship selection required validation' },
  
  // Action Buttons
  { content_key: 'partner_personal_data.button.next', component_type: 'text', category: 'action', description: 'Next button text' },
  { content_key: 'partner_personal_data.button.back', component_type: 'text', category: 'action', description: 'Back button text' },
  { content_key: 'partner_personal_data.button.skip', component_type: 'text', category: 'action', description: 'Skip partner info button' },
  
  // Help Text
  { content_key: 'partner_personal_data.help.relationship', component_type: 'text', category: 'text', description: 'Relationship selection help text' },
  { content_key: 'partner_personal_data.help.optional', component_type: 'text', category: 'text', description: 'Optional partner info note' }
];

const section4_1_5_Translations = [
  // Page Structure
  { content_key: 'partner_personal_data.title', language_code: 'ru', content_value: 'Данные супруга/партнера' },
  { content_key: 'partner_personal_data.title', language_code: 'he', content_value: 'נתוני בן/בת הזוג' },
  { content_key: 'partner_personal_data.title', language_code: 'en', content_value: 'Partner Personal Data' },
  
  { content_key: 'partner_personal_data.subtitle', language_code: 'ru', content_value: 'Заполните данные супруга/партнера' },
  { content_key: 'partner_personal_data.subtitle', language_code: 'he', content_value: 'מלא את פרטי בן/בת הזוג' },
  { content_key: 'partner_personal_data.subtitle', language_code: 'en', content_value: 'Fill in partner personal data' },
  
  { content_key: 'partner_personal_data.description', language_code: 'ru', content_value: 'Если у вас есть супруг(а) или партнер, который будет участвовать в кредите, заполните его данные' },
  { content_key: 'partner_personal_data.description', language_code: 'he', content_value: 'אם יש לך בן/בת זוג שישתתף בהלוואה, מלא את הפרטים שלו/ה' },
  { content_key: 'partner_personal_data.description', language_code: 'en', content_value: 'If you have a spouse or partner who will participate in the loan, fill in their details' },
  
  // Form Fields
  { content_key: 'partner_personal_data.field.first_name', language_code: 'ru', content_value: 'Имя супруга/партнера' },
  { content_key: 'partner_personal_data.field.first_name', language_code: 'he', content_value: 'שם פרטי של בן/בת הזוג' },
  { content_key: 'partner_personal_data.field.first_name', language_code: 'en', content_value: 'Partner First Name' },
  
  { content_key: 'partner_personal_data.field.last_name', language_code: 'ru', content_value: 'Фамилия супруга/партнера' },
  { content_key: 'partner_personal_data.field.last_name', language_code: 'he', content_value: 'שם משפחה של בן/בת הזוג' },
  { content_key: 'partner_personal_data.field.last_name', language_code: 'en', content_value: 'Partner Last Name' },
  
  { content_key: 'partner_personal_data.field.id_number', language_code: 'ru', content_value: 'Номер удостоверения личности супруга/партнера' },
  { content_key: 'partner_personal_data.field.id_number', language_code: 'he', content_value: 'מספר תעודת זהות של בן/בת הזוג' },
  { content_key: 'partner_personal_data.field.id_number', language_code: 'en', content_value: 'Partner ID Number' },
  
  { content_key: 'partner_personal_data.field.relationship', language_code: 'ru', content_value: 'Отношения с заемщиком' },
  { content_key: 'partner_personal_data.field.relationship', language_code: 'he', content_value: 'קשר עם הלווה' },
  { content_key: 'partner_personal_data.field.relationship', language_code: 'en', content_value: 'Relationship to Borrower' },
  
  { content_key: 'partner_personal_data.field.gender', language_code: 'ru', content_value: 'Пол супруга/партнера' },
  { content_key: 'partner_personal_data.field.gender', language_code: 'he', content_value: 'מגדר בן/בת הזוג' },
  { content_key: 'partner_personal_data.field.gender', language_code: 'en', content_value: 'Partner Gender' },
  
  // Dropdown Options - Relationship
  { content_key: 'partner_personal_data.dropdown.relationship.spouse', language_code: 'ru', content_value: 'Супруг(а)' },
  { content_key: 'partner_personal_data.dropdown.relationship.spouse', language_code: 'he', content_value: 'בן/בת זוג נשוי/ה' },
  { content_key: 'partner_personal_data.dropdown.relationship.spouse', language_code: 'en', content_value: 'Spouse' },
  
  { content_key: 'partner_personal_data.dropdown.relationship.partner', language_code: 'ru', content_value: 'Партнер' },
  { content_key: 'partner_personal_data.dropdown.relationship.partner', language_code: 'he', content_value: 'בן/בת זוג' },
  { content_key: 'partner_personal_data.dropdown.relationship.partner', language_code: 'en', content_value: 'Partner' },
  
  { content_key: 'partner_personal_data.dropdown.relationship.other', language_code: 'ru', content_value: 'Другое' },
  { content_key: 'partner_personal_data.dropdown.relationship.other', language_code: 'he', content_value: 'אחר' },
  { content_key: 'partner_personal_data.dropdown.relationship.other', language_code: 'en', content_value: 'Other' },
  
  // Dropdown Options - Gender
  { content_key: 'partner_personal_data.dropdown.gender.male', language_code: 'ru', content_value: 'Мужской' },
  { content_key: 'partner_personal_data.dropdown.gender.male', language_code: 'he', content_value: 'זכר' },
  { content_key: 'partner_personal_data.dropdown.gender.male', language_code: 'en', content_value: 'Male' },
  
  { content_key: 'partner_personal_data.dropdown.gender.female', language_code: 'ru', content_value: 'Женский' },
  { content_key: 'partner_personal_data.dropdown.gender.female', language_code: 'he', content_value: 'נקבה' },
  { content_key: 'partner_personal_data.dropdown.gender.female', language_code: 'en', content_value: 'Female' },
  
  // Validation Messages
  { content_key: 'partner_personal_data.validation.first_name_required', language_code: 'ru', content_value: 'Имя супруга/партнера обязательно' },
  { content_key: 'partner_personal_data.validation.first_name_required', language_code: 'he', content_value: 'שם פרטי של בן/בת הזוג הוא שדה חובה' },
  { content_key: 'partner_personal_data.validation.first_name_required', language_code: 'en', content_value: 'Partner first name is required' },
  
  { content_key: 'partner_personal_data.validation.last_name_required', language_code: 'ru', content_value: 'Фамилия супруга/партнера обязательна' },
  { content_key: 'partner_personal_data.validation.last_name_required', language_code: 'he', content_value: 'שם משפחה של בן/בת הזוג הוא שדה חובה' },
  { content_key: 'partner_personal_data.validation.last_name_required', language_code: 'en', content_value: 'Partner last name is required' },
  
  { content_key: 'partner_personal_data.validation.id_number_required', language_code: 'ru', content_value: 'Номер удостоверения личности супруга/партнера обязателен' },
  { content_key: 'partner_personal_data.validation.id_number_required', language_code: 'he', content_value: 'מספר תעודת זהות של בן/בת הזוג הוא שדה חובה' },
  { content_key: 'partner_personal_data.validation.id_number_required', language_code: 'en', content_value: 'Partner ID number is required' },
  
  { content_key: 'partner_personal_data.validation.relationship_required', language_code: 'ru', content_value: 'Выбор отношений обязателен' },
  { content_key: 'partner_personal_data.validation.relationship_required', language_code: 'he', content_value: 'בחירת קשר היא שדה חובה' },
  { content_key: 'partner_personal_data.validation.relationship_required', language_code: 'en', content_value: 'Relationship selection is required' },
  
  // Action Buttons
  { content_key: 'partner_personal_data.button.next', language_code: 'ru', content_value: 'Далее' },
  { content_key: 'partner_personal_data.button.next', language_code: 'he', content_value: 'הבא' },
  { content_key: 'partner_personal_data.button.next', language_code: 'en', content_value: 'Next' },
  
  { content_key: 'partner_personal_data.button.back', language_code: 'ru', content_value: 'Назад' },
  { content_key: 'partner_personal_data.button.back', language_code: 'he', content_value: 'חזור' },
  { content_key: 'partner_personal_data.button.back', language_code: 'en', content_value: 'Back' },
  
  { content_key: 'partner_personal_data.button.skip', language_code: 'ru', content_value: 'Пропустить данные партнера' },
  { content_key: 'partner_personal_data.button.skip', language_code: 'he', content_value: 'דלג על פרטי בן/בת הזוג' },
  { content_key: 'partner_personal_data.button.skip', language_code: 'en', content_value: 'Skip Partner Info' },
  
  // Help Text
  { content_key: 'partner_personal_data.help.relationship', language_code: 'ru', content_value: 'Выберите тип отношений с основным заемщиком' },
  { content_key: 'partner_personal_data.help.relationship', language_code: 'he', content_value: 'בחר את סוג הקשר עם הלווה הראשי' },
  { content_key: 'partner_personal_data.help.relationship', language_code: 'en', content_value: 'Select the type of relationship with the main borrower' },
  
  { content_key: 'partner_personal_data.help.optional', language_code: 'ru', content_value: 'Данные партнера необязательны, но могут улучшить условия кредита' },
  { content_key: 'partner_personal_data.help.optional', language_code: 'he', content_value: 'פרטי בן/בת הזוג אינם חובה, אך עשויים לשפר את תנאי ההלוואה' },
  { content_key: 'partner_personal_data.help.optional', language_code: 'en', content_value: 'Partner information is optional but may improve loan terms' }
];

async function executeSection4_1_5() {
  const client = await contentPool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting Section 4.1.5: Partner Personal Data Form implementation...');

    // Insert content items
    console.log('📝 Inserting 22 content items for partner_personal_data...');
    for (const item of section4_1_5_ContentItems) {
      await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [item.content_key, item.component_type, item.category, 'partner_personal_data', item.description, true, 1]
      );
    }

    // Insert translations
    console.log('🌐 Inserting 66 trilingual translations (22 items × 3 languages)...');
    for (const translation of section4_1_5_Translations) {
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
    console.log('✅ Section 4.1.5 implementation completed successfully!');
    console.log('📊 Summary:');
    console.log('   • 22 content items created for partner_personal_data');
    console.log('   • 66 trilingual translations added (RU/HE/EN)');
    console.log('   • Screen location: partner_personal_data');
    console.log('   • Components: partner forms, relationship dropdowns, validation, optional skip');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing Section 4.1.5:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  executeSection4_1_5()
    .then(() => {
      console.log('🎉 Section 4.1.5: Partner Personal Data Form implementation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to implement Section 4.1.5:', error);
      process.exit(1);
    });
}

module.exports = { executeSection4_1_5 };