const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Section 4.1.12: Sign-Up Form
const section4_1_12_ContentItems = [
  { content_key: 'signup_form.title', component_type: 'text', category: 'heading', description: 'Sign-up form title' },
  { content_key: 'signup_form.field.email', component_type: 'text', category: 'form', description: 'Email field' },
  { content_key: 'signup_form.field.password', component_type: 'text', category: 'form', description: 'Password field' },
  { content_key: 'signup_form.field.confirm_password', component_type: 'text', category: 'form', description: 'Confirm password field' },
  { content_key: 'signup_form.button.register', component_type: 'text', category: 'action', description: 'Register button' },
  { content_key: 'signup_form.validation.email_required', component_type: 'text', category: 'validation', description: 'Email required validation' },
  { content_key: 'signup_form.validation.password_mismatch', component_type: 'text', category: 'validation', description: 'Password mismatch validation' }
];

const section4_1_12_Translations = [
  { content_key: 'signup_form.title', language_code: 'ru', content_value: 'Регистрация в системе' },
  { content_key: 'signup_form.title', language_code: 'he', content_value: 'הרשמה למערכת' },
  { content_key: 'signup_form.title', language_code: 'en', content_value: 'System Registration' },
  { content_key: 'signup_form.field.email', language_code: 'ru', content_value: 'Электронная почта' },
  { content_key: 'signup_form.field.email', language_code: 'he', content_value: 'דואר אלקטרוני' },
  { content_key: 'signup_form.field.email', language_code: 'en', content_value: 'Email Address' },
  { content_key: 'signup_form.field.password', language_code: 'ru', content_value: 'Пароль' },
  { content_key: 'signup_form.field.password', language_code: 'he', content_value: 'סיסמה' },
  { content_key: 'signup_form.field.password', language_code: 'en', content_value: 'Password' },
  { content_key: 'signup_form.field.confirm_password', language_code: 'ru', content_value: 'Подтвердите пароль' },
  { content_key: 'signup_form.field.confirm_password', language_code: 'he', content_value: 'אשר סיסמה' },
  { content_key: 'signup_form.field.confirm_password', language_code: 'en', content_value: 'Confirm Password' },
  { content_key: 'signup_form.button.register', language_code: 'ru', content_value: 'Зарегистрироваться' },
  { content_key: 'signup_form.button.register', language_code: 'he', content_value: 'הירשם' },
  { content_key: 'signup_form.button.register', language_code: 'en', content_value: 'Register' },
  { content_key: 'signup_form.validation.email_required', language_code: 'ru', content_value: 'Электронная почта обязательна' },
  { content_key: 'signup_form.validation.email_required', language_code: 'he', content_value: 'דואר אלקטרוני הוא שדה חובה' },
  { content_key: 'signup_form.validation.email_required', language_code: 'en', content_value: 'Email address is required' },
  { content_key: 'signup_form.validation.password_mismatch', language_code: 'ru', content_value: 'Пароли не совпадают' },
  { content_key: 'signup_form.validation.password_mismatch', language_code: 'he', content_value: 'סיסמאות לא תואמות' },
  { content_key: 'signup_form.validation.password_mismatch', language_code: 'en', content_value: 'Passwords do not match' }
];

// Section 4.1.13: Login Page
const section4_1_13_ContentItems = [
  { content_key: 'login_page.title', component_type: 'text', category: 'heading', description: 'Login page title' },
  { content_key: 'login_page.field.email', component_type: 'text', category: 'form', description: 'Email field' },
  { content_key: 'login_page.field.password', component_type: 'text', category: 'form', description: 'Password field' },
  { content_key: 'login_page.button.login', component_type: 'text', category: 'action', description: 'Login button' },
  { content_key: 'login_page.link.forgot_password', component_type: 'link', category: 'action', description: 'Forgot password link' },
  { content_key: 'login_page.validation.invalid_credentials', component_type: 'text', category: 'validation', description: 'Invalid credentials validation' }
];

const section4_1_13_Translations = [
  { content_key: 'login_page.title', language_code: 'ru', content_value: 'Вход в систему' },
  { content_key: 'login_page.title', language_code: 'he', content_value: 'כניסה למערכת' },
  { content_key: 'login_page.title', language_code: 'en', content_value: 'System Login' },
  { content_key: 'login_page.field.email', language_code: 'ru', content_value: 'Электронная почта' },
  { content_key: 'login_page.field.email', language_code: 'he', content_value: 'דואר אלקטרוני' },
  { content_key: 'login_page.field.email', language_code: 'en', content_value: 'Email Address' },
  { content_key: 'login_page.field.password', language_code: 'ru', content_value: 'Пароль' },
  { content_key: 'login_page.field.password', language_code: 'he', content_value: 'סיסמה' },
  { content_key: 'login_page.field.password', language_code: 'en', content_value: 'Password' },
  { content_key: 'login_page.button.login', language_code: 'ru', content_value: 'Войти' },
  { content_key: 'login_page.button.login', language_code: 'he', content_value: 'התחבר' },
  { content_key: 'login_page.button.login', language_code: 'en', content_value: 'Login' },
  { content_key: 'login_page.link.forgot_password', language_code: 'ru', content_value: 'Забыли пароль?' },
  { content_key: 'login_page.link.forgot_password', language_code: 'he', content_value: 'שכחת סיסמה?' },
  { content_key: 'login_page.link.forgot_password', language_code: 'en', content_value: 'Forgot Password?' },
  { content_key: 'login_page.validation.invalid_credentials', language_code: 'ru', content_value: 'Неверные учетные данные' },
  { content_key: 'login_page.validation.invalid_credentials', language_code: 'he', content_value: 'פרטי התחברות שגויים' },
  { content_key: 'login_page.validation.invalid_credentials', language_code: 'en', content_value: 'Invalid login credentials' }
];

