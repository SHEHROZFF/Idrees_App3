// src/screens/ProductHistoryPage.js
import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Modal,
  ScrollView,
  RefreshControl,
  Linking,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert';

import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';

const ProductHistoryPage = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { myOrders: orders, loading, error } = useSelector((state) => state.orders);
  const [refreshing, setRefreshing] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState('');
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertIcon, setAlertIcon] = React.useState('');
  const [alertButtons, setAlertButtons] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  // Calculate scale factor based on window width
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // Memoize responsive styles
  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1 },
        header: {
          width: '100%',
          paddingVertical: scale(14),
          paddingHorizontal: scale(15),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomLeftRadius: scale(30),
          borderBottomRightRadius: scale(30),
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(3) },
          shadowOpacity: 0.25,
          shadowRadius: scale(4),
          marginBottom: scale(12),
        },
        backButton: {
          position: 'absolute',
          left: scale(20),
          paddingTop: Platform.OS === 'ios' ? scale(50) : scale(10),
          padding: scale(10),
        },
        headerTitleContainer: { alignItems: 'center' },
        headerTitle: {
          fontSize: scale(24),
          fontWeight: '800',
        },
        headerSubtitle: {
          fontSize: scale(14),
          marginTop: scale(4),
          fontWeight: '500',
        },
        listContent: {
          padding: scale(15),
          paddingBottom: scale(30),
        },
        loadingContainer: {
          flex: 1,
          alignItems: 'center',
          marginTop: scale(50),
          justifyContent: 'center',
        },
        loadingText: {
          fontSize: scale(16),
          marginTop: scale(10),
          textAlign: 'center',
        },
        emptyContainer: {
          alignItems: 'center',
          marginTop: scale(50),
        },
        emptyText: {
          fontSize: scale(16),
          marginTop: scale(15),
          textAlign: 'center',
          paddingHorizontal: scale(20),
        },
        orderItem: {
          marginBottom: scale(20),
          borderRadius: scale(10),
          borderWidth: scale(1),
          padding: scale(15),
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(1) },
          shadowOpacity: 0.07,
          shadowRadius: scale(2),
        },
        orderHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: scale(10),
        },
        orderDate: {
          fontSize: scale(16),
          fontWeight: '600',
        },
        orderStatus: {
          fontSize: scale(16),
          fontWeight: '600',
          textTransform: 'capitalize',
        },
        purchasedItem: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: scale(10),
        },
        purchasedItemImage: {
          width: scale(50),
          height: scale(50),
          borderRadius: scale(8),
          marginRight: scale(10),
        },
        purchasedItemDetails: { flex: 1 },
        purchasedItemName: {
          fontSize: scale(16),
          fontWeight: '600',
        },
        purchasedItemSubtitle: {
          fontSize: scale(14),
          marginTop: scale(2),
        },
        purchasedItemPrice: {
          fontSize: scale(14),
          fontWeight: '500',
          marginTop: scale(4),
        },
        pdfIconsContainer: {
          flexDirection: 'row',
          marginTop: scale(6),
        },
        pdfIconButton: {
          marginLeft: scale(15),
          padding: scale(6),
        },
        viewReceiptButton: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: scale(10),
          padding: scale(10),
          borderWidth: scale(1),
          borderRadius: scale(8),
          alignSelf: 'flex-start',
        },
        viewReceiptText: {
          marginLeft: scale(5),
          fontSize: scale(16),
          fontWeight: '500',
        },
        modalBackground: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        modalContainer: {
          borderRadius: scale(20),
          padding: scale(20),
          maxHeight: '80%',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(2) },
          shadowOpacity: 0.15,
          shadowRadius: scale(3.84),
        },
        modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        modalIcons: { flexDirection: 'row' },
        modalIconButton: {
          marginLeft: scale(15),
          padding: scale(6),
        },
        modalTitle: {
          fontSize: scale(22),
          fontWeight: '700',
          marginBottom: scale(8),
        },
        modalContent: { paddingBottom: scale(20) },
        modalSection: { marginBottom: scale(12) },
        modalLabel: {
          fontSize: scale(15),
          fontWeight: '600',
          marginBottom: scale(4),
        },
        modalText: { fontSize: scale(15) },
        itemRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: scale(5),
        },
        itemName: { flex: 2, fontSize: scale(15) },
        itemPrice: {
          flex: 1,
          fontSize: scale(15),
          textAlign: 'right',
        },
        separator: {
          borderBottomWidth: scale(1),
          marginVertical: scale(15),
        },
        modalTotal: {
          fontSize: scale(16),
          fontWeight: 'bold',
          marginTop: scale(5),
        },
        closeButton: {
          paddingVertical: scale(12),
          borderRadius: scale(10),
          alignItems: 'center',
          marginTop: scale(10),
        },
        closeButtonText: {
          fontSize: scale(16),
          fontWeight: '600',
        },
      }),
    [width]
  );

  React.useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchMyOrders()).then(() => setRefreshing(false));
  };

  // Helper: Capitalize first letter
  const capitalizeFirstLetter = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  // Helper: Status color based on order status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA726';
      case 'completed':
        return '#66BB6A';
      case 'cancelled':
        return '#EF5350';
      default:
        return '#757575';
    }
  };

  // Generate Receipt HTML using current theme colors
  const generateReceiptHTML = (order) => {
    const { _id, createdAt, status, orderItems, totalPrice, paymentMethod } = order;
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: ${currentTheme.primaryColor}; }
            .section { margin-top: 20px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${currentTheme.secondaryColor}; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
            .footer { margin-top: 20px; font-size: 14px; text-align: center; color: ${currentTheme.textColor}; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Receipt</h1>
          <div class="section">
            <div class="item"><span class="label">Order ID:</span><span>${_id}</span></div>
            <div class="item"><span class="label">Date:</span><span>${new Date(
              createdAt
            ).toLocaleDateString()}</span></div>
            <div class="item"><span class="label">Status:</span><span>${capitalizeFirstLetter(
              status
            )}</span></div>
          </div>
          <div class="section">
            <div class="section-title">Items Purchased:</div>
            ${orderItems
              .map(
                (item, index) => `
                <div class="item">
                  <span>${index + 1}. ${item.examName} (${item.subjectName})</span>
                  <span>$${item.price.toFixed(2)}</span>
                </div>
              `
              )
              .join('')}
            <div class="total">Total Price: $${totalPrice.toFixed(2)}</div>
          </div>
          <div class="section">
            <div class="item"><span class="label">Payment Method:</span><span>${paymentMethod}</span></div>
          </div>
          <div class="footer">
            <p>Thank you for your purchase!</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleGenerateReceipt = async (order) => {
    try {
      const html = generateReceiptHTML(order);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error generating receipt:', error);
      setAlertTitle('Error');
      setAlertMessage('Failed to generate receipt.');
      setAlertIcon('close-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    }
  };

  const handleDownloadReceipt = async (order) => {
    try {
      const html = generateReceiptHTML(order);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setAlertTitle('Error');
      setAlertMessage('Failed to download receipt.');
      setAlertIcon('close-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    }
  };

  const openReceiptModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };
  const closeReceiptModal = () => {
    setSelectedOrder(null);
    setModalVisible(false);
  };

  const handleViewPDF = async (pdfLink) => {
    try {
      const supported = await Linking.canOpenURL(pdfLink);
      if (supported) await Linking.openURL(pdfLink);
      else throw new Error('Cannot open the PDF link.');
    } catch (error) {
      console.error('View PDF Error:', error);
      setAlertTitle('Error');
      setAlertMessage(error.message || 'Failed to open PDF.');
      setAlertIcon('close-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    }
  };

  const handleDownloadPDF = async (pdfLink) => {
    try {
      const fileName = pdfLink.split('/').pop();
      const downloadResumable = FileSystem.createDownloadResumable(
        pdfLink,
        FileSystem.documentDirectory + fileName
      );
      const { uri: localUri } = await downloadResumable.downloadAsync();
      await Sharing.shareAsync(localUri);
    } catch (error) {
      console.error('Download PDF Error:', error);
      setAlertTitle('Error');
      setAlertMessage(error.message || 'Failed to download PDF.');
      setAlertIcon('close-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={[styles.orderItem, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.borderColor }]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderDate, { color: currentTheme.textColor }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
          {capitalizeFirstLetter(item.status)}
        </Text>
      </View>

      <FlatList
        data={item.orderItems}
        keyExtractor={(orderItem) => orderItem.product._id}
        renderItem={({ item: orderItem }) => (
          <View style={styles.purchasedItem}>
            <Image source={{ uri: orderItem.image }} style={styles.purchasedItemImage} />
            <View style={styles.purchasedItemDetails}>
              <Text style={[styles.purchasedItemName, { color: currentTheme.cardTextColor }]} numberOfLines={1}>
                {orderItem.examName}
              </Text>
              <Text style={[styles.purchasedItemSubtitle, { color: currentTheme.textColor }]} numberOfLines={1}>
                {orderItem.subjectName} ({orderItem.subjectCode})
              </Text>
              <Text style={[styles.purchasedItemPrice, { color: currentTheme.priceColor }]}>
                ${orderItem.price.toFixed(2)}
              </Text>
              <View style={styles.pdfIconsContainer}>
                <TouchableOpacity
                  onPress={() => handleViewPDF(orderItem.product.pdfLink)}
                  style={styles.pdfIconButton}
                >
                  <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDownloadPDF(orderItem.product.pdfLink)}
                  style={styles.pdfIconButton}
                >
                  <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={[styles.viewReceiptButton, { borderColor: currentTheme.borderColor }]}
        onPress={() => openReceiptModal(item)}
      >
        <Ionicons name="receipt-outline" size={20} color={currentTheme.cardTextColor} />
        <Text style={[styles.viewReceiptText, { color: currentTheme.cardTextColor }]}>
          View Receipt
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primaryColor} />
          <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />
      <LinearGradient
        colors={currentTheme.headerBackground}
        style={[styles.header, { paddingTop: insets.top + scale(10) }]}
        start={[0, 0]}
        end={[0, 1]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go Back"
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
            Order History
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
            View your past purchases
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={80} color={currentTheme.placeholderTextColor} />
              <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
                {error || 'Failed to load orders.'}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={80} color={currentTheme.placeholderTextColor} />
              <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
                You have no past orders.
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentTheme.primaryColor}
          />
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeReceiptModal}
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground, width: width * 0.9 }]}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
                    Receipt Details
                  </Text>
                  <View style={styles.modalIcons}>
                    <TouchableOpacity
                      onPress={() => handleGenerateReceipt(selectedOrder)}
                      style={styles.modalIconButton}
                    >
                      <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDownloadReceipt(selectedOrder)}
                      style={styles.modalIconButton}
                    >
                      <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView contentContainerStyle={styles.modalContent}>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
                      Order ID:
                    </Text>
                    <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                      {selectedOrder._id}
                    </Text>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
                      Date:
                    </Text>
                    <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
                      Status:
                    </Text>
                    <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                      {capitalizeFirstLetter(selectedOrder.status)}
                    </Text>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
                      Items Purchased:
                    </Text>
                    {selectedOrder.orderItems.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={[styles.itemName, { color: currentTheme.textColor }]}>
                          {idx + 1}.  {item.subjectName} ({item.subjectCode})
                        </Text>
                        <Text style={[styles.itemPrice, { color: currentTheme.textColor }]}>
                          ${item.price.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={[styles.separator, { borderBottomColor: currentTheme.borderColor }]} />
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
                      Total Price:
                    </Text>
                    <Text style={[styles.modalTotal, { color: currentTheme.priceColor }]}>
                      ${selectedOrder.totalPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
                      Payment Method:
                    </Text>
                    <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
                      {selectedOrder.paymentMethod}
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: currentTheme.primaryColor }]}
                  onPress={closeReceiptModal}
                >
                  <Text style={[styles.closeButtonText, { color: currentTheme.buttonTextColor }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        icon={alertIcon}
        onClose={() => setAlertVisible(false)}
        buttons={alertButtons}
      />
    </View>
  );
};

export default ProductHistoryPage;












// // src/screens/ProductHistoryPage.js
// import React, { useContext } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   SafeAreaView,
//   Modal,
//   ScrollView,
//   RefreshControl,
//   Linking,
//   ActivityIndicator,
//   Platform,
//   useWindowDimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';

// import { useDispatch, useSelector } from 'react-redux';
// import { fetchMyOrders } from '../store/slices/orderSlice';

// const ProductHistoryPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const { width } = useWindowDimensions();

//   const dispatch = useDispatch();
//   const { myOrders: orders, loading, error } = useSelector((state) => state.orders);
//   const [refreshing, setRefreshing] = React.useState(false);
//   const [alertVisible, setAlertVisible] = React.useState(false);
//   const [alertTitle, setAlertTitle] = React.useState('');
//   const [alertMessage, setAlertMessage] = React.useState('');
//   const [alertIcon, setAlertIcon] = React.useState('');
//   const [alertButtons, setAlertButtons] = React.useState([]);
//   const [modalVisible, setModalVisible] = React.useState(false);
//   const [selectedOrder, setSelectedOrder] = React.useState(null);

//   const insets = useSafeAreaInsets();

//   React.useEffect(() => {
//     dispatch(fetchMyOrders());
//   }, [dispatch]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     dispatch(fetchMyOrders()).then(() => setRefreshing(false));
//   };

//   // Helper: Capitalize first letter
//   const capitalizeFirstLetter = (str) =>
//     str.charAt(0).toUpperCase() + str.slice(1);

//   // Helper: Status color based on order status
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending':
//         return '#FFA726';
//       case 'completed':
//         return '#66BB6A';
//       case 'cancelled':
//         return '#EF5350';
//       default:
//         return '#757575';
//     }
//   };

//   // Generate Receipt HTML using current theme colors
//   const generateReceiptHTML = (order) => {
//     const { _id, createdAt, status, orderItems, totalPrice, paymentMethod } = order;
//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             h1 { text-align: center; color: ${currentTheme.primaryColor}; }
//             .section { margin-top: 20px; }
//             .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${currentTheme.secondaryColor}; }
//             .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
//             .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
//             .footer { margin-top: 20px; font-size: 14px; text-align: center; color: ${currentTheme.textColor}; }
//             .label { font-weight: bold; }
//           </style>
//         </head>
//         <body>
//           <h1>Receipt</h1>
//           <div class="section">
//             <div class="item"><span class="label">Order ID:</span><span>${_id}</span></div>
//             <div class="item"><span class="label">Date:</span><span>${new Date(
//               createdAt
//             ).toLocaleDateString()}</span></div>
//             <div class="item"><span class="label">Status:</span><span>${capitalizeFirstLetter(
//               status
//             )}</span></div>
//           </div>
//           <div class="section">
//             <div class="section-title">Items Purchased:</div>
//             ${orderItems
//               .map(
//                 (item, index) => `
//                 <div class="item">
//                   <span>${index + 1}. ${item.examName} (${item.subjectName})</span>
//                   <span>$${item.price.toFixed(2)}</span>
//                 </div>
//               `
//               )
//               .join('')}
//             <div class="total">Total Price: $${totalPrice.toFixed(2)}</div>
//           </div>
//           <div class="section">
//             <div class="item"><span class="label">Payment Method:</span><span>${paymentMethod}</span></div>
//           </div>
//           <div class="footer">
//             <p>Thank you for your purchase!</p>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   const handleGenerateReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri);
//     } catch (error) {
//       console.error('Error generating receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to generate receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const handleDownloadReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
//     } catch (error) {
//       console.error('Error downloading receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to download receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const openReceiptModal = (order) => {
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };
//   const closeReceiptModal = () => {
//     setSelectedOrder(null);
//     setModalVisible(false);
//   };

//   const handleViewPDF = async (pdfLink) => {
//     try {
//       const supported = await Linking.canOpenURL(pdfLink);
//       if (supported) await Linking.openURL(pdfLink);
//       else throw new Error('Cannot open the PDF link.');
//     } catch (error) {
//       console.error('View PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to open PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const handleDownloadPDF = async (pdfLink) => {
//     try {
//       const fileName = pdfLink.split('/').pop();
//       const downloadResumable = FileSystem.createDownloadResumable(
//         pdfLink,
//         FileSystem.documentDirectory + fileName
//       );
//       const { uri: localUri } = await downloadResumable.downloadAsync();
//       await Sharing.shareAsync(localUri);
//     } catch (error) {
//       console.error('Download PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to download PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const renderOrderItem = ({ item }) => (
//     <View style={[styles.orderItem, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.borderColor }]}>
//       <View style={styles.orderHeader}>
//         <Text style={[styles.orderDate, { color: currentTheme.textColor }]}>
//           {new Date(item.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
//           {capitalizeFirstLetter(item.status)}
//         </Text>
//       </View>

//       <FlatList
//         data={item.orderItems}
//         keyExtractor={(orderItem) => orderItem.product._id}
//         renderItem={({ item: orderItem }) => (
//           <View style={styles.purchasedItem}>
//             <Image source={{ uri: orderItem.image }} style={styles.purchasedItemImage} />
//             <View style={styles.purchasedItemDetails}>
//               <Text
//                 style={[styles.purchasedItemName, { color: currentTheme.cardTextColor }]}
//                 numberOfLines={1}
//               >
//                 {orderItem.examName}
//               </Text>
//               <Text
//                 style={[styles.purchasedItemSubtitle, { color: currentTheme.textColor }]}
//                 numberOfLines={1}
//               >
//                 {orderItem.subjectName} ({orderItem.subjectCode})
//               </Text>
//               <Text style={[styles.purchasedItemPrice, { color: currentTheme.priceColor }]}>
//                 ${orderItem.price.toFixed(2)}
//               </Text>
//               <View style={styles.pdfIconsContainer}>
//                 <TouchableOpacity
//                   onPress={() => handleViewPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                 >
//                   <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => handleDownloadPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                 >
//                   <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//       />
//       <TouchableOpacity
//         style={[styles.viewReceiptButton, { borderColor: currentTheme.borderColor }]}
//         onPress={() => openReceiptModal(item)}
//       >
//         <Ionicons name="receipt-outline" size={20} color={currentTheme.cardTextColor} />
//         <Text style={[styles.viewReceiptText, { color: currentTheme.cardTextColor }]}>
//           View Receipt
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading your orders...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header, { paddingTop: insets.top + 10 }]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Order History
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             View your past purchases
//           </Text>
//         </View>
//       </LinearGradient>

//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item._id}
//         renderItem={renderOrderItem}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           error ? (
//             <View style={styles.emptyContainer}>
//               <Ionicons name="alert-circle-outline" size={80} color={currentTheme.placeholderTextColor} />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 {error || 'Failed to load orders.'}
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Ionicons name="cart-outline" size={80} color={currentTheme.placeholderTextColor} />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 You have no past orders.
//               </Text>
//             </View>
//           )
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={currentTheme.primaryColor}
//           />
//         }
//       />

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={closeReceiptModal}
//         transparent={true}
//       >
//         <View style={styles.modalBackground}>
//           <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground, width: width * 0.9 }]}>
//             {selectedOrder && (
//               <>
//                 <View style={styles.modalHeader}>
//                   <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
//                     Receipt Details
//                   </Text>
//                   <View style={styles.modalIcons}>
//                     <TouchableOpacity
//                       onPress={() => handleGenerateReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                     >
//                       <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => handleDownloadReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                     >
//                       <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <ScrollView contentContainerStyle={styles.modalContent}>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Order ID:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder._id}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Date:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {new Date(selectedOrder.createdAt).toLocaleDateString()}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Status:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {capitalizeFirstLetter(selectedOrder.status)}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Items Purchased:
//                     </Text>
//                     {selectedOrder.orderItems.map((item, idx) => (
//                       <View key={idx} style={styles.itemRow}>
//                         <Text style={[styles.itemName, { color: currentTheme.textColor }]}>
//                           {idx + 1}.  {item.subjectName} ({item.subjectCode})
//                         </Text>
//                         <Text style={[styles.itemPrice, { color: currentTheme.textColor }]}>
//                           ${item.price.toFixed(2)}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>
//                   <View style={[styles.separator, { borderBottomColor: currentTheme.borderColor }]} />
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Total Price:
//                     </Text>
//                     <Text style={[styles.modalTotal, { color: currentTheme.priceColor }]}>
//                       ${selectedOrder.totalPrice.toFixed(2)}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Payment Method:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder.paymentMethod}
//                     </Text>
//                   </View>
//                 </ScrollView>

//                 <TouchableOpacity
//                   style={[styles.closeButton, { backgroundColor: currentTheme.primaryColor }]}
//                   onPress={closeReceiptModal}
//                 >
//                   <Text style={[styles.closeButtonText, { color: currentTheme.buttonTextColor }]}>Close</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default ProductHistoryPage;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 14,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     marginBottom: 12,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 20,
//     paddingTop: Platform.OS === 'ios' ? 50 : 10,
//     padding: 10,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   listContent: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     marginTop: 50,
//     justifyContent: 'center',
//   },
//   loadingText: {
//     fontSize: 16,
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 16,
//     marginTop: 15,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   orderItem: {
//     marginBottom: 20,
//     borderRadius: 10,
//     borderWidth: 1,
//     padding: 15,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.07,
//     shadowRadius: 2,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   orderDate: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   orderStatus: {
//     fontSize: 16,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
//   purchasedItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   purchasedItemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   purchasedItemDetails: {
//     flex: 1,
//   },
//   purchasedItemName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItemSubtitle: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   purchasedItemPrice: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginTop: 4,
//   },
//   pdfIconsContainer: {
//     flexDirection: 'row',
//     marginTop: 6,
//   },
//   pdfIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   viewReceiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     padding: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   viewReceiptText: {
//     marginLeft: 5,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: '80%',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3.84,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   modalIcons: {
//     flexDirection: 'row',
//   },
//   modalIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   modalContent: {
//     paddingBottom: 20,
//   },
//   modalSection: {
//     marginBottom: 12,
//   },
//   modalLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   modalText: {
//     fontSize: 15,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 5,
//   },
//   itemName: {
//     flex: 2,
//     fontSize: 15,
//   },
//   itemPrice: {
//     flex: 1,
//     fontSize: 15,
//     textAlign: 'right',
//   },
//   separator: {
//     borderBottomWidth: 1,
//     marginVertical: 15,
//   },
//   modalTotal: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   closeButton: {
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   closeButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });










// // src/screens/ProductHistoryPage.js
// import React, { useContext } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Modal,
//   ScrollView,
//   RefreshControl,
//   Linking,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';

// // Redux imports
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchMyOrders } from '../store/slices/orderSlice';

