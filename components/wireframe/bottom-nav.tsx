"use client"

import { Home, Map, Settings, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: "home" | "map" | "safety" | "settings"
  onTabChange: (tab: "home" | "map" | "safety" | "settings") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home" as const, icon: Home, label: "Главная" },
    { id: "map" as const, icon: Map, label: "Карта" },
    { id: "safety" as const, icon: Shield, label: "Безопасность" },
    { id: "settings" as const, icon: Settings, label: "Профиль" },
  ]

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-30">
      <div className="mx-auto flex max-w-md justify-center px-4">
        <div className="travel-panel flex w-full items-center justify-around px-2 py-2 shadow-[0_12px_30px_rgba(24,38,54,0.14)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex min-w-16 flex-col items-center gap-1 rounded-md px-3 py-2 transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-[0_10px_18px_rgba(196,104,73,0.26)]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5",
                  activeTab === tab.id && "fill-primary-foreground",
                )}
                strokeWidth={activeTab === tab.id ? 2.3 : 1.75}
              />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
