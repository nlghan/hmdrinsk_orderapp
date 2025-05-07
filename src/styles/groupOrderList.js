import { StyleSheet } from 'react-native';
import {
    BORDERRADIUS,
    COLORS,
    FONTFAMILY,
    SPACING,
} from '../theme/theme';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: FONTFAMILY.medium, // tuỳ chỉnh theo theme của bạn
  },
  list: {
    margin: 0,
    padding: 0,
  },
  item: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // elevation for Android
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
  },
  status: {
    fontSize: 13,
    color: 'gray',
  },
  info: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
});

export default styles;
