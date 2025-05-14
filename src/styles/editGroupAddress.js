import { StyleSheet } from 'react-native';
import { FONTFAMILY } from '../theme/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  label: {
    fontSize:22,
    fontFamily: FONTFAMILY.dongle_bold,
    marginTop: 4,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  dropDownContainer: {
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#FF8C42',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: 'orange',
   
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTFAMILY.dongle_regular,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FFE1D0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'gray',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontFamily: FONTFAMILY.dongle_regular,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
   header: {
        flexDirection: "row", justifyContent: "center", alignItems: "center",
        marginBottom: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E0E0E0",
    },
    backIcon: {
        position: "absolute", left: 5, padding: 8, borderRadius: 10,
        backgroundColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    },
    headerTitle: { fontSize: 24, fontFamily: FONTFAMILY.lobster_regular, color: "#333" },
});

export default styles;