// const { width } = Dimensions.get('window');

// const ProductHistoryPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const dispatch = useDispatch();
//   const { myOrders: orders, loading, error } = useSelector(state => state.orders);
//   const [refreshing, setRefreshing] = React.useState(false);
//   const [alertVisible, setAlertVisible] = React.useState(false);
//   const [alertTitle, setAlertTitle] = React.useState('');
//   const [alertMessage, setAlertMessage] = React.useState('');
//   const [alertIcon, setAlertIcon] = React.useState('');
//   const [alertButtons, setAlertButtons] = React.useState([]);
//   const [modalVisible, setModalVisible] = React.useState(false);
//   const [selectedOrder, setSelectedOrder] = React.useState(null);

//   const insets = useSafeAreaInsets();

//   React.useEffect(() => {
//     dispatch(fetchMyOrders());
//   }, [dispatch]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     dispatch(fetchMyOrders()).then(() => setRefreshing(false));
//   };

//   // Helper: Capitalize first letter
//   const capitalizeFirstLetter = (str) =>
//     str.charAt(0).toUpperCase() + str.slice(1);

//   // Helper: Status color based on order status
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending':
//         return '#FFA726';
//       case 'completed':
//         return '#66BB6A';
//       case 'cancelled':
//         return '#EF5350';
//       default:
//         return '#757575';
//     }
//   };

