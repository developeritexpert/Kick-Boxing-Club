// zustand store
import { create } from 'zustand';
import { persist, createJSONStorage, PersistStorage } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    role: string;
    profile_image_url: string | null;
}

interface AuthState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
}

const getStorage = (): PersistStorage<AuthState> | undefined => {
    if (typeof window === 'undefined') return undefined;

    const rememberMe =
        document.cookie
            .split('; ')
            .find((row) => row.startsWith('remember-me='))
            ?.split('=')[1] === 'true';

    return createJSONStorage<AuthState>(() => (rememberMe ? localStorage : sessionStorage));
};

export const useAuthStore = create(
    persist<AuthState>(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'auth-storage',
            storage: getStorage(),
        },
    ),
);

// import { create } from 'zustand';
// import { persist, createJSONStorage ,PersistStorage } from 'zustand/middleware';

// export interface User {
//     id: string;
//     email: string;
//     first_name: string | null;
//     last_name: string | null;
//     phone: string | null;
//     role: string;
// }

// interface AuthState {
//     user: User | null;
//     setUser: (user: User) => void;
//     clearUser: () => void;
// }

// const getStorage = (): PersistStorage<AuthState> | undefined => {
//     if (typeof window === 'undefined') return undefined;

//     const rememberMe = document.cookie
//         .split('; ')
//         .find(row => row.startsWith('remember-me='))
//         ?.split('=')[1] === 'true';

//     return createJSONStorage<AuthState>(() => rememberMe ? localStorage : sessionStorage);
// };

// export const useAuthStore = create(
//     persist<AuthState>(
//         (set) => ({
//             user: null,
//             setUser: (user) => set({ user }),
//             clearUser: () => set({ user: null }),
//         }),
//         {
//             name: 'auth-storage',
//             storage: getStorage(),
//         },
//     ),
// );

// // zustand (original )

// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';

// export interface User {
//     id: string;
//     email: string;
//     first_name: string | null;
//     last_name: string | null;
//     phone: string | null;
//     role: string;
// }

// interface AuthState {
//     user: User | null;
//     setUser: (user: User) => void;
//     clearUser: () => void;
// }

// export const useAuthStore = create(
//     persist<AuthState>(
//         (set) => ({
//             user: null,
//             setUser: (user) => set({ user }),
//             clearUser: () => set({ user: null }),
//         }),
//         {
//             name: 'auth-storage',
//             storage:
//                 typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
//         },
//     ),
// );
