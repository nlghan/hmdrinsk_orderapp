import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';
const styles = StyleSheet.create({
    container: {
      flex: 1,
      opacity: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: COLORS.primaryGreenHex,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 4,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 30,
      height: 30,
      marginRight: 8,
      resizeMode: 'contain',
    },
    greeting: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 12,
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
      borderRadius: 50,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    iconText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: 'bold',
    },
    rewardsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      marginTop: 5,
      gap: 10,
    },
    categoryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
      marginTop: 10,
      marginLeft: 8,
      letterSpacing: 1,
    },
    services: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      paddingHorizontal: 14,
      marginTop: 20,
    },
    productHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 8,
      alignItems: 'center'
    },
    productTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
      marginTop: 10,
      marginLeft: 8,
      letterSpacing: 1,
    },
    productTitle2: {
      fontSize: 13,
      color: 'black',
      marginTop: 10,
      marginRight: 8,
      letterSpacing: 1,
    },
    serviceItem: {
      alignItems: 'center',
      marginRight: 16,
    },
    serviceImage: {
      width: 65,
      height: 65,
      borderRadius: 30,
    },
    notificationDot: {
      width: 8,
      height: 8,
      backgroundColor: COLORS.primaryGreenHex,
      borderRadius: 4,
      position: 'absolute',
      top: 0,
      right: 0,
    },
    serviceText: {
      fontSize: 14,
      marginTop: 4,
      textAlign: 'center',
    },
    
    
    
  });
  export default styles;