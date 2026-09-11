import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import NGOHomeScreen from '../screens/ngo/NGOHomeScreen';
import AvailableDonationsScreen from '../screens/ngo/AvailableDonationsScreen';
import NGOInventoryScreen from '../screens/ngo/NGOInventoryScreen';
import DistributionScreen from '../screens/ngo/DistributionScreen';
import DonationDetailScreen from '../screens/donor/DonationDetailScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function NGOTabs() {
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
            Dashboard: focused ? 'business' : 'business-outline',
            Available: focused ? 'search-circle' : 'search-circle-outline',
            Inventory: focused ? 'layers' : 'layers-outline',
            Notifications: focused ? 'notifications' : 'notifications-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={NGOHomeScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Available" component={AvailableDonationsScreen} options={{ tabBarLabel: 'Available' }} />
      <Tab.Screen name="Inventory" component={NGOInventoryScreen} options={{ tabBarLabel: 'Inventory' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function NGONavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NGOTabs" component={NGOTabs} />
      <Stack.Screen name="DonationDetail" component={DonationDetailScreen} />
      <Stack.Screen name="Distribution" component={DistributionScreen} />
    </Stack.Navigator>
  );
}