//   // Generate Receipt HTML using current theme colors
//   const generateReceiptHTML = (order) => {
//     const { _id, createdAt, status, orderItems, totalPrice, paymentMethod } = order;
//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             h1 { text-align: center; color: ${currentTheme.primaryColor}; }
//             .section { margin-top: 20px; }
//             .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${currentTheme.secondaryColor}; }
//             .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
//             .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
//             .footer { margin-top: 20px; font-size: 14px; text-align: center; color: ${currentTheme.textColor}; }
//             .label { font-weight: bold; }
//           </style>
//         </head>
//         <body>
//           <h1>Receipt</h1>
//           <div class="section">
//             <div class="item"><span class="label">Order ID:</span><span>${_id}</span></div>
//             <div class="item"><span class="label">Date:</span><span>${new Date(
//               createdAt
//             ).toLocaleDateString()}</span></div>
//             <div class="item"><span class="label">Status:</span><span>${capitalizeFirstLetter(
//               status
//             )}</span></div>
//           </div>
//           <div class="section">
//             <div class="section-title">Items Purchased:</div>
//             ${orderItems
//               .map(
//                 (item, index) => `
//                 <div class="item">
//                   <span>${index + 1}. ${item.examName} (${item.subjectName})</span>
//                   <span>$${item.price.toFixed(2)}</span>
//                 </div>
//               `
//               )
//               .join('')}
//             <div class="total">Total Price: $${totalPrice.toFixed(2)}</div>
//           </div>
//           <div class="section">
//             <div class="item"><span class="label">Payment Method:</span><span>${paymentMethod}</span></div>
//           </div>
//           <div class="footer">
//             <p>Thank you for your purchase!</p>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   const handleGenerateReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri);
//     } catch (error) {
//       console.error('Error generating receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to generate receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const handleDownloadReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
//     } catch (error) {
//       console.error('Error downloading receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to download receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const openReceiptModal = (order) => {
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };
//   const closeReceiptModal = () => {
//     setSelectedOrder(null);
//     setModalVisible(false);
//   };

//   const handleViewPDF = async (pdfLink) => {
//     try {
//       const supported = await Linking.canOpenURL(pdfLink);
//       if (supported) await Linking.openURL(pdfLink);
//       else throw new Error('Cannot open the PDF link.');
//     } catch (error) {
//       console.error('View PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to open PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const handleDownloadPDF = async (pdfLink) => {
//     try {
//       const fileName = pdfLink.split('/').pop();
//       const downloadResumable = FileSystem.createDownloadResumable(
//         pdfLink,
//         FileSystem.documentDirectory + fileName
//       );
//       const { uri: localUri } = await downloadResumable.downloadAsync();
//       await Sharing.shareAsync(localUri);
//     } catch (error) {
//       console.error('Download PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to download PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const renderOrderItem = ({ item }) => (
//     <View style={[styles.orderItem, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.borderColor }]}>
//       <View style={styles.orderHeader}>
//         <Text style={[styles.orderDate, { color: currentTheme.textColor }]}>
//           {new Date(item.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
//           {capitalizeFirstLetter(item.status)}
//         </Text>
//       </View>

//       <FlatList
//         data={item.orderItems}
//         keyExtractor={(orderItem) => orderItem.product._id}
//         renderItem={({ item: orderItem }) => (
//           <View style={styles.purchasedItem}>
//             <Image source={{ uri: orderItem.image }} style={styles.purchasedItemImage} />
//             <View style={styles.purchasedItemDetails}>
//               <Text
//                 style={[styles.purchasedItemName, { color: currentTheme.cardTextColor }]}
//                 numberOfLines={1}
//               >
//                 {orderItem.examName}
//               </Text>
//               <Text
//                 style={[styles.purchasedItemSubtitle, { color: currentTheme.textColor }]}
//                 numberOfLines={1}
//               >
//                 {orderItem.subjectName} ({orderItem.subjectCode})
//               </Text>
//               <Text style={[styles.purchasedItemPrice, { color: currentTheme.priceColor }]}>
//                 ${orderItem.price.toFixed(2)}
//               </Text>
//               <View style={styles.pdfIconsContainer}>
//                 <TouchableOpacity
//                   onPress={() => handleViewPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                 >
//                   <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => handleDownloadPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                 >
//                   <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//       />
//       <TouchableOpacity
//         style={[styles.viewReceiptButton, { borderColor: currentTheme.borderColor }]}
//         onPress={() => openReceiptModal(item)}
//       >
//         <Ionicons name="receipt-outline" size={20} color={currentTheme.cardTextColor} />
//         <Text style={[styles.viewReceiptText, { color: currentTheme.cardTextColor }]}>
//           View Receipt
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading your orders...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header, { paddingTop: insets.top + 10 }]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Order History
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             View your past purchases
//           </Text>
//         </View>
//       </LinearGradient>

//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item._id}
//         renderItem={renderOrderItem}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           error ? (
//             <View style={styles.emptyContainer}>
//               <Ionicons name="alert-circle-outline" size={80} color={currentTheme.placeholderTextColor} />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 {error || 'Failed to load orders.'}
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Ionicons name="cart-outline" size={80} color={currentTheme.placeholderTextColor} />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 You have no past orders.
//               </Text>
//             </View>
//           )
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={currentTheme.primaryColor}
//           />
//         }
//       />

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={closeReceiptModal}
//         transparent={true}
//       >
//         <View style={styles.modalBackground}>
//           <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {selectedOrder && (
//               <>
//                 <View style={styles.modalHeader}>
//                   <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
//                     Receipt Details
//                   </Text>
//                   <View style={styles.modalIcons}>
//                     <TouchableOpacity
//                       onPress={() => handleGenerateReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                     >
//                       <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => handleDownloadReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                     >
//                       <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <ScrollView contentContainerStyle={styles.modalContent} >
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Order ID:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder._id}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Date:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {new Date(selectedOrder.createdAt).toLocaleDateString()}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Status:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {capitalizeFirstLetter(selectedOrder.status)}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Items Purchased:
//                     </Text>
//                     {selectedOrder.orderItems.map((item, idx) => (
//                       <View key={idx} style={styles.itemRow}>
//                         <Text style={[styles.itemName, { color: currentTheme.textColor }]}>
//                           {idx + 1}.  {item.subjectName} ({item.subjectCode})
//                         </Text>
//                         <Text style={[styles.itemPrice, { color: currentTheme.textColor }]}>
//                           ${item.price.toFixed(2)}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>
//                   <View style={[styles.separator, { borderBottomColor: currentTheme.borderColor }]} />
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Total Price:
//                     </Text>
//                     <Text style={[styles.modalTotal, { color: currentTheme.priceColor }]}>
//                       ${selectedOrder.totalPrice.toFixed(2)}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Payment Method:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder.paymentMethod}
//                     </Text>
//                   </View>
//                 </ScrollView>

