import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCategoryStore } from '../store/store';

interface Post {
  postId: number;
  url: string;
  dateCreated: string;
  title: string;
  shortDescription: string;
}
type NavigationProp = StackNavigationProp<RootStackParamList, 'News'>;

const News = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const postsPerPage = 10;
  const navigation = useNavigation<NavigationProp>();
  const { language, userId } = useCategoryStore();

  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<{ listPosts: Post[]; totalPages: number }>(
        `/post/view/all/desc?page=${page}&limit=${postsPerPage}&language=${language}`
      );

      setPosts((prevPosts) => [...prevPosts, ...response.data.listPosts]);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePressPost = (postId: number) => {
    navigation.navigate('NewDetails', { postId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tin Tức</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.postItem} onPress={() => handlePressPost(item.postId)}>
            <Image source={{ uri: item.url || "https://via.placeholder.com/250" }} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.date}>📅 {item.dateCreated}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.shortDescription}</Text>
              <TouchableOpacity style={styles.button} onPress={() => handlePressPost(item.postId)}>
                <Text style={styles.buttonText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#ff6347" /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  postItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  image: { width: 100, height: 100, borderRadius: 8 },
  content: { flex: 1, marginLeft: 12 },
  date: { fontSize: 12, color: '#666' },
  title: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#444', marginTop: 4 },
  button: { marginTop: 8, padding: 8, backgroundColor: '#ff6347', borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default News;
