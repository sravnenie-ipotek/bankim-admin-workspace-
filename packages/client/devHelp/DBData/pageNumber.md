# Page Numbering Strategy for BankIM Content

## 🎯 Goal
Provide a **single, authoritative mapping** between Confluence page numbers (e.g., `2`, `7.1`) and the database `screen_location` values defined in **`devHelp/SystemAnalyse/procceessesPagesInDB.md`**. This mapping will later be used to populate the new `page_number` column in `content_items` and to power user-search by page number.

## 🔍 Analysis
1. **Source of truth** for functional page order is the Confluence page:  
   <https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/5472277/BANKIMONLINE>
2. **Database conventions** for each process already exist in `procceessesPagesInDB.md` (do NOT edit that file).  
   – It lists valid `screen_location` identifiers and their migration status.
3. **Observation**: The same logical page number *repeats* across services. Example: page `2` is the calculator step for mortgage **and** mortgage-refi.
4. **Decision**: Store the *local* Confluence number (no service prefix) in `page_number`; the combination `(service_type, page_number)` is therefore unique.
5. **Scope** (phase 1): Only top-level core steps **2, 4, 7, 11** for all four services. Sub-pages (e.g., `7.1`) will be handled in phase 2.

## 🗂️ Complete Enumeration (All Confluence Rows)

Below tables reproduce **every numbered row** from the Confluence BANKIMONLINE master page.  
`screen_location` values come from `procceessesPagesInDB.md` (or **TBD** if content not yet in DB).

### 📑 Legend
* **TBD** – screen_location not yet created or unidentified  
* *(shared)* – same screen_location used by multiple services

---

### 🏠 Услуга 1 – Рассчитать ипотеку (Mortgage Calculation)
| # | Page Title (RU) | Confluence Section | screen_location |
|---|-----------------|--------------------|-----------------|
| 1 | Главная страница | Home / Main | `home_page` *(shared)* |
| 1.1 | Главная. Сайд навигация | Sidebar | `sidebar` *(shared)* |
| 1.2 | Главная. Сайд навигация под-меню | Sidebar submenu | `sidebar_submenu` *(shared)* |
| 2 | Калькулятор Ипотеки | Calculator | `mortgage_step1` |
| 3 | Ввод номера телефона | Phone input | `phone_verification` *(shared)* |
| 3.1 | Ввод кода | SMS code | `phone_code_verification` *(shared)* |
| 4 | Анкета личных данных | Personal data form | `mortgage_step2` |
| 5 | Анкета партнера. Личные данные | Partner personal | `partner_personal_data` *(TBD)* |
| 6 | Анкета партнера. Доходы | Partner income | `partner_income_data` *(TBD)* |
| 7 | Анкета доходов. Наёмный работник | Income form | `mortgage_step3` |
| 7.1 | Добавление источника дохода | Add income source | `additional_income_source` *(TBD)* |
| 7.2 | Добавление доп источника дохода | Add extra income | `extra_income_source` *(TBD)* |
| 7.3 | Добавление долгового обязательства | Add debt obligation | `debt_obligations` *(TBD)* |
| 8 | Личные данные созаемщика | Co-borrower personal | `co_borrower_personal` *(TBD)* |
| 9 | Доходы созаемщика | Co-borrower income | `co_borrower_income` *(TBD)* |
| 10 | Экран загрузки | Loading screen | `loading_screen` *(TBD)* |
| 11 | Выбор программ ипотеки | Program selection | `mortgage_step4` |
| 11.1 | Детали банка. Описание | Bank details – desc | `bank_details_description` *(TBD)* |
| 11.2 | Детали банка. Условия | Bank details – cond | `bank_details_conditions` *(TBD)* |
| 12 | Регистрация в ЛК по телефону | Register by phone | `register_phone` *(TBD)* |
| 12.1 | Регистрация по Email | Register by email | `register_email` *(TBD)* |
| 13 | Форма входа | Login form | `login_form` *(TBD)* |
| 13.1 | Восстановить пароль SMS | Reset pwd SMS | `reset_pwd_sms` *(TBD)* |
| 13.2 | Форма входа Email | Login email | `login_email` *(TBD)* |
| 14 | Восстановить пароль | Reset pwd | `reset_pwd` *(TBD)* |
| 14.1 | Проверка SMS | Reset pwd SMS check | `reset_pwd_sms_check` *(TBD)* |
| 14.2 | Новый пароль | New password | `reset_pwd_new` *(TBD)* |
| 14.3 | Пароль восстановлен | Password ok | `reset_pwd_done` *(TBD)* |
| 14.4 | Восстановить пароль Email | Reset pwd email | `reset_pwd_email` *(TBD)* |

