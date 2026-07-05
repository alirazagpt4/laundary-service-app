import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, SafeAreaView, ScrollView, 
  TouchableOpacity, Alert 
} from 'react-native';

// Mock DB Structure for Static Categories (O(1) Data Set)
const CATEGORY_DATA: Record<string, { id: string; name: string; price: number }[]> = {
  'Casual Wear': [
    { id: 'c1', name: 'Shirt', price: 150 },
    { id: 'c2', name: 'Pants', price: 150 },
    { id: 'c3', name: 'Shalwar Kameez', price: 250 }
  ],
  'Formal Wear': [
    { id: 'f1', name: 'Suit 2-Piece', price: 600 },
    { id: 'f2', name: 'Coat/Blazer', price: 400 },
    { id: 'f3', name: 'Sherwani', price: 1200 }
  ]
};

export default function HomeScreen({ onOrderSubmit }: { onOrderSubmit: (data: any) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Casual Wear');
  const [cart, setCart] = useState<Record<string, { name: string; price: number; qty: number }>>({});

  // O(1) Cart Modifier Logic
  const addItemToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prevCart => {
      const existing = prevCart[item.id];
      return {
        ...prevCart,
        [item.id]: {
          name: item.name,
          price: item.price,
          qty: existing ? existing.qty + 1 : 1
        }
      };
    });
  };

  const removeItemFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existing = prevCart[itemId];
      if (!existing) return prevCart;
      const updatedCart = { ...prevCart };
      if (existing.qty <= 1) {
        delete updatedCart[itemId];
      } else {
        updatedCart[itemId] = { ...existing, qty: existing.qty - 1 };
      }
      return updatedCart;
    });
  };

  // Derived State Matrix (No excessive re-renders)
  const cartItemsArray = Object.entries(cart);
  const subTotal = cartItemsArray.reduce((acc, [_, item]) => acc + (item.price * item.qty), 0);

  const handleSubmitOrder = () => {
    if (subTotal === 0) {
      Alert.alert("Error", "Cart is empty. Please add items.");
      return;
    }
    const receiptPayload = {
      orderNo: `LND-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      items: cartItemsArray.map(([id, item]) => ({ id, ...item })),
      total: subTotal
    };
    onOrderSubmit(receiptPayload);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER LANDMARK SECTION */}
      <View style={styles.header} accessible={true} accessibilityRole="header">
        <View style={styles.logoPlaceholder} accessibilityLabel="Logo Visual" />
        <Text style={styles.headerTitle}>Awais Dry Cleaner</Text>
      </View>

      <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* SERVICE CATEGORY MATRIX */}
        <Text style={styles.sectionHeading} accessibilityRole="header">Service Category</Text>
        <View style={styles.categoryRow}>
          {Object.keys(CATEGORY_DATA).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catButton, selectedCategory === cat && styles.catButtonActive]}
              onPress={() => setSelectedCategory(cat)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${cat} Category Selection`}
              accessibilityState={{ selected: selectedCategory === cat }}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUB-CATEGORIES LIST CONTAINER */}
        <View style={styles.itemsContainer} accessible={true} accessibilityLabel="Available Items Container">
          {CATEGORY_DATA[selectedCategory].map((subItem) => (
            <View key={subItem.id} style={styles.itemTile}>
              <Text style={styles.itemName}>{subItem.name} (Rs. {subItem.price})</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addItemToCart(subItem)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Add ${subItem.name} to checkout basket`}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ORDER VIEW TILE (DYNAMICAL EXTRACTION) */}
        {cartItemsArray.length > 0 && (
          <View style={styles.orderViewBox} accessible={true} accessibilityLabel="Active Order Summary Tile">
            <Text style={styles.orderViewHeader}>Order Summary</Text>
            
            {cartItemsArray.map(([id, item]) => (
              <View key={id} style={styles.orderItemRow}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity 
                    onPress={() => removeItemFromCart(id)} 
                    style={styles.counterBtn}
                    accessibilityLabel={`Decrease count for ${item.name}`}
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <TouchableOpacity 
                    onPress={() => addItemToCart({ id, name: item.name, price: item.price })} 
                    style={styles.counterBtn}
                    accessibilityLabel={`Increase count for ${item.name}`}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemTotalText}>Rs. {item.price * item.qty}</Text>
              </View>
            ))}

            {/* TOTAL COMPUTATION EDGE */}
            <View style={styles.divider} />
            <View style={styles.totalRow} aria-live="polite">
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>Rs. {subTotal}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FIXED FOOTER SUBMIT ACTIONS CHANNEL */}
      <View style={styles.footerAction}>
        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmitOrder}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Generate Invoice Receipt total value Rs. ${subTotal}`}
        >
          <Text style={styles.submitBtnText}>Generate Receipt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E9ECEF' },
  logoPlaceholder: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#0055FF', marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#212529' },
  scrollBody: { flex: 1, padding: 16 },
  sectionHeading: { fontSize: 22, fontWeight: '700', color: '#212529', marginBottom: 12, marginTop: 10 },
  categoryRow: { flexDirection: 'row', marginBottom: 16 },
  catButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#E9ECEF', marginRight: 10 },
  catButtonActive: { backgroundColor: '#0055FF' },
  catText: { fontSize: 14, fontWeight: '600', color: '#495057' },
  catTextActive: { color: '#FFFFFF' },
  itemsContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 8, elevation: 2, marginBottom: 20 },
  itemTile: { flexDirection: 'row', justifyContent: 'between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderColor: '#F1F3F5', display: 'flex', width: '100%' },
  itemName: { fontSize: 16, color: '#343A40', flex: 1 },
  addButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E7F5FF', justifyContent: 'center', alignItems: 'center' },
  addButtonText: { fontSize: 20, fontWeight: '700', color: '#0055FF' },
  orderViewBox: { backgroundColor: '#212529', borderRadius: 16, padding: 16, elevation: 4 },
  orderViewHeader: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  orderItemName: { fontSize: 15, color: '#CED4DA', flex: 2 },
  counterRow: { flexDirection: 'row', alignItems: 'center', flex: 2, justifyContent: 'center' },
  counterBtn: { width: 28, height: 28, backgroundColor: '#495057', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  qtyText: { color: '#FFFFFF', marginHorizontal: 12, fontSize: 16 },
  itemTotalText: { flex: 1.5, color: '#FFFFFF', textAlign: 'right', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#495057', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, color: '#ADB5BD', fontWeight: '600' },
  totalValue: { fontSize: 20, color: '#69DB7C', fontWeight: '800' },
  footerAction: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E9ECEF' },
  submitBtn: { backgroundColor: '#0055FF', borderRadius: 12, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});