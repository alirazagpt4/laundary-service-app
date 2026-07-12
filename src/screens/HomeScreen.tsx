// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TextInput, 
  Button, 
  Text, 
  Appbar, 
  Surface 
} from 'react-native-paper'; 
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { globalStyles } from '../theme/styles';

interface HomeScreenProps {
  onOrderSubmit: (customerPayload: any) => void;
}

export default function HomeScreen({ onOrderSubmit }: HomeScreenProps) {
  const { logoutState } = useApp();

  // State Management Matrix (Cleaned up Category)
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date>(() => {
    const defaultDelivery = new Date();
    defaultDelivery.setDate(defaultDelivery.getDate() + 2);
    return defaultDelivery;
  });

  // UI Visibility Controls
  const [showOrderPicker, setShowOrderPicker] = useState<boolean>(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState<boolean>(false);

  const formatDateString = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const onOrderDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowOrderPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setOrderDate(selectedDate);
      if (deliveryDate < selectedDate) {
        const nextDelivery = new Date(selectedDate);
        nextDelivery.setDate(nextDelivery.getDate() + 2);
        setDeliveryDate(nextDelivery);
      }
    }
  };

  const onDeliveryDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDeliveryPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate < orderDate) {
        Alert.alert("Invalid Chronology", "Delivery date cannot be configured before the order placement date.");
        return;
      }
      setDeliveryDate(selectedDate);
    }
  };

 const handleNextStep = () => {
    const cleanName = customerName.trim();
    const cleanPhone = phoneNumber.trim();

    if (!cleanName || !cleanPhone) {
      Alert.alert("Validation Failure", "Customer Name and Phone Number fields are strictly mandatory.");
      return;
    }
    if (cleanPhone.length < 10) {
      Alert.alert("Validation Failure", "Enter a valid operational phone number format.");
      return;
    }

    // --- LOGICAL SPLIT SYSTEM START ---
    // Name ko space (' ') par split karke array banate hain
    const nameParts = cleanName.split(/\s+/); // Use regex to handle multiple spaces safely
    
    const firstName = nameParts[0] || '';
    // Agar naam mein ek se zyada parts hain (e.g., "Ali Sace" ya "Muhammad Ali Sace"), 
    // toh pehle part ke baad baki sab kuch lastName mein combine ho jayega.
    const lastName = nameParts.slice(1).join(' ') || 'Customer'; 
    // --- LOGICAL SPLIT SYSTEM END ---

    // Updated Downstream Payload Contract
    onOrderSubmit({
      customerName: cleanName, // Safe fallback text presentation ke liye
      firstName: firstName,    // Backend requirement sync
      lastName: lastName,      // Backend requirement sync
      phoneNumber: cleanPhone,
      orderDate: formatDateString(orderDate),
      deliveryDate: formatDateString(deliveryDate),
      timestamp: Date.now()
    });
  };

  return (
    <SafeAreaView style={globalStyles.mainContainer} edges={['top', 'left', 'right']}>
      
      {/* PAPER APPBAR LAYER */}
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.Action icon="menu" onPress={() => {}} accessibilityLabel="Open Navigation Menu" />
        <Appbar.Content 
          title="CLEAN & FRESH" 
          subtitle="DRY CLEANERS" 
          titleStyle={styles.appbarTitle}
          subtitleStyle={styles.appbarSub}
        />
        <Button 
          mode="text" 
          textColor="#EF4444" 
          labelStyle={styles.logoutLabel} 
          onPress={logoutState}
        >
          Logout
        </Button>
      </Appbar.Header>

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* PAPER SURFACE BANNER */}
        <Surface style={styles.heroSurface} elevation={1}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>+ New Receipt</Text>
            <Text style={styles.heroSub}>Create new order / receipt</Text>
          </View>
          <Text style={styles.heroIcon}>📄</Text>
        </Surface>

        <Text style={styles.sectionTitle}>Customer Details</Text>

        {/* INPUT: NAME */}
        <TextInput
          mode="outlined"
          label="Customer Name *"
          placeholder="Enter customer name"
          value={customerName}
          onChangeText={setCustomerName}
          outlineColor="#E2E8F0"
          activeOutlineColor="#6366F1"
          left={<TextInput.Icon icon="account" color="#94A3B8" />}
          style={styles.paperInput}
        />

        {/* INPUT: PHONE */}
        <TextInput
          mode="outlined"
          label="Phone Number *"
          placeholder="03XX XXX XXXX"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          outlineColor="#E2E8F0"
          activeOutlineColor="#6366F1"
          left={<TextInput.Icon icon="phone" color="#94A3B8" />}
          style={styles.paperInput}
        />

        {/* DATE METADATA DOUBLE COLUMNS */}
        <View style={styles.dateRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <TouchableOpacity onPress={() => setShowOrderPicker(true)} activeOpacity={1}>
              <TextInput
                mode="outlined"
                label="Order Date *"
                value={formatDateString(orderDate)}
                editable={false}
                outlineColor="#E2E8F0"
                activeOutlineColor="#6366F1"
                right={<TextInput.Icon icon="calendar" color="#94A3B8" onPress={() => setShowOrderPicker(true)} />}
                style={styles.paperInput}
              />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <TouchableOpacity onPress={() => setShowDeliveryPicker(true)} activeOpacity={1}>
              <TextInput
                mode="outlined"
                label="Delivery Date *"
                value={formatDateString(deliveryDate)}
                editable={false}
                outlineColor="#E2E8F0"
                activeOutlineColor="#6366F1"
                right={<TextInput.Icon icon="calendar" color="#94A3B8" onPress={() => setShowDeliveryPicker(true)} />}
                style={styles.paperInput}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* NATIVE CALENDAR LOGIC RIGGING */}
        {showOrderPicker && (
          <DateTimePicker value={orderDate} mode="date" display="calendar" onChange={onOrderDateChange} />
        )}
        {showDeliveryPicker && (
          <DateTimePicker value={deliveryDate} mode="date" display="calendar" minimumDate={orderDate} onChange={onDeliveryDateChange} />
        )}
      </ScrollView>

      {/* FOOTER ACTIONS WRAPPER */}
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handleNextStep}
          style={styles.submitButton}
          labelStyle={styles.submitButtonLabel}
        >
          Next: Add Items  ➔
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appbar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
  },
  appbarTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: 1,
    textAlign: 'center',
  },
  appbarSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollBody: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroSurface: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSub: {
    fontSize: 13,
    color: '#E9D5FF',
    marginTop: 4,
    fontWeight: '500',
  },
  heroIcon: {
    fontSize: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 16,
  },
  paperInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 6,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});