---

### 🏠 Услуга 2 – Рефинансирование ипотеки (Mortgage-Refi)
| # | Page Title (RU) | Confluence Section | screen_location |
|---|-----------------|--------------------|-----------------|
| 1 | Главная страница | Home | `home_page` *(shared)* |
| 1.1 | Главная. Сайд навигация | Sidebar | `sidebar` *(shared)* |
| 1.2 | Главная. Сайд навигация под-меню | Sidebar submenu | `sidebar_submenu` *(shared)* |
| 2 | Рефинансирование ипотеки | Calculator | `refinance_credit_1` |
| 2.1 | Уменьшение ипотеки | Refi decrease | `mortgage_reduction` *(TBD)* |
| 2.2 | Увеличение ипотеки | Refi increase | `mortgage_increase` *(TBD)* |
| 3 | Ввод номера телефона | Phone input | `phone_verification` *(shared)* |
| 3.1 | Ввод кода | SMS code | `phone_code_verification` *(shared)* |
| 4 | Анкета личных данных | Personal data | `refinance_credit_2` |
| 5 | Анкета партнера. Личные данные | Partner personal | `partner_personal_data` *(TBD)* |
| 6 | Анкета партнера. Доходы | Partner income | `partner_income_data` *(TBD)* |
| 7 | Анкета доходов. Наёмный работник | Income form | `refinance_credit_3` |
| 7.1 | Добавление источника дохода | Add income source | `additional_income_source` *(TBD)* |
| 7.2 | Добавление доп источника дохода | Add extra income | `extra_income_source` *(TBD)* |
| 7.3 | Добавление долгового обязательства | Add debt obligation | `debt_obligations` *(TBD)* |
| 8 | Личные данные созаемщика | Co-borrower personal | `co_borrower_personal` *(TBD)* |
| 9 | Доходы созаемщика | Co-borrower income | `co_borrower_income` *(TBD)* |
| 10 | Экран загрузки | Loading screen | `loading_screen` *(TBD)* |
| 11 | Выбор программ ипотеки | Program selection | `mortgage_step4` *(shared)* |
| 11.1 | Детали банка. Описание | Bank desc | `bank_details_description` *(TBD)* |
| 11.2 | Детали банка. Условия | Bank cond | `bank_details_conditions` *(TBD)* |
| 12 | Регистрация | Register phone | `register_phone` *(TBD)* |
| 12.1 | Регистрация Email | Register email | `register_email` *(TBD)* |
| 13 | Форма входа | Login form | `login_form` *(TBD)* |
| 13.1 | Восстановить пароль SMS | Reset pwd SMS | `reset_pwd_sms` *(TBD)* |
| 13.2 | Форма входа Email | Login email | `login_email` *(TBD)* |
| 14 | Восстановить пароль | Reset pwd | `reset_pwd` *(TBD)* |
| 14.1 | Проверка SMS | Reset pwd SMS check | `reset_pwd_sms_check` *(TBD)* |
| 14.2 | Новый пароль | New password | `reset_pwd_new` *(TBD)* |
| 14.3 | Пароль восстановлен | Password ok | `reset_pwd_done` *(TBD)* |
| 14.4 | Восстановить пароль Email | Reset pwd email | `reset_pwd_email` *(TBD)* |

---

*(Additional tables for Услуга 3, Услуга 4, Login flows, Forgot-password scenarios, Personal cabinet, Payments, Settings, etc., follow the same structure but are omitted here for brevity. They should be appended below once corresponding `screen_location` identifiers are confirmed in `procceessesPagesInDB.md`.)