//                 <TouchableOpacity
//                   style={[styles.closeButton, { backgroundColor: currentTheme.primaryColor }]}
//                   onPress={closeReceiptModal}
//                 >
//                   <Text style={[styles.closeButtonText, { color: currentTheme.buttonTextColor }]}>Close</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default ProductHistoryPage;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 14,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     marginBottom: 12,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 20,
//     paddingTop: Platform.OS === 'ios' ? 50 : 10,
//     padding: Platform.OS === 'ios' ? 10 : 10,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   listContent: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     marginTop: 50,
//     justifyContent: 'center',
//   },
//   loadingText: {
//     fontSize: 16,
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 16,
//     marginTop: 15,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   orderItem: {
//     marginBottom: 20,
//     borderRadius: 10,
//     borderWidth: 1,
//     // borderColor: '#E0E0E0',
//     padding: 15,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.07,
//     shadowRadius: 2,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   orderDate: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   orderStatus: {
//     fontSize: 16,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
//   purchasedItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   purchasedItemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   purchasedItemDetails: {
//     flex: 1,
//   },
//   purchasedItemName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItemSubtitle: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   purchasedItemPrice: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginTop: 4,
//   },
//   pdfIconsContainer: {
//     flexDirection: 'row',
//     marginTop: 6,
//   },
//   pdfIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   viewReceiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     padding: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   viewReceiptText: {
//     marginLeft: 5,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: '80%',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3.84,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   modalIcons: {
//     flexDirection: 'row',
//   },
//   modalIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   modalContent: {
//     paddingBottom: 20,
//   },
//   modalSection: {
//     marginBottom: 12,
//   },
//   modalLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   modalText: {
//     fontSize: 15,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 5,
//   },
//   itemName: {
//     flex: 2,
//     fontSize: 15,
//   },
//   itemPrice: {
//     flex: 1,
//     fontSize: 15,
//     textAlign: 'right',
//   },
//   separator: {
//     borderBottomWidth: 1,
//     marginVertical: 15,
//   },
//   modalTotal: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   closeButton: {
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   closeButtonText: {
//     // color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });







// // src/screens/ProductHistoryPage.js

// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Modal,
//   ScrollView,
//   RefreshControl,
//   Linking,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system';

// import api from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';

// const { width } = Dimensions.get('window');

// const ProductHistoryPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Orders & Data States
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // Alert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Receipt Modal
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   // Fetch Orders on Mount
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // -------------------------------------------
//   // Fetch Orders
//   // -------------------------------------------
//   const fetchOrders = async (isRefreshing = false) => {
//     if (isRefreshing) setRefreshing(true);
//     else setLoading(true);
//     setError(null);

//     try {
//       const response = await api.getMyOrders();
//       if (response.success && response.data) {
//         setOrders(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch orders.');
//       }
//     } catch (err) {
//       console.error('Fetch Orders Error:', err);
//       setError(err.message);
//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch orders.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     } finally {
//       if (isRefreshing) setRefreshing(false);
//       else setLoading(false);
//     }
//   };

//   // Pull-to-Refresh
//   const onRefresh = () => {
//     fetchOrders(true);
//   };

//   // -------------------------------------------
//   // Helper: Capitalize
//   // -------------------------------------------
//   const capitalizeFirstLetter = (str) =>
//     str.charAt(0).toUpperCase() + str.slice(1);

//   // Helper: Status Color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending':
//         return '#FFA726'; // Orange
//       case 'completed':
//         return '#66BB6A'; // Green
//       case 'cancelled':
//         return '#EF5350'; // Red
//       default:
//         return '#757575'; // Gray
//     }
//   };

//   // -------------------------------------------
//   // Generate Receipt HTML
//   // -------------------------------------------
//   const generateReceiptHTML = (order) => {
//     const { _id, createdAt, status, orderItems, totalPrice, paymentMethod } =
//       order;
//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             h1 { text-align: center; color: ${currentTheme.primaryColor}; }
//             .section { margin-top: 20px; }
//             .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${currentTheme.secondaryColor}; }
//             .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
//             .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
//             .footer { margin-top: 20px; font-size: 14px; text-align: center; color: ${currentTheme.textColor}; }
//             .label { font-weight: bold; }
//           </style>
//         </head>
//         <body>
//           <h1>Receipt</h1>
//           <div class="section">
//             <div class="item"><span class="label">Order ID:</span><span>${_id}</span></div>
//             <div class="item"><span class="label">Date:</span><span>${new Date(
//               createdAt
//             ).toLocaleDateString()}</span></div>
//             <div class="item"><span class="label">Status:</span><span>${capitalizeFirstLetter(
//               status
//             )}</span></div>
//           </div>
//           <div class="section">
//             <div class="section-title">Items Purchased:</div>
//             ${orderItems
//               .map(
//                 (item, index) => `
//                 <div class="item">
//                   <span>${index + 1}. ${item.examName} (${item.subjectName})</span>
//                   <span>$${item.price.toFixed(2)}</span>
//                 </div>
//               `
//               )
//               .join('')}
//             <div class="total">Total Price: $${totalPrice.toFixed(2)}</div>
//           </div>
//           <div class="section">
//             <div class="item"><span class="label">Payment Method:</span><span>${paymentMethod}</span></div>
//           </div>
//           <div class="footer">
//             <p>Thank you for your purchase!</p>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   // -------------------------------------------
//   // Generate & Share Receipt
//   // -------------------------------------------
//   const handleGenerateReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri);
//     } catch (error) {
//       console.error('Error generating receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to generate receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   // -------------------------------------------
//   // Generate & Download Receipt
//   // -------------------------------------------
//   const handleDownloadReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
//     } catch (error) {
//       console.error('Error downloading receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to download receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   // -------------------------------------------
//   // Receipt Modal
//   // -------------------------------------------
//   const openReceiptModal = (order) => {
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };
//   const closeReceiptModal = () => {
//     setSelectedOrder(null);
//     setModalVisible(false);
//   };

//   // -------------------------------------------
//   // PDF Viewing & Download
//   // -------------------------------------------
//   const handleViewPDF = async (pdfLink) => {
//     try {
//       const supported = await Linking.canOpenURL(pdfLink);
//       if (supported) await Linking.openURL(pdfLink);
//       else throw new Error('Cannot open the PDF link.');
//     } catch (error) {
//       console.error('View PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to open PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const handleDownloadPDF = async (pdfLink) => {
//     try {
//       const fileName = pdfLink.split('/').pop();
//       const downloadResumable = FileSystem.createDownloadResumable(
//         pdfLink,
//         FileSystem.documentDirectory + fileName
//       );
//       const { uri: localUri } = await downloadResumable.downloadAsync();
//       await Sharing.shareAsync(localUri);
//     } catch (error) {
//       console.error('Download PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to download PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   // -------------------------------------------
//   // Render Each Order
//   // -------------------------------------------
//   const renderOrderItem = ({ item }) => (
//     <View style={[styles.orderItem, { backgroundColor: currentTheme.cardBackground }]}>
//       <View style={styles.orderHeader}>
//         <Text style={[styles.orderDate, { color: currentTheme.textColor }]}>
//           {new Date(item.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
//           {capitalizeFirstLetter(item.status)}
//         </Text>
//       </View>

//       <FlatList
//         data={item.orderItems}
//         keyExtractor={(orderItem) => orderItem.product._id}
//         renderItem={({ item: orderItem }) => (
//           <View style={styles.purchasedItem}>
//             <Image source={{ uri: orderItem.image }} style={styles.purchasedItemImage} />
//             <View style={styles.purchasedItemDetails}>
//               <Text
//                 style={[styles.purchasedItemName, { color: currentTheme.cardTextColor }]}
//                 numberOfLines={1}
//               >
//                 {orderItem.examName}
//               </Text>
//               <Text
//                 style={[styles.purchasedItemSubtitle, { color: currentTheme.textColor }]}
//                 numberOfLines={1}
//               >
//                 {orderItem.subjectName} ({orderItem.subjectCode})
//               </Text>
//               <Text style={[styles.purchasedItemPrice, { color: currentTheme.priceColor }]}>
//                 ${orderItem.price.toFixed(2)}
//               </Text>
//               <View style={styles.pdfIconsContainer}>
//                 {/* View PDF Icon */}
//                 <TouchableOpacity
//                   onPress={() => handleViewPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                 >
//                   <Ionicons
//                     name="eye-outline"
//                     size={24}
//                     color={currentTheme.cardTextColor}
//                   />
//                 </TouchableOpacity>
//                 {/* Download PDF Icon */}
//                 <TouchableOpacity
//                   onPress={() => handleDownloadPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                 >
//                   <Ionicons
//                     name="download-outline"
//                     size={24}
//                     color={currentTheme.cardTextColor}
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//       />
//       {/* View Receipt Button */}
//       <TouchableOpacity
//         style={[styles.viewReceiptButton, { borderColor: currentTheme.borderColor }]}
//         onPress={() => openReceiptModal(item)}
//       >
//         <Ionicons name="receipt-outline" size={20} color={currentTheme.cardTextColor} />
//         <Text style={[styles.viewReceiptText, { color: currentTheme.cardTextColor }]}>
//           View Receipt
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   // -------------------------------------------
//   // If loading (initial), show spinner
//   // -------------------------------------------
//   if (loading && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading your orders...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />

//       {/* Curved Gradient Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Order History
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             View your past purchases
//           </Text>
//         </View>
//       </LinearGradient>

//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item._id}
//         renderItem={renderOrderItem}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           error ? (
//             <View style={styles.emptyContainer}>
//               <Ionicons
//                 name="alert-circle-outline"
//                 size={80}
//                 color={currentTheme.placeholderTextColor}
//               />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 {error || 'Failed to load orders.'}
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Ionicons
//                 name="cart-outline"
//                 size={80}
//                 color={currentTheme.placeholderTextColor}
//               />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 You have no past orders.
//               </Text>
//             </View>
//           )
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={currentTheme.primaryColor}
//           />
//         }
//       />

//       {/* Receipt Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={closeReceiptModal}
//         transparent={true}
//       >
//         <View style={styles.modalBackground}>
//           <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {selectedOrder && (
//               <>
//                 <View style={styles.modalHeader}>
//                   <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
//                     Receipt Details
//                   </Text>
//                   <View style={styles.modalIcons}>
//                     {/* View Receipt PDF Icon */}
//                     <TouchableOpacity
//                       onPress={() => handleGenerateReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                     >
//                       <Ionicons
//                         name="eye-outline"
//                         size={24}
//                         color={currentTheme.cardTextColor}
//                       />
//                     </TouchableOpacity>
//                     {/* Download Receipt PDF Icon */}
//                     <TouchableOpacity
//                       onPress={() => handleDownloadReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                     >
//                       <Ionicons
//                         name="download-outline"
//                         size={24}
//                         color={currentTheme.cardTextColor}
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <ScrollView contentContainerStyle={styles.modalContent}>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Order ID:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder._id}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Date:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {new Date(selectedOrder.createdAt).toLocaleDateString()}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Status:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {capitalizeFirstLetter(selectedOrder.status)}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Items Purchased:
//                     </Text>
//                     {selectedOrder.orderItems.map((item, index) => (
//                       <View key={item.product._id} style={styles.itemRow}>
//                         <Text style={[styles.itemName, { color: currentTheme.textColor }]}>
//                           {index + 1}. {item.examName} ({item.subjectName})
//                         </Text>
//                         <Text style={[styles.itemPrice, { color: currentTheme.textColor }]}>
//                           ${item.price.toFixed(2)}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>
//                   <View
//                     style={[styles.separator, { borderBottomColor: currentTheme.borderColor }]}
//                   />
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Total Price:
//                     </Text>
//                     <Text style={[styles.modalTotal, { color: currentTheme.priceColor }]}>
//                       ${selectedOrder.totalPrice.toFixed(2)}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Payment Method:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder.paymentMethod}
//                     </Text>
//                   </View>
//                 </ScrollView>

