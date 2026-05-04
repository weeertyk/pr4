"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, CloudRain, Compass, LoaderCircle, LogOut, Navigation, Shield, User } from "lucide-react"
import { getPlaceCategoryLabel } from "@/lib/travel/presentation"
import type { DestinationPlace } from "@/lib/travel/ui-types"
import { BottomNav } from "../bottom-nav"

interface DashboardScreenProps {
  userId: string
  onNavigate: (destination?: DestinationPlace) => void
  onTabChange: (tab: "home" | "map" | "safety" | "settings") => void
  onOpenRecovery: () => void
  onSignOut: () => Promise<void> | void
}

type RecommendationItem = {
  id: string
  name: string
  actionType: string
  reason: string
  score: number
  distanceMeters: number
  riskLevel: string
  category?: string
  latitude?: number
  longitude?: number
}

type NearbyPlace = {
  id: string
  name: string
  category: string
  distance_meters: number
  latitude: number
  longitude: number
}

type DashboardData = {
  city: string
  weatherCode: number | null
  recommendation: RecommendationItem | null
  alternatives: RecommendationItem[]
  nearbyPlaces: NearbyPlace[]
  latestEvent: {
    type: string
    description: string | null
  } | null
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} м`
  }

  return `${(distanceMeters / 1000).toFixed(1)} км`
}

function weatherText(weatherCode: number | null) {
  if (weatherCode == null) {
    return "ясно"
  }
  if (weatherCode >= 51 && weatherCode <= 99) {
    return "ожидаются осадки"
  }
  return "спокойная погода"
}

function actionLabel(actionType: string | undefined) {
  switch (actionType) {
    case "EAT":
      return "Лучшее место на ближайший час"
    case "VISIT":
      return "Следующая достойная остановка"
    case "REROUTE":
      return "Лучший ход прямо сейчас"
    default:
      return "Следующее действие"
  }
}

export function DashboardScreen({ userId, onNavigate, onTabChange, onOpenRecovery, onSignOut }: DashboardScreenProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadDashboard() {
      try {
        setIsLoading(true)
        setError(null)

        const [recommendationResponse, nearbyResponse, planResponse] = await Promise.all([
          fetch(`/api/recommendations/next?userId=${userId}`),
          fetch(`/api/places/nearby?lat=55.7539&lng=37.6208&limit=6`),
          fetch(`/api/trip-plan/today?userId=${userId}`),
        ])

        if (!recommendationResponse.ok || !nearbyResponse.ok) {
          throw new Error("Не удалось загрузить данные дня.")
        }

        const recommendationJson = await recommendationResponse.json()
        const nearbyJson = await nearbyResponse.json()
        const planJson = planResponse.ok ? await planResponse.json() : null

        if (!isActive) {
          return
        }

        setData({
          city: recommendationJson.context?.city ?? "Москва",
          weatherCode: recommendationJson.context?.weather_code ?? null,
          recommendation: recommendationJson.recommendation ?? null,
          alternatives: recommendationJson.alternatives ?? [],
          nearbyPlaces: nearbyJson.places ?? [],
          latestEvent: planJson?.latestEvent
            ? {
                type: planJson.latestEvent.type,
                description: planJson.latestEvent.description,
              }
            : null,
        })
      } catch (loadError) {
        if (!isActive) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : "Неизвестная ошибка.")
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isActive = false
    }
  }, [userId])

  const recommendation = data?.recommendation

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="travel-kicker">Сегодня</p>
            <h1 className="travel-title text-3xl font-semibold">{data?.city ?? "Город дня"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Держу ритм маршрута в фокусе и подсказываю следующее лучшее действие.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange("settings")}
              className="travel-panel flex h-11 w-11 items-center justify-center transition-colors hover:bg-muted"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              onClick={() => void onSignOut()}
              className="travel-panel flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Выйти"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="px-5 pb-4">
        <div className="travel-panel overflow-hidden">
          <div
            className="min-h-72 px-5 py-5 text-white"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(18,27,41,0.18), rgba(18,27,41,0.8)), url('/travel-hero.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {isLoading ? (
              <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <p className="text-sm text-white/80">Собираю лучший следующий шаг...</p>
              </div>
            ) : error ? (
              <div className="flex h-full min-h-72 flex-col justify-end gap-3">
                <p className="travel-kicker text-white/70">Требуется обновление</p>
                <h2 className="travel-title text-3xl font-semibold">Не удалось собрать рекомендации</h2>
                <p className="max-w-72 text-sm leading-6 text-white/80">{error}</p>
              </div>
            ) : recommendation ? (
              <div className="flex min-h-72 flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/35 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/80">
                    {actionLabel(recommendation.actionType)}
                  </span>
                  <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/85">
                    <CloudRain className="h-3.5 w-3.5" />
                    <span>{weatherText(data?.weatherCode ?? null)}</span>
                  </div>
                </div>

                <div className="max-w-72">
                  <h2 className="travel-title text-4xl font-semibold leading-tight">{recommendation.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/80">{recommendation.reason}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-white/85">
                    <span className="rounded-full border border-white/30 px-3 py-1">{formatDistance(recommendation.distanceMeters)}</span>
                    <span className="rounded-full border border-white/30 px-3 py-1">риск: {recommendation.riskLevel.toLowerCase()}</span>
                    <span className="rounded-full border border-white/30 px-3 py-1">оценка {recommendation.score}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        onNavigate({
                          id: recommendation.id,
                          name: recommendation.name,
                          category: recommendation.category ?? "PLACE",
                          latitude: recommendation.latitude ?? 55.7548,
                          longitude: recommendation.longitude ?? 37.6189,
                          distanceMeters: recommendation.distanceMeters,
                          reason: recommendation.reason,
                        })
                      }
                      className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
                    >
                      Открыть маршрут
                    </button>
                    <span className="text-sm text-white/75">ещё {data?.alternatives.length ?? 0} альтернатив</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-72 flex-col justify-end gap-3">
                <p className="travel-kicker text-white/70">Нет рекомендации</p>
                <h2 className="travel-title text-3xl font-semibold">Пока нет следующего действия</h2>
                <p className="max-w-72 text-sm leading-6 text-white/80">
                  Нужно обновить контекст поездки, чтобы собрать рекомендацию под текущую локацию.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="travel-kicker">Рядом</p>
            <h3 className="travel-title text-2xl font-semibold">Рядом и по делу</h3>
          </div>
          <button onClick={() => onTabChange("map")} className="text-sm text-muted-foreground">показать всё</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(data?.nearbyPlaces ?? []).slice(0, 4).map((place, index) => (
            <button
              key={place.id}
              onClick={() =>
                onNavigate({
                  id: place.id,
                  name: place.name,
                  category: place.category,
                  latitude: place.latitude,
                  longitude: place.longitude,
                  distanceMeters: place.distance_meters,
                })
              }
              className="travel-panel overflow-hidden text-left transition-transform hover:-translate-y-0.5"
            >
              <div
                className="h-28 w-full"
                style={{
                  backgroundImage:
                    `linear-gradient(180deg, rgba(14,19,30,0.08), rgba(14,19,30,0.42)), url('/travel-card.svg')`,
                  backgroundSize: "cover",
                  backgroundPosition: `${30 + index * 10}% center`,
                }}
              />
              <div className="p-3">
                <p className="font-medium">{place.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getPlaceCategoryLabel(place.category)} · {formatDistance(place.distance_meters)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pb-4">
        <button
          onClick={onOpenRecovery}
          className="travel-panel flex w-full items-start gap-3 p-4 text-left transition-transform hover:-translate-y-0.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="travel-kicker">Восстановление плана</p>
            <p className="font-medium">День изменился</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data?.latestEvent?.description ?? "Проверь обновлённый маршрут и прими новую версию плана."}
            </p>
          </div>
        </button>
      </section>

      <section className="px-5 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="travel-kicker">Быстрые действия</p>
            <h3 className="travel-title text-2xl font-semibold">Быстрый фокус</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onTabChange("map")} className="travel-panel p-4 text-left transition-transform hover:-translate-y-0.5">
            <Compass className="h-5 w-5 text-primary" />
            <p className="mt-5 font-medium">Открыть карту</p>
            <p className="mt-1 text-sm text-muted-foreground">посмотреть точки в радиусе</p>
          </button>
          <button onClick={() => onTabChange("safety")} className="travel-panel p-4 text-left transition-transform hover:-translate-y-0.5">
            <Shield className="h-5 w-5 text-secondary-foreground" />
            <p className="mt-5 font-medium">Проверить район</p>
            <p className="mt-1 text-sm text-muted-foreground">быстро оценить зону по риску</p>
          </button>
        </div>
      </section>

      <BottomNav activeTab="home" onTabChange={onTabChange} />
    </div>
  )
}
