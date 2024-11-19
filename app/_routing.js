import { useEffect } from 'react'
import { useRouter, useSegments } from "expo-router";
import { useAuth } from '../context/authContext';

export function useProtectedRoute() {
    const { isAuthenticated, user } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (typeof isAuthenticated == 'undefined') return;

        const inApp = segments[0] == '(app)';
        const inSitter = segments[0] == '(sitter)';

        console.log('Current user:', user);
        console.log('Current role:', user?.role);
        console.log('Current segment:', segments[0]);

        if (isAuthenticated) {
            if (user?.role === 'sitter') {
                console.log('Redirecting to sitter interface');
                if (!inSitter) {
                    router.replace('/(sitter)/home');
                }
            } else {
                console.log('Redirecting to owner interface');
                if (!inApp) {
                    router.replace('/(app)/home');
                }
            }
        } else {
            if (inApp || inSitter) {
                router.replace('/signIn');
            }
        }
    }, [isAuthenticated, user?.role]);
}

export default function ProtectedRoute({ children }) {
    useProtectedRoute();
    return children;
} 