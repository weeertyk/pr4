"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { AuthScreen } from "@/components/wireframe/screens/auth-screen"
import { DashboardScreen } from "@/components/wireframe/screens/dashboard-screen"
import { MapScreen } from "@/components/wireframe/screens/map-screen"
import { NavigationScreen } from "@/components/wireframe/screens/navigation-screen"
import { OnboardingScreen } from "@/components/wireframe/screens/onboarding-screen"
import { SafetyScreen } from "@/components/wireframe/screens/safety-screen"
import { SettingsScreen } from "@/components/wireframe/screens/settings-screen"
import { TripRecoveryScreen } from "@/components/wireframe/screens/trip-recovery-screen"
import { DEMO_CITY_CENTER } from "@/lib/travel/demo"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"
import type { DestinationPlace } from "@/lib/travel/ui-types"

type Screen = "auth" | "onboarding" | "dashboard" | "safety" | "navigation" | "map" | "settings" | "recovery"

type ProfilePayload = {
  profile: {
    id: string
    email: string
    name: string | null
    role: string
    is_premium: boolean
  } | null
  preferences: {
    user_id: string
    budget_level: string
    preference_mode: string
    travel_styles: string[]
    language: string
    city_mode: boolean
  } | null
}

async function loadProfile(userId: string) {
  const response = await fetch(`/api/profile?userId=${userId}`)

  if (!response.ok) {
    throw new Error("Не удалось загрузить профиль пользователя.")
  }

  return (await response.json()) as ProfilePayload & { ok: true }
}

async function saveOnboarding(input: {
  userId: string
  budgetLevel: string
  preferenceMode: string
  travelStyles: string[]
}) {
  const response = await fetch("/api/onboarding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: input.userId,
      budgetLevel: input.budgetLevel,
      preferenceMode: input.preferenceMode,
      travelStyles: input.travelStyles,
      language: "ru",
      cityMode: true,
    }),
  })

  if (!response.ok) {
    const json = await response.json().catch(() => null)
    throw new Error(json?.error ?? "Не удалось сохранить анкету.")
  }

  return response.json()
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("auth")
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfilePayload["profile"]>(null)
  const [preferences, setPreferences] = useState<ProfilePayload["preferences"]>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [selectedDestination, setSelectedDestination] = useState<DestinationPlace | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function bootstrap() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user ?? null
      setAuthUser(user)

      if (user) {
        try {
          const payload = await loadProfile(user.id)
          setProfile(payload.profile)
          setPreferences(payload.preferences)
          setCurrentScreen(payload.preferences ? "dashboard" : "onboarding")
        } catch {
          setCurrentScreen("onboarding")
        }
      } else {
        setProfile(null)
        setPreferences(null)
        setCurrentScreen("auth")
      }

      setIsAuthLoading(false)
    }

    void bootstrap()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setAuthUser(user)

      if (!user) {
        setProfile(null)
        setPreferences(null)
        setCurrentScreen("auth")
        return
      }

      void loadProfile(user.id)
        .then((payload) => {
          setProfile(payload.profile)
          setPreferences(payload.preferences)
          setCurrentScreen(payload.preferences ? "dashboard" : "onboarding")
        })
        .catch(() => {
          setCurrentScreen("onboarding")
        })
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function handleAuthReady() {
    if (!authUser) {
      return
    }

    const payload = await loadProfile(authUser.id)
    setProfile(payload.profile)
    setPreferences(payload.preferences)
    setCurrentScreen(payload.preferences ? "dashboard" : "onboarding")
  }

  async function handleOnboardingComplete(input: {
    budgetLevel: string
    preferenceMode: string
    travelStyles: string[]
  }) {
    if (!authUser) {
      throw new Error("Сначала войдите в систему.")
    }

    const response = await saveOnboarding({
      userId: authUser.id,
      ...input,
    })

    setPreferences(response.preferences)
    setCurrentScreen("dashboard")
  }

  function handleOnboardingClose() {
    if (preferences) {
      setCurrentScreen("dashboard")
    }
  }

  function handleTabChange(tab: "home" | "map" | "safety" | "settings") {
    const screenMap: Record<string, Screen> = {
      home: "dashboard",
      map: "map",
      safety: "safety",
      settings: "settings",
    }
    setCurrentScreen(screenMap[tab])
  }

  function handleNavigate(destination?: DestinationPlace) {
    if (destination) {
      setSelectedDestination(destination)
    }
    setCurrentScreen("navigation")
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    setSelectedDestination(null)
  }

  const fallbackDestination: DestinationPlace = {
    id: "default-destination",
    name: "Double B Coffee",
    category: "CAFE",
    latitude: 55.7548,
    longitude: 37.6189,
    distanceMeters: 250,
    reason: "Резервная точка, пока место не выбрано.",
  }

  if (isAuthLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-3 py-3 md:px-5">
        <div className="travel-shell min-h-[calc(100vh-24px)] overflow-hidden border border-white/60" />
      </main>
    )
  }

   return (
     <main className="mx-auto min-h-screen max-w-md px-3 py-3 md:px-5">
       <div className="travel-shell h-[calc(100vh-24px)] overflow-y-auto border border-white/60 flex flex-col">
        {currentScreen === "auth" && <AuthScreen onReady={() => void handleAuthReady()} />}

        {currentScreen === "onboarding" && authUser && (
          <OnboardingScreen
            userId={authUser.id}
            initialBudget={preferences?.budget_level ?? null}
            initialStyles={preferences?.travel_styles ?? []}
            onComplete={handleOnboardingComplete}
            onClose={handleOnboardingClose}
          />
        )}

        {currentScreen === "dashboard" && authUser && (
          <DashboardScreen
            userId={authUser.id}
            onNavigate={handleNavigate}
            onTabChange={handleTabChange}
            onOpenRecovery={() => setCurrentScreen("recovery")}
          />
        )}

        {currentScreen === "safety" && <SafetyScreen onTabChange={handleTabChange} />}

        {currentScreen === "navigation" && (
          <NavigationScreen
            onBack={() => setCurrentScreen("dashboard")}
            origin={DEMO_CITY_CENTER}
            destination={selectedDestination ?? fallbackDestination}
          />
        )}

        {currentScreen === "map" && (
          <MapScreen
            onTabChange={handleTabChange}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === "settings" && (
          <SettingsScreen
            profile={profile}
            preferences={preferences}
            onTabChange={handleTabChange}
            onStartOnboarding={() => setCurrentScreen("onboarding")}
            onSignOut={handleSignOut}
          />
        )}

        {currentScreen === "recovery" && authUser && (
          <TripRecoveryScreen
            userId={authUser.id}
            onAcceptNewPlan={() => setCurrentScreen("dashboard")}
            onEditManually={() => setCurrentScreen("settings")}
            onBack={() => setCurrentScreen("dashboard")}
          />
        )}
      </div>
    </main>
  )
}
