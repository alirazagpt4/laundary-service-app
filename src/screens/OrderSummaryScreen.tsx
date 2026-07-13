// src/screens/OrderSummaryScreen.tsx
import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Button, Text, Card, Divider, Surface, ActivityIndicator } from 'react-native-paper';
import { apiService } from '../api/apiService';
import { useApp } from '../context/AppContext'; 

interface OrderSummaryProps {
  onBack: () => void;
  onOrderSuccess: (receiptData: any) => void;
}

export default function OrderSummaryScreen({ onBack, onOrderSuccess }: OrderSummaryProps) {
  const { customerData, quantities, catalog } = useApp(); 
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Reconstruct Items List with absolute index-based split matrix
  const itemsList = useMemo(() => {
    if (!quantities || !catalog || catalog.length === 0) return [];
    
    return Object.keys(quantities)
      .map((compositeKey) => {
        const qty = quantities[compositeKey] || 0;
        if (qty <= 0) return null; 

        const parts = compositeKey.split('_');
        // CRITICAL REVERSAL FIX: The item ID resides strictly at index 1 of your selection matrix!
        const parsedItemId = parts[1] || parts[0]; 
        const categoryId = parts[0];

        // Structural match against flat cached catalog elements
        const catalogItem = catalog.find((c: any) => {
          return (
            String(c.id) === String(parsedItemId) || 
            String(c.item_id) === String(parsedItemId) ||
            String(c.code) === String(parsedItemId)
          );
        });

        if (!catalogItem) return null;

        // Extract pricing data safely
        let itemPrice = 0;
        if (catalogItem.prices && catalogItem.prices.length > 0) {
          itemPrice = Number(catalogItem.prices[0].price || 0);
        } else if (catalogItem.price) {
          itemPrice = Number(catalogItem.price);
        }

        return {
          id: compositeKey, 
          itemId: catalogItem.id,
          name: catalogItem.name || "Laundry Item",
          itemName: catalogItem.name || "Laundry Item",
          quantity: qty,
          unitPrice: itemPrice,
          serviceOptionId: catalogItem.prices?.[0]?.service_option_id || "default-option-id"
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [quantities, catalog]);

  const grandTotal = useMemo(() => {
    return itemsList.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [itemsList]);

  const handleOrderCommit = async () => {
    if (itemsList.length === 0) {
      Alert.alert("Execution Blocked", "Your active items cart ledger is empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      const finalServerPayload = {
        address: {
          areaId: "10c3fd4e-23d3-4bd9-97bf-2ee93de70b7e",
          addressLine1: "Walk-in Counter Pickup",
          city: "Khurrianwala",
          instructions: "Standard processing"
        },
        items: itemsList.map(item => ({
          itemId: item.itemId,
          serviceOptionId: item.serviceOptionId,
          quantity: item.quantity
        })),
        schedule: {
          pickupDate: customerData?.orderDate || new Date().toISOString().split('T')[0],
          pickupSlotId: "d4d04f4b-748c-4d0b-9b5f-5f4b00cf9db8",
          deliveryDate: customerData?.deliveryDate || new Date().toISOString().split('T')[0],
          deliverySlotId: "f3648632-2e9a-44ed-88fc-5f6dd151c009"
        },
        contact: {
          firstName: customerData?.customerName?.split(' ')[0] || "Walk-in",
          lastName: customerData?.customerName?.split(' ')[1] || "Customer",
          email: "customer@laundry.com",
          phone: customerData?.phoneNumber || "03001234567"
        },
        couponCode: "WELCOME25",
        specialInstructions: "Standard Care",
        isItemSelectionSkipped: false,
        acceptedTerms: true
      };

      const response = await apiService.post('/orders', finalServerPayload);

      if (response.status === 201 || response.status === 200) {
        const responseData = response.data?.data || response.data;
        onOrderSuccess({
          orderNo: responseData?.orderNo || responseData?.id || `ORD-${Date.now().toString().slice(-6)}`,
          date: customerData?.orderDate || new Date().toISOString().split('T')[0],
          customerName: customerData?.customerName || 'Walk-in Client',
          customerPhone: customerData?.phoneNumber || '03001234567',
          total: grandTotal,
          items: itemsList.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.unitPrice }))
        });
      }
    } catch (error: any) {
      Alert.alert("Order Failed", error.response?.data?.message || "Failed to commit order mutation.");
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
        <Text style={styles.sectionHeading} accessibilityRole="header">Customer Profile</Text>
        <Card style={styles.infoCard} mode="flat">
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.customerName}>{customerData?.customerName || 'Client Profile'}</Text>
              <Text style={styles.dateText}>Order: {customerData?.orderDate || 'Today'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.phoneText}>{customerData?.phoneNumber || 'N/A'}</Text>
              <Text style={styles.dateText}>Delivery: {customerData?.deliveryDate || 'Pending'}</Text>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionHeading} accessibilityRole="header">Invoice Ledger Items</Text>
        <Surface style={styles.tableSurface} elevation={0}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.col, styles.colMain, styles.headerText]}>Item</Text>
            <Text style={[styles.col, styles.colQty, styles.headerText, styles.textCenter]}>Qty</Text>
            <Text style={[styles.col, styles.colRate, styles.headerText, styles.textRight]}>Rate</Text>
            <Text style={[styles.col, styles.colTotal, styles.headerText, styles.textRight]}>Total</Text>
          </View>
          <Divider />

          {itemsList.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontWeight: '600' }}>No active items selected.</Text>
            </View>
          ) : (
            itemsList.map((item) => {
              const totalCost = item.unitPrice * item.quantity;
              return (
                <View key={item.id} style={styles.tableRow} accessible={true}>
                  <Text style={[styles.col, styles.colMain, styles.cellText]}>{item.name}</Text>
                  <Text style={[styles.col, styles.colQty, styles.cellText, styles.textCenter]}>{item.quantity}</Text>
                  <Text style={[styles.col, styles.colRate, styles.cellText, styles.textRight]}>Rs. {item.unitPrice}</Text>
                  <Text style={[styles.col, styles.colTotal, styles.cellText, styles.textRight]}>Rs. {totalCost}</Text>
                </View>
              );
            })
          )}
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
            disabled={itemsList.length === 0}
            style={[styles.actionButton, itemsList.length === 0 && { backgroundColor: '#CBD5E1' }]}
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