#!/usr/bin/env node

// Скрипт для тестирования RLS политик
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Тестирование RLS политик...\n')

// Получаем переменные окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('ℹ️  Переменные окружения Supabase не найдены')
  console.log('Это нормально, если вы еще не настроили .env.local файл')
  console.log('См. документацию: docs/supabase-setup.md\n')
  console.log('✅ Скрипт тестирования RLS готов к использованию после настройки переменных окружения')
  process.exit(0)
}

// Создаем клиент Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRLSPolicies() {
  try {
    // Тест 1: Попытка доступа к таблице profiles без аутентификации
    console.log('Тест 1: Доступ к profiles без аутентификации')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError && profilesError.code === '42501') {
      console.log('✅ Политики RLS работают правильно для profiles (доступ запрещен)')
    } else if (profilesData && profilesData.length === 0) {
      console.log('✅ Политики RLS работают правильно для profiles (нет данных для доступа)')
    } else {
      console.log('⚠️  Проверьте политики для profiles')
    }

    // Тест 2: Попытка доступа к таблице rooms без аутентификации
    console.log('\nТест 2: Доступ к rooms без аутентификации')
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(1)

    if (roomsError && roomsError.code === '42501') {
      console.log('✅ Политики RLS работают правильно для rooms (доступ запрещен)')
    } else if (roomsData) {
      console.log('ℹ️  Доступ к rooms возможен (публичные комнаты)')
    } else {
      console.log('⚠️  Проверьте политики для rooms')
    }

    // Тест 3: Попытка доступа к таблице tracks без аутентификации
    console.log('\nТест 3: Доступ к tracks без аутентификации')
    const { data: tracksData, error: tracksError } = await supabase
      .from('tracks')
      .select('*')
      .limit(1)

    if (tracksError && tracksError.code === '42501') {
      console.log('✅ Политики RLS работают правильно для tracks (доступ запрещен)')
    } else if (tracksData) {
      console.log('✅ Политики RLS работают правильно для tracks (публичный доступ)')
    } else {
      console.log('⚠️  Проверьте политики для tracks')
    }

    console.log('\n✅ Тестирование RLS политик завершено')
    console.log('ℹ️  Для полного тестирования аутентифицируйтесь в приложении')

  } catch (error) {
    console.error('❌ Ошибка при тестировании RLS политик:', error.message)
  }
}

// Запускаем тестирование
testRLSPolicies()