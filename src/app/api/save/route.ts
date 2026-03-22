/**
 * API для сохранения и загрузки игры
 *
 * POST /api/save - сохранить игру
 * GET /api/save - загрузить игру
 * DELETE /api/save - удалить сохранение (сбросить прогресс)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Демо-игрок для разработки (без авторизации)
const DEMO_PLAYER_ID = 'demo-player'

// ================================
// GET - Загрузка сохранения
// ================================
export async function GET(request: NextRequest) {
  try {
    const playerId = request.headers.get('x-player-id') || DEMO_PLAYER_ID

    const save = await db.gameSave.findUnique({
      where: { playerId },
    })

    if (!save) {
      // Создаём новое сохранение с начальными данными
      const newSave = await createNewSave(playerId)
      console.log('[Save API] Created new save for:', playerId)
      return NextResponse.json({
        success: true,
        data: formatSaveData(newSave),
        isNew: true,
      })
    }

    console.log('[Save API] Loaded save for:', playerId)
    return NextResponse.json({
      success: true,
      data: formatSaveData(save),
      isNew: false,
    })
  } catch (error) {
    console.error('[Save API] Load error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load save' },
      { status: 500 }
    )
  }
}

// ================================
// POST - Сохранение игры
// ================================
export async function POST(request: NextRequest) {
  try {
    const playerId = request.headers.get('x-player-id') || DEMO_PLAYER_ID
    const body = await request.json()

    // Валидация данных
    const validatedData = validateSaveData(body)

    // Сохраняем (upsert - создаёт или обновляет)
    const save = await db.gameSave.upsert({
      where: { playerId },
      update: {
        level: validatedData.player.level,
        experience: validatedData.player.experience,
        fame: validatedData.player.fame,
        resources: JSON.stringify(validatedData.resources),
        statistics: JSON.stringify(validatedData.statistics),
        workers: JSON.stringify(validatedData.workers),
        buildings: JSON.stringify(validatedData.buildings),
        maxWorkers: validatedData.maxWorkers,
        activeCraft: JSON.stringify(validatedData.activeCraft),
        activeRefining: JSON.stringify(validatedData.activeRefining),
        weaponInventory: JSON.stringify(validatedData.weaponInventory),
        unlockedRecipes: JSON.stringify(validatedData.unlockedRecipes),
        recipeSources: JSON.stringify(validatedData.recipeSources),
        unlockedEnchantments: JSON.stringify(validatedData.unlockedEnchantments),
        guild: JSON.stringify(validatedData.guild),
        knownAdventurers: JSON.stringify(validatedData.knownAdventurers || []),
        orders: JSON.stringify(validatedData.orders),
        tutorial: JSON.stringify(validatedData.tutorial),
        playTime: validatedData.playTime || 0,
        saveVersion: validatedData.saveVersion || 2,
      },
      create: {
        playerId,
        level: validatedData.player.level,
        experience: validatedData.player.experience,
        fame: validatedData.player.fame,
        resources: JSON.stringify(validatedData.resources),
        statistics: JSON.stringify(validatedData.statistics),
        workers: JSON.stringify(validatedData.workers),
        buildings: JSON.stringify(validatedData.buildings),
        maxWorkers: validatedData.maxWorkers,
        activeCraft: JSON.stringify(validatedData.activeCraft),
        activeRefining: JSON.stringify(validatedData.activeRefining),
        weaponInventory: JSON.stringify(validatedData.weaponInventory),
        unlockedRecipes: JSON.stringify(validatedData.unlockedRecipes),
        recipeSources: JSON.stringify(validatedData.recipeSources),
        unlockedEnchantments: JSON.stringify(validatedData.unlockedEnchantments),
        guild: JSON.stringify(validatedData.guild),
        knownAdventurers: JSON.stringify(validatedData.knownAdventurers || []),
        orders: JSON.stringify(validatedData.orders),
        tutorial: JSON.stringify(validatedData.tutorial),
        playTime: validatedData.playTime || 0,
      },
    })

    console.log(`[Save API] Saved for player ${playerId}`)

    return NextResponse.json({
      success: true,
      savedAt: save.updatedAt,
    })
  } catch (error) {
    console.error('[Save API] Save error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save' },
      { status: 500 }
    )
  }
}

// ================================
// DELETE - Удаление сохранения (сброс)
// ================================
export async function DELETE(request: NextRequest) {
  try {
    const playerId = request.headers.get('x-player-id') || DEMO_PLAYER_ID

    // Удаляем сохранение
    await db.gameSave.delete({
      where: { playerId },
    })

    // Удаляем историю
    await db.saveHistory.deleteMany({
      where: { gameSaveId: playerId },
    })

    console.log(`[Save API] Deleted save for player ${playerId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Save API] Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete save' },
      { status: 500 }
    )
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

function formatSaveData(save: any) {
  return {
    ...save,
    resources: safeJsonParse(save.resources, {}),
    statistics: safeJsonParse(save.statistics, {}),
    workers: safeJsonParse(save.workers, []),
    buildings: safeJsonParse(save.buildings, []),
    activeCraft: safeJsonParse(save.activeCraft, {}),
    activeRefining: safeJsonParse(save.activeRefining, {}),
    weaponInventory: safeJsonParse(save.weaponInventory, { weapons: [] }),
    unlockedRecipes: safeJsonParse(save.unlockedRecipes, {
      weaponRecipes: [],
      refiningRecipes: [],
    }),
    recipeSources: safeJsonParse(save.recipeSources, []),
    unlockedEnchantments: safeJsonParse(save.unlockedEnchantments, []),
    guild: safeJsonParse(save.guild, {}),
    knownAdventurers: safeJsonParse(save.knownAdventurers, []),
    orders: safeJsonParse(save.orders, {}),
    tutorial: safeJsonParse(save.tutorial, { isActive: true, currentStep: 0 }),
  }
}

function safeJsonParse(str: string, fallback: any) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

async function createNewSave(playerId: string) {
  const initialResources = {
    gold: 100,
    wood: 20,
    stone: 10,
    iron: 5,
    coal: 5,
    copper: 0,
    tin: 0,
    silver: 0,
    goldOre: 0,
    mithril: 0,
    soulEssence: 0,
    planks: 0,
    stoneBlocks: 0,
    copperIngot: 0,
    tinIngot: 0,
    bronzeIngot: 0,
    ironIngot: 0,
    steelIngot: 0,
    silverIngot: 0,
    goldIngot: 0,
    mithrilIngot: 0,
  }

  const initialStatistics = {
    totalCrafts: 0,
    totalRefines: 0,
    totalGoldEarned: 0,
    totalWorkersHired: 0,
    playTime: 0,
    weaponsSold: 0,
    recipesUnlocked: 6,
    ordersCompleted: 0,
    weaponsSacrificed: 0,
    enchantmentsApplied: 0,
  }

  const initialGuild = {
    level: 1,
    glory: 0,
    adventurers: [],
    activeExpeditions: [],
    recoveryQuests: [],
    history: [],
    adventurerRefreshAt: Date.now(),
  }

  const save = await db.gameSave.create({
    data: {
      playerId,
      level: 1,
      experience: 0,
      fame: 0,
      resources: JSON.stringify(initialResources),
      statistics: JSON.stringify(initialStatistics),
      workers: '[]',
      buildings: '[]',
      maxWorkers: 3,
      activeCraft: '{}',
      activeRefining: '{}',
      weaponInventory: '{"weapons": []}',
      unlockedRecipes:
        '{"weaponRecipes": ["sword_iron", "dagger_iron", "sword_bronze", "dagger_bronze", "sword_copper", "dagger_copper"], "refiningRecipes": []}',
      recipeSources: '[]',
      unlockedEnchantments: '[]',
      guild: JSON.stringify(initialGuild),
      knownAdventurers: '[]',
      orders: '{}',
      tutorial:
        '{"isActive": true, "currentStep": 0, "skipped": false, "completedSteps": []}',
    },
  })

  return save
}

function validateSaveData(data: any) {
  return {
    player: {
      level: Math.max(1, Number(data.player?.level) || 1),
      experience: Math.max(0, Number(data.player?.experience) || 0),
      fame: Math.max(0, Number(data.player?.fame) || 0),
    },
    resources: data.resources || {},
    statistics: data.statistics || {},
    workers: data.workers || [],
    buildings: data.buildings || [],
    maxWorkers: Math.max(1, Number(data.maxWorkers) || 3),
    activeCraft: data.activeCraft || {},
    activeRefining: data.activeRefining || {},
    weaponInventory: data.weaponInventory || { weapons: [] },
    unlockedRecipes: data.unlockedRecipes || { weaponRecipes: [], refiningRecipes: [] },
    recipeSources: data.recipeSources || [],
    unlockedEnchantments: data.unlockedEnchantments || [],
    guild: data.guild || {},
    knownAdventurers: data.knownAdventurers || [],
    orders: data.orders || {},
    tutorial: data.tutorial || { isActive: true, currentStep: 0 },
    playTime: Math.max(0, Number(data.playTime) || 0),
    saveVersion: Number(data.saveVersion) || 2,
  }
}
