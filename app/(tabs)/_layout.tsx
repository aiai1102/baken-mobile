import { Tabs } from 'expo-router';
import { IconHome, IconBarChart2 } from '../../components/ui/icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb', headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: '馬券記録',
                    tabBarIcon: ({ color }) => <IconHome size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="summary"
                options={{
                    title: '集計',
                    tabBarIcon: ({ color }) => <IconBarChart2 size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