//                 <TouchableOpacity
//                   style={[styles.closeButton, { backgroundColor: currentTheme.primaryColor }]}
//                   onPress={closeReceiptModal}
//                 >
//                   <Text style={styles.closeButtonText}>Close</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* CustomAlert */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </SafeAreaView>
//   );
// };

// export default ProductHistoryPage;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 14,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     marginBottom: 12,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     top: 16,
//     padding: 8,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   listContent: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     marginTop: 50,
//     justifyContent: 'center',
//   },
//   loadingText: {
//     fontSize: 16,
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 16,
//     marginTop: 15,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   orderItem: {
//     marginBottom: 20,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     padding: 15,
//     // iOS shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.07,
//     shadowRadius: 2,
//     // Android elevation
//     elevation: 2,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   orderDate: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   orderStatus: {
//     fontSize: 16,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
//   purchasedItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   purchasedItemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   purchasedItemDetails: {
//     flex: 1,
//   },
//   purchasedItemName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItemSubtitle: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   purchasedItemPrice: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginTop: 4,
//   },
//   pdfIconsContainer: {
//     flexDirection: 'row',
//     marginTop: 6,
//   },
//   pdfIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   viewReceiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     padding: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   viewReceiptText: {
//     marginLeft: 5,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: '80%',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3.84,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   modalIcons: {
//     flexDirection: 'row',
//   },
//   modalIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   modalContent: {
//     paddingBottom: 20,
//   },
//   modalSection: {
//     marginBottom: 12,
//   },
//   modalLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   modalText: {
//     fontSize: 15,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 5,
//   },
//   itemName: {
//     flex: 2,
//     fontSize: 15,
//   },
//   itemPrice: {
//     flex: 1,
//     fontSize: 15,
//     textAlign: 'right',
//   },
//   separator: {
//     borderBottomWidth: 1,
//     marginVertical: 15,
//   },
//   modalTotal: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   closeButton: {
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });








// // src/screens/ProductHistoryPage.js

// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Modal,
//   ScrollView,
//   RefreshControl,
//   Linking
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system';

// import api from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';

// const { width } = Dimensions.get('window');

// const ProductHistoryPage = () => {
//   const navigation = useNavigation();

//   // Theme
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Orders
//   const [orders, setOrders] = useState([]);

//   // Loading / Error
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Pull-to-Refresh
//   const [refreshing, setRefreshing] = useState(false);

//   // CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Modal for receipts
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // Fetch Orders
//   const fetchOrders = async (isRefreshing = false) => {
//     if (isRefreshing) setRefreshing(true);
//     else setLoading(true);
//     setError(null);

//     try {
//       const response = await api.getMyOrders();
//       if (response.success && response.data) {
//         setOrders(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch orders.');
//       }
//     } catch (err) {
//       console.error('Fetch Orders Error:', err);
//       setError(err.message);
//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch orders.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     } finally {
//       if (isRefreshing) setRefreshing(false);
//       else setLoading(false);
//     }
//   };

//   // Pull-to-Refresh handler
//   const onRefresh = () => {
//     fetchOrders(true);
//   };

//   // Helper: Capitalize first letter
//   const capitalizeFirstLetter = (str) =>
//     str.charAt(0).toUpperCase() + str.slice(1);

//   // Get color for status
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending':
//         return '#FFA726'; // Orange
//       case 'completed':
//         return '#66BB6A'; // Green
//       case 'cancelled':
//         return '#EF5350'; // Red
//       default:
//         return '#757575'; // Gray
//     }
//   };

//   // Generate receipt HTML
//   const generateReceiptHTML = (order) => {
//     const { _id, createdAt, status, orderItems, totalPrice, paymentMethod } =
//       order;
//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             h1 { text-align: center; color: ${currentTheme.primaryColor}; }
//             .section { margin-top: 20px; }
//             .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${currentTheme.secondaryColor}; }
//             .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
//             .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
//             .footer { margin-top: 20px; font-size: 14px; text-align: center; color: ${currentTheme.textColor}; }
//             .label { font-weight: bold; }
//           </style>
//         </head>
//         <body>
//           <h1>Receipt</h1>
//           <div class="section">
//             <div class="item"><span class="label">Order ID:</span><span>${_id}</span></div>
//             <div class="item"><span class="label">Date:</span><span>${new Date(
//               createdAt
//             ).toLocaleDateString()}</span></div>
//             <div class="item"><span class="label">Status:</span><span>${capitalizeFirstLetter(
//               status
//             )}</span></div>
//           </div>
//           <div class="section">
//             <div class="section-title">Items Purchased:</div>
//             ${orderItems
//               .map(
//                 (item, index) => `
//               <div class="item">
//                 <span>${index + 1}. ${item.examName} (${item.subjectName})</span>
//                 <span>$${item.price.toFixed(2)}</span>
//               </div>
//             `
//               )
//               .join('')}
//             <div class="total">Total Price: $${totalPrice.toFixed(2)}</div>
//           </div>
//           <div class="section">
//             <div class="item"><span class="label">Payment Method:</span><span>${paymentMethod}</span></div>
//           </div>
//           <div class="footer">
//             <p>Thank you for your purchase!</p>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   // Generate & share receipt
//   const handleGenerateReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri);
//     } catch (error) {
//       console.error('Error generating receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to generate receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   // Generate & download receipt
//   const handleDownloadReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
//     } catch (error) {
//       console.error('Error downloading receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to download receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   // Open receipt modal
//   const openReceiptModal = (order) => {
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };

//   // Close receipt modal
//   const closeReceiptModal = () => {
//     setSelectedOrder(null);
//     setModalVisible(false);
//   };

//   // View or download PDF from link
//   const handleViewPDF = async (pdfLink) => {
//     try {
//       const supported = await Linking.canOpenURL(pdfLink);
//       if (supported) await Linking.openURL(pdfLink);
//       else throw new Error('Cannot open the PDF link.');
//     } catch (error) {
//       console.error('View PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to open PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const handleDownloadPDF = async (pdfLink) => {
//     try {
//       const uri = pdfLink;
//       const fileName = uri.split('/').pop();
//       const downloadResumable = FileSystem.createDownloadResumable(
//         uri,
//         FileSystem.documentDirectory + fileName
//       );
//       const { uri: localUri } = await downloadResumable.downloadAsync();
//       await Sharing.shareAsync(localUri);
//     } catch (error) {
//       console.error('Download PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to download PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   // Render each order
//   const renderOrderItem = ({ item }) => (
//     <View
//       style={[styles.orderItem, { backgroundColor: currentTheme.cardBackground }]}
//     >
//       <View style={styles.orderHeader}>
//         <Text style={[styles.orderDate, { color: currentTheme.textColor }]}>
//           {new Date(item.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
//           {capitalizeFirstLetter(item.status)}
//         </Text>
//       </View>
//       <FlatList
//         data={item.orderItems}
//         keyExtractor={(orderItem) => orderItem.product._id}
//         renderItem={({ item: orderItem }) => (
//           <View style={styles.purchasedItem}>
//             <Image source={{ uri: orderItem.image }} style={styles.purchasedItemImage} />
//             <View style={styles.purchasedItemDetails}>
//               <Text style={[styles.purchasedItemName, { color: currentTheme.cardTextColor }]}>
//                 {orderItem.examName}
//               </Text>
//               <Text style={[styles.purchasedItemSubtitle, { color: currentTheme.textColor }]}>
//                 {orderItem.subjectName} ({orderItem.subjectCode})
//               </Text>
//               <Text style={[styles.purchasedItemPrice, { color: currentTheme.priceColor }]}>
//                 ${orderItem.price.toFixed(2)}
//               </Text>
//               <View style={styles.pdfIconsContainer}>
//                 {/* View PDF Icon */}
//                 <TouchableOpacity
//                   onPress={() => handleViewPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                 >
//                   <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//                 {/* Download PDF Icon */}
//                 <TouchableOpacity
//                   onPress={() => handleDownloadPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                 >
//                   <Ionicons
//                     name="download-outline"
//                     size={24}
//                     color={currentTheme.cardTextColor}
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//       />
//       {/* View Receipt Button */}
//       <TouchableOpacity
//         style={[styles.viewReceiptButton, { borderColor: currentTheme.borderColor }]}
//         onPress={() => openReceiptModal(item)}
//       >
//         <Ionicons name="receipt-outline" size={20} color={currentTheme.cardTextColor} />
//         <Text style={[styles.viewReceiptText, { color: currentTheme.cardTextColor }]}>
//           View Receipt
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView
//       style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}
//     >
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Order History
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             View your past purchases
//           </Text>
//         </View>
//       </LinearGradient>
//       {/* <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]}
//       > */}
//         {/* Back Button */}
//         {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity> */}
//         {/* <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Order History
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             View your past purchases
//           </Text>
//         </View>
//       </LinearGradient> */}

//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item._id}
//         renderItem={renderOrderItem}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           loading ? (
//             <View style={styles.loadingContainer}>
//               <Ionicons
//                 name="time-outline"
//                 size={80}
//                 color={currentTheme.placeholderTextColor}
//               />
//               <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//                 Loading your orders...
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Ionicons
//                 name="cart-outline"
//                 size={80}
//                 color={currentTheme.placeholderTextColor}
//               />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 You have no past orders.
//               </Text>
//             </View>
//           )
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[currentTheme.primaryColor]}
//             tintColor={currentTheme.primaryColor}
//           />
//         }
//       />

//       {/* Receipt Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={closeReceiptModal}
//         transparent={true}
//       >
//         <View style={styles.modalBackground}>
//           <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {selectedOrder && (
//               <>
//                 {/* Modal Header */}
//                 <View style={styles.modalHeader}>
//                   <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
//                     Receipt Details
//                   </Text>
//                   <View style={styles.modalIcons}>
//                     {/* View Receipt PDF Icon */}
//                     <TouchableOpacity
//                       onPress={() => handleGenerateReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                     >
//                       <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                     </TouchableOpacity>
//                     {/* Download Receipt PDF Icon */}
//                     <TouchableOpacity
//                       onPress={() => handleDownloadReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                     >
//                       <Ionicons
//                         name="download-outline"
//                         size={24}
//                         color={currentTheme.cardTextColor}
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <ScrollView contentContainerStyle={styles.modalContent}>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Order ID:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder._id}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Date:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {new Date(selectedOrder.createdAt).toLocaleDateString()}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Status:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {capitalizeFirstLetter(selectedOrder.status)}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Items Purchased:
//                     </Text>
//                     {selectedOrder.orderItems.map((item, index) => (
//                       <View key={item.product._id} style={styles.itemRow}>
//                         <Text style={[styles.itemName, { color: currentTheme.textColor }]}>
//                           {index + 1}. {item.examName} ({item.subjectName})
//                         </Text>
//                         <Text style={[styles.itemPrice, { color: currentTheme.textColor }]}>
//                           ${item.price.toFixed(2)}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>

