import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar, SafeAreaView} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import styles from '../../styles/profile.styles';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import Clipboard from '@react-native-clipboard/clipboard';
import { ImageBackground } from 'react-native';
import ImageUpload from '@/components/ImageUpload';
import { api } from '@/services/api';
import {SideMenu} from '@/components/SiderMemu';

const PROFILE_SECTION_BG = '#4A4E69'; 

const ProfileScreen = () => {
  const { isAuthenticated, checkToken, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
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

  // ProfileHeader component - Fixed at the top
  const ProfileHeader = () => (
    <View style={styles.profileHeaderContainer}>
      <TouchableOpacity style={styles.headerIcon} onPress={() => setShowMenu(true)}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>
      <View style={styles.headerRightIcons}>
        <TouchableOpacity style={styles.setBackgroundButton}>
          <MaterialIcons name="share" size={16} color="white" style={{ marginRight: 5 }}/>
        </TouchableOpacity>
        
      </View>
    </View>
  );

  const updateavatar = async (uri: string) => {
    try {
      const response = await api.put('/api/users/me', {
          avatar:  uri,
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

  // UserInfoSection and below will be inside the ScrollView
  const UserInfoSection = () => (
    <View style={styles.userInfoSection}>
      <View style={styles.avatarContainer}>
        <ImageUpload
              value={`http://localhost:5000/api/images/image?filename=${user?.user.avatar}`}
              onChange={(filename) => {updateavatar(filename);}}
              style={styles.avatarContainer}
              imageStyle={styles.avatarInnerPlaceholder}
              iscameraIcon={false}
              />
        
      </View>
      
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{user?.user.nickname}</Text>
        <View style={styles.userIdContainer}>
          <Text style={styles.userId}>ID:{user?.user._id}</Text>
          <TouchableOpacity onPress={() => { if (user?.user._id) Clipboard.setString(user?.user._id); }}>
            <FontAwesome5 name="clone" size={12} color="#A9A9A9" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );

  const BioAndStats = () => (
    <View style={styles.bioStatsContainer}>
      <Text style={styles.bioText}>{user?.user.signature}</Text>
      <TouchableOpacity style={styles.genderIconContainer}>
        {
          user?.user.gender === 'male' ? (
            <Ionicons name="male-outline" size={16} color="#A9A9A9"  />
          ) : (
            <Ionicons name="female-outline" size={16} color="#2c91ef" />
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
            <TouchableOpacity style={styles.editProfileButton} onPress={
              () => {
                  console.log('Navigating to Edit Profile');
                  router.push('/editinfo'); // Adjust the path as needed
              }
            }>
              <Text style={styles.editProfileText}>编辑资料</Text>
            </TouchableOpacity>
            
        </View>
      </View>
    </View>
  );

  const ContentTabs = () => (
    <View style={styles.contentTabsContainer}>
      <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
        <Text style={[styles.tabText, styles.activeTabText]}>游记</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabItem}>
        <Text style={styles.tabText}>收藏</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabItem}>
        <Text style={styles.tabText}>赞过</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} /> 
      <TouchableOpacity style={styles.searchIconTab}>
        <Ionicons name="search" size={22} color="#555" />
      </TouchableOpacity>
    </View>
  );


  const Content = () => (
    <View style={styles.contentContainer}>
      <Ionicons name="camera-outline" size={80} color="#D3D3D3" />
      <Text style={styles.contentText}>一张照片, 交换春天 🍃</Text>
      <TouchableOpacity style={styles.publishButton}>
        <Text style={styles.publishButtonText}>去发布</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      
      <StatusBar barStyle="light-content" backgroundColor={PROFILE_SECTION_BG} />
      <ProfileHeader />
      <ScrollView style={styles.scrollView } 
        contentContainerStyle={[{ paddingTop: 0, paddingBottom: 52 },styles.scrollViewContentContainer]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.scrollableTopContentWrapper}>
          
            <UserInfoSection />
            <BioAndStats />
        
        </View>
        
        <View style={styles.contentSection}>
          <ContentTabs />
          <Content />
        </View>
      </ScrollView>
      <SideMenu visible={showMenu} onClose={() => setShowMenu(false)} />
    </SafeAreaView>
    
  );
};


export default ProfileScreen;