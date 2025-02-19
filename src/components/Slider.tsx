import React, { useEffect, useRef, useState } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { useCategoryStore } from '../store/store'; // Import store

const { width } = Dimensions.get('window'); // Lấy chiều rộng màn hình

const Slider = () => {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const { posts, fetchPosts } = useCategoryStore(); // Lấy danh sách bài viết từ store

  useEffect(() => {
    fetchPosts(); // Fetch danh sách bài viết khi component được render lần đầu
  }, []);

  useEffect(() => {
    if (posts.length === 0) return; // Nếu chưa có dữ liệu, không chạy interval

    const interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % posts.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000); // Tự động chuyển ảnh mỗi 3 giây

    return () => clearInterval(interval); // Xóa interval khi component unmount
  }, [currentIndex, posts.length]);

  return (
    <View style={styles.container}>
      {/* FlatList hiển thị ảnh bài viết */}
      <FlatList
        ref={flatListRef}
        data={posts}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.url }} style={styles.image} />
            
            {/* Lớp phủ title */}
            <View style={styles.overlay}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </View>
          </View>
        )}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Dấu chấm chỉ mục */}
      <View style={styles.pagination}>
        {posts.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 8,
  },
  imageContainer: {
    position: 'relative',
    width: width,
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  overlay: {
    position: 'absolute',
    top:0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.74)', // Lớp phủ mờ trên ảnh
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 2,
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
    width: 10,
    height: 10,
  },
});

export default Slider;
