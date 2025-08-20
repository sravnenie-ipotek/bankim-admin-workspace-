const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

// Database configuration for content database
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const section4_1_8_ContentItems = [
  // Page Structure
  { content_key: 'co_borrower_personal_data.title', component_type: 'text', category: 'heading', description: 'Co-borrower personal data form title' },
  { content_key: 'co_borrower_personal_data.subtitle', component_type: 'text', category: 'heading', description: 'Co-borrower form subtitle' },
  { content_key: 'co_borrower_personal_data.description', component_type: 'text', category: 'text', description: 'Co-borrower form description' },
  
  // Personal Information
  { content_key: 'co_borrower_personal_data.field.first_name', component_type: 'text', category: 'form', description: 'Co-borrower first name field' },
  { content_key: 'co_borrower_personal_data.field.last_name', component_type: 'text', category: 'form', description: 'Co-borrower last name field' },
  { content_key: 'co_borrower_personal_data.field.id_number', component_type: 'text', category: 'form', description: 'Co-borrower ID number field' },
  { content_key: 'co_borrower_personal_data.field.gender', component_type: 'text', category: 'form', description: 'Co-borrower gender field' },
  { content_key: 'co_borrower_personal_data.field.birth_date', component_type: 'text', category: 'form', description: 'Co-borrower birth date field' },
  { content_key: 'co_borrower_personal_data.field.relationship', component_type: 'text', category: 'form', description: 'Relationship to main borrower field' },
  
  // Contact Information
  { content_key: 'co_borrower_personal_data.field.phone_number', component_type: 'text', category: 'form', description: 'Co-borrower phone number field' },
  { content_key: 'co_borrower_personal_data.field.email', component_type: 'text', category: 'form', description: 'Co-borrower email field' },
  { content_key: 'co_borrower_personal_data.field.address', component_type: 'text', category: 'form', description: 'Co-borrower address field' },
  
  // Dropdown Options - Gender
  { content_key: 'co_borrower_personal_data.dropdown.gender.male', component_type: 'dropdown', category: 'form', description: 'Male gender option' },
  { content_key: 'co_borrower_personal_data.dropdown.gender.female', component_type: 'dropdown', category: 'form', description: 'Female gender option' },
  
  // Dropdown Options - Relationship
  { content_key: 'co_borrower_personal_data.dropdown.relationship.family_member', component_type: 'dropdown', category: 'form', description: 'Family member relationship option' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.friend', component_type: 'dropdown', category: 'form', description: 'Friend relationship option' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.business_partner', component_type: 'dropdown', category: 'form', description: 'Business partner relationship option' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.guarantor', component_type: 'dropdown', category: 'form', description: 'Guarantor relationship option' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.other', component_type: 'dropdown', category: 'form', description: 'Other relationship option' },
  
  // Validation Messages
  { content_key: 'co_borrower_personal_data.validation.first_name_required', component_type: 'text', category: 'validation', description: 'Co-borrower first name required validation' },
  { content_key: 'co_borrower_personal_data.validation.last_name_required', component_type: 'text', category: 'validation', description: 'Co-borrower last name required validation' },
  { content_key: 'co_borrower_personal_data.validation.id_number_required', component_type: 'text', category: 'validation', description: 'Co-borrower ID number required validation' },
  { content_key: 'co_borrower_personal_data.validation.phone_required', component_type: 'text', category: 'validation', description: 'Co-borrower phone required validation' },
  { content_key: 'co_borrower_personal_data.validation.email_format', component_type: 'text', category: 'validation', description: 'Co-borrower email format validation' },
  { content_key: 'co_borrower_personal_data.validation.relationship_required', component_type: 'text', category: 'validation', description: 'Relationship selection required validation' },
  
  // Action Buttons
  { content_key: 'co_borrower_personal_data.button.next', component_type: 'text', category: 'action', description: 'Next button text' },
  { content_key: 'co_borrower_personal_data.button.back', component_type: 'text', category: 'action', description: 'Back button text' },
  { content_key: 'co_borrower_personal_data.button.add_another', component_type: 'text', category: 'action', description: 'Add another co-borrower button' },
  { content_key: 'co_borrower_personal_data.button.skip', component_type: 'text', category: 'action', description: 'Skip co-borrower button' },
  
  // Help Text
  { content_key: 'co_borrower_personal_data.help.relationship_explanation', component_type: 'text', category: 'text', description: 'Relationship selection explanation' },
  { content_key: 'co_borrower_personal_data.help.multiple_co_borrowers', component_type: 'text', category: 'text', description: 'Multiple co-borrowers help text' }
];

