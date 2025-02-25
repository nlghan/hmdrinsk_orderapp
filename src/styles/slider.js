import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    height: 250,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 8,
    overflow: 'hidden', 
    borderRadius: 20, 
  },
  imageContainer: {
    width: width,
    height: 250,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: width,
    height: '100%',
    resizeMode: 'stretch',
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,  
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1, 
    minHeight: 50, 
  },
  title: {
    color: '#fff',
    fontSize: 16, 
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: width * 0.8, 
    flexWrap: 'wrap', 
    
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotInactive: {
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: '#ff5733',
    width: 12,
    height: 12,
  },
});

export default styles;
