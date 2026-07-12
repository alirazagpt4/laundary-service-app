import { StyleSheet, Platform } from 'react-native';

export const globalStyles = StyleSheet.create({
  // 1% Engineer Edge: Root viewport canvas scaffolding with strict padding boundaries
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Strict white background compliance
    // Android par status bar spacing auto-inject karne ke liye operational padding setup
    paddingTop: Platform.OS === 'android' ? 12 : 0, 
    paddingHorizontal: 16, // Consistent internal left/right gutter padding
  },
  
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 14, // Slightly increased touch surface for accessibility compliance
    paddingHorizontal: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  surfaceInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    height: 50, // Standard standardized height grid execution
    paddingHorizontal: 16,
  }
});