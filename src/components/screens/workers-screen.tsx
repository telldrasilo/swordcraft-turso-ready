/**
 * Workers Screen
 * Главный экран управления рабочими (контейнер)
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Zap, BedDouble, AlertTriangle, Heart, Clock, AlertCircle, HandHeart
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  useGameStore, 
  useFormattedResources,
  useWorkerHireCost,
  workerClassData,
  type WorkerClass
} from '@/store'
import { BALANCE } from '@/hooks/use-game-loop'
import { 
  TooltipProvider,
  RichTooltip,
  StatTooltip,
  InfoTooltip 
} from '@/components/ui/game-tooltip'
import { 
  getWorkerClassInfo,
  statsInfo
} from '@/data/game-tooltips'
import { cn } from '@/lib/utils'

// Импорт вынесенных компонентов
import {
  classIcons,
  WorkerCard,
  BuildingCard,
  AssignmentModal,
  FireConfirmModal,
} from '@/components/workers'

export function WorkersScreen() {
  const resources = useFormattedResources()
  const workers = useGameStore((state) => state.workers)
  const maxWorkers = useGameStore((state) => state.maxWorkers)
  const buildings = useGameStore((state) => state.buildings)
  const hireWorker = useGameStore((state) => state.hireWorker)
  const assignWorker = useGameStore((state) => state.assignWorker)
  const fireWorker = useGameStore((state) => state.fireWorker)
  const canGetEmergencyHelp = useGameStore((state) => state.canGetEmergencyHelp)
  const getEmergencyHelp = useGameStore((state) => state.getEmergencyHelp)
  
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [workerToFire, setWorkerToFire] = useState<Worker | null>(null)
  
  const availableSlots = maxWorkers - workers.length
  const needsEmergencyHelp = canGetEmergencyHelp()
  
  // Расчёт возврата при увольнении (с fallback для старых сохранений)
  const getRefund = (worker: { class: WorkerClass; hireCost?: number }) => {
    const hireCost = worker.hireCost ?? workerClassData[worker.class]?.baseCost ?? 50
    return Math.floor(hireCost * 0.3)
  }
  
  // Статистика по рабочим
  const stats = useMemo(() => {
    const working = workers.filter(w => w.assignment !== 'rest' && w.stamina > BALANCE.AUTO_REST_THRESHOLD).length
    const resting = workers.filter(w => w.assignment === 'rest').length
    const exhausted = workers.filter(w => w.stamina <= BALANCE.AUTO_REST_THRESHOLD).length
    const avgStamina = workers.length > 0 
      ? Math.round(workers.reduce((sum, w) => sum + (w.stamina / w.stats.stamina_max) * 100, 0) / workers.length)
      : 0
    
    return { working, resting, exhausted, avgStamina }
  }, [workers])
  
  // Классы рабочих для найма
  const availableClasses: WorkerClass[] = [
    'apprentice', 'loggers', 'mason', 'miner', 'smelter', 'blacksmith', 'merchant', 'enchanter'
  ]
  
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500" />
              Рабочие
            </h2>
            <InfoTooltip
              title="Управление рабочими"
              content="Нанимайте рабочих и назначайте их на здания. Специалисты работают эффективнее на своих специальностях. Наведите на элементы для подробностей."
              icon="help"
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-stone-800/50 border-stone-600">
              <Users className="w-3 h-3 mr-1" />
              {workers.length}/{maxWorkers} рабочих
            </Badge>
          </div>
        </div>
        
        {/* Быстрая статистика */}
        {workers.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            <RichTooltip title="Работают" description="Рабочие, которые активно производят ресурсы." side="bottom">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-900/20 border border-green-600/30 cursor-help">
                <Zap className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-lg font-bold text-green-400">{stats.working}</p>
                  <p className="text-xs text-stone-500">Работают</p>
                </div>
              </div>
            </RichTooltip>
            <RichTooltip title="Отдыхают" description="Рабочие восстанавливают стамину." side="bottom">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-900/20 border border-blue-600/30 cursor-help">
                <BedDouble className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-lg font-bold text-blue-400">{stats.resting}</p>
                  <p className="text-xs text-stone-500">Отдыхают</p>
                </div>
              </div>
            </RichTooltip>
            <RichTooltip title="Истощены" description="Рабочие с критически низкой стаминой. Нужен отдых." side="bottom">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-900/20 border border-red-600/30 cursor-help">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-lg font-bold text-red-400">{stats.exhausted}</p>
                  <p className="text-xs text-stone-500">Истощены</p>
                </div>
              </div>
            </RichTooltip>
            <RichTooltip title="Средняя стамина" description="Средний уровень выносливости всех рабочих." side="bottom">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-900/20 border border-amber-600/30 cursor-help">
                <Heart className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-lg font-bold text-amber-400">{stats.avgStamina}%</p>
                  <p className="text-xs text-stone-500">Сред. стамина</p>
                </div>
              </div>
            </RichTooltip>
          </div>
        )}
        
        {/* Производственные здания */}
        <Card className="card-medieval">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-amber-200 flex items-center gap-2 text-base">
                <Clock className="w-4 h-4" />
                Производственные здания
              </CardTitle>
              <InfoTooltip
                title="Здания"
                content="Назначайте рабочих на здания для добычи ресурсов. Каждое здание требует определённое количество рабочих для полной эффективности."
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {buildings.map((building) => (
                <BuildingCard 
                  key={building.id} 
                  building={building}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Текущие рабочие */}
        <Card className="card-medieval">
          <CardHeader>
            <CardTitle className="text-amber-200">Ваши рабочие</CardTitle>
            <CardDescription>
              Управляйте назначениями • Наведите для подсказок • Рабочие автоматически уходят на отдых при истощении
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workers.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>У вас пока нет рабочих</p>
                <p className="text-sm">Наймите первого работника ниже</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {workers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      onAssign={() => setSelectedWorker(worker)}
                      onFire={() => setWorkerToFire(worker)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Экстренная помощь при банкротстве */}
        {needsEmergencyHelp && (
          <Card className="card-medieval border-red-600/50 bg-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-800/50 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Критическое положение!
                  </h3>
                  <p className="text-stone-300 mb-4">
                    У вас нет рабочих и недостаточно золота для найма. Гильдия предлагает помощь начинающим кузнецам.
                  </p>
                  <div className="bg-stone-800/50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-stone-400">Вы получите:</p>
                    <ul className="text-sm text-green-400 mt-1 space-y-1">
                      <li>• <strong>75</strong> золота</li>
                      <li>• <strong>1 ученика</strong> бесплатно</li>
                    </ul>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-green-100"
                    onClick={() => getEmergencyHelp()}
                  >
                    <HandHeart className="w-4 h-4 mr-2" />
                    Получить помощь
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Найм новых рабочих */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-stone-300 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              Нанять рабочего
            </h3>
            <InfoTooltip
              title="Найм рабочих"
              content="Стоимость растёт с каждым нанятым рабочим того же класса. Специалисты дороже, но эффективнее на своих работах."
            />
            {availableSlots === 0 && (
              <Badge variant="outline" className="text-red-400 border-red-600 ml-2">
                Нет свободных слотов
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableClasses.map((workerClass, index) => {
              const classData = workerClassData[workerClass]
              const classInfo = getWorkerClassInfo(workerClass)
              const Icon = classIcons[workerClass]
              const cost = useWorkerHireCost(workerClass)
              const canAfford = resources.gold >= cost
              const canHire = availableSlots > 0 && canAfford
              
              return (
                <motion.div
                  key={workerClass}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    'card-medieval transition-all',
                    canHire && 'hover:border-amber-600/50'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <RichTooltip
                          title={classData.name}
                          description={classInfo?.description}
                          details={classInfo?.tips}
                          icon="👤"
                          side="right"
                        >
                          <div className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center cursor-help',
                            'bg-stone-800/50'
                          )}>
                            <Icon className="w-7 h-7 text-amber-400" />
                          </div>
                        </RichTooltip>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-stone-200">{classData.name}</h4>
                            <Badge variant="outline" className="text-xs text-amber-400 border-amber-600">
                              {classInfo?.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-500 mb-3">{classData.description}</p>
                          
                          {/* Характеристики */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {Object.entries(classData.baseStats).map(([stat, value]) => {
                              const statInfo = statsInfo[stat as keyof typeof statsInfo]
                              return (
                                <StatTooltip key={stat} statName={stat}>
                                  <div className="flex items-center gap-2 cursor-help">
                                    <span className="text-sm">{statInfo?.icon}</span>
                                    <span className="text-xs text-stone-400">
                                      {statInfo?.name || stat}
                                    </span>
                                    <span className="text-xs text-stone-300 ml-auto">{value}</span>
                                  </div>
                                </StatTooltip>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-700/50">
                        <div className="flex items-center gap-1 text-amber-400">
                          <span className="text-lg font-bold">{cost}</span>
                          <span className="text-xs">золота</span>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100"
                          disabled={!canHire}
                          onClick={() => hireWorker(workerClass)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Нанять
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
        
        {/* Подсказки */}
        <Card className="card-medieval bg-stone-800/30">
          <CardContent className="p-4">
            <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
              💡 Советы по управлению
            </h4>
            <ul className="text-xs text-stone-500 space-y-1">
              <li>• <strong>Специалисты</strong> (дровосеки, шахтёры) работают на 25-30% эффективнее и медленнее устают на своих работах</li>
              <li>• При истощении стамины рабочий <strong>автоматически уходит на отдых</strong></li>
              <li>• Восстановление занимает ~3-5 минут в зависимости от выносливости</li>
              <li>• Набирайте больше рабочих для <strong>непрерывного производства</strong> (пока одни отдыхают, другие работают)</li>
              <li>• Наводите на элементы интерфейса для получения подсказок</li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Модальное окно назначения */}
        <AnimatePresence>
          {selectedWorker && (
            <AssignmentModal
              worker={selectedWorker}
              buildings={buildings}
              onClose={() => setSelectedWorker(null)}
              onAssign={(assignment) => assignWorker(selectedWorker.id, assignment)}
            />
          )}
        </AnimatePresence>
        
        {/* Модальное окно подтверждения увольнения */}
        <AnimatePresence>
          {workerToFire && (
            <FireConfirmModal
              worker={workerToFire}
              refund={getRefund(workerToFire)}
              onClose={() => setWorkerToFire(null)}
              onConfirm={() => {
                fireWorker(workerToFire.id)
                setWorkerToFire(null)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
