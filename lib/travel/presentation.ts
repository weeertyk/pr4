import type { PlaceCategory } from "@/lib/travel/domain"

const placeCategoryLabels: Record<PlaceCategory, string> = {
  CAFE: "Кафе",
  RESTAURANT: "Ресторан",
  MUSEUM: "Музей",
  PARK: "Парк",
  VIEWPOINT: "Смотровая точка",
  TRANSPORT: "Транспорт",
  SHOP: "Магазин",
  HOTEL: "Отель",
  LANDMARK: "Достопримечательность",
}

export function getPlaceCategoryLabel(category?: string | null) {
  if (!category) {
    return "Место"
  }

  return placeCategoryLabels[category as PlaceCategory] ?? category
}

export function getRouteProviderLabel(provider?: string | null) {
  if (provider === "openrouteservice") {
    return "OpenRouteService"
  }

  if (provider === "fallback") {
    return "Локальный расчёт"
  }

  return "Навигация"
}
