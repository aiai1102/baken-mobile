import "../global.css";
import { Stack } from "expo-router";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function Layout() {
    return (
        <ErrorBoundary>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="edit-record" options={{ presentation: 'modal', title: 'レコード編集' }} />
            </Stack>
        </ErrorBoundary>
    );
}
