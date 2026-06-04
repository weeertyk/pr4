"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle, Layers, LoaderCircle, Minus, Navigation, Plus, Search } from "lucide-react"
import { MapLibreMap } from "@/components/travel/maplibre-map"
import { DEMO_CITY_CENTER } from "@/lib/travel/demo"
import { getPlaceCategoryLabel } from "@/lib/travel/presentation"
import type { DestinationPlace } from "@/lib/travel/ui-types"
import { BottomNav } from "../bottom-nav"
import { cn } from "@/lib/utils"

interface MapScreenProps {
  readonly onTabChange: (tab: "home" | "map" | "safety" | "settings") => void
  readonly onNavigate: (destination?: DestinationPlace) => void
  readonly userEmail?: string
}

type BoundsPlace = {
  id: string
  name: string
  category: string
  latitude: number
  longitude: number
}

type FilterId = "all" | "food" | "attractions" | "transport"

const filters: { id: FilterId; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "food", label: "Еда" },
  { id: "attractions", label: "Достопримечательности" },
  { id: "transport", label: "Транспорт" },
]

const zoomSpans = [0.025, 0.015, 0.01] as const

function filterPlace(place: BoundsPlace, activeFilter: FilterId, searchQuery: string) {
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const categoryLabel = getPlaceCategoryLabel(place.category).toLowerCase()
  const matchesSearch =
    normalizedSearch.length === 0 ||
    place.name.toLowerCase().includes(normalizedSearch) ||
    place.category.toLowerCase().includes(normalizedSearch) ||
    categoryLabel.includes(normalizedSearch)

  if (!matchesSearch) return false

  if (activeFilter === "all") return true
  if (activeFilter === "food") return place.category === "CAFE" || place.category === "RESTAURANT"
  if (activeFilter === "attractions")
    return ["MUSEUM", "PARK", "VIEWPOINT", "LANDMARK"].includes(place.category)
  return place.category === "TRANSPORT"
}