const section4_1_8_Translations = [
  // Page Structure
  { content_key: 'co_borrower_personal_data.title', language_code: 'ru', content_value: 'Данные созаемщика' },
  { content_key: 'co_borrower_personal_data.title', language_code: 'he', content_value: 'נתוני לווה שותף' },
  { content_key: 'co_borrower_personal_data.title', language_code: 'en', content_value: 'Co-Borrower Personal Data' },
  
  { content_key: 'co_borrower_personal_data.subtitle', language_code: 'ru', content_value: 'Заполните данные дополнительного созаемщика' },
  { content_key: 'co_borrower_personal_data.subtitle', language_code: 'he', content_value: 'מלא את פרטי הלווה השותף הנוסף' },
  { content_key: 'co_borrower_personal_data.subtitle', language_code: 'en', content_value: 'Fill in additional co-borrower details' },
  
  { content_key: 'co_borrower_personal_data.description', language_code: 'ru', content_value: 'Добавление созаемщика может улучшить условия кредита и увеличить сумму займа' },
  { content_key: 'co_borrower_personal_data.description', language_code: 'he', content_value: 'הוספת לווה שותף עשויה לשפר את תנאי ההלוואה ולהגדיל את סכום ההלוואה' },
  { content_key: 'co_borrower_personal_data.description', language_code: 'en', content_value: 'Adding a co-borrower may improve loan terms and increase the loan amount' },
  
  // Personal Information
  { content_key: 'co_borrower_personal_data.field.first_name', language_code: 'ru', content_value: 'Имя созаемщика' },
  { content_key: 'co_borrower_personal_data.field.first_name', language_code: 'he', content_value: 'שם פרטי של הלווה השותף' },
  { content_key: 'co_borrower_personal_data.field.first_name', language_code: 'en', content_value: 'Co-Borrower First Name' },
  
  { content_key: 'co_borrower_personal_data.field.last_name', language_code: 'ru', content_value: 'Фамилия созаемщика' },
  { content_key: 'co_borrower_personal_data.field.last_name', language_code: 'he', content_value: 'שם משפחה של הלווה השותף' },
  { content_key: 'co_borrower_personal_data.field.last_name', language_code: 'en', content_value: 'Co-Borrower Last Name' },
  
  { content_key: 'co_borrower_personal_data.field.id_number', language_code: 'ru', content_value: 'Номер удостоверения личности созаемщика' },
  { content_key: 'co_borrower_personal_data.field.id_number', language_code: 'he', content_value: 'מספר תעודת זהות של הלווה השותף' },
  { content_key: 'co_borrower_personal_data.field.id_number', language_code: 'en', content_value: 'Co-Borrower ID Number' },
  
  { content_key: 'co_borrower_personal_data.field.gender', language_code: 'ru', content_value: 'Пол созаемщика' },
  { content_key: 'co_borrower_personal_data.field.gender', language_code: 'he', content_value: 'מגדר הלווה השותף' },
  { content_key: 'co_borrower_personal_data.field.gender', language_code: 'en', content_value: 'Co-Borrower Gender' },
  
  { content_key: 'co_borrower_personal_data.field.birth_date', language_code: 'ru', content_value: 'Дата рождения' },
  { content_key: 'co_borrower_personal_data.field.birth_date', language_code: 'he', content_value: 'תאריך לידה' },
  { content_key: 'co_borrower_personal_data.field.birth_date', language_code: 'en', content_value: 'Birth Date' },
  
  { content_key: 'co_borrower_personal_data.field.relationship', language_code: 'ru', content_value: 'Отношение к основному заемщику' },
  { content_key: 'co_borrower_personal_data.field.relationship', language_code: 'he', content_value: 'קשר ללווה הראשי' },
  { content_key: 'co_borrower_personal_data.field.relationship', language_code: 'en', content_value: 'Relationship to Main Borrower' },
  
  // Contact Information
  { content_key: 'co_borrower_personal_data.field.phone_number', language_code: 'ru', content_value: 'Номер телефона' },
  { content_key: 'co_borrower_personal_data.field.phone_number', language_code: 'he', content_value: 'מספר טלפון' },
  { content_key: 'co_borrower_personal_data.field.phone_number', language_code: 'en', content_value: 'Phone Number' },
  
  { content_key: 'co_borrower_personal_data.field.email', language_code: 'ru', content_value: 'Электронная почта' },
  { content_key: 'co_borrower_personal_data.field.email', language_code: 'he', content_value: 'דואר אלקטרוני' },
  { content_key: 'co_borrower_personal_data.field.email', language_code: 'en', content_value: 'Email Address' },
  
  { content_key: 'co_borrower_personal_data.field.address', language_code: 'ru', content_value: 'Адрес проживания' },
  { content_key: 'co_borrower_personal_data.field.address', language_code: 'he', content_value: 'כתובת מגורים' },
  { content_key: 'co_borrower_personal_data.field.address', language_code: 'en', content_value: 'Residential Address' },
  
  // Dropdown Options - Gender
  { content_key: 'co_borrower_personal_data.dropdown.gender.male', language_code: 'ru', content_value: 'Мужской' },
  { content_key: 'co_borrower_personal_data.dropdown.gender.male', language_code: 'he', content_value: 'זכר' },
  { content_key: 'co_borrower_personal_data.dropdown.gender.male', language_code: 'en', content_value: 'Male' },
  
  { content_key: 'co_borrower_personal_data.dropdown.gender.female', language_code: 'ru', content_value: 'Женский' },
  { content_key: 'co_borrower_personal_data.dropdown.gender.female', language_code: 'he', content_value: 'נקבה' },
  { content_key: 'co_borrower_personal_data.dropdown.gender.female', language_code: 'en', content_value: 'Female' },
  
  // Dropdown Options - Relationship
  { content_key: 'co_borrower_personal_data.dropdown.relationship.family_member', language_code: 'ru', content_value: 'Член семьи' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.family_member', language_code: 'he', content_value: 'בן/בת משפחה' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.family_member', language_code: 'en', content_value: 'Family Member' },
  
  { content_key: 'co_borrower_personal_data.dropdown.relationship.friend', language_code: 'ru', content_value: 'Друг' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.friend', language_code: 'he', content_value: 'חבר' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.friend', language_code: 'en', content_value: 'Friend' },
  
  { content_key: 'co_borrower_personal_data.dropdown.relationship.business_partner', language_code: 'ru', content_value: 'Деловой партнер' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.business_partner', language_code: 'he', content_value: 'שותף עסקי' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.business_partner', language_code: 'en', content_value: 'Business Partner' },
  
  { content_key: 'co_borrower_personal_data.dropdown.relationship.guarantor', language_code: 'ru', content_value: 'Поручитель' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.guarantor', language_code: 'he', content_value: 'ערב' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.guarantor', language_code: 'en', content_value: 'Guarantor' },
  
  { content_key: 'co_borrower_personal_data.dropdown.relationship.other', language_code: 'ru', content_value: 'Другое' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.other', language_code: 'he', content_value: 'אחר' },
  { content_key: 'co_borrower_personal_data.dropdown.relationship.other', language_code: 'en', content_value: 'Other' },
  
  // Validation Messages
  { content_key: 'co_borrower_personal_data.validation.first_name_required', language_code: 'ru', content_value: 'Имя созаемщика обязательно' },
  { content_key: 'co_borrower_personal_data.validation.first_name_required', language_code: 'he', content_value: 'שם פרטי של הלווה השותף הוא שדה חובה' },
  { content_key: 'co_borrower_personal_data.validation.first_name_required', language_code: 'en', content_value: 'Co-borrower first name is required' },
  
  { content_key: 'co_borrower_personal_data.validation.last_name_required', language_code: 'ru', content_value: 'Фамилия созаемщика обязательна' },
  { content_key: 'co_borrower_personal_data.validation.last_name_required', language_code: 'he', content_value: 'שם משפחה של הלווה השותף הוא שדה חובה' },
  { content_key: 'co_borrower_personal_data.validation.last_name_required', language_code: 'en', content_value: 'Co-borrower last name is required' },
  
  { content_key: 'co_borrower_personal_data.validation.id_number_required', language_code: 'ru', content_value: 'Номер удостоверения личности созаемщика обязателен' },
  { content_key: 'co_borrower_personal_data.validation.id_number_required', language_code: 'he', content_value: 'מספר תעודת זהות של הלווה השותף הוא שדה חובה' },
  { content_key: 'co_borrower_personal_data.validation.id_number_required', language_code: 'en', content_value: 'Co-borrower ID number is required' },
  
  { content_key: 'co_borrower_personal_data.validation.phone_required', language_code: 'ru', content_value: 'Номер телефона обязателен' },
  { content_key: 'co_borrower_personal_data.validation.phone_required', language_code: 'he', content_value: 'מספר טלפון הוא שדה חובה' },
  { content_key: 'co_borrower_personal_data.validation.phone_required', language_code: 'en', content_value: 'Phone number is required' },
  
  { content_key: 'co_borrower_personal_data.validation.email_format', language_code: 'ru', content_value: 'Введите корректный адрес электронной почты' },
  { content_key: 'co_borrower_personal_data.validation.email_format', language_code: 'he', content_value: 'הכנס כתובת דואר אלקטרוני תקינה' },
  { content_key: 'co_borrower_personal_data.validation.email_format', language_code: 'en', content_value: 'Enter a valid email address' },
  
  { content_key: 'co_borrower_personal_data.validation.relationship_required', language_code: 'ru', content_value: 'Выбор отношений обязателен' },
  { content_key: 'co_borrower_personal_data.validation.relationship_required', language_code: 'he', content_value: 'בחירת קשר היא שדה חובה' },
  { content_key: 'co_borrower_personal_data.validation.relationship_required', language_code: 'en', content_value: 'Relationship selection is required' },
  
  // Action Buttons
  { content_key: 'co_borrower_personal_data.button.next', language_code: 'ru', content_value: 'Далее' },
  { content_key: 'co_borrower_personal_data.button.next', language_code: 'he', content_value: 'הבא' },
  { content_key: 'co_borrower_personal_data.button.next', language_code: 'en', content_value: 'Next' },
  
  { content_key: 'co_borrower_personal_data.button.back', language_code: 'ru', content_value: 'Назад' },
  { content_key: 'co_borrower_personal_data.button.back', language_code: 'he', content_value: 'חזור' },
  { content_key: 'co_borrower_personal_data.button.back', language_code: 'en', content_value: 'Back' },
  
  { content_key: 'co_borrower_personal_data.button.add_another', language_code: 'ru', content_value: 'Добавить еще созаемщика' },
  { content_key: 'co_borrower_personal_data.button.add_another', language_code: 'he', content_value: 'הוסף לווה שותף נוסף' },
  { content_key: 'co_borrower_personal_data.button.add_another', language_code: 'en', content_value: 'Add Another Co-Borrower' },
  
  { content_key: 'co_borrower_personal_data.button.skip', language_code: 'ru', content_value: 'Пропустить созаемщика' },
  { content_key: 'co_borrower_personal_data.button.skip', language_code: 'he', content_value: 'דלג על לווה שותף' },
  { content_key: 'co_borrower_personal_data.button.skip', language_code: 'en', content_value: 'Skip Co-Borrower' },
  
  // Help Text
  { content_key: 'co_borrower_personal_data.help.relationship_explanation', language_code: 'ru', content_value: 'Укажите тип отношений между созаемщиком и основным заемщиком' },
  { content_key: 'co_borrower_personal_data.help.relationship_explanation', language_code: 'he', content_value: 'ציין את סוג הקשר בין הלווה השותף ללווה הראשי' },
  { content_key: 'co_borrower_personal_data.help.relationship_explanation', language_code: 'en', content_value: 'Specify the type of relationship between co-borrower and main borrower' },
  
  { content_key: 'co_borrower_personal_data.help.multiple_co_borrowers', language_code: 'ru', content_value: 'Вы можете добавить до 3 созаемщиков для улучшения условий кредита' },
  { content_key: 'co_borrower_personal_data.help.multiple_co_borrowers', language_code: 'he', content_value: 'ניתן להוסיף עד 3 לווים שותפים לשיפור תנאי ההלוואה' },
  { content_key: 'co_borrower_personal_data.help.multiple_co_borrowers', language_code: 'en', content_value: 'You can add up to 3 co-borrowers to improve loan terms' }
];

async function executeSection4_1_8() {
  const client = await contentPool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting Section 4.1.8: Co-Borrower Personal Data implementation...');

    // Insert content items
    console.log('📝 Inserting 31 content items for co_borrower_personal_data...');
    for (const item of section4_1_8_ContentItems) {
      await client.query(`
        INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [item.content_key, item.component_type, item.category, 'co_borrower_personal_data', item.description, true, 1]
      );
    }

    // Insert translations
    console.log('🌐 Inserting 93 trilingual translations (31 items × 3 languages)...');
    for (const translation of section4_1_8_Translations) {
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
    console.log('✅ Section 4.1.8 implementation completed successfully!');
    console.log('📊 Summary:');
    console.log('   • 31 content items created for co_borrower_personal_data');
    console.log('   • 93 trilingual translations added (RU/HE/EN)');
    console.log('   • Screen location: co_borrower_personal_data');
    console.log('   • Components: personal info, contact details, relationship types, multiple co-borrowers');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing Section 4.1.8:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute if run directly
if (require.main === module) {
  executeSection4_1_8()
    .then(() => {
      console.log('🎉 Section 4.1.8: Co-Borrower Personal Data implementation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to implement Section 4.1.8:', error);
      process.exit(1);
    });
}

module.exports = { executeSection4_1_8 };