//                   <View
//                     style={[styles.separator, { borderBottomColor: currentTheme.borderColor }]}
//                   />
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Total Price:
//                     </Text>
//                     <Text style={[styles.modalTotal, { color: currentTheme.priceColor }]}>
//                       ${selectedOrder.totalPrice.toFixed(2)}
//                     </Text>
//                   </View>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Payment Method:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder.paymentMethod}
//                     </Text>
//                   </View>
//                 </ScrollView>

//                 {/* Close Button */}
//                 <TouchableOpacity
//                   style={[styles.closeButton, { backgroundColor: currentTheme.primaryColor }]}
//                   onPress={closeReceiptModal}
//                 >
//                   <Text style={styles.closeButtonText}>Close</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* CustomAlert */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   // header: {
//   //   width: '100%',
//   //   paddingVertical: 10,
//   //   paddingHorizontal: 15,
//   //   flexDirection: 'row',
//   //   alignItems: 'center',
//   //   justifyContent: 'center',
//   //   elevation: 4,
//   //   shadowColor: '#000',
//   //   shadowOffset: { width: 0, height: 2 },
//   //   shadowOpacity: 0.25,
//   //   shadowRadius: 3.84,
//   // },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     top: 10,
//     padding: 8,
//   },
//   // headerTitleContainer: {
//   //   alignItems: 'center',
//   // },
//   // headerTitle: {
//   //   fontSize: 24,
//   //   fontWeight: '700',
//   // },
//   // headerSubtitle: {
//   //   fontSize: 14,
//   //   marginTop: 4,
//   // },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   headerTitleContainer: { alignItems: 'center' },
//   headerTitle: { fontSize: 22, fontWeight: '700' },
//   headerSubtitle: { fontSize: 14, marginTop: 4 },
//   listContent: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   loadingText: {
//     fontSize: 16,
//     marginTop: 10,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 16,
//     marginTop: 15,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   orderItem: {
//     marginBottom: 20,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     padding: 15,
//     // iOS shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 2,
//     // Android elevation
//     elevation: 2,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   orderDate: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   orderStatus: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   purchasedItemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     marginRight: 10,
//   },
//   purchasedItemDetails: {
//     flex: 1,
//   },
//   purchasedItemName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItemSubtitle: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   purchasedItemPrice: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginTop: 4,
//   },
//   pdfIconsContainer: {
//     flexDirection: 'row',
//     marginTop: 6,
//   },
//   pdfIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   viewReceiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     padding: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   viewReceiptText: {
//     marginLeft: 5,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: '80%',
//     elevation: 5,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   modalIcons: {
//     flexDirection: 'row',
//   },
//   modalIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   modalContent: {
//     paddingBottom: 20,
//   },
//   modalSection: {
//     marginBottom: 10,
//   },
//   modalLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   modalText: {
//     fontSize: 16,
//     marginTop: 2,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 5,
//   },
//   itemName: {
//     flex: 2,
//     fontSize: 16,
//   },
//   itemPrice: {
//     flex: 1,
//     fontSize: 16,
//     textAlign: 'right',
//   },
//   separator: {
//     borderBottomWidth: 1,
//     marginVertical: 15,
//   },
//   modalTotal: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   closeButton: {
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default ProductHistoryPage;






















// // src/screens/ProductHistoryPage.js

// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Linking,
//   Modal,
//   ScrollView,
//   RefreshControl,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system';

// import api from '../services/api'; // Import the centralized API functions

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

// const { width, height } = Dimensions.get('window');

// const ProductHistoryPage = () => {
//   const navigation = useNavigation();

//   // Access theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // State for orders
//   const [orders, setOrders] = useState([]);

//   // State for loading and errors
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // State for controlling the Receipt Modal
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   // Add a refreshing state for pull-to-refresh
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   /**
//    * Modify the fetchOrders function to handle refreshing
//    * @param {boolean} isRefreshing - Indicates if the fetch is due to a pull-to-refresh action
//    */
//   const fetchOrders = async (isRefreshing = false) => {
//     if (isRefreshing) {
//       setRefreshing(true);
//     } else {
//       setLoading(true);
//     }
//     setError(null);
//     try {
//       const response = await api.getMyOrders();
//       if (response.success && response.data) {
//         setOrders(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch orders.');
//       }
//     } catch (err) {
//       console.error('Fetch Orders Error:', err);
//       setError(err.message);
//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch orders.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     } finally {
//       if (isRefreshing) {
//         setRefreshing(false);
//       } else {
//         setLoading(false);
//       }
//     }
//   };

//   /**
//    * Create the onRefresh function for pull-to-refresh
//    */
//   const onRefresh = () => {
//     fetchOrders(true); // Pass true to indicate refreshing
//   };

//   /**
//    * Generates HTML content for the receipt based on order details.
//    * @param {object} order - The selected order.
//    * @returns {string} - HTML string representing the receipt.
//    */
//   const generateReceiptHTML = (order) => {
//     const { _id, createdAt, status, orderItems, totalPrice, paymentMethod } = order;
//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             h1 { text-align: center; color: ${currentTheme.primaryColor}; }
//             .section { margin-top: 20px; }
//             .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${currentTheme.secondaryColor}; }
//             .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
//             .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
//             .footer { margin-top: 20px; font-size: 14px; text-align: center; color: ${currentTheme.textColor}; }
//             .label { font-weight: bold; }
//           </style>
//         </head>
//         <body>
//           <h1>Receipt</h1>
//           <div class="section">
//             <div class="item"><span class="label">Order ID:</span><span>${_id}</span></div>
//             <div class="item"><span class="label">Date:</span><span>${new Date(createdAt).toLocaleDateString()}</span></div>
//             <div class="item"><span class="label">Status:</span><span>${capitalizeFirstLetter(status)}</span></div>
//           </div>
//           <div class="section">
//             <div class="section-title">Items Purchased:</div>
//             ${orderItems
//               .map(
//                 (item, index) => `
//               <div class="item">
//                 <span>${index + 1}. ${item.examName} (${item.subjectName})</span>
//                 <span>$${item.price.toFixed(2)}</span>
//               </div>
//             `
//               )
//               .join('')}
//             <div class="total">Total Price: $${totalPrice.toFixed(2)}</div>
//           </div>
//           <div class="section">
//             <div class="item"><span class="label">Payment Method:</span><span>${paymentMethod}</span></div>
//           </div>
//           <div class="footer">
//             <p>Thank you for your purchase!</p>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   /**
//    * Handles generating and viewing the receipt PDF.
//    * @param {object} order - The selected order.
//    */
//   const handleGenerateReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri);
//     } catch (error) {
//       console.error('Error generating receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to generate receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   /**
//    * Handles generating and downloading the receipt PDF.
//    * @param {object} order - The selected order.
//    */
//   const handleDownloadReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
//     } catch (error) {
//       console.error('Error downloading receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to download receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   /**
//    * Opens the PDF link using the device's default PDF viewer.
//    * @param {string} pdfLink - The URL to the PDF.
//    */
//   const handleViewPDF = async (pdfLink) => {
//     try {
//       const supported = await Linking.canOpenURL(pdfLink);
//       if (supported) {
//         await Linking.openURL(pdfLink);
//       } else {
//         throw new Error('Cannot open the PDF link.');
//       }
//     } catch (error) {
//       console.error('View PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to open PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   /**
//    * Downloads the PDF from the provided link.
//    * @param {string} pdfLink - The URL to the PDF.
//    */
//   const handleDownloadPDF = async (pdfLink) => {
//     try {
//       const uri = pdfLink;
//       const fileName = uri.split('/').pop();
//       const downloadResumable = FileSystem.createDownloadResumable(
//         uri,
//         FileSystem.documentDirectory + fileName
//       );

//       const { uri: localUri } = await downloadResumable.downloadAsync();
//       await Sharing.shareAsync(localUri);
//     } catch (error) {
//       console.error('Download PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to download PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   /**
//    * Returns the color based on the order status.
//    * @param {string} status - The status of the order.
//    * @returns {string} - The corresponding color code.
//    */
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending':
//         return '#FFA726'; // Orange
//       case 'completed':
//         return '#66BB6A'; // Green
//       case 'cancelled':
//         return '#EF5350'; // Red
//       default:
//         return '#757575'; // Grey
//     }
//   };

//   /**
//    * Capitalizes the first letter of a string.
//    * @param {string} string - The input string.
//    * @returns {string} - The capitalized string.
//    */
//   const capitalizeFirstLetter = (string) => {
//     return string.charAt(0).toUpperCase() + string.slice(1);
//   };

//   /**
//    * Opens the receipt modal with the selected order.
//    * @param {object} order - The selected order.
//    */
//   const openReceiptModal = (order) => {
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };

//   /**
//    * Closes the receipt modal.
//    */
//   const closeReceiptModal = () => {
//     setSelectedOrder(null);
//     setModalVisible(false);
//   };

//   /**
//    * Renders each order item in the FlatList.
//    * @param {object} param0 - The item object.
//    * @returns {JSX.Element} - The rendered order item.
//    */
//   const renderOrderItem = ({ item }) => (
//     <View style={[styles.orderItem, { backgroundColor: currentTheme.cardBackground }]}>
//       <View style={styles.orderHeader}>
//         <Text style={[styles.orderDate, { color: currentTheme.textColor }]}>
//           {new Date(item.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
//           {capitalizeFirstLetter(item.status)}
//         </Text>
//       </View>
//       <FlatList
//         data={item.orderItems}
//         keyExtractor={(orderItem) => orderItem.product._id}
//         renderItem={({ item: orderItem }) => (
//           <View style={styles.purchasedItem}>
//             <Image source={{ uri: orderItem.image }} style={styles.purchasedItemImage} />
//             <View style={styles.purchasedItemDetails}>
//               <Text style={[styles.purchasedItemName, { color: currentTheme.cardTextColor }]}>
//                 {orderItem.examName}
//               </Text>
//               <Text style={[styles.purchasedItemSubtitle, { color: currentTheme.textColor }]}>
//                 {orderItem.subjectName} ({orderItem.subjectCode})
//               </Text>
//               <Text style={[styles.purchasedItemPrice, { color: currentTheme.priceColor }]}>
//                 ${orderItem.price.toFixed(2)}
//               </Text>
//               {/* Replaced Buttons with Icons */}
//               <View style={styles.pdfIconsContainer}>
//                 {/* View PDF Icon */}
//                 <TouchableOpacity
//                   onPress={() => handleViewPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                   accessibilityLabel={`View PDF for ${orderItem.examName}`}
//                   accessibilityRole="button"
//                 >
//                   <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//                 {/* Download PDF Icon */}
//                 <TouchableOpacity
//                   onPress={() => handleDownloadPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                   accessibilityLabel={`Download PDF for ${orderItem.examName}`}
//                   accessibilityRole="button"
//                 >
//                   <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//       />
//       {/* View Receipt Button */}
//       <TouchableOpacity
//         style={[styles.viewReceiptButton, { borderColor: currentTheme.backgroundHeaderColor }]}
//         onPress={() => openReceiptModal(item)}
//         accessibilityLabel="View Receipt"
//         accessibilityRole="button"
//       >
//         <Ionicons name="receipt-outline" size={20} color={currentTheme.cardTextColor} />
//         <Text style={[styles.viewReceiptText, { color: currentTheme.cardTextColor }]}>
//           View Receipt
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Enhanced Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]} // Vertical gradient
//       >
//         {/* Back Button */}
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//           accessibilityRole="button"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>

