"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Clock, LoaderCircle, MapPin, Navigation, Volume2 } from "lucide-react"
import { MapLibreMap } from "@/components/travel/maplibre-map"
import { getRouteProviderLabel } from "@/lib/travel/presentation"
import type { DestinationPlace } from "@/lib/travel/ui-types"

interface NavigationScreenProps {
  onBack: () => void
  origin: {
    lat: number
    lng: number
  }
  destination: DestinationPlace
}

type RouteStep = {
  instruction: string
  distance: number
  street: string
}

type RouteData = {
  provider: string
  geometry: Array<[number, number]>
  summary: {
    distanceMeters: number
    durationSeconds: number
  }
  steps: RouteStep[]
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} м`
  }

  return `${(distanceMeters / 1000).toFixed(1)} км`
}

function formatDuration(durationSeconds: number) {
  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60))

  if (totalMinutes < 60) {
    return `${totalMinutes} мин`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`
}

export function NavigationScreen({ onBack, origin, destination }: NavigationScreenProps) {
  const [route, setRoute] = useState<RouteData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  useEffect(() => {
    let isActive = true

    async function loadRoute() {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
          startLat: String(origin.lat),
          startLng: String(origin.lng),
          endLat: String(destination.latitude),
          endLng: String(destination.longitude),
          destinationName: destination.name,
        })

        const response = await fetch(`/api/routes?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Не удалось построить маршрут.")
        }

        const json = await response.json()

        if (!isActive) {
          return
        }

        setRoute({
          provider: json.provider,
          geometry: json.geometry ?? [],
          summary: json.summary,
          steps: json.steps ?? [],
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

    void loadRoute()

    return () => {
      isActive = false
    }
  }, [destination.latitude, destination.longitude, destination.name, origin.lat, origin.lng])

  const arrivalTime = useMemo(() => {
    if (!route) {
      return null
    }

    return new Date(Date.now() + route.summary.durationSeconds * 1000).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [route])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 p-4 border-b-2 border-foreground">
        <button
          onClick={onBack}
          className="p-2 border-2 border-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold">Навигация</h1>
          <p className="text-sm text-muted-foreground truncate">до {destination.name}</p>
        </div>
        <button
          onClick={() => setVoiceEnabled((current) => !current)}
          className="p-2 border-2 border-foreground hover:bg-muted transition-colors"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 border-b-2 border-foreground relative min-h-[320px]">
        <MapLibreMap
          center={[origin.lng, origin.lat]}
          zoom={14}
          routeGeometry={route?.geometry}
          origin={[origin.lng, origin.lat]}
          destination={[destination.longitude, destination.latitude]}
          markers={[
            {
              id: destination.id,
              name: destination.name,
              category: destination.category,
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          ]}
          selectedMarkerId={destination.id}
        />
        <div className="absolute top-4 left-4 bg-background border-2 border-foreground px-4 py-2 text-center max-w-72 z-10">
          <span className="text-sm font-medium block">Маршрут до выбранной точки</span>
          <span className="text-xs text-muted-foreground block mt-1">
            {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 bg-foreground text-background px-3 py-2 flex items-center gap-2 z-10">
          <Navigation className="w-4 h-4" />
          <span className="text-sm font-medium">Вы здесь</span>
        </div>
      </div>

      <div className="p-4 border-b-2 border-foreground bg-foreground text-background">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <LoaderCircle className="w-5 h-5 animate-spin" />
            <p className="text-sm">Строю маршрут...</p>
          </div>
        ) : error ? (
          <div>
            <p className="font-bold">Ошибка маршрута</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : route ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="text-2xl font-bold">{formatDuration(route.summary.durationSeconds)}</p>
                <p className="text-sm opacity-80">{formatDistance(route.summary.distanceMeters)} пешком</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Прибытие</p>
              <p className="font-bold">{arrivalTime ?? "--:--"}</p>
              <p className="text-xs opacity-80">{getRouteProviderLabel(route.provider)} · {voiceEnabled ? "голос включён" : "без голоса"}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Маршрут по шагам
        </h3>
        <div className="space-y-0">
          {(route?.steps ?? []).map((step, index) => (
            <div
              key={`${step.instruction}-${index}`}
              className="flex items-start gap-3 p-3 border-2 border-foreground border-t-0 first:border-t-2"
            >
              <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">
                  {step.instruction}
                  {step.distance > 0 && (
                    <span className="text-muted-foreground ml-2">{formatDistance(step.distance)}</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.street || destination.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t-2 border-foreground mt-auto">
        <button
          onClick={onBack}
          className="w-full py-4 border-2 border-foreground font-bold hover:bg-muted transition-colors"
        >
          Завершить навигацию
        </button>
      </div>
    </div>
  )
}
