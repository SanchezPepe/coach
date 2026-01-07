import { useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import { useStore } from '@/store'

export function useAuth() {
  const { user, isAuthenticated, setUser, setAthlete, logout } = useStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '' })

        // Load athlete profile from Firestore
        const athleteDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (athleteDoc.exists()) {
          setAthlete(athleteDoc.data().profile)
        }
      } else {
        setUser(null)
        setAthlete(null)
      }
    })

    return () => unsubscribe()
  }, [setUser, setAthlete])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    // Create initial user document
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      createdAt: new Date().toISOString(),
    })

    return result.user
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)

    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', result.user.uid))
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        createdAt: new Date().toISOString(),
      })
    }

    return result.user
  }

  const signOutUser = async () => {
    await signOut(auth)
    logout()
  }

  return {
    user,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: signOutUser,
  }
}
