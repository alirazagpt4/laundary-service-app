import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function ReceiptScreen({ orderData, onBackToHome }: { orderData: any; onBackToHome: () => void }) {
  if (!orderData) return null;

  const handleThermalPrint = () => {
    // Structural abstraction placeholder for react-native-bluetooth-escpos-printer
    Alert.alert("Thermal Printer Action", `Transmitting transaction matrix data for Order: ${orderData.orderNo} to paired hardware.`);
  };

  const handleDownloadPDF = () => {
    // Structural abstraction placeholder for react-native-view-shot/rn-fetch-blob canvas dump
    Alert.alert("PDF Engine", `Rendering local asset mapping canvas pipeline. File app-release directory hook initialized.`);
  };

  const handleWhatsAppShare = () => {
    // Structural abstraction execution schema
    Alert.alert("Communication API", `Injecting deep link target parameters: whatsapp://send?text=Order No: ${orderData.orderNo}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.receiptWrapper} contentContainerStyle={{ alignItems: 'center' }}>
        
        {/* BANK STYLE RECEIPT CONTAINER */}
        <View style={styles.receiptCard} accessible={true} accessibilityRole="summary" accessibilityLabel="Transaction Invoice Data Sheet Summary">
          <Text style={styles.bankHeader}>TRANSACTION RECEIPT</Text>
          <Text style={styles.brandTitle}>AWAIS DRY CLEANER</Text>
          <View style={styles.dashedLine} />
          
          <View style={styles.metaRow}><Text style={styles.label}>Order No:</Text><Text style={styles.value}>{orderData.orderNo}</Text></View>
          <View style={styles.metaRow}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{orderData.date}</Text></View>
          <View style={styles.metaRow}><Text style={styles.label}>Status:</Text><Text style={[styles.value, {color: '#2B8A3E'}]}>PAID / UNPROCESSED</Text></View>
          
          <View style={styles.dashedLine} />
          
          {orderData.items.map((item: any) => (
            <View key={item.id} style={styles.itemBillRow}>
              <Text style={styles.billItemDesc}>{item.name} x {item.qty}</Text>
              <Text style={styles.billItemPrice}>Rs. {item.price * item.qty}</Text>
            </View>
          ))}
          
          <View style={styles.dashedLine} />
          
          <View style={styles.totalReceiptRow} aria-live="assertive">
            <Text style={styles.grandLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.grandValue}>Rs. {orderData.total}</Text>
          </View>
        </View>

        {/* ACTION BUTTON GRID MATRIX */}
        <View style={styles.actionGrid} accessible={true} accessibilityLabel="Receipt Operational Actions Group">
          <TouchableOpacity style={[styles.actionBtn, styles.printColor]} onPress={handleThermalPrint} accessibilityRole="button" accessibilityLabel="Transmit layout via Bluetooth ESC/POS hardware printer">
            <Text style={styles.btnText}>Print Thermal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.downloadColor]} onPress={handleDownloadPDF} accessibilityRole="button" accessibilityLabel="Download and render compiled local document file stream">
            <Text style={styles.btnText}>Download PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.whatsappColor]} onPress={handleWhatsAppShare} accessibilityRole="button" accessibilityLabel="Forward invoice payload summary direct to target customer WhatsApp chain">
            <Text style={styles.btnText}>Send WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backHomeBtn} onPress={onBackToHome} accessibilityRole="button" accessibilityLabel="Clear active transaction context and reset to fresh control center layout">
            <Text style={styles.backHomeBtnText}>Create New Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E9ECEF' },
  receiptWrapper: { padding: 20 },
  receiptCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 4, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  bankHeader: { fontSize: 14, fontWeight: '700', color: '#868E96', letterSpacing: 2, textAlign: 'center', marginBottom: 4 },
  brandTitle: { fontSize: 24, fontWeight: '900', color: '#212529', textAlign: 'center', marginBottom: 14 },
  dashedLine: { height: 1, borderColor: '#CED4DA', borderWidth: 1, borderStyle: 'dashed', marginVertical: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#495057', fontWeight: '500' },
  value: { fontSize: 14, color: '#212529', fontWeight: '700' },
  itemBillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billItemDesc: { fontSize: 15, color: '#495057' },
  billItemPrice: { fontSize: 15, color: '#212529', fontWeight: '600' },
  totalReceiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  grandLabel: { fontSize: 15, color: '#212529', fontWeight: '800' },
  grandValue: { fontSize: 22, color: '#2B8A3E', fontWeight: '900' },
  actionGrid: { width: '100%', marginTop: 24 },
  actionBtn: { width: '100%', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  printColor: { backgroundColor: '#495057' },
  downloadColor: { backgroundColor: '#0055FF' },
  whatsappColor: { backgroundColor: '#2B8A3E' },
  backHomeBtn: { width: '100%', padding: 16, borderOpacity: 1, borderWidth: 2, borderColor: '#0055FF', borderRadius: 8, alignItems: 'center', marginTop: 10 },
  backHomeBtnText: { color: '#0055FF', fontSize: 16, fontWeight: '700' }
});