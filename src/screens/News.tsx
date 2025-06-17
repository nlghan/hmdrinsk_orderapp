import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCategoryStore } from '../store/store';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { FONTFAMILY } from '../theme/theme';

interface Post {
  postId: number;
  url: string;
  dateCreated: string;
  title: string;
  shortDescription: string;
  typePost: string
}
type NavigationProp = StackNavigationProp<RootStackParamList, 'News'>;

const News = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const postsPerPage = 10;
  const navigation = useNavigation<NavigationProp>();
  const { language } = useCategoryStore();
  const { t } = useTranslation();
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("Món mới");


  const handleTabPress = (tabName: string) => {
    setSelectedTab(tabName);
    if (tabName === "Món mới") {
      setFilteredPosts(posts.filter(post => post.typePost === "NEW"));
    } else if (tabName === "Sự kiện") {
      setFilteredPosts(posts.filter(post => post.typePost === "EVENT"));
    } else if (tabName === "Giảm giá") {
      setFilteredPosts(posts.filter(post => post.typePost === "DISCOUNT"));
    } else {
      setFilteredPosts(posts); // Hiển thị tất cả nếu không chọn tab nào
    }
  };
  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<{
        headers: any;
        body: {
          listPosts: Post[];
          totalPages: number;
          currentPage: number;
          total: number;
          limit: number;
        };
      }>(
        `/post/view/all/desc?page=${page}&limit=${postsPerPage}&language=${language}`
      );

      const { listPosts, totalPages } = response.data.body;

      setPosts((prevPosts) => {
        const newPosts = listPosts.filter(
          (newPost) => !prevPosts.some((post) => post.postId === newPost.postId)
        );
        return page === 1 ? newPosts : [...prevPosts, ...newPosts];
      });

      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);
  useEffect(() => {
    handleTabPress("Món mới");
  }, [posts]);

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
      <Header
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          paddingBottom: 10,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        }}
      />
      <View style={styles.flatlistContainer}>
        <Text style={styles.header}>{t('posts1')}</Text>
        <View style={styles.tab}>
          {['Món mới', 'Sự kiện', 'Giảm giá'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.tabButtonSelected // Thêm màu nền khi được chọn
              ]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[styles.tabButtonText, selectedTab === tab && styles.tabButtonTextSelected]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filteredPosts}
          keyExtractor={(item, index) => `${item.postId}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.postWrapper}>
              <TouchableOpacity style={styles.postItem} onPress={() => handlePressPost(item.postId)}>
                <Image source={{ uri: item.url || "https://via.placeholder.com/150" }} style={styles.image} />
                <View style={{ padding: 10 }}>
                  <Text style={styles.date}>📅 {item.dateCreated}</Text>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.description} numberOfLines={3}>{item.shortDescription}</Text>

                </View>


              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 10,
            justifyContent: 'space-between',
          }}
          numColumns={2}
          columnWrapperStyle={styles.row} // Đảm bảo căn chỉnh hàng
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="large" color="#ff6347" /> : null}
        />


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9'},
  headerContainer: {
    paddingHorizontal: 14,
    paddingTop: 25,
    paddingBottom: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Dành cho Android
  },
  flatlistContainer: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 8,
    height: '88%'

  },
  header: { fontSize: 24, marginBottom: 16, textAlign: 'center', fontFamily: FONTFAMILY.lobster_regular, },
  row: {
    justifyContent: 'space-between',
  },
  postItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 5,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  date: { fontSize: 18, color: '#666', marginTop: 5, fontFamily: FONTFAMILY.dongle_light },
  title: { fontSize: 22, textAlign: 'center', fontFamily: FONTFAMILY.dongle_bold, lineHeight: 25 },
  description: { fontSize: 20, color: 'gray', marginTop: 4, textAlign: 'center', fontFamily: FONTFAMILY.dongle_regular },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ff6347',
    borderRadius: 5,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  postWrapper: {
    width: '48%', // Mỗi cột chiếm 48% để có khoảng cách giữa hai cột
    marginBottom: 10,
  },
  leftColumn: {
    alignSelf: 'flex-start', // Cột trái
  },
  rightColumn: {
    alignSelf: 'flex-end', // Cột phải
  },
  tab: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'white', // Mặc định nền trắng
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '30%'
  },

  tabButtonSelected: {
    backgroundColor: '#ffebe0', // Màu nền khi được chọn
  },

  tabButtonTextSelected: {
    textAlign: 'center',
    color: '#ff6347', // Màu chữ khi được chọn

  },
  tabButtonText: {
    color: '#6f6e6d',
    fontSize: 20,
    fontFamily: FONTFAMILY.dongle_bold,
    textAlign: 'center',
  },

});

export default News;
