// 放在 App.tsx 或入口文件
;(React as any).useInsertionEffect = React.useLayoutEffect;

import React, { useState, useRef, useEffect, useCallback, useMemo, useContext } from 'react';
import { Easing, View, Text, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar, Share, FlatList, ActivityIndicator, Animated, StyleSheet, TextInput, Pressable } from 'react-native';
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
import axios from 'axios';
import TravelDiaryMasonry from '@/components/TravelDiaryMasonryCopy';
import {TravelDiary} from '@/components/TravelDiaryMasonryCopy/types'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuContext } from './_layout';
const PROFILE_SECTION_BG = '#4A4E69';
const ACCENT_COLOR = '#F25F5C';

// 将 UserInfoSection 组件移到外部
interface UserInfoProps {
  userInfo: {
    avatar: string;
    nickname: string;
    _id: string;
  };
  onUpdateAvatar: (uri: string) => void;
}

const UserInfoSection = React.memo(({ userInfo, onUpdateAvatar }: UserInfoProps) => {
  console.log('[RENDER] UserInfoSection');
  
  const avatarUrl = userInfo.avatar ? 
    `http://localhost:5001/api/images/image?filename=${userInfo.avatar}` : '';

  useEffect(() => {
    console.log('[EFFECT] UserInfoSection props changed:', { userInfo });
  }, [userInfo]);

  return (
    <View style={styles.userInfoSection}>
      <View style={styles.avatarContainer}>
        <ImageUpload
          value={avatarUrl}
          onChange={onUpdateAvatar}
          style={styles.avatarContainer}
          imageStyle={styles.avatarInnerPlaceholder}
          iscameraIcon={false}
        />
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.userName}>{userInfo.nickname || '未设置昵称'}</Text>
        <View style={styles.userIdContainer}>
          <Text style={styles.userId}>ID:{userInfo._id}</Text>
          <TouchableOpacity onPress={() => {
            if (userInfo._id) {
              Share.share({
                message: `User ID: ${userInfo._id}`
              });
            }
          }}>
            <MaterialIcons name="share" size={16} color="#A9A9A9" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  const isEqual = prevProps.userInfo.avatar === nextProps.userInfo.avatar &&
         prevProps.userInfo.nickname === nextProps.userInfo.nickname &&
         prevProps.userInfo._id === nextProps.userInfo._id &&
         prevProps.onUpdateAvatar === nextProps.onUpdateAvatar;
  
  console.log('[MEMO] UserInfoSection comparison:', { 
    isEqual,
    prevProps: prevProps.userInfo,
    nextProps: nextProps.userInfo
  });
  
  return isEqual;
});