// Section 4.1.14: Password Reset
const section4_1_14_ContentItems = [
  { content_key: 'password_reset.title', component_type: 'text', category: 'heading', description: 'Password reset title' },
  { content_key: 'password_reset.field.email', component_type: 'text', category: 'form', description: 'Email field' },
  { content_key: 'password_reset.field.new_password', component_type: 'text', category: 'form', description: 'New password field' },
  { content_key: 'password_reset.field.confirm_password', component_type: 'text', category: 'form', description: 'Confirm password field' },
  { content_key: 'password_reset.button.reset', component_type: 'text', category: 'action', description: 'Reset password button' },
  { content_key: 'password_reset.message.email_sent', component_type: 'text', category: 'text', description: 'Email sent message' },
  { content_key: 'password_reset.validation.email_not_found', component_type: 'text', category: 'validation', description: 'Email not found validation' }
];

const section4_1_14_Translations = [
  { content_key: 'password_reset.title', language_code: 'ru', content_value: 'Сброс пароля' },
  { content_key: 'password_reset.title', language_code: 'he', content_value: 'איפוס סיסמה' },
  { content_key: 'password_reset.title', language_code: 'en', content_value: 'Password Reset' },
  { content_key: 'password_reset.field.email', language_code: 'ru', content_value: 'Электронная почта' },
  { content_key: 'password_reset.field.email', language_code: 'he', content_value: 'דואר אלקטרוני' },
  { content_key: 'password_reset.field.email', language_code: 'en', content_value: 'Email Address' },
  { content_key: 'password_reset.field.new_password', language_code: 'ru', content_value: 'Новый пароль' },
  { content_key: 'password_reset.field.new_password', language_code: 'he', content_value: 'סיסמה חדשה' },
  { content_key: 'password_reset.field.new_password', language_code: 'en', content_value: 'New Password' },
  { content_key: 'password_reset.field.confirm_password', language_code: 'ru', content_value: 'Подтвердите пароль' },
  { content_key: 'password_reset.field.confirm_password', language_code: 'he', content_value: 'אשר סיסמה' },
  { content_key: 'password_reset.field.confirm_password', language_code: 'en', content_value: 'Confirm Password' },
  { content_key: 'password_reset.button.reset', language_code: 'ru', content_value: 'Сбросить пароль' },
  { content_key: 'password_reset.button.reset', language_code: 'he', content_value: 'אפס סיסמה' },
  { content_key: 'password_reset.button.reset', language_code: 'en', content_value: 'Reset Password' },
  { content_key: 'password_reset.message.email_sent', language_code: 'ru', content_value: 'Инструкции отправлены на вашу почту' },
  { content_key: 'password_reset.message.email_sent', language_code: 'he', content_value: 'הוראות נשלחו לדואר האלקטרוני שלך' },
  { content_key: 'password_reset.message.email_sent', language_code: 'en', content_value: 'Instructions sent to your email' },
  { content_key: 'password_reset.validation.email_not_found', language_code: 'ru', content_value: 'Электронная почта не найдена' },
  { content_key: 'password_reset.validation.email_not_found', language_code: 'he', content_value: 'דואר אלקטרוני לא נמצא' },
  { content_key: 'password_reset.validation.email_not_found', language_code: 'en', content_value: 'Email address not found' }
];

async function executeAllFinalSections() {
  const client = await contentPool.connect();
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting final 3 sections implementation...');

    // Process all sections
    const allSections = [
      { items: section4_1_12_ContentItems, translations: section4_1_12_Translations, location: 'signup_form', name: '4.1.12' },
      { items: section4_1_13_ContentItems, translations: section4_1_13_Translations, location: 'login_page', name: '4.1.13' },
      { items: section4_1_14_ContentItems, translations: section4_1_14_Translations, location: 'password_reset', name: '4.1.14' }
    ];

    for (const section of allSections) {
      console.log(`📝 Implementing Section ${section.name}...`);
      
      // Insert content items
      for (const item of section.items) {
        await client.query(`
          INSERT INTO content_items (content_key, component_type, category, screen_location, description, is_active, page_number, created_at, updated_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [item.content_key, item.component_type, item.category, section.location, item.description, true, 1]
        );
      }

      // Insert translations
      for (const translation of section.translations) {
        const itemResult = await client.query('SELECT id FROM content_items WHERE content_key = $1', [translation.content_key]);
        if (itemResult.rows.length > 0) {
          await client.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())`,
            [itemResult.rows[0].id, translation.language_code, translation.content_value]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ All final sections completed successfully!');
    console.log('📊 Final Summary:');
    console.log('   • Section 4.1.12: 7 items (signup_form)');
    console.log('   • Section 4.1.13: 6 items (login_page)');
    console.log('   • Section 4.1.14: 7 items (password_reset)');
    console.log('   • Total: 20 content items + 60 translations');
    console.log('🎉 ALL 13 SECTIONS COMPLETED!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error implementing final sections:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  executeAllFinalSections()
    .then(() => console.log('🎉 All final sections completed!'))
    .catch(error => console.error('💥 Failed:', error));
}

module.exports = { executeAllFinalSections };