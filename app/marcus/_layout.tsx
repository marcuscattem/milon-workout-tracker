import { Stack } from 'expo-router';

export default function MarcusLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="workout/[id]" />
    </Stack>
  );
}
