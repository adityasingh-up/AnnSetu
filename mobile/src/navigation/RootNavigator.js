import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

import AuthNavigator from './AuthNavigator';
import DonorNavigator from './DonorNavigator';
import VolunteerNavigator from './VolunteerNavigator';
import NGONavigator from './NGONavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  switch (user.role) {
    case 'donor':
      return <DonorNavigator />;
    case 'volunteer':
      return <VolunteerNavigator />;
    case 'ngo':
      return <NGONavigator />;
    case 'admin':
      return <AdminNavigator />;
    default:
      return <DonorNavigator />;
  }
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
