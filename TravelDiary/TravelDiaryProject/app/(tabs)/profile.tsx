import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar, SafeAreaView} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import styles from '../../styles/profile.styles';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

const PROFILE_SECTION_BG = '#4A4E69'; 
const ACCENT_COLOR = '#F25F5C'; 

const ProfileScreen = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/authscreen');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // ProfileHeader component - Fixed at the top
  const ProfileHeader = () => (
    <View style={styles.profileHeaderContainer}>
      <TouchableOpacity style={styles.headerIcon}>
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>
      <View style={styles.headerRightIcons}>
        <TouchableOpacity style={styles.setBackgroundButton}>
          <MaterialIcons name="photo-library" size={16} color="white" style={{ marginRight: 5 }}/>
          <Text style={styles.setBackgroundText}>设置背景</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );

  // UserInfoSection and below will be inside the ScrollView
  const UserInfoSection = () => (
    <View style={styles.userInfoSection}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarOutline}>
            <View style={styles.avatarInnerPlaceholder} />
        </View>
        <TouchableOpacity style={styles.addAvatarButton}>
          <Ionicons name="add" size={18} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>昵称62A60E63</Text>
        <View style={styles.userIdContainer}>
          <Text style={styles.userId}>ID: 5418842087</Text>
          <FontAwesome5 name="clone" size={12} color="#A9A9A9" style={{ marginLeft: 5 }} />
        </View>
      </View>
    </View>
  );

  const BioAndStats = () => (
    <View style={styles.bioStatsContainer}>
      <Text style={styles.bioText}>点击这里, 填写简介</Text>
      <TouchableOpacity style={styles.genderIconContainer}>
        <Ionicons name="male-outline" size={16} color="#A9A9A9" />
      </TouchableOpacity>
      <View style={styles.betweenContainer}>
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>获赞</Text>
            </View>
            <View style={styles.statItem}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>收藏</Text>
            </View>
        </View>
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>编辑资料</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={22} color="white" />
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
    </SafeAreaView>
  );
};


export default ProfileScreen;