---

### 💳 Услуга 3 – Рассчитать кредит (Calculate Credit)
| # | Page Title (RU) | Confluence Section | screen_location |
|---|-----------------|--------------------|-----------------|
| 1 | Главная страница | Home | `home_page` *(shared)* |
| 1.1 | Сайд навигация | Sidebar | `sidebar` *(shared)* |
| 1.2 | Сайд навигация под меню | Sidebar submenu | `sidebar_submenu` *(shared)* |
| 2 | Расчет кредита | Calculator | `credit_step1` *(TBD)* |
| 2.1 | Кредит на ремонт | Renovation credit | `credit_renovation` *(TBD)* |
| 3 | Ввод номера телефона | Phone input | `phone_verification` *(shared)* |
| 3.1 | Ввод кода | SMS code | `phone_code_verification` *(shared)* |
| 4 | Анкета личных данных | Personal data | `credit_step2` *(TBD)* |
| 5 | Анкета личных данных партнера | Partner personal | `credit_partner_personal` *(TBD)* |
| 6 | Анкета Партнера. Доходы | Partner income | `credit_partner_income` *(TBD)* |
| 7 | Анкета доходов | Income form | `credit_step3` *(TBD)* |
| 7.1 | Добавление источника дохода | Add income source | `credit_additional_income` *(TBD)* |
| 7.2 | Добавление доп источника дохода | Add extra income | `credit_extra_income` *(TBD)* |
| 7.3 | Добавление долгового обязательства | Add debt obligation | `credit_debt_obligations` *(TBD)* |
| 8 | Личные данные созаемщика | Co-borrower personal | `credit_co_borrower_personal` *(TBD)* |
| 9 | Анкета созаемщика Доходы | Co-borrower income | `credit_co_borrower_income` *(TBD)* |
| 10 | Экран загрузки | Loading screen | `credit_loading_screen` *(TBD)* |
| 11 | Выбор программ для кредита | Program selection | `credit_step4` *(TBD)* |
| 12 | Регистрация по номеру телефона | Register phone | `register_phone` *(shared)* |
| 12.1 | Регистрация по Email | Register email | `register_email` *(shared)* |

---

### 💳 Услуга 4 – Рефинансировать кредит (Credit Refinancing)
| # | Page Title (RU) | Confluence Section | screen_location |
|---|-----------------|--------------------|-----------------|
| 1 | Главная страница | Home | `home_page` *(shared)* |
| 1.1 | Главная. Сайд навигация | Sidebar | `sidebar` *(shared)* |
| 1.2 | Главная. Сайд навигация под-меню | Sidebar submenu | `sidebar_submenu` *(shared)* |
| 2 | Рефинансирование кредита | Refi calculator | `refinance_credit_1` *(shared)* |
| 2.2 | Подтверждение удаления кредита | Deletion confirm | `credit_deletion_confirmation` *(TBD)* |
| 3 | Ввод номера телефона | Phone input | `phone_verification` *(shared)* |
| 3.1 | Ввод кода | SMS code | `phone_code_verification` *(shared)* |
| 4 | Анкета личных данных | Personal data | `refinance_credit_2` *(shared)* |
| 5 | Анкета личных данных партнера | Partner personal | `credit_refi_partner_personal` *(TBD)* |
| 6 | Анкета партнера. Доходы | Partner income | `credit_refi_partner_income` *(TBD)* |
| 7 | Анкета доходов. Наёмный работник | Income form | `refinance_credit_3` *(shared)* |
| 7.1 | Добавление источника дохода | Add income source | `credit_refi_additional_income` *(TBD)* |
| 7.2 | Добавление доп. источника дохода | Add extra income | `credit_refi_extra_income` *(TBD)* |
| 7.3 | Добавление долгового обязательства | Add debt obligation | `credit_refi_debt_obligations` *(TBD)* |
| 8 | Личные данные созаемщика | Co-borrower personal | `credit_refi_co_borrower_personal` *(TBD)* |
| 9 | Доходы созаемщика | Co-borrower income | `credit_refi_co_borrower_income` *(TBD)* |
| 10 | Экран загрузки | Loading screen | `credit_refi_loading_screen` *(TBD)* |
| 11 | Выбор программ кредита | Program selection | `refinance_credit_4` |
| 11.1 | Детали банка. Описание | Bank desc | `credit_refi_bank_description` *(TBD)* |
| 11.2 | Детали банка. Условия | Bank cond | `credit_refi_bank_conditions` *(TBD)* |
| 12 | Регистрация | Register phone | `register_phone` *(shared)* |
| 12.1 | Регистрация Email | Register email | `register_email` *(shared)* |
| 13 | Форма входа страница | Login form | `login_form` *(shared)* |
| 13.1 | Восстановить пароль. Проверка SMS | Reset pwd SMS | `reset_pwd_sms` *(shared)* |
| 13.2 | Форма входа по email | Login email | `login_email` *(shared)* |
| 14 | Восстановить пароль | Reset pwd | `reset_pwd` *(shared)* |
| 14.1 | Восстановить пароль. Проверка SMS | Reset pwd SMS check | `reset_pwd_sms_check` *(shared)* |
| 14.2 | Восстановить пароль. Выбор нового пароля | New password | `reset_pwd_new` *(shared)* |
| 14.3 | Пароль успешно восстановлен | Password ok | `reset_pwd_done` *(shared)* |
| 14.4 | Восстановить пароль по Email | Reset pwd email | `reset_pwd_email` *(shared)* |

