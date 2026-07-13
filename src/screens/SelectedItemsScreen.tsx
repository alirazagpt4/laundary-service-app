// src/screens/SelectItemsScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Button, Text, Card, IconButton, ActivityIndicator, Surface, TouchableRipple } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { globalStyles } from '../theme/styles';

interface SelectItemsProps {
  routePayload: any; 
  onBack: () => void;
  onNext: (finalPayload: any) => void;
}

export default function SelectItemsScreen({ routePayload, onBack, onNext }: SelectItemsProps) {
  // CONSUME PERSISTENT ARCHITECTURE FROM GLOBAL ENGINE
  const { 
    categories, 
    quantities, 
    setQuantities, 
    isCatalogLoading 
  } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Fallback structural selection for the initial index layer
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const activeCategory = categories.find(cat => cat.id === selectedCategoryId);

  const updateQuantity = (catId: string, itemId: string, operation: 'INC' | 'DEC') => {
    const key = `${catId}_${itemId}`;
    setQuantities(prev => {
      const currentQty = prev[key] || 0;
      const newQty = operation === 'INC' ? currentQty + 1 : Math.max(0, currentQty - 1);
      return { ...prev, [key]: newQty };
    });
  };

  const compileFinalOrderPayload = () => {
    const selectedItemsBreakdown: any[] = [];
    let orderTotalAccumulator = 0;

    categories.forEach(category => {
      category.items.forEach(item => {
        const key = `${category.id}_${item.id}`;
        const currentQty = quantities[key] || 0;

        if (currentQty > 0) {
          const basePrice = item.prices && item.prices.length > 0 ? item.prices[0].price : 0;
          const totalCalculatedItemCost = basePrice * currentQty;
          
          orderTotalAccumulator += totalCalculatedItemCost;

          selectedItemsBreakdown.push({
            itemId: item.id,
            itemName: item.name,
            itemCode: item.code,
            categoryId: category.id,
            categoryName: category.name,
            quantity: currentQty,
            unitPrice: basePrice,
            totalCost: totalCalculatedItemCost,
            serviceOptionId: item.prices && item.prices.length > 0 ? item.prices[0].service_option_id : null
          });
        }
      });
    });

    if (selectedItemsBreakdown.length === 0) {
      Alert.alert("Empty Selection", "Please increment at least 1 structural item quantity to proceed downstream.");
      return;
    }

    const finalPipelinePayload = {
      customerData: routePayload, 
      orderedItems: selectedItemsBreakdown,
      financials: {
        grossTotal: orderTotalAccumulator,
        currency: "PKR"
      }
    };

    onNext(finalPipelinePayload);
  };

  if (isCatalogLoading) {
    return (
      <View style={styles.centerEngine}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingTxt}>Hydrating Distributed Service Trees...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.mainContainer} edges={['top', 'left', 'right']}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title="SELECT ITEMS & QUANTITY" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {/* HORIZONTAL CATEGORY NAVIGATION STRIP */}
      <View style={{ height: 60, backgroundColor: '#FFFFFF' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryStrip}>
          {categories.map((category) => {
            const isSelected = category.id === selectedCategoryId;
            return (
              <Surface 
                key={category.id} 
                style={[styles.chipSurface, isSelected && styles.activeChipSurface]} 
                elevation={0}
              >
                <TouchableRipple
                  onPress={() => setSelectedCategoryId(category.id)}
                  style={styles.chipTouch}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${category.name} Category`}
                >
                  <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                    {category.name}
                  </Text>
                </TouchableRipple>
              </Surface>
            );
          })}
        </ScrollView>
      </View>

      {/* DYNAMIC VIRTUALIZED ITEMS SCROLLER CONTAINER */}
      <FlatList
        data={activeCategory ? activeCategory.items : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const key = `${selectedCategoryId}_${item.id}`;
          const currentItemQty = quantities[key] || 0;
          const displayPrice = item.prices && item.prices.length > 0 ? item.prices[0].price : "N/A";

          return (
            <Card style={styles.itemCard} mode="outlined">
              <View style={styles.cardInternalRow}>
                <View style={styles.infoColumn}>
                  <Text style={styles.itemNameText}>{item.name}</Text>
                  <Text style={styles.itemPriceText}>
                    {typeof displayPrice === 'number' ? `Rs. ${displayPrice}` : displayPrice}
                  </Text>
                </View>

                {/* ACCESSIBILITY COMPLIANT INCREMENT CONTROLLER */}
                <View style={styles.counterControlWrapper}>
                  <IconButton
                    icon="minus-box"
                    iconColor={currentItemQty > 0 ? "#6366F1" : "#CBD5E1"}
                    size={32}
                    disabled={currentItemQty === 0}
                    onPress={() => updateQuantity(selectedCategoryId, item.id, 'DEC')}
                    accessibilityLabel={`Decrease operational quantity for ${item.name}`}
                    accessibilityHint={`Current layout count value is ${currentItemQty}`}
                  />
                  <Text 
                    style={styles.quantityDisplayValue}
                    accessibilityLiveRegion="polite"
                  >
                    {currentItemQty}
                  </Text>
                  <IconButton
                    icon="plus-box"
                    iconColor="#6366F1"
                    size={32}
                    onPress={() => updateQuantity(selectedCategoryId, item.id, 'INC')}
                    accessibilityLabel={`Increase operational quantity for ${item.name}`}
                    accessibilityHint={`Current layout count value is ${currentItemQty}`}
                  />
                </View>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTxt}>No catalog aggregates linked inside this node profile.</Text>
          </View>
        }
      />

      {/* FOOTER ACTION PIPELINE INTERFACE */}
      <View style={styles.actionStickyFooter}>
        <Button 
          mode="contained" 
          onPress={compileFinalOrderPayload} 
          style={styles.executionBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Compile Summary Layer ➔
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerEngine: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingTxt: { marginTop: 14, fontWeight: '800', color: '#6366F1', fontSize: 13, letterSpacing: 0.5 },
  appbar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  appbarTitle: { fontSize: 14, fontWeight: '900', color: '#1E293B', letterSpacing: 0.5 },
  categoryStrip: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  chipSurface: { borderRadius: 20, backgroundColor: '#F1F5F9', overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  activeChipSurface: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipTouch: { paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  activeChipText: { color: '#FFFFFF' },
  listContainer: { padding: 16, paddingBottom: 100 },
  itemCard: { marginBottom: 12, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 10 },
  cardInternalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  infoColumn: { flex: 1, paddingRight: 8 },
  itemNameText: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  itemPriceText: { fontSize: 13, fontWeight: '700', color: '#6366F1', marginTop: 3 },
  counterControlWrapper: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  quantityDisplayValue: { fontSize: 16, fontWeight: '900', color: '#0F172A', minWidth: 24, textAlign: 'center' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyTxt: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  actionStickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#F1F5F9' },
  executionBtn: { backgroundColor: '#6366F1', borderRadius: 8 }
});