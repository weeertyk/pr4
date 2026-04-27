"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, LoaderCircle, RefreshCcw } from "lucide-react"

interface TripRecoveryScreenProps {
  userId: string
  onAcceptNewPlan: () => void
  onEditManually: () => void
  onBack: () => void
}

type PlanItem = {
  id: string
  start_time: string
  place: {
    id: string
    name: string
  } | null
  changed?: boolean
}

type RecoveryPayload = {
  event: {
    type: string
    description?: string | null
  } | null
  oldItems: PlanItem[]
  newItems: PlanItem[]
  replacement: {
    name: string
    reason: string
  } | null
}

function formatTime(dateTime: string) {
  return new Date(dateTime).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function TripRecoveryScreen({
  userId,
  onAcceptNewPlan,
  onEditManually,
  onBack,
}: TripRecoveryScreenProps) {
  const [data, setData] = useState<RecoveryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadRecovery() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/recommendations/rebuild", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        })

        if (!response.ok) {
          throw new Error("Не удалось пересобрать маршрут.")
        }

        const json = await response.json()

        if (!isActive) {
          return
        }

        setData({
          event: json.event ?? null,
          oldItems: json.oldItems ?? [],
          newItems: json.newItems ?? [],
          replacement: json.replacement ?? null,
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

    void loadRecovery()

    return () => {
      isActive = false
    }
  }, [userId])

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="flex items-center gap-3 px-5 pb-4 pt-5">
        <button
          onClick={onBack}
          className="travel-panel flex h-11 w-11 items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="travel-kicker">Восстановление</p>
          <h1 className="travel-title text-3xl font-semibold">Новый план дня</h1>
        </div>
      </header>

      <section className="px-5 pb-4">
        <div className="travel-panel overflow-hidden">
          <div className="bg-primary px-5 py-5 text-primary-foreground">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <p className="text-sm">Пересобираю маршрут с учётом нового события...</p>
              </div>
            ) : error ? (
              <div>
                <p className="font-semibold">Не удалось пересобрать маршрут</p>
                <p className="mt-2 text-sm text-primary-foreground/80">{error}</p>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/20 bg-white/10">
                  <RefreshCcw className="h-6 w-6" />
                </div>
                <div>
                  <p className="travel-kicker text-white/70">Ситуация изменилась</p>
                  <h2 className="travel-title mt-1 text-3xl font-semibold">День можно сохранить</h2>
                  <p className="mt-2 max-w-72 text-sm leading-6 text-primary-foreground/80">
                    {data?.event?.description ?? "Система уже собрала более устойчивую версию маршрута."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 pb-4">
        <div className="mb-3">
          <p className="travel-kicker">Сравнение</p>
          <h3 className="travel-title text-2xl font-semibold">Было и стало</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="travel-panel p-4">
            <p className="travel-kicker mb-3">Исходный план</p>
            <div className="space-y-3">
              {(data?.oldItems ?? []).map((item) => (
                <div key={item.id} className="rounded-md border border-border bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">{formatTime(item.start_time)}</p>
                  <p className="mt-1 text-sm line-through text-muted-foreground">
                    {item.place?.name ?? "Неизвестная точка"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="travel-panel p-4">
            <p className="travel-kicker mb-3">Новый план</p>
            <div className="space-y-3">
              {(data?.newItems ?? []).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-md border p-3 ${item.changed ? "border-primary bg-secondary/45" : "border-border bg-background"}`}
                >
                  <p className="text-xs text-muted-foreground">{formatTime(item.start_time)}</p>
                  <p className={`mt-1 text-sm ${item.changed ? "font-semibold" : ""}`}>
                    {item.place?.name ?? "Неизвестная точка"}
                  </p>
                  {item.changed && <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-primary">заменено</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-4">
        <div className="travel-panel p-4">
          <p className="travel-kicker mb-2">Почему это работает</p>
          {data?.replacement ? (
            <>
              <h3 className="travel-title text-2xl font-semibold">{data.replacement.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{data.replacement.reason}</p>
            </>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Подходящая замена пока не найдена. Можно сохранить старый план или отредактировать день вручную.
            </p>
          )}
        </div>
      </section>

      <section className="px-5">
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={onAcceptNewPlan}
            className="rounded-md bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_22px_rgba(196,104,73,0.24)] transition-transform hover:-translate-y-0.5"
          >
            Принять новый план
          </button>
          <button
            onClick={onEditManually}
            className="travel-panel px-4 py-4 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Отредактировать вручную
          </button>
        </div>
      </section>
    </div>
  )
}