---

## 🔐 Вход / Login Flows
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 8 | Форма входа страница | Login page | `login_form` *(shared)* |
| 8.1 | Подтверждение SMS | SMS confirm | `login_sms_confirm` *(TBD)* |

## 🔑 Сценарии «Забыли пароль» (Forgot-Password)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 9 | Восстановить пароль страницы | Reset pwd page | `reset_pwd` *(shared)* |
| 9.1 | Проверка SMS | Reset pwd SMS | `reset_pwd_sms_check` *(shared)* |
| 9.2 | Выбор нового пароля | New password | `reset_pwd_new` *(shared)* |
| 9.3 | Пароль успешно восстановлен | Password ok | `reset_pwd_done` *(shared)* |

---

## 🏠 Личный кабинет клиента (Personal Cabinet)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 16 | Личный кабинет | Dashboard | `cabinet_dashboard` *(TBD)* |
| 17 | Анкета ост. вопросы – Личные данные | Remaining Q – personal | `cabinet_remaining_personal` *(TBD)* |
| 17.1 | Анкета ост. вопросы – Личные данные – Созаемщик | Remaining Q – personal co-borrower | `cabinet_remaining_personal_co` *(TBD)* |
| 18 | Анкета ост. вопросы – Доходы | Remaining Q – income | `cabinet_remaining_income` *(TBD)* |
| 18.1 | Анкета ост. вопросы – Доходы – Созаемщик | Remaining Q – income co-borrower | `cabinet_remaining_income_co` *(TBD)* |
| 19 | Документы | Documents | `cabinet_docs` *(TBD)* |
| 19.1 | Загрузить документ | Upload doc | `cabinet_doc_upload` *(TBD)* |
| 19.2 | Кредитный договор | Loan contract | `cabinet_loan_contract` *(TBD)* |
| 20 | Заявка принята в обработку | Application accepted | `cabinet_app_accepted` *(TBD)* |
| 21 | Выбор программ окончательный расчет | Final program selection | `cabinet_final_programs` *(TBD)* |
| 21.4 | Детали Банка – Описание | Bank desc | `cabinet_bank_desc` *(TBD)* |
| 21.5 | Детали Банка – Условия | Bank cond | `cabinet_bank_cond` *(TBD)* |
| 21.6 | Редактировать Условия | Edit cond. | `cabinet_edit_conditions` *(TBD)* |
| 22 | Предложение | Offer | `cabinet_offer` *(TBD)* |
| 23 | Оплата услуги | Payment | `cabinet_payment` *(TBD)* |
| 24 | Подтверждение оплаты | Payment confirm | `cabinet_payment_ok` *(TBD)* |
| 25 | Выбор банка подтверждение | Bank confirmation | `cabinet_bank_confirm` *(TBD)* |
| 26 | Назначить встречу в банке | Set meeting | `cabinet_set_meeting` *(TBD)* |
| 27 | Подтверждение встречи | Meeting ok | `cabinet_meeting_ok` *(TBD)* |
| 32 | Выход | Logout | `cabinet_logout` *(TBD)* |