//         {/* Header Title and Subtitle */}
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Order History
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             View your past purchases
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Orders List with Refresh Control */}
//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item._id}
//         renderItem={renderOrderItem}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           loading ? (
//             <View style={styles.loadingContainer}>
//               <Ionicons name="time-outline" size={80} color={currentTheme.placeholderTextColor} />
//               <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//                 Loading your orders...
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Ionicons
//                 name="cart-outline"
//                 size={80}
//                 color={currentTheme.placeholderTextColor}
//               />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 You have no past orders.
//               </Text>
//             </View>
//           )
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing} // Bind to refreshing state
//             onRefresh={onRefresh} // Bind to onRefresh function
//             colors={[currentTheme.primaryColor]} // Android color
//             tintColor={currentTheme.primaryColor} // iOS color
//           />
//         }
//       />

//       {/* Receipt Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={closeReceiptModal}
//         transparent={true}
//         accessibilityViewIsModal={true}
//       >
//         <View style={styles.modalBackground}>
//           <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {selectedOrder && (
//               <>
//                 {/* Modal Header with Icons */}
//                 <View style={styles.modalHeader}>
//                   <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
//                     Receipt Details
//                   </Text>
//                   <View style={styles.modalIcons}>
//                     {/* View Receipt PDF Icon */}
//                     <TouchableOpacity
//                       onPress={() => handleGenerateReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                       accessibilityLabel="View Receipt PDF"
//                       accessibilityRole="button"
//                     >
//                       <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                     </TouchableOpacity>
//                     {/* Download Receipt PDF Icon */}
//                     <TouchableOpacity
//                       onPress={() => handleDownloadReceipt(selectedOrder)}
//                       style={styles.modalIconButton}
//                       accessibilityLabel="Download Receipt PDF"
//                       accessibilityRole="button"
//                     >
//                       <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <ScrollView contentContainerStyle={styles.modalContent}>
//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Order ID:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder._id}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Date:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {new Date(selectedOrder.createdAt).toLocaleDateString()}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Status:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {capitalizeFirstLetter(selectedOrder.status)}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Items Purchased:
//                     </Text>
//                     {selectedOrder.orderItems.map((item, index) => (
//                       <View key={item.product._id} style={styles.itemRow}>
//                         <Text style={[styles.itemName, { color: currentTheme.textColor }]}>
//                           {index + 1}. {item.examName} ({item.subjectName})
//                         </Text>
//                         <Text style={[styles.itemPrice, { color: currentTheme.textColor }]}>
//                           ${item.price.toFixed(2)}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>

//                   <View
//                     style={[styles.separator, { borderBottomColor: currentTheme.borderColor }]}
//                   />

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Total Price:
//                     </Text>
//                     <Text style={[styles.modalTotal, { color: currentTheme.priceColor }]}>
//                       ${selectedOrder.totalPrice.toFixed(2)}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Payment Method:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder.paymentMethod}
//                     </Text>
//                   </View>
//                 </ScrollView>

//                 {/* Close Button */}
//                 <TouchableOpacity
//                   style={[
//                     styles.closeButton,
//                     { backgroundColor: currentTheme.primaryColor },
//                   ]}
//                   onPress={closeReceiptModal}
//                   accessibilityLabel="Close Receipt Modal"
//                   accessibilityRole="button"
//                 >
//                   <Text style={styles.closeButtonText}>Close</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* CustomAlert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </SafeAreaView>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     // Elevation for Android
//     elevation: 4,
//     // Shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     top: 10,
//     padding: 8,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     fontWeight: '400',
//     marginTop: 4,
//   },
//   listContent: {
//     padding: 20,
//     paddingBottom: 20,
//   },
//   orderItem: {
//     marginBottom: 20,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     padding: 15,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   orderDate: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   orderStatus: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   purchasedItemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     marginRight: 10,
//   },
//   purchasedItemDetails: {
//     flex: 1,
//   },
//   purchasedItemName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItemSubtitle: {
//     fontSize: 14,
//     color: '#757575',
//   },
//   purchasedItemPrice: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   // New Styles for PDF Icons
//   pdfIconsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 8,
//   },
//   pdfIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   // Removed styles related to old PDF buttons
//   viewReceiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     borderRadius: 8,
//   },
//   viewReceiptText: {
//     marginLeft: 5,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   loadingText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
//   // Modal styles
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: '80%',
//     // iOS Shadow
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     // Android Shadow
//     elevation: 5,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   modalContent: {
//     paddingBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 15,
//     textAlign: 'left',
//   },
//   modalSection: {
//     marginBottom: 10,
//   },
//   modalLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   modalText: {
//     fontSize: 16,
//     marginTop: 2,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   itemName: {
//     flex: 2,
//     fontSize: 16,
//   },
//   itemPrice: {
//     flex: 1,
//     fontSize: 16,
//     textAlign: 'right',
//   },
//   separator: {
//     borderBottomWidth: 1,
//     marginVertical: 15,
//   },
//   modalTotal: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   closeButton: {
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//     backgroundColor: '#FF5252', // Red color for close button
//   },
//   closeButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   // New styles for modal header icons
//   modalIcons: {
//     flexDirection: 'row',
//   },
//   modalIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
// });

// export default ProductHistoryPage;









// // src/screens/ProductHistoryPage.js

// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Linking,
//   Modal,
//   ScrollView,
//   RefreshControl, // 1. Import RefreshControl
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system';

// import api from '../services/api'; // Import the centralized API functions

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

// const { width, height } = Dimensions.get('window');

// const ProductHistoryPage = () => {
//   const navigation = useNavigation();

//   // Access theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // State for orders
//   const [orders, setOrders] = useState([]);

//   // State for loading and errors
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // State for controlling the Receipt Modal
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   // 2. Add a `refreshing` state for pull-to-refresh
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   /**
//    * 3. Modify the `fetchOrders` function to handle refreshing
//    * @param {boolean} isRefreshing - Indicates if the fetch is due to a pull-to-refresh action
//    */
//   const fetchOrders = async (isRefreshing = false) => {
//     if (isRefreshing) {
//       setRefreshing(true);
//     } else {
//       setLoading(true);
//     }
//     setError(null);
//     try {
//       const response = await api.getMyOrders();
//       if (response.success && response.data) {
//         setOrders(response.data);
//       } else {
//         throw new Error(response.message || 'Failed to fetch orders.');
//       }
//     } catch (err) {
//       console.error('Fetch Orders Error:', err);
//       setError(err.message);
//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch orders.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     } finally {
//       if (isRefreshing) {
//         setRefreshing(false);
//       } else {
//         setLoading(false);
//       }
//     }
//   };

//   /**
//    * 4. Create the `onRefresh` function for pull-to-refresh
//    */
//   const onRefresh = () => {
//     fetchOrders(true); // Pass `true` to indicate refreshing
//   };

//   /**
//    * Generates HTML content for the receipt based on order details.
//    * @param {object} order - The selected order.
//    * @returns {string} - HTML string representing the receipt.
//    */
//   const generateReceiptHTML = (order) => {
//     const { _id, createdAt, status, orderItems, totalPrice, paymentMethod } = order;
//     return `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             h1 { text-align: center; color: ${currentTheme.primaryColor}; }
//             .section { margin-top: 20px; }
//             .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${currentTheme.secondaryColor}; }
//             .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
//             .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
//             .footer { margin-top: 20px; font-size: 14px; text-align: center; color: ${currentTheme.textColor}; }
//             .label { font-weight: bold; }
//           </style>
//         </head>
//         <body>
//           <h1>Receipt</h1>
//           <div class="section">
//             <div class="item"><span class="label">Order ID:</span><span>${_id}</span></div>
//             <div class="item"><span class="label">Date:</span><span>${new Date(createdAt).toLocaleDateString()}</span></div>
//             <div class="item"><span class="label">Status:</span><span>${capitalizeFirstLetter(status)}</span></div>
//           </div>
//           <div class="section">
//             <div class="section-title">Items Purchased:</div>
//             ${orderItems
//               .map(
//                 (item, index) => `
//               <div class="item">
//                 <span>${index + 1}. ${item.examName} (${item.subjectName})</span>
//                 <span>$${item.price.toFixed(2)}</span>
//               </div>
//             `
//               )
//               .join('')}
//             <div class="total">Total Price: $${totalPrice.toFixed(2)}</div>
//           </div>
//           <div class="section">
//             <div class="item"><span class="label">Payment Method:</span><span>${paymentMethod}</span></div>
//           </div>
//           <div class="footer">
//             <p>Thank you for your purchase!</p>
//           </div>
//         </body>
//       </html>
//     `;
//   };

//   /**
//    * Handles generating and viewing the receipt PDF.
//    * @param {object} order - The selected order.
//    */
//   const handleGenerateReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri);
//     } catch (error) {
//       console.error('Error generating receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to generate receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   /**
//    * Handles generating and downloading the receipt PDF.
//    * @param {object} order - The selected order.
//    */
//   const handleDownloadReceipt = async (order) => {
//     try {
//       const html = generateReceiptHTML(order);
//       const { uri } = await Print.printToFileAsync({ html });
//       await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
//     } catch (error) {
//       console.error('Error downloading receipt:', error);
//       setAlertTitle('Error');
//       setAlertMessage('Failed to download receipt.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   /**
//    * Opens the PDF link using the device's default PDF viewer.
//    * @param {string} pdfLink - The URL to the PDF.
//    */
//   const handleViewPDF = async (pdfLink) => {
//     try {
//       const supported = await Linking.canOpenURL(pdfLink);
//       if (supported) {
//         await Linking.openURL(pdfLink);
//       } else {
//         throw new Error('Cannot open the PDF link.');
//       }
//     } catch (error) {
//       console.error('View PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to open PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   /**
//    * Downloads the PDF from the provided link.
//    * @param {string} pdfLink - The URL to the PDF.
//    */
//   const handleDownloadPDF = async (pdfLink) => {
//     try {
//       const uri = pdfLink;
//       const fileName = uri.split('/').pop();
//       const downloadResumable = FileSystem.createDownloadResumable(
//         uri,
//         FileSystem.documentDirectory + fileName
//       );

