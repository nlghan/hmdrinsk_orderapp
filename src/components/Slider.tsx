import React, { useEffect, useRef, useState } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, Animated, Text, TouchableOpacity } from 'react-native';
import { useCategoryStore } from '../store/store';
import sliderStyles from '../styles/slider';


const { width } = Dimensions.get('window');

interface Post {
  postId: number;
  url: string;
  title: string;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

const Slider = () => {
  const flatListRef = useRef<FlatList<Post>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // 🔥 Lấy `posts` từ `data` trong store
  const { data,  } = useCategoryStore();
  const posts = data?.posts || []; // ✅ Lấy posts từ `data.posts`
 

  useEffect(() => {
    if (posts.length === 0 || !isAutoScrolling) return;

    const interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % posts.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, posts.length, isAutoScrolling]);

  return (
    <View style={sliderStyles.container}>
      {/* Hiển thị ảnh */}
      <AnimatedFlatList
        ref={flatListRef}
        data={posts}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <View style={sliderStyles.imageContainer}>
            <View style={sliderStyles.imageWrapper}>
              <Image source={{ uri: item.url }} style={sliderStyles.image} />
            </View>
            {/* Lớp phủ title */}
            <View style={sliderStyles.overlay}>
              <Text style={sliderStyles.title} numberOfLines={2}>{item.title}</Text>
            </View>
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
          setIsAutoScrolling(true);
        }}
        onTouchStart={() => {
          setIsAutoScrolling(false); // 🛑 Dừng auto-scroll khi người dùng chạm vào slider
        }}
        onTouchEnd={() => {
          setTimeout(() => setIsAutoScrolling(true), 5000); // 🔄 Bật lại auto-scroll sau 5s
        }}
      />

      {/* Dấu chấm chỉ mục */}
      <View style={sliderStyles.pagination}>
        {posts.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              flatListRef.current?.scrollToOffset({
                offset: index * width,
                animated: true,
              });
              setIsAutoScrolling(false);
              setTimeout(() => setIsAutoScrolling(true), 5000);
            }}
          >
            <View
              style={[
                sliderStyles.dot,
                currentIndex === index ? sliderStyles.dotActive : sliderStyles.dotInactive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Slider;
