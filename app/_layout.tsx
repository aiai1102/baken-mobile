import "../global.css";
import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="edit-record" options={{ presentation: 'modal', title: 'レコード編集' }} />
        </Stack>
    );
}
