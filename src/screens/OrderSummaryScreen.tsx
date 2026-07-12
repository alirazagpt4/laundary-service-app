// src/screens/OrderSummaryScreen.tsx
import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Button, Text, Card, Divider, Surface, ActivityIndicator } from 'react-native-paper';
import { apiService } from '../api/apiService';

interface OrderSummaryProps {
  routePayload: {
    customerData: any;
    selectedItems: Array<{
      id: string;
      name: string;
      quantity: number;
      basePrice: number;
      serviceOptionId: string | null;
    }>;
  };
  onBack: () => void;
  onOrderSuccess: (receiptData: any) => void;
}

export default function OrderSummaryScreen({ routePayload, onBack, onOrderSuccess }: OrderSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
 console.log("SUMMARY SCREEN INCOMING PAYLOAD:", JSON.stringify(routePayload, null, 2));

// 1. Safe Fallback Destruction to explicitly secure runtime checks
const customerData = routePayload?.customerData || {};

// CRITICAL PIPELINE FIX: Naming contract alignment to capture upstream data safely
const rawItems = routePayload?.orderedItems || routePayload?.selectedItems;
const itemsList = Array.isArray(rawItems) ? rawItems : [];

// FIXED: Using itemsList with an explicit array guard to eliminate runtime reduce() crashes
const grandTotal = useMemo(() => {
  return itemsList.reduce((acc, item) => {
    // Upstream support: handle both 'basePrice' and 'unitPrice' properties seamlessly
    const currentPrice = item.basePrice || item.unitPrice || 0;
    return acc + (currentPrice * (item.quantity || 0));
  }, 0);
}, [itemsList]);

  const handleOrderCommit = async () => {
    try {
      setIsSubmitting(true);

     const finalServerPayload = {
        address: {
          areaId: "area-uuid-default",
          addressLine1: "Walk-in Counter Pickup",
          city: "Khurrianwala",
          instructions: "Standard processing"
        },
        items: itemsList.map(item => ({
          itemId: item.id,
          serviceOptionId: item.serviceOptionId || "default-option-id",
          quantity: item.quantity
        })),
        schedule: {
          pickupDate: customerData.orderDate || new Date().toISOString().split('T')[0],
          pickupSlotId: "time-slot-uuid-1",
          deliveryDate: customerData.deliveryDate || new Date().toISOString().split('T')[0],
          deliverySlotId: "time-slot-uuid-2"
        },
        // --- UPDATED CONTACT LAYER WITH RAW SPLIT DATA ---
        contact: {
          firstName: customerData.firstName || "Walk-in", // HomeScreen se split kiya hua firstName
          lastName: customerData.lastName || "Customer",  // HomeScreen se split kiya hua lastName
          email: "customer@laundry.com",
          phone: customerData.phoneNumber || "03001234567"
        },
        couponCode: "WELCOME25",
        specialInstructions: "Standard Care",
        isItemSelectionSkipped: false,
        acceptedTerms: true
      };

      const response = await apiService.post('/orders', finalServerPayload);

      if (response.status === 201 || response.status === 200) {
        onOrderSuccess(response.data?.data || response.data);
      } else {
        throw new Error(`Unexpected server status code: ${response.status}`);
      }
    } catch (error: any) {
      Alert.alert(
        "Order Failed",
        error.response?.data?.message || "Failed to commit order mutation to database ledger."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.BackAction onPress={onBack} disabled={isSubmitting} />
        <Appbar.Content title="Order Summary" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionHeading}>Customer</Text>
        <Card style={styles.infoCard} mode="flat">
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.customerName}>
                {`${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || 'Client Profile'}
              </Text>
              <Text style={styles.dateText}>Order: {customerData.pickupDate || 'Today'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.phoneText}>{customerData.phone || customerData.phoneNumber || 'N/A'}</Text>
              <Text style={styles.dateText}>Delivery: {customerData.deliveryDate || 'Pending'}</Text>
            </View>
          </Card.Content>
        </Card>

        <Surface style={styles.tableSurface} elevation={0}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.col, styles.colMain, styles.headerText]}>Item</Text>
            <Text style={[styles.col, styles.colQty, styles.headerText, styles.textCenter]}>Qty</Text>
            <Text style={[styles.col, styles.colRate, styles.headerText, styles.textRight]}>Rate</Text>
            <Text style={[styles.col, styles.colTotal, styles.headerText, styles.textRight]}>Total</Text>
          </View>
          <Divider />

          {itemsList.map((item, index) => (
            <View key={item.id || String(index)} style={styles.tableRow}>
              <Text style={[styles.col, styles.colMain, styles.cellText]}>{item.name}</Text>
              <Text style={[styles.col, styles.colQty, styles.cellText, styles.textCenter]}>{item.quantity}</Text>
              <Text style={[styles.col, styles.colRate, styles.cellText, styles.textRight]}>{item.basePrice}</Text>
              <Text style={[styles.col, styles.colTotal, styles.cellText, styles.textRight]}>
                {(item.basePrice || 0) * (item.quantity || 0)}
              </Text>
            </View>
          ))}
        </Surface>

        <Surface style={styles.grandTotalSurface} elevation={0}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>Rs. {grandTotal.toLocaleString()}</Text>
        </Surface>
      </ScrollView>

      <View style={styles.footerBar}>
        {isSubmitting ? (
          <ActivityIndicator animating={true} color="#6366F1" size="small" style={{ paddingVertical: 10 }} />
        ) : (
          <Button
            mode="contained"
            onPress={handleOrderCommit}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            CONFIRM & PLACE ORDER
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  appbar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  appbarTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  scrollContainer: { padding: 16, paddingBottom: 100 },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  infoCard: { backgroundColor: '#FAF9FF', borderRadius: 12, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  customerName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  phoneText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  dateText: { fontSize: 12, color: '#475569' },
  tableSurface: { backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16 },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' },
  tableHeader: { backgroundColor: '#F8FAFC' },
  col: { fontSize: 14, color: '#334155' },
  colMain: { flex: 2.5 },
  colQty: { flex: 1 },
  colRate: { flex: 1.5 },
  colTotal: { flex: 1.5 },
  headerText: { fontWeight: '700', color: '#475569', fontSize: 13 },
  cellText: { fontWeight: '500' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  grandTotalSurface: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#F3EFFF', borderRadius: 12, alignItems: 'center' },
  grandTotalLabel: { fontSize: 15, fontWeight: '700', color: '#6366F1' },
  grandTotalValue: { fontSize: 16, fontWeight: '800', color: '#6366F1' },
  footerBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#F1F5F9' },
  actionButton: { backgroundColor: '#6366F1', borderRadius: 24 },
  actionButtonContent: { paddingVertical: 8 }
});