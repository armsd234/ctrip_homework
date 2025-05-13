import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar, Share, FlatList, ActivityIndicator, Animated, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import styles from '../../styles/profile.styles';
import { useAuth } from '../../contexts/AuthContext';
// import { router } from 'expo-router';
import { useRouter } from 'expo-router';
import { ImageBackground } from 'react-native';
import ImageUpload from '@/components/ImageUpload';
import { api } from '@/services/api';
import { SideMenu } from '@/components/SiderMemu';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blue } from 'react-native-reanimated/lib/typescript/Colors';
import axios from 'axios';

const PROFILE_SECTION_BG = '#4A4E69';
const ACCENT_COLOR = '#F25F5C';

interface TravelNote {
  _id: string;
  title: string;
  images: string[];
  views: number;
  likesCount: number;
  commentCount: number;
}

const ProfileScreen = () => {
  const router = useRouter();
  const { isAuthenticated, checkToken, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'travels' | 'favorites' | 'likes'>('travels');
  const [loading, setLoading] = useState(false);
  const [travels, setTravels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [prevTab, setPrevTab] = useState<'travels' | 'favorites' | 'likes'>('travels');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [filteredTravels, setFilteredTravels] = useState<TravelNote[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<TravelNote[]>([]);
  const [filteredLikes, setFilteredLikes] = useState<TravelNote[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const checkAuth = async () => {
      await checkToken();
      setIsReady(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push({
        pathname: '/authscreen',
        params: { from: '/(tabs)/profile' }
      });
    }
  }, [isReady, isAuthenticated]);

  // 自动请求游记列表
  useEffect(() => {
    if (!user?.user._id) return;
    setLoading(true);
    axios.get(`http://localhost:5001/api/travel-notes/user/${user.user._id}`, { params: { page: 1, limit: 10 } })
      .then(res => setTravels(res.data.data))
      .catch(err => console.error('获取游记失败', err))
      .finally(() => setLoading(false));
  }, [user?.user._id]);

  // 修改搜索过滤函数
  const filterContent = (text: string) => {
    const searchLower = text.toLowerCase().trim();
    
    // 如果没有搜索文本，显示所有内容
    if (!searchLower) {
      setFilteredTravels(travels);
      setFilteredFavorites(favorites);
      setFilteredLikes(likes);
      return;
    }

    // 优化搜索逻辑
    const filterItems = (items: TravelNote[]) => 
      items.filter(item => {
        if (!item || !item.title) return false;
        return item.title.toLowerCase().includes(searchLower);
      });

    const filteredTravelsData = filterItems(travels);
    const filteredFavoritesData = filterItems(favorites);
    const filteredLikesData = filterItems(likes);

    // 更新过滤后的数据
    setFilteredTravels(filteredTravelsData);
    setFilteredFavorites(filteredFavoritesData);
    setFilteredLikes(filteredLikesData);

    // 优化标签页切换逻辑
    if (filteredTravelsData.length > 0) {
      setActiveTab('travels');
    } else if (filteredFavoritesData.length > 0) {
      setActiveTab('favorites');
    } else if (filteredLikesData.length > 0) {
      setActiveTab('likes');
    }
  };

  // 修改 loadAllData 函数，初始化过滤后的数据
  const loadAllData = async () => {
    if (!user?.user._id) return;
    
    setLoading(true);
    try {
      const userId = user.user._id;
      const [travelsRes, favoritesRes, likesRes] = await Promise.all([
        api.get(`/api/travel-notes/user/${userId}`, { params: { page: 1, limit: 10 } }),
        api.get(`/api/travel-notes/favorites/${userId}`, { params: { page: 1, limit: 10 } }),
        api.get(`/api/travel-notes/likes/${userId}`, { params: { page: 1, limit: 10 } })
      ]);

      const travelsData = travelsRes.data.data;
      const favoritesData = favoritesRes.data.data;
      const likesData = likesRes.data.data;

      setTravels(travelsData);
      setFavorites(favoritesData);
      setLikes(likesData);
      setFilteredTravels(travelsData);
      setFilteredFavorites(favoritesData);
      setFilteredLikes(likesData);
      setHasMore(true);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当用户信息加载完成后，立即加载所有数据
  useEffect(() => {
    if (user?.user._id) {
      loadAllData();
    }
  }, [user?.user._id]);

  // 加载更多数据
  const loadMoreData = async (type: 'travels' | 'favorites' | 'likes') => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const userId = user?.user._id;
      if (!userId) return;

      let endpoint = '';
      switch (type) {
        case 'travels':
          endpoint = `/api/travel-notes/user/${userId}`;
          break;
        case 'favorites':
          endpoint = `/api/travel-notes/favorites/${userId}`;
          break;
        case 'likes':
          endpoint = `/api/travel-notes/likes/${userId}`;
          break;
      }

      const response = await api.get(endpoint, {
        params: { page, limit: 10 }
      });

      const newData = response.data.data;
      setHasMore(newData.length === 10);

      switch (type) {
        case 'travels':
          const updatedTravels = page === 1 ? newData : [...travels, ...newData];
          setTravels(updatedTravels);
          filterContent(searchText); // 重新过滤数据
          break;
        case 'favorites':
          const updatedFavorites = page === 1 ? newData : [...favorites, ...newData];
          setFavorites(updatedFavorites);
          filterContent(searchText); // 重新过滤数据
          break;
        case 'likes':
          const updatedLikes = page === 1 ? newData : [...likes, ...newData];
          setLikes(updatedLikes);
          filterContent(searchText); // 重新过滤数据
          break;
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换标签时重置页码并加载更多数据
  useEffect(() => {
    if (user?.user._id) {
      setPage(1);
      setHasMore(true);
      loadMoreData(activeTab);
    }
  }, [activeTab]);

  // ProfileHeader component - Fixed at the top
  const ProfileHeader = () => (
    <View style={styles.profileHeaderContainer}>
      <TouchableOpacity style={styles.headerIcon} onPress={() => setShowMenu(true)}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>
      <View style={styles.headerRightIcons}>
        <TouchableOpacity style={styles.setBackgroundButton}>
          <MaterialIcons name="share" size={16} color="white" style={{ marginRight: 5 }} />
        </TouchableOpacity>

      </View>
    </View>
  );

  const updateavatar = async (uri: string) => {
    try {
      const response = await api.put('/api/users/me', {
        avatar: uri,
      });
      if (response.data) {
        await checkToken();
        alert('头像上传成功');
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      alert(error.response?.data?.message || '保存失败，请重试');
    }
  }

  // 使用React.memo优化UserInfoSection组件
  const UserInfoSection = React.memo(({ user, onUpdateAvatar }: { 
    user: any, 
    onUpdateAvatar: (uri: string) => void 
  }) => (
    <View style={styles.userInfoSection}>
      <View style={styles.avatarContainer}>
        <ImageUpload
          value={`http://localhost:5001/api/images/image?filename=${user?.user.avatar}`}
          onChange={(filename) => { onUpdateAvatar(filename); }}
          style={styles.avatarContainer}
          imageStyle={styles.avatarInnerPlaceholder}
          iscameraIcon={false}
        />
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user?.user.nickname}</Text>
        <View style={styles.userIdContainer}>
          <Text style={styles.userId}>ID:{user?.user._id}</Text>
          <TouchableOpacity onPress={() => {
            if (user?.user._id) {
              Share.share({
                message: `User ID: ${user.user._id}`
              });
            }
          }}>
            <FontAwesome5 name="clone" size={12} color="#A9A9A9" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ));

  // 使用React.memo优化BioAndStats组件
  const BioAndStats = React.memo(({ user, onEditProfile }: { 
    user: any, 
    onEditProfile: () => void 
  }) => (
    <View style={styles.bioStatsContainer}>
      <Text style={styles.bioText}>{user?.user.signature}</Text>
      <TouchableOpacity style={styles.genderIconContainer}>
        {
          user?.user.gender === 'male' ? (
            <Ionicons name="male-outline" size={16} color="#2c91ef" />
          ) : (
            <Ionicons name="female-outline" size={16} color="#A9A9A9" />
          )
        }
      </TouchableOpacity>
      <View style={styles.betweenContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.user.followers}</Text>
            <Text style={styles.statLabel}>关注</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.user.followings}</Text>
            <Text style={styles.statLabel}>粉丝</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(user?.user?.favoriteds || 0) + (user?.user?.likeds || 0)}</Text>
            <Text style={styles.statLabel}>获赞与收藏</Text>
          </View>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editProfileButton} onPress={onEditProfile}>
            <Text style={styles.editProfileText}>编辑资料</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ));

  // 处理标签切换动画
  const handleTabChange = (newTab: 'travels' | 'favorites' | 'likes') => {
    const tabOrder = ['travels', 'favorites', 'likes'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const direction = newIndex > currentIndex ? 1 : -1;

    // 设置初始位置
    slideAnim.setValue(direction);
    setPrevTab(activeTab);
    setActiveTab(newTab);

    // 执行动画
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // 修改 BigSearchBar 组件
  const BigSearchBar = () => (
    <View style={[styles.searchWrapper, { zIndex: 1000 }]}>
      <View style={[
        styles.searchBox,
        searchFocused && { borderColor: ACCENT_COLOR }
      ]}>
        <View style={styles.searchIconWrapper}>
          <Ionicons 
            name="search" 
            size={20} 
            color={searchFocused ? ACCENT_COLOR : '#999'} 
          />
        </View>
        <TextInput
          style={[
            styles.searchTextInput,
            { outlineWidth: 0, outlineColor: 'transparent', boxShadow: 'none' }
          ]}
          placeholder="搜索游记标题"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            filterContent(text);
          }}
          onFocus={() => {
            setSearchFocused(true);
            // 滚动到搜索框位置
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          enablesReturnKeyAutomatically
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.searchClearBtn}
            onPress={() => {
              setSearchText('');
              filterContent('');
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // 修改ContentTabs组件，去除搜索相关内容
  const ContentTabs = React.memo(() => (
    <View style={styles.contentTabsContainer}>
      <TouchableOpacity 
        style={[styles.tabItem, activeTab === 'travels' && styles.activeTabItem]}
        onPress={() => handleTabChange('travels')}>
        <Text style={[styles.tabText, activeTab === 'travels' && styles.activeTabText]}>游记</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabItem, activeTab === 'favorites' && styles.activeTabItem]}
        onPress={() => handleTabChange('favorites')}>
        <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>收藏</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabItem, activeTab === 'likes' && styles.activeTabItem]}
        onPress={() => handleTabChange('likes')}>
        <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>赞过</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
    </View>
  ));

  const renderTravelItem = ({ item }: { item: TravelNote }) => (
    // console.log('Rendering travel item:', item),
    <TouchableOpacity 
      style={styles.travelItem}
      onPress={() => {
        router.push({
          pathname: '/diary-list/[id]',
          params: { id: item._id }
        });
      }}
    >
      <Image 
        source={{ 
          uri: item.images && item.images.length > 0 
            ? `http://localhost:5001/api/images/image?filename=${item.images[0] }`
            : 'http://localhost:5001/api/images/image?filename=default_avatar.jpg'
        }}
        style={styles.travelImage}
      />
      <View style={styles.travelInfo}>
        <Text style={styles.travelTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.travelStats}>
          <Text style={styles.travelStat}>
            <Ionicons name="eye-outline" size={14} /> {item.views}
          </Text>
          <Text style={styles.travelStat}>
            <Ionicons name="heart-outline" size={14} /> {item.likesCount}
          </Text>
          <Text style={styles.travelStat}>
            <Ionicons name="chatbubble-outline" size={14} /> {item.commentCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 修改内容组件的类型定义
  interface ContentComponentProps {
    data: TravelNote[];
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    ListEmptyComponent?: React.ComponentType<any>;
  }

  // 使用React.memo优化各个内容组件
  const TravelsContent = React.memo(({ data, loading, hasMore, onLoadMore, ListEmptyComponent }: ContentComponentProps) => (
    <FlatList
      data={data}
      renderItem={renderTravelItem}
      keyExtractor={item => item._id}
      onEndReached={() => {
        if (hasMore && !loading) {
          onLoadMore();
        }
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
    />
  ));

  const FavoritesContent = React.memo(({ data, loading, hasMore, onLoadMore, ListEmptyComponent }: ContentComponentProps) => (
    <FlatList
      data={data}
      renderItem={renderTravelItem}
      keyExtractor={item => item._id}
      onEndReached={() => {
        if (hasMore && !loading) {
          onLoadMore();
        }
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
    />
  ));

  const LikesContent = React.memo(({ data, loading, hasMore, onLoadMore, ListEmptyComponent }: ContentComponentProps) => (
    <FlatList
      data={data}
      renderItem={renderTravelItem}
      keyExtractor={item => item._id}
      onEndReached={() => {
        if (hasMore && !loading) {
          onLoadMore();
        }
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
    />
  ));

  // 修改Content组件，只对游记tab应用搜索过滤
  const Content = React.memo(({ activeTab, loading, hasMore, onLoadMore }: {
    activeTab: 'travels' | 'favorites' | 'likes',
    loading: boolean,
    hasMore: boolean,
    onLoadMore: (type: 'travels' | 'favorites' | 'likes') => void
  }) => {
    const translateX = slideAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [-Dimensions.get('window').width, 0, Dimensions.get('window').width]
    });

    const EmptyComponent = () => {
      if (searchText.trim()) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={80} color="#D3D3D3" />
            <Text style={styles.contentText}>未找到相关游记</Text>
          </View>
        );
      }

      switch (activeTab) {
        case 'travels':
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="camera-outline" size={80} color="#D3D3D3" />
              <Text style={styles.contentText}>一张照片, 交换春天 🍃</Text>
              <TouchableOpacity style={styles.publishButton}>
                <Text style={styles.publishButtonText}>去发布</Text>
              </TouchableOpacity>
            </View>
          );
        case 'favorites':
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={80} color="#D3D3D3" />
              <Text style={styles.contentText}>还没有收藏任何内容</Text>
            </View>
          );
        case 'likes':
          return (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={80} color="#D3D3D3" />
              <Text style={styles.contentText}>还没有点赞任何内容</Text>
            </View>
          );
      }
    };

    return (
      <Animated.View style={[
        styles.contentContainer,
        { transform: [{ translateX }] }
      ]}>
        {activeTab === 'travels' && (
          <TravelsContent 
            data={filteredTravels} 
            loading={loading} 
            hasMore={hasMore} 
            onLoadMore={() => onLoadMore('travels')}
            ListEmptyComponent={EmptyComponent}
          />
        )}
        {activeTab === 'favorites' && (
          <FavoritesContent 
            data={filteredFavorites} 
            loading={loading} 
            hasMore={hasMore} 
            onLoadMore={() => onLoadMore('favorites')}
            ListEmptyComponent={EmptyComponent}
          />
        )}
        {activeTab === 'likes' && (
          <LikesContent 
            data={filteredLikes} 
            loading={loading} 
            hasMore={hasMore} 
            onLoadMore={() => onLoadMore('likes')}
            ListEmptyComponent={EmptyComponent}
          />
        )}
      </Animated.View>
    );
  });

  const handleLoadMore = (type: 'travels' | 'favorites' | 'likes') => {
    setPage(prev => prev + 1);
    loadMoreData(type);
  };

  const handleEditProfile = () => {
    console.log('Navigating to Edit Profile');
    router.push('/editinfo');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* <StatusBar barStyle="light-content" backgroundColor={'blue'} /> */}
      <ProfileHeader />
      <ScrollView 
        style={[styles.scrollView, { zIndex: 1 }]}
        contentContainerStyle={[styles.scrollViewContentContainer, { zIndex: 1 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ref={scrollViewRef}>
        <View style={styles.scrollableTopContentWrapper}>
          <UserInfoSection 
            user={user} 
            onUpdateAvatar={updateavatar}
          />
          <BioAndStats 
            user={user} 
            onEditProfile={handleEditProfile}
          />
        </View>

        <View style={styles.contentSection}>
          <BigSearchBar />
          <ContentTabs />
          <Content 
            activeTab={activeTab}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </View>
      </ScrollView>
      <SideMenu visible={showMenu} onClose={() => setShowMenu(false)} />
    </SafeAreaView>

  );
};

// 添加新的样式到现有的样式对象中
// Object.assign(styles, {
  
// });

export default ProfileScreen;