---

## 💰 Платежи (Payments)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 28 | Платежи | Payments main | `payments_main` *(TBD)* |
| 28.1 | История транзакции | Payment history | `payments_history` *(TBD)* |
| 28.2 | Добавить карту | Add card | `payments_add_card` *(TBD)* |
| 28.3 | Удалить карту | Delete card | `payments_del_card` *(TBD)* |

---

## 🗂️ Персональные данные (Personal Data section)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 29 | Персональные данные | Personal data main | `personal_data_main` *(TBD)* |
| 29.1 | Личные данные все поля | All fields | `personal_data_all` *(TBD)* |
| 29.2 | Доходы все поля | Income fields | `personal_data_income` *(TBD)* |
| 29.3 | Личные данные – Созаемщики | All fields – co-borrower | `personal_data_all_co` *(TBD)* |
| 29.4 | Доходы все поля – Созаемщики | Income fields co-borrower | `personal_data_income_co` *(TBD)* |

---

## 📊 Мои услуги (My Services)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 30 | Мои Услуги | My services main | `my_services_main` *(TBD)* |
| 30.1 | Расчет Ипотеки | Mortgage calc | `my_services_mortgage` *(TBD)* |
| 30.2 | Рефинансирование Ипотеки | Mortgage refi | `my_services_mortgage_refi` *(TBD)* |
| 30.3 | Расчет Кредита | Credit calc | `my_services_credit` *(TBD)* |
| 30.4 | Рефинансирование Кредита | Credit refi | `my_services_credit_refi` *(TBD)* |
| 30.5 | Использовать данные созаемщика | Use co-borrower data | `my_services_use_co` *(TBD)* |

---

## ⚙️ Настройки (Settings)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 31 | Настройки | Settings main | `settings_main` *(TBD)* |
| 31.1 | Изменить Имя | Change name | `settings_change_name` *(TBD)* |
| 31.2 | Загрузить Фото профиля | Upload avatar | `settings_upload_avatar` *(TBD)* |
| 31.3 | Изменить Пароль | Change pwd | `settings_change_pwd` *(TBD)* |
| 31.4 | Изменить Телефон | Change phone | `settings_change_phone` *(TBD)* |
| 31.5 | Проверка телефона | Phone verify | `settings_phone_verify` *(TBD)* |
| 31.6 | Изменить Email | Change email | `settings_change_email` *(TBD)* |
| 31.7 | Проверка Email | Email verify | `settings_email_verify` *(TBD)* |
| 31.8 | Добавить Email | Add email | `settings_add_email` *(TBD)* |
| 31.9 | Верификация Email | Email validation | `settings_email_validation` *(TBD)* |

---

## 👥 Добавление созаемщиков (Add Co-Borrowers)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 33 | Добавление созаемщиков | Add co-borrowers main | `add_co_borrowers_main` *(TBD)* |
| 33.1 | Добавление созаемщиков – Доходы | Co-borrowers income | `add_co_borrowers_income` *(TBD)* |

---

## 🔔 Уведомление (Notification)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 35 | Уведомление | Notification | `notification_page` *(TBD)* |

---

## 📜 Политика и Польз. соглашение (Policies)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 36 | Политика конфиденциальности | Privacy policy | `privacy_policy` *(TBD)* |
| 37 | Пользовательское соглашение | Terms of use | `terms_of_use` *(TBD)* |

---

## 🚫 Ошибка 404 (Error 404)
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 15 | Ошибка 404 | 404 page | `error_404` *(TBD)* |

---

## 💬 Чат
| # | Page Title (RU) | Section | screen_location |
|---|-----------------|---------|-----------------|
| 38 | Мессенджер | Chat | `chat_messenger` *(TBD)* |
