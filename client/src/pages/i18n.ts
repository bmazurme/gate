import { intl } from '../i18n/intl';

export const { t, Message } = intl.createMessages({
  // Login
  login_title: { en: 'Sign in', ru: 'Вход' },
  login_email_placeholder: { en: 'Email', ru: 'Email' },
  login_password_placeholder: { en: 'Password', ru: 'Пароль' },
  login_submit: { en: 'Sign in', ru: 'Войти' },
  login_no_account: {
    en: 'No account? <link>Register</link>',
    ru: 'Нет аккаунта? <link>Зарегистрироваться</link>',
  },

  // Register
  register_title: { en: 'Create account', ru: 'Создать аккаунт' },
  register_email_placeholder: { en: 'Email', ru: 'Email' },
  register_name_placeholder: { en: 'Name (optional)', ru: 'Имя (необязательно)' },
  register_password_placeholder: {
    en: 'Password (min 8 characters)',
    ru: 'Пароль (минимум 8 символов)',
  },
  register_submit: { en: 'Sign up', ru: 'Зарегистрироваться' },
  register_have_account: {
    en: 'Already have an account? <link>Sign in</link>',
    ru: 'Уже есть аккаунт? <link>Войти</link>',
  },

  // Dashboard
  dashboard_active_subscription: {
    en: 'Active subscription: {plan}',
    ru: 'Активная подписка: {plan}',
  },
  dashboard_price_valid_until: {
    en: '{price} {currency} · valid until {date}',
    ru: '{price} {currency} · действует до {date}',
  },
  dashboard_view_details: { en: 'View details', ru: 'Подробнее' },
  dashboard_no_subscription: {
    en: "You don't have an active subscription yet.",
    ru: 'У вас пока нет активной подписки.',
  },
  dashboard_choose_plan: { en: 'Choose a plan', ru: 'Выбрать тариф' },

  // Plans
  plans_current_label: { en: 'Current', ru: 'Текущий' },
  plans_duration_days: { en: '{days} days', ru: '{days} дней' },
  plans_current_plan_button: { en: 'Current plan', ru: 'Текущий тариф' },
  plans_switch_button: {
    en: 'Cancel current plan to switch',
    ru: 'Отмените текущий тариф для перехода',
  },
  plans_switch_tooltip: {
    en: 'Cancel your current plan first to switch',
    ru: 'Сначала отмените текущий тариф, чтобы перейти на другой',
  },
  plans_subscribe_button: { en: 'Subscribe', ru: 'Подписаться' },

  // Plans admin
  plans_admin_column_plan: { en: 'Plan', ru: 'Тариф' },
  plans_admin_column_price: { en: 'Price', ru: 'Цена' },
  plans_admin_column_duration: { en: 'Duration', ru: 'Длительность' },
  plans_admin_edit_button: { en: 'Edit', ru: 'Редактировать' },
  plans_admin_not_found: { en: 'Plan not found', ru: 'Тариф не найден' },

  // Subscriptions (list)
  subscriptions_column_plan: { en: 'Plan', ru: 'Тариф' },
  subscriptions_column_status: { en: 'Status', ru: 'Статус' },
  subscriptions_column_price: { en: 'Price', ru: 'Цена' },
  subscriptions_column_valid_until: { en: 'Valid until', ru: 'Действует до' },
  subscriptions_details_button: { en: 'Details', ru: 'Подробнее' },

  // Subscription detail
  subscription_detail_not_found: { en: 'Subscription not found', ru: 'Подписка не найдена' },
  subscription_detail_price: { en: '{price} {currency}', ru: '{price} {currency}' },
  subscription_detail_start: { en: 'Start: {date}', ru: 'Начало: {date}' },
  subscription_detail_end: { en: 'End: {date}', ru: 'Окончание: {date}' },
  subscription_detail_cancel: { en: 'Cancel subscription', ru: 'Отменить подписку' },
  subscription_detail_edit: { en: 'Edit', ru: 'Редактировать' },
  subscription_detail_payments_title: { en: 'Payments', ru: 'Платежи' },
  payments_column_amount: { en: 'Amount', ru: 'Сумма' },
  payments_column_status: { en: 'Status', ru: 'Статус' },
  payments_column_provider: { en: 'Provider', ru: 'Провайдер' },
  payments_column_date: { en: 'Date', ru: 'Дата' },

  // Subscription edit
  subscription_edit_plan_label: { en: 'Plan', ru: 'Тариф' },
  subscription_edit_price_label: { en: 'Price', ru: 'Цена' },
  subscription_edit_save: { en: 'Save changes', ru: 'Сохранить' },
  subscription_edit_invalid_price: {
    en: 'Enter a price greater than 0',
    ru: 'Введите цену больше 0',
  },

  // Users
  users_column_email: { en: 'Email', ru: 'Email' },
  users_column_name: { en: 'Name', ru: 'Имя' },
  users_column_registered: { en: 'Registered', ru: 'Зарегистрирован' },
  users_column_roles: { en: 'Role', ru: 'Роль' },
  users_column_status: { en: 'Status', ru: 'Статус' },
  users_role_admin: { en: 'Admin', ru: 'Админ' },
  users_status_blocked: { en: 'Blocked', ru: 'Заблокирован' },
  users_status_active: { en: 'Active', ru: 'Активен' },
  users_edit_button: { en: 'Edit', ru: 'Редактировать' },

  // User edit
  user_edit_not_found: { en: 'User not found', ru: 'Пользователь не найден' },
  user_edit_email_label: { en: 'Email', ru: 'Email' },
  user_edit_self_notice: {
    en: 'You cannot change your own roles or blocked status.',
    ru: 'Вы не можете изменить собственные роли или статус блокировки.',
  },
  user_edit_admin_switch: { en: 'Admin role', ru: 'Роль администратора' },
  user_edit_blocked_switch: { en: 'Blocked', ru: 'Заблокирован' },

  // Profile
  profile_not_found: { en: 'Not found', ru: 'Не найдено' },
  profile_email_label: { en: 'Email', ru: 'Email' },
  profile_name_label: { en: 'Name', ru: 'Имя' },
  profile_registered_label: { en: 'Registered', ru: 'Зарегистрирован' },
  profile_subscription_active: { en: 'Subscription active', ru: 'Подписка активна' },
  profile_plan_valid_until: {
    en: 'Plan: {plan} · valid until {date}',
    ru: 'Тариф: {plan} · действует до {date}',
  },
  profile_cancel_subscription: { en: 'Cancel subscription', ru: 'Отменить подписку' },
  profile_no_subscription: {
    en: "You don't have an active subscription yet.",
    ru: 'У вас пока нет активной подписки.',
  },

  // Access demo
  access_demo_description: {
    en: "Test access to content depending on your current subscription tier. Each button calls a separate protected backend endpoint (`/access-demo/...`).",
    ru: "Проверка доступа к контенту в зависимости от текущего тарифа подписки. Каждая кнопка дёргает отдельный защищённый эндпоинт backend'а (`/access-demo/...`).",
  },
  access_demo_basic_description: {
    en: 'Available to subscribers of the basic, extended, and max plans',
    ru: 'Доступен подписчикам тарифов basic, extended и max',
  },
  access_demo_extended_description: {
    en: 'Available to subscribers of the extended and max plans',
    ru: 'Доступен подписчикам тарифов extended и max',
  },
  access_demo_max_description: {
    en: 'Available only to subscribers of the max plan',
    ru: 'Доступен только подписчикам тарифа max',
  },
  access_demo_test_button: { en: 'Test access', ru: 'Проверить доступ' },
  access_demo_granted_title: { en: 'Access granted', ru: 'Доступ разрешён' },
  access_demo_denied_title: { en: 'Access denied', ru: 'Доступ запрещён' },
  access_demo_by_plan_title: { en: 'Access by subscription plan', ru: 'Доступ по тарифу подписки' },
  access_demo_by_role_title: { en: 'Access by role', ru: 'Доступ по роли' },
  access_demo_role_description: {
    en: 'Test access to content depending on your account role. Each button calls a separate protected backend endpoint (`/access-demo/role/...`).',
    ru: "Проверка доступа к контенту в зависимости от роли аккаунта. Каждая кнопка дёргает отдельный защищённый эндпоинт backend'а (`/access-demo/role/...`).",
  },
  access_demo_role_user_label: { en: 'User', ru: 'Пользователь' },
  access_demo_role_user_description: {
    en: 'Available to every authenticated account',
    ru: 'Доступен любому авторизованному аккаунту',
  },
  access_demo_role_admin_label: { en: 'Admin', ru: 'Администратор' },
  access_demo_role_admin_description: {
    en: 'Available only to accounts with the admin role',
    ru: 'Доступен только аккаунтам с ролью администратора',
  },

  // Not found
  not_found_title: { en: '404', ru: '404' },
  not_found_subtitle: { en: 'Page not found', ru: 'Страница не найдена' },
  not_found_go_home: { en: 'Go home', ru: 'На главную' },
});

export type MessageKey = Parameters<typeof t>[0];