export function MapScreen({ onTabChange, onNavigate, userEmail }: MapScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [zoomIndex, setZoomIndex] = useState(1)
  const [places, setPlaces] = useState<BoundsPlace[]>([])
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Поля формы жалобы в BPMS
  const [showReportForm, setShowReportForm] = useState(false)
  const [reporterEmail, setReporterEmail] = useState(userEmail || "")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)

  useEffect(() => {
    if (userEmail) {
      setReporterEmail(userEmail)
    }
  }, [userEmail])

  const span = zoomSpans[zoomIndex]

  useEffect(() => {
    let isActive = true

    async function loadPlaces() {
      try {
        setIsLoading(true)
        setError(null)
        const params = new URLSearchParams({
          minLat: String(DEMO_CITY_CENTER.lat - span),
          minLng: String(DEMO_CITY_CENTER.lng - span),
          maxLat: String(DEMO_CITY_CENTER.lat + span),
          maxLng: String(DEMO_CITY_CENTER.lng + span),
        })
        const response = await fetch(`/api/places/in-bounds?${params.toString()}`)
        if (!response.ok) throw new Error("Не удалось загрузить точки на карте.")
        const json = await response.json()
        if (!isActive) return
        setPlaces(json.places ?? [])
      } catch (loadError) {
        if (!isActive) return
        setError(loadError instanceof Error ? loadError.message : "Неизвестная ошибка.")
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadPlaces()
    return () => {
      isActive = false
    }
  }, [span])

  const filteredPlaces = useMemo(
    () => places.filter((place) => filterPlace(place, activeFilter, searchQuery)),
    [activeFilter, places, searchQuery],
  )

  const selectedPlace =
    filteredPlaces.find((place) => place.id === selectedPlaceId) ??
    places.find((place) => place.id === selectedPlaceId) ??
    filteredPlaces[0] ??
    null

  useEffect(() => {
    if (!selectedPlaceId && filteredPlaces[0]) setSelectedPlaceId(filteredPlaces[0].id)
  }, [filteredPlaces, selectedPlaceId])

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlace || !reporterEmail || !description) return

    setIsSubmitting(true)
    setSubmitSuccess(null)
    setReportError(null)

    try {
      const response = await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poiId: selectedPlace.id,
          email: reporterEmail,
          description: description
        })
      })

      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || "Не удалось отправить жалобу.")
      }

      setSubmitSuccess(true)
      setDescription("")
      setTimeout(() => {
        setShowReportForm(false)
        setSubmitSuccess(null)
      }, 3000)
    } catch (err: any) {
      setReportError(err.message || "Произошла ошибка при отправке.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCycleFilter() {
    const currentIndex = filters.findIndex((filter) => filter.id === activeFilter)
    const nextFilter = filters[(currentIndex + 1) % filters.length]
    setActiveFilter(nextFilter.id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Верхняя панель поиска и фильтров */}
      <header className="p-4 border-b-2 border-foreground">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или категории..."
            className="w-full pl-10 pr-4 py-3 border-2 border-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
          />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 border-2 border-foreground text-sm transition-colors",
                activeFilter === filter.id ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {/* Карта занимает половину экрана */}
      <div className="relative h-1/3 border-b-2 border-foreground">
        <MapLibreMap
          center={[DEMO_CITY_CENTER.lng, DEMO_CITY_CENTER.lat]}
          zoom={14 - zoomIndex}
          markers={filteredPlaces.map((place) => ({
            id: place.id,
            name: place.name,
            category: place.category,
            latitude: place.latitude,
            longitude: place.longitude,
          }))}
          selectedMarkerId={selectedPlace?.id ?? null}
          onMarkerSelect={setSelectedPlaceId}
          className="h-full w-full"
        />

        {/* Элементы управления карты */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleCycleFilter}
            className="w-10 h-10 bg-background border-2 border-foreground flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute right-4 bottom-4 flex flex-col gap-0 z-10">
          <button
            onClick={() => setZoomIndex((c) => Math.max(c - 1, 0))}
            className="w-10 h-10 bg-background border-2 border-foreground flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoomIndex((c) => Math.min(c + 1, zoomSpans.length - 1))}
            className="w-10 h-10 bg-background border-2 border-foreground border-t-0 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => {
            setSearchQuery("")
            setActiveFilter("all")
            setZoomIndex(1)
          }}
          className="absolute left-4 bottom-4 bg-foreground text-background px-4 py-2 flex items-center gap-2 border-2 border-foreground z-10"
        >
          <Navigation className="w-4 h-4" />
          <span className="text-sm font-medium">Моя локация</span>
        </button>

        {isLoading && (
          <div className="absolute left-3 bottom-16 z-10 bg-background border-2 border-foreground px-3 py-2 flex items-center gap-2 text-sm">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            <span>Загружаю точки...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-x-4 top-16 z-10 bg-background border-2 border-foreground p-4 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredPlaces.length === 0 && (
          <div className="absolute inset-x-4 top-16 z-10 bg-background border-2 border-foreground p-4 text-sm">
            В этих границах сейчас нет точек по выбранному фильтру.
          </div>
        )}
      </div>

      {/* Нижняя половина экрана: список и детали */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 border-b-2 border-foreground pb-2">
          <h3 className="font-semibold text-sm">Выбранная точка</h3>
          <p className="text-sm font-medium truncate">
            {selectedPlace?.name ?? "Нет активной точки"}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedPlace ? getPlaceCategoryLabel(selectedPlace.category) : "Выберите маркер на карте"}
          </p>
          <div className="flex gap-2">
            <button
              disabled={!selectedPlace}
              onClick={() => {
                if (!selectedPlace) return
                onNavigate({
                  id: selectedPlace.id,
                  name: selectedPlace.name,
                  category: selectedPlace.category,
                  latitude: selectedPlace.latitude,
                  longitude: selectedPlace.longitude,
                })
              }}
              className="mt-2 px-4 py-2 border-2 border-foreground font-bold text-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              Маршрут
            </button>
            <button
              disabled={!selectedPlace}
              onClick={() => setShowReportForm(true)}
              className="mt-2 px-4 py-2 border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive hover:text-destructive-foreground transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              Пожаловаться
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-sm">Точки в текущих границах</h3>
          <div className="space-y-2">
            {filteredPlaces.map((place) => (
              <button
                key={place.id}
                onClick={() => setSelectedPlaceId(place.id)}
                className={cn(
                  "w-full p-3 border-2 text-left transition-colors",
                  selectedPlace?.id === place.id
                    ? "border-foreground bg-muted"
                    : "border-foreground hover:bg-muted",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{place.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getPlaceCategoryLabel(place.category)} · {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </p>
                  </div>
                  <span className="text-xs border border-foreground px-2 py-1">точка</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showReportForm && selectedPlace && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReportSubmit} className="w-full max-w-sm border-2 border-foreground bg-background p-6 space-y-4 shadow-lg">
            <h3 className="font-semibold text-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Сообщить об угрозе
            </h3>
            <p className="text-xs text-muted-foreground">
              Вы сообщаете об угрозе безопасности для объекта <strong>{selectedPlace.name}</strong>.
            </p>


            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Описание угрозы
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите проблему безопасности..."
                rows={3}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                required
              />
            </div>

            {reportError && (
              <p className="text-xs text-destructive font-medium">{reportError}</p>
            )}

            {submitSuccess && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Жалоба отправлена!
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 border-2 border-foreground bg-foreground text-background py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {isSubmitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
                Отправить
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReportForm(false)
                  setSubmitSuccess(null)
                  setReportError(null)
                }}
                disabled={isSubmitting}
                className="flex-1 border-2 border-foreground bg-background py-2 text-sm font-semibold hover:bg-muted transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <BottomNav activeTab="map" onTabChange={onTabChange} />
    </div>
  )
}