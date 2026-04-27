"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { LoaderCircle } from "lucide-react"

type MarkerPoint = {
  id: string
  name: string
  category?: string
  latitude: number
  longitude: number
}

type RouteGeometry = Array<[number, number]>

interface MapLibreMapProps {
  center: [number, number]
  zoom: number
  markers?: MarkerPoint[]
  selectedMarkerId?: string | null
  onMarkerSelect?: (markerId: string) => void
  routeGeometry?: RouteGeometry
  origin?: [number, number]
  destination?: [number, number]
  className?: string
}

type MapLibreModule = typeof import("maplibre-gl")
type MapInstance = import("maplibre-gl").Map
type GeoJSONSource = import("maplibre-gl").GeoJSONSource

function buildPlacesGeoJson(markers: MarkerPoint[], selectedMarkerId?: string | null) {
  return {
    type: "FeatureCollection" as const,
    features: markers.map((marker) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [marker.longitude, marker.latitude],
      },
      properties: {
        id: marker.id,
        name: marker.name,
        category: marker.category ?? "",
        isSelected: marker.id === selectedMarkerId,
      },
    })),
  }
}

function buildPointGeoJson(point?: [number, number]) {
  if (!point) {
    return {
      type: "FeatureCollection" as const,
      features: [],
    }
  }

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: point,
        },
        properties: {},
      },
    ],
  }
}

function buildRouteGeoJson(routeGeometry?: RouteGeometry) {
  if (!routeGeometry || routeGeometry.length < 2) {
    return {
      type: "FeatureCollection" as const,
      features: [],
    }
  }

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: routeGeometry,
        },
        properties: {},
      },
    ],
  }
}

export function MapLibreMap({
  center,
  zoom,
  markers = [],
  selectedMarkerId,
  onMarkerSelect,
  routeGeometry,
  origin,
  destination,
  className,
}: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const moduleRef = useRef<MapLibreModule | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  const placesGeoJson = useMemo(
    () => buildPlacesGeoJson(markers, selectedMarkerId),
    [markers, selectedMarkerId],
  )
  const routeGeoJson = useMemo(() => buildRouteGeoJson(routeGeometry), [routeGeometry])
  const originGeoJson = useMemo(() => buildPointGeoJson(origin), [origin])
  const destinationGeoJson = useMemo(() => buildPointGeoJson(destination), [destination])

  useEffect(() => {
    let isMounted = true

    async function initMap() {
      try {
        if (!containerRef.current || mapRef.current) {
          return
        }

        const maplibregl = await import("maplibre-gl")
        moduleRef.current = maplibregl

        if (!isMounted || !containerRef.current) {
          return
        }

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
              },
            },
            layers: [
              {
                id: "osm",
                type: "raster",
                source: "osm",
              },
            ],
          },
          center,
          zoom,
        })

        map.addControl(new maplibregl.NavigationControl(), "top-right")

        map.on("load", () => {
          if (!isMounted) {
            return
          }

          map.addSource("places", {
            type: "geojson",
            data: placesGeoJson,
          })

          map.addLayer({
            id: "places-layer",
            type: "circle",
            source: "places",
            paint: {
              "circle-radius": 8,
              "circle-color": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                "#ffffff",
                "#111111",
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": [
                "case",
                ["boolean", ["get", "isSelected"], false],
                "#111111",
                "#ffffff",
              ],
            },
          })

          map.addLayer({
            id: "places-label",
            type: "symbol",
            source: "places",
            layout: {
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-offset": [0, 1.5],
              "text-anchor": "top",
            },
            paint: {
              "text-color": "#111111",
              "text-halo-color": "#ffffff",
              "text-halo-width": 1.5,
            },
          })

          map.addSource("route", {
            type: "geojson",
            data: routeGeoJson,
          })

          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            paint: {
              "line-color": "#111111",
              "line-width": 4,
            },
          })

          map.addSource("origin", {
            type: "geojson",
            data: originGeoJson,
          })

          map.addLayer({
            id: "origin-layer",
            type: "circle",
            source: "origin",
            paint: {
              "circle-radius": 6,
              "circle-color": "#2563eb",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            },
          })

          map.addSource("destination", {
            type: "geojson",
            data: destinationGeoJson,
          })

          map.addLayer({
            id: "destination-layer",
            type: "circle",
            source: "destination",
            paint: {
              "circle-radius": 7,
              "circle-color": "#dc2626",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            },
          })

          if (onMarkerSelect) {
            map.on("click", "places-layer", (event) => {
              const feature = event.features?.[0]
              const markerId = feature?.properties?.id

              if (typeof markerId === "string") {
                onMarkerSelect(markerId)
              }
            })

            map.on("mouseenter", "places-layer", () => {
              map.getCanvas().style.cursor = "pointer"
            })

            map.on("mouseleave", "places-layer", () => {
              map.getCanvas().style.cursor = ""
            })
          }

          mapRef.current = map
          setStatus("ready")
        })

        map.on("error", () => {
          if (isMounted) {
            setStatus("error")
          }
        })
      } catch {
        if (isMounted) {
          setStatus("error")
        }
      }
    }

    void initMap()

    return () => {
      isMounted = false
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [center, onMarkerSelect, zoom])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const placesSource = map.getSource("places") as GeoJSONSource | undefined
    placesSource?.setData(placesGeoJson)

    const routeSource = map.getSource("route") as GeoJSONSource | undefined
    routeSource?.setData(routeGeoJson)

    const originSource = map.getSource("origin") as GeoJSONSource | undefined
    originSource?.setData(originGeoJson)

    const destinationSource = map.getSource("destination") as GeoJSONSource | undefined
    destinationSource?.setData(destinationGeoJson)
  }, [destinationGeoJson, originGeoJson, placesGeoJson, routeGeoJson])

  useEffect(() => {
    const map = mapRef.current
    const maplibre = moduleRef.current
    if (!map || !maplibre) {
      return
    }

    if (routeGeometry && routeGeometry.length > 1) {
      const bounds = new maplibre.LngLatBounds(routeGeometry[0], routeGeometry[0])
      routeGeometry.forEach((coordinate) => bounds.extend(coordinate))
      map.fitBounds(bounds, { padding: 48, duration: 600 })
      return
    }

    map.easeTo({
      center,
      zoom,
      duration: 500,
    })
  }, [center, routeGeometry, zoom])

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      <div ref={containerRef} className="h-full w-full" />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <div className="flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-sm">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            <span>Загружаю карту...</span>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4">
          <div className="border-2 border-foreground bg-background px-4 py-3 text-sm text-center max-w-64">
            Карта не загрузилась. Проверь установку `maplibre-gl` и сетевой доступ к тайлам.
          </div>
        </div>
      )}
    </div>
  )
}