const ProfileScreen = () => {
  const router = useRouter();
  const { isAuthenticated, checkToken, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const { setShowMenu } = useContext(MenuContext);
  const [activeTab, setActiveTab] = useState<'travels' | 'favorites' | 'likes'>('travels');
  const [loading, setLoading] = useState(false);
  const [travels, setTravels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [filteredTravels, setFilteredTravels] = useState<TravelDiary[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<TravelDiary[]>([]);
  const [filteredLikes, setFilteredLikes] = useState<TravelDiary[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      await checkToken();
      setIsReady(true);
    };
    checkAuth();
    if (user?.user?._id) {
      loadAllData();
    }
  }, [isReady, isAuthenticated]);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push({
        pathname: '/authscreen',
        params: { from: '/(tabs)/profile' }
      });
    }
  }, [isReady, isAuthenticated]);
  
  // 修改 loadAllData 函数，初始化过滤后的数据
  const loadAllData = async () => {
    if (!user?.user?._id) return;
    
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
          setFilteredTravels(prev => page === 1 ? newData : [...prev, ...newData]);
          break;
        case 'favorites':
          setFilteredFavorites(prev => page === 1 ? newData : [...prev, ...newData]);
          break;
        case 'likes':
          setFilteredLikes(prev => page === 1 ? newData : [...prev, ...newData]);
          break;
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    console.log('activeTab changed:', activeTab);
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

  
  const updateavatar = useCallback(async (uri: string) => {
    try {
      const response = await api.put('/api/users/me', {
        avatar: uri,
      });
      if (response.data) {
        await checkToken();
        alert('头像上传成功');
      }
      loadAllData();
    } catch (error: any) {
      console.error('保存失败:', error);
      alert(error.response?.data?.message || '保存失败，请重试');
    }
  }, []);

  
  const userInfo = useMemo(() => ({
    avatar: user?.user?.avatar || '',
    nickname: user?.user?.nickname || '',
    _id: user?.user?._id || '',
  }), [
    user?.user?.avatar,
    user?.user?.nickname,
    user?.user?._id
  ]);

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
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabChange = (newTab: 'travels' | 'favorites' | 'likes') => {
    if (newTab === activeTab || isAnimating) return;

    const tabOrder = ['travels', 'favorites', 'likes'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const direction = newIndex > currentIndex ? -1 : 1;

    const screenWidth = Dimensions.get('window').width;
    setIsAnimating(true);

  Animated.timing(slideAnim, {
      toValue: direction * screenWidth,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      // 切换 tab
      setActiveTab(newTab);

      // 重置动画初始位置为相反方向
      slideAnim.setValue(-direction * screenWidth);

      // 滑入新 tab
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false); // 解锁
      });
    });
  };
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

  // 数据转换函数
  const convertToTravelDiary = (data: any[]): TravelDiary[] => {
    return data.map(item => ({
      id: item._id, 
      title: item.title,
      content: item.content,
      coverImage: item.images.map((image: any) => `http://localhost:5001/api/images/image?filename=${image}`), 
      video: `http://localhost:5001/api/images/video?filename=${item.video}`,
      duration: 0,
      type: item.video ? 'video' : 'image',
      tags: item.tags?.map((tag: string) => ({ id: tag, name: tag })) || [],
      When: item.when,
      Who: item.who,
      Days: item.days,
      Money: item.money,
      user: {
        id: item.author._id,
        nickname: item.author.nickname,
        avatar: `http://localhost:5001/api/images/image?filename=${item.author.avatar}`
      },
      likes: item.likesCount,
      collects: item.favoriteCount,
      comments: item.commentCount,
      views: item.views,
      location: item.location,
      createTime: item.createdAt,
      status: item.status as 'pending' | 'approved' | 'rejected',
      rejectReason: item.rejectionReason
    }));
  };

  // 优化Content组件
  const Content = React.memo(({ activeTab, loading, hasMore }: {
    activeTab: 'travels' | 'favorites' | 'likes',
    loading: boolean,
    hasMore: boolean
  }) => {
    const screenWidth = Dimensions.get('window').width;
    const animatedStyle = {
      transform: [{ translateX: slideAnim }],
      width: screenWidth,
    };

    // 使用useMemo缓存数据转换结果
    const data = useMemo(() => {
      let sourceData: any[] = [];
      switch (activeTab) {
        case 'travels':
          sourceData = filteredTravels;
          break;
        case 'favorites':
          sourceData = filteredFavorites;
          break;
        case 'likes':
          sourceData = filteredLikes;
          break;
      }
      return convertToTravelDiary(sourceData);
    }, [activeTab, filteredTravels, filteredFavorites, filteredLikes]);

    const handleLoadMoreinner = useCallback(async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      setTimeout(() => {
        setPage(prev => prev + 1);
        loadMoreData(activeTab);
        setLoading(false);
      }, 1000);
    }, [activeTab, page, loading, hasMore]);

    const handlePressItem = useCallback((diary: TravelDiary) => {
      if (diary.type === 'video') {
        router.push({
          pathname: '/diary/[id]',
          params: { id: diary.id }
        });
      }else{
        router.push({
          pathname: '/diary-listCopy/[id]',
          params: { id: diary.id }
        });
      }
    }, []);
    console.log('data:', data);
    if(activeTab === 'travels' && data.length === 0){
      return (
        <View style={styles.emptycontentContainer}>
          <Ionicons name="camera-outline" size={80} color="#D3D3D3" />
          <Text style={styles.contentText}>一张照片, 交换春天 🍃</Text>
          <TouchableOpacity style={styles.publishButton}>
            <Text style={styles.publishButtonText}>去发布</Text>
          </TouchableOpacity>
        </View>)
    }
    

    return (
      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <TravelDiaryMasonry
          diaries={data}
          loading={loading}
          searching={false}
          onLoadMore={handleLoadMoreinner}
          onPressItem={handlePressItem}
        />
      </Animated.View>
    );
  }, (prevProps, nextProps) => {
    return (
      prevProps.activeTab === nextProps.activeTab &&
      prevProps.loading === nextProps.loading &&
      prevProps.hasMore === nextProps.hasMore
    );
  });

  const handleEditProfile = () => {
    router.push('/editinfo');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ProfileHeader />
      <View 
        style={[styles.scrollView, { zIndex: 1 }]}
        >
        <View style={styles.scrollableTopContentWrapper}>
          <UserInfoSection 
            userInfo={userInfo}
            onUpdateAvatar={updateavatar}
          />
          <BioAndStats 
            user={user} 
            onEditProfile={handleEditProfile}
          />
        </View>

        <View style={styles.contentSection}>
          <ContentTabs />
          <Content 
            activeTab={activeTab}
            loading={loading}
            hasMore={hasMore}
          />
        </View>
      </View>
    </SafeAreaView>

  );
};
export default ProfileScreen;