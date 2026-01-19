// Quick script to clear AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.clear().then(() => {
  console.log('✅ AsyncStorage cleared!');
}).catch((err) => {
  console.error('Error clearing storage:', err);
});
