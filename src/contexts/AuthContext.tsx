import Router from "next/router"
import { setCookie, parseCookies, destroyCookie } from "nookies"
import { useEffect } from "react"
import { useState } from "react"
import { createContext, ReactNode, useContext } from "react"
import { apiAuth } from "../services/apiClient"

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => void;
    user: User;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

let authChannel: BroadcastChannel

export function signOut() {
    destroyCookie(undefined, 'dashgo.token')
    destroyCookie(undefined, 'dashgo.refreshToken')

    authChannel.postMessage('signOut')

    Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User>()
    const isAuthenticated = !!user;

    useEffect(()=> {
        authChannel = new BroadcastChannel('auth')

        authChannel.onmessage = (message) => {
            switch (message.data) {
                case 'signOut':
                    signOut();
                    break;
                case 'signIn':
                    Router.push('/dashboard');
                    break;
                default:
                    break;
            }
        }
    }, [])

    useEffect(() => {
        const { 'dashgo.token': token } = parseCookies()

        if (token) {
            apiAuth.get('/me')
                .then(response => {
                    const { email, permissions, roles } = response.data

                    setUser({ email, permissions, roles })
                })
                .catch(() => {
                    signOut()
                })
        }

    }, [])

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await apiAuth.post('/sessions', {
                email,
                password
            })

            const { permissions, roles, token, refreshToken } = response.data

            setCookie(undefined, 'dashgo.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })
            setCookie(undefined, 'dashgo.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })

            setUser({
                email,
                permissions,
                roles
            })

            apiAuth.defaults.headers['Authorization'] = 'Bearer ' + token

            Router.push('/dashboard')

            authChannel.postMessage('signIn')
        } catch (err) {
            console.log('err', err)
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, signIn, user, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)