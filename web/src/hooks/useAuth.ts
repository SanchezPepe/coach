import { useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '@/services/firebase'
import { useStore } from '@/store'
import {
  initializeUserDocument,
  getAthleteProfile,
  getUserSettings,
} from '@/services/firestore'

export function useAuth() {
  const { user, isAuthenticated, setUser, setAthlete, setTheme, logout } = useStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '' })

        try {
          // Load athlete profile from Firestore
          const profile = await getAthleteProfile(firebaseUser.uid)
          if (profile) {
            setAthlete(profile)
          }

          // Load user settings
          const settings = await getUserSettings(firebaseUser.uid)
          if (settings?.theme) {
            setTheme(settings.theme === 'system' ? 'dark' : settings.theme)
          }
        } catch (err) {
          console.error('Error loading user data:', err)
        }
      } else {
        setUser(null)
        setAthlete(null)
      }
    })

    return () => unsubscribe()
  }, [setUser, setAthlete, setTheme])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    // Initialize user document with default settings
    await initializeUserDocument(result.user.uid, result.user.email || '')

    return result.user
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)

    // Initialize user document if it doesn't exist
    await initializeUserDocument(result.user.uid, result.user.email || '')

    // Load profile
    const profile = await getAthleteProfile(result.user.uid)
    if (profile) {
      setAthlete(profile)
    }

    return result.user
  }

  const signOutUser = async () => {
    await signOut(auth)
    logout()
  }

  const needsOnboarding = () => {
    return isAuthenticated && !useStore.getState().athlete
  }

  return {
    user,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: signOutUser,
    needsOnboarding,
  }
}
