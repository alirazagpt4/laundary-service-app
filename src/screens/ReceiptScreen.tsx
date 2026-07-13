// src/screens/ReceiptScreen.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Button, Text, Surface, Divider } from 'react-native-paper';
import RNPrint from 'react-native-print';

interface ReceiptScreenProps {
  orderData: {
    orderNo: string;
    date: string;
    customerName: string;
    customerPhone: string;
    total: number;
    items: Array<{
      id: string;
      name: string;
      qty: number;
      price: number;
    }>;
  };
  onBackToHome: () => void;
}

export default function ReceiptScreen({ orderData, onBackToHome }: ReceiptScreenProps) {
  if (!orderData) return null;

  // HTML Blueprint String for Printing Spooler
  const generateHtmlTemplate = () => {
    const rows = orderData.items
      .map(
        (i) => `
      <tr>
        <td style="padding: 8px 0; font-size: 14px;">${i.name} x ${i.qty}</td>
        <td style="padding: 8px 0; text-align: right; font-size: 14px;">Rs. ${i.price * i.qty}</td>
      </tr>`
      )
      .join('');

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; color: #212529; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .receipt-title { font-size: 12px; font-weight: bold; color: #868E96; letter-spacing: 2px; }
            .brand-title { font-size: 22px; font-weight: 900; color: #6366F1; margin-top: 5px; }
            .dashed { border-top: 1px dashed #CED4DA; margin: 15px 0; }
            .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .label { color: #64748B; font-weight: 600; }
            .value { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; }
            .total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
            .grand-label { font-size: 16px; font-weight: 800; }
            .grand-value { font-size: 22px; font-weight: 900; color: #10B981; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="receipt-title">TRANSACTION RECEIPT</div>
            <div class="brand-title">AWAIS DRY CLEANERS</div>
          </div>
          <div class="dashed"></div>
          <div class="meta-row"><span class="label">Order No:</span><span class="value">${orderData.orderNo}</span></div>
          <div class="meta-row"><span class="label">Date:</span><span class="value">${orderData.date}</span></div>
          <div class="meta-row"><span class="label">Customer:</span><span class="value">${orderData.customerName || 'Walk-in'}</span></div>
          <div class="meta-row"><span class="label">Status:</span><span class="value" style="color: #10B981;">PAID</span></div>
          <div class="dashed"></div>
          <table>
            ${rows}
          </table>
          <div class="dashed"></div>
          <div class="total-row">
            <span class="grand-label">TOTAL AMOUNT</span>
            <span class="grand-value">Rs. ${orderData.total}</span>
          </div>
        </body>
      </html>
    `;
  };

  // 1. SYSTEM PRINT ENGINE
  const handleSystemPrint = async () => {
    try {
      const html = generateHtmlTemplate();
      await RNPrint.print({ html });
    } catch (error) {
      Alert.alert("Print Failure", "Could not mount print spooler interface.");
    }
  };

  // 2. WHATSAPP TRANSACTION LINK PIPELINE
  const handleWhatsAppShare = async () => {
    let phone = orderData.customerPhone ? orderData.customerPhone.trim() : '';
    if (!phone) {
      Alert.alert("Missing Input Parameters", "No operational phone number linked to this transaction.");
      return;
    }

    if (phone.startsWith('0')) {
      phone = '92' + phone.substring(1);
    } else if (!phone.startsWith('92')) {
      phone = '92' + phone;
    }

    const message = `*AWAIS DRY CLEANERS*\n\n` +
                    `*Order No:* ${orderData.orderNo}\n` +
                    `*Date:* ${orderData.date}\n` +
                    `*Customer:* ${orderData.customerName || 'Walk-in'}\n` +
                    `---------------------------\n` +
                    orderData.items.map(i => `${i.name} x ${i.qty} = Rs. ${i.price * i.qty}`).join('\n') +
                    `\n---------------------------\n` +
                    `*Total Amount:* Rs. ${orderData.total}\n\n` +
                    `Thank you for choosing us!`;

    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Execution Refused", "WhatsApp core application missing.");
      }
    } catch (error) {
      Alert.alert("Deep Link Error", "Channel verification failed.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.Content title="Invoice Receipt" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Surface 
          style={styles.receiptCard} 
          elevation={1}
          accessible={true}
          accessibilityLabel={`Receipt Details for Order Number ${orderData.orderNo}. Customer name is ${orderData.customerName || 'Walk-in Client'}. Issued on ${orderData.date}`}
        >
          <Text style={styles.bankHeader} accessibilityRole="header">TRANSACTION RECEIPT</Text>
          <Text style={styles.brandTitle}>AWAIS DRY CLEANERS</Text>
          
          <Divider style={styles.dashedLine} importantForAccessibility="no" />
          
          <View style={styles.metaRow} accessible={true} accessibilityLabel={`Order number is ${orderData.orderNo}`}>
            <Text style={styles.label}>Order No:</Text>
            <Text style={styles.value}>{orderData.orderNo}</Text>
          </View>
          <View style={styles.metaRow} accessible={true} accessibilityLabel={`Transaction date is ${orderData.date}`}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{orderData.date}</Text>
          </View>
          <View style={styles.metaRow} accessible={true} accessibilityLabel={`Customer name is ${orderData.customerName || 'Walk-in Client'}`}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{orderData.customerName || 'Walk-in Client'}</Text>
          </View>
          <View style={styles.metaRow} accessible={true} accessibilityLabel="Payment status is paid">
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, styles.statusPaid]}>PAID</Text>
          </View>
          
          <Divider style={styles.dashedLine} importantForAccessibility="no" />
          
          {/* ITEMS LISTING LOOP - COMPACTED MATRIX FOR SCREEN READERS */}
          {orderData.items.map((item: any, idx: number) => {
            const itemTotalCost = item.price * item.qty;
            return (
              <View 
                key={item.id || String(idx)} 
                style={styles.itemBillRow}
                accessible={true}
                accessibilityLabel={`${item.qty} quantity of ${item.name}, individual item pricing Rs. ${item.price}, net total item price Rs. ${itemTotalCost}`}
              >
                <Text style={styles.billItemDesc}>{item.name} x {item.qty}</Text>
                <Text style={styles.billItemPrice}>Rs. {itemTotalCost}</Text>
              </View>
            );
          })}
          
          <Divider style={styles.dashedLine} importantForAccessibility="no" />
          
          <View 
            style={styles.totalReceiptRow}
            accessible={true}
            accessibilityLabel={`Final grand calculated invoice total amount is Rupees ${orderData.total}`}
          >
            <Text style={styles.grandLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.grandValue}>Rs. {orderData.total}</Text>
          </View>
        </Surface>

        <View style={styles.actionGrid}>
          <Button 
            mode="contained" 
            icon="printer" 
            onPress={handleSystemPrint} 
            style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
            labelStyle={styles.btnLabel}
            accessibilityRole="button"
            accessibilityLabel="Print receipt or save statement as PDF document artifact"
          >
            Print / Save PDF
          </Button>

          <Button 
            mode="contained" 
            icon="whatsapp" 
            onPress={handleWhatsAppShare} 
            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
            labelStyle={styles.btnLabel}
            accessibilityRole="button"
            accessibilityLabel="Send transaction statement invoice directly to customer WhatsApp wire"
          >
            Send WhatsApp
          </Button>
          
          <Button 
            mode="outlined" 
            icon="plus" 
            onPress={onBackToHome} 
            style={styles.backHomeBtn}
            labelStyle={[styles.btnLabel, { color: '#6366F1' }]}
            accessibilityRole="button"
            accessibilityLabel="Flush current statement memory and trigger workflow back to dashboard console"
          >
            Create New Order
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  appbar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  appbarTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  scrollBody: { flex: 1 },
  scrollContent: { padding: 20, alignItems: 'center' },
  receiptCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 8, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  bankHeader: { fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 1.5, textAlign: 'center', marginBottom: 4 },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#6366F1', textAlign: 'center', marginBottom: 12 },
  dashedLine: { marginVertical: 14, backgroundColor: '#CBD5E1', height: 1 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  value: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  statusPaid: { color: '#10B981' },
  itemBillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billItemDesc: { fontSize: 15, color: '#334155', fontWeight: '500' },
  billItemPrice: { fontSize: 15, color: '#0F172A', fontWeight: '700' },
  totalReceiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  grandLabel: { fontSize: 15, color: '#1E293B', fontWeight: '800' },
  grandValue: { fontSize: 22, color: '#10B981', fontWeight: '900' },
  actionGrid: { width: '100%', marginTop: 24 },
  actionBtn: { width: '100%', marginBottom: 12, borderRadius: 8 },
  backHomeBtn: { width: '100%', marginTop: 8, borderRadius: 8, borderColor: '#6366F1', borderWidth: 1.5 },
  btnLabel: { fontSize: 15, fontWeight: '700', paddingVertical: 4, color: '#FFFFFF' }
});