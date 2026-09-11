import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import VolunteerHomeScreen from '../screens/volunteer/VolunteerHomeScreen';
import NearbyDonationsScreen from '../screens/volunteer/NearbyDonationsScreen';
import MissionDetailScreen from '../screens/volunteer/MissionDetailScreen';
import PickupOTPScreen from '../screens/volunteer/PickupOTPScreen';
import MissionHistoryScreen from '../screens/volunteer/MissionHistoryScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function VolunteerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.cardBorder,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'speedometer' : 'speedometer-outline',
            Nearby: focused ? 'map' : 'map-outline',
            Missions: focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline',
            Notifications: focused ? 'notifications' : 'notifications-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={VolunteerHomeScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Nearby" component={NearbyDonationsScreen} options={{ tabBarLabel: 'Nearby' }} />
      <Tab.Screen name="Missions" component={MissionHistoryScreen} options={{ tabBarLabel: 'Missions' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function VolunteerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VolunteerTabs" component={VolunteerTabs} />
      <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
      <Stack.Screen name="PickupOTP" component={PickupOTPScreen} />
    </Stack.Navigator>
  );
}