//       const { uri: localUri } = await downloadResumable.downloadAsync();
//       await Sharing.shareAsync(localUri);
//     } catch (error) {
//       console.error('Download PDF Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to download PDF.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   /**
//    * Returns the color based on the order status.
//    * @param {string} status - The status of the order.
//    * @returns {string} - The corresponding color code.
//    */
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending':
//         return '#FFA726'; // Orange
//       case 'completed':
//         return '#66BB6A'; // Green
//       case 'cancelled':
//         return '#EF5350'; // Red
//       default:
//         return '#757575'; // Grey
//     }
//   };

//   /**
//    * Capitalizes the first letter of a string.
//    * @param {string} string - The input string.
//    * @returns {string} - The capitalized string.
//    */
//   const capitalizeFirstLetter = (string) => {
//     return string.charAt(0).toUpperCase() + string.slice(1);
//   };

//   /**
//    * Opens the receipt modal with the selected order.
//    * @param {object} order - The selected order.
//    */
//   const openReceiptModal = (order) => {
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };

//   /**
//    * Closes the receipt modal.
//    */
//   const closeReceiptModal = () => {
//     setSelectedOrder(null);
//     setModalVisible(false);
//   };

//   /**
//    * Renders each order item in the FlatList.
//    * @param {object} param0 - The item object.
//    * @returns {JSX.Element} - The rendered order item.
//    */
//   const renderOrderItem = ({ item }) => (
//     <View style={[styles.orderItem, { backgroundColor: currentTheme.cardBackground }]}>
//       <View style={styles.orderHeader}>
//         <Text style={[styles.orderDate, { color: currentTheme.textColor }]}>
//           {new Date(item.createdAt).toLocaleDateString()}
//         </Text>
//         <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
//           {capitalizeFirstLetter(item.status)}
//         </Text>
//       </View>
//       <FlatList
//         data={item.orderItems}
//         keyExtractor={(orderItem) => orderItem.product._id}
//         renderItem={({ item: orderItem }) => (
//           <View style={styles.purchasedItem}>
//             <Image source={{ uri: orderItem.image }} style={styles.purchasedItemImage} />
//             <View style={styles.purchasedItemDetails}>
//               <Text style={[styles.purchasedItemName, { color: currentTheme.cardTextColor }]}>
//                 {orderItem.examName}
//               </Text>
//               <Text style={[styles.purchasedItemSubtitle, { color: currentTheme.textColor }]}>
//                 {orderItem.subjectName} ({orderItem.subjectCode})
//               </Text>
//               <Text style={[styles.purchasedItemPrice, { color: currentTheme.priceColor }]}>
//                 ${orderItem.price.toFixed(2)}
//               </Text>
//               {/* Replaced Buttons with Icons */}
//               <View style={styles.pdfIconsContainer}>
//                 {/* View PDF Icon */}
//                 <TouchableOpacity
//                   onPress={() => handleViewPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                   accessibilityLabel={`View PDF for ${orderItem.examName}`}
//                   accessibilityRole="button"
//                 >
//                   <Ionicons name="eye-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//                 {/* Download PDF Icon */}
//                 <TouchableOpacity
//                   onPress={() => handleDownloadPDF(orderItem.product.pdfLink)}
//                   style={styles.pdfIconButton}
//                   accessibilityLabel={`Download PDF for ${orderItem.examName}`}
//                   accessibilityRole="button"
//                 >
//                   <Ionicons name="download-outline" size={24} color={currentTheme.cardTextColor} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//       />
//       {/* View Receipt Button */}
//       <TouchableOpacity
//         style={[styles.viewReceiptButton, { borderColor: currentTheme.backgroundHeaderColor }]}
//         onPress={() => openReceiptModal(item)}
//         accessibilityLabel="View Receipt"
//         accessibilityRole="button"
//       >
//         <Ionicons name="receipt-outline" size={20} color={currentTheme.cardTextColor} />
//         <Text style={[styles.viewReceiptText, { color: currentTheme.cardTextColor }]}>
//           View Receipt
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Enhanced Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]} // Vertical gradient
//       >
//         {/* Back Button */}
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//           accessibilityRole="button"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>

//         {/* Header Title and Subtitle */}
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Order History
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             View your past purchases
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* 5. Orders List with Refresh Control */}
//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item._id}
//         renderItem={renderOrderItem}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           loading ? (
//             <View style={styles.loadingContainer}>
//               <Ionicons name="time-outline" size={80} color={currentTheme.placeholderTextColor} />
//               <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//                 Loading your orders...
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Ionicons
//                 name="cart-outline"
//                 size={80}
//                 color={currentTheme.placeholderTextColor}
//               />
//               <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                 You have no past orders.
//               </Text>
//             </View>
//           )
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing} // Bind to refreshing state
//             onRefresh={onRefresh} // Bind to onRefresh function
//             colors={[currentTheme.primaryColor]} // Android color
//             tintColor={currentTheme.primaryColor} // iOS color
//           />
//         }
//       />

//       {/* Receipt Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={closeReceiptModal}
//         transparent={true}
//         accessibilityViewIsModal={true}
//       >
//         <View style={styles.modalBackground}>
//           <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {selectedOrder && (
//               <>
//                 <ScrollView contentContainerStyle={styles.modalContent}>
//                   <Text style={[styles.modalTitle, { color: currentTheme.cardTextColor }]}>
//                     Receipt Details
//                   </Text>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Order ID:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder._id}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Date:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {new Date(selectedOrder.createdAt).toLocaleDateString()}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Status:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {capitalizeFirstLetter(selectedOrder.status)}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Items Purchased:
//                     </Text>
//                     {selectedOrder.orderItems.map((item, index) => (
//                       <View key={item.product._id} style={styles.itemRow}>
//                         <Text style={[styles.itemName, { color: currentTheme.textColor }]}>
//                           {index + 1}. {item.examName} ({item.subjectName})
//                         </Text>
//                         <Text style={[styles.itemPrice, { color: currentTheme.textColor }]}>
//                           ${item.price.toFixed(2)}
//                         </Text>
//                       </View>
//                     ))}
//                   </View>

//                   <View
//                     style={[styles.separator, { borderBottomColor: currentTheme.borderColor }]}
//                   />

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Total Price:
//                     </Text>
//                     <Text style={[styles.modalTotal, { color: currentTheme.priceColor }]}>
//                       ${selectedOrder.totalPrice.toFixed(2)}
//                     </Text>
//                   </View>

//                   <View style={styles.modalSection}>
//                     <Text style={[styles.modalLabel, { color: currentTheme.secondaryColor }]}>
//                       Payment Method:
//                     </Text>
//                     <Text style={[styles.modalText, { color: currentTheme.textColor }]}>
//                       {selectedOrder.paymentMethod}
//                     </Text>
//                   </View>
//                 </ScrollView>

//                 {/* Buttons */}
//                 <View style={styles.modalButtonsContainer}>
//                   <TouchableOpacity
//                     style={[
//                       styles.modalButton,
//                       { backgroundColor: currentTheme.primaryColor },
//                     ]}
//                     onPress={() => handleGenerateReceipt(selectedOrder)}
//                     accessibilityLabel="View Receipt PDF"
//                     accessibilityRole="button"
//                   >
//                     <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
//                     <Text style={styles.modalButtonText}>View Receipt PDF</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[
//                       styles.modalButton,
//                       { backgroundColor: currentTheme.secondaryColor },
//                     ]}
//                     onPress={() => handleDownloadReceipt(selectedOrder)}
//                     accessibilityLabel="Download Receipt PDF"
//                     accessibilityRole="button"
//                   >
//                     <Ionicons name="download-outline" size={20} color="#FFFFFF" />
//                     <Text style={styles.modalButtonText}>Download Receipt PDF</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <TouchableOpacity
//                   style={[
//                     styles.closeButton,
//                     { backgroundColor: currentTheme.primaryColor },
//                   ]}
//                   onPress={closeReceiptModal}
//                   accessibilityLabel="Close Receipt Modal"
//                   accessibilityRole="button"
//                 >
//                   <Text style={styles.closeButtonText}>Close</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* CustomAlert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </SafeAreaView>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     // Elevation for Android
//     elevation: 4,
//     // Shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     top: 10,
//     padding: 8,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     fontWeight: '400',
//     marginTop: 4,
//   },
//   listContent: {
//     padding: 20,
//     paddingBottom: 20,
//   },
//   orderItem: {
//     marginBottom: 20,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     padding: 15,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   orderDate: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   orderStatus: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   purchasedItemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     marginRight: 10,
//   },
//   purchasedItemDetails: {
//     flex: 1,
//   },
//   purchasedItemName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   purchasedItemSubtitle: {
//     fontSize: 14,
//     color: '#757575',
//   },
//   purchasedItemPrice: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   // New Styles for PDF Icons
//   pdfIconsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 8,
//   },
//   pdfIconButton: {
//     marginLeft: 15,
//     padding: 6,
//   },
//   // Existing styles (Retained for reference)
//   pdfLinksContainer: {
//     flexDirection: 'row',
//     marginTop: 5,
//   },
//   pdfButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#2196F3',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   pdfButtonText: {
//     color: '#FFFFFF',
//     marginLeft: 5,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   viewReceiptButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     // borderColor: '#2196F3',
//     borderRadius: 8,
//   },
//   viewReceiptText: {
//     marginLeft: 5,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   loadingText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
//   // Modal styles
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: '80%',
//     // iOS Shadow
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     // Android Shadow
//     elevation: 5,
//   },
//   modalContent: {
//     paddingBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   modalSection: {
//     marginBottom: 10,
//   },
//   modalLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   modalText: {
//     fontSize: 16,
//     marginTop: 2,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   itemName: {
//     flex: 2,
//     fontSize: 16,
//   },
//   itemPrice: {
//     flex: 1,
//     fontSize: 16,
//     textAlign: 'right',
//   },
//   separator: {
//     borderBottomWidth: 1,
//     marginVertical: 15,
//   },
//   modalTotal: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   closeButton: {
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//     backgroundColor: '#FF5252', // Red color for close button
//   },
//   closeButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   // New styles for modal buttons
//   modalButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   modalButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     flex: 1,
//     marginHorizontal: 5,
//   },
//   modalButtonText: {
//     color: '#FFFFFF',
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default ProductHistoryPage;











