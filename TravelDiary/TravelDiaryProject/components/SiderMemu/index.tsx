import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.65;

const menuList = [
  { icon: <Ionicons name="person-add-outline" size={24} color="#222" />, label: '发现好友' },
  { icon: <Ionicons name="flash-outline" size={24} color="#222" />, label: '我的草稿' },
  { icon: <Ionicons name="chatbubble-ellipses-outline" size={24} color="#222" />, label: '我的评论' },
  { icon: <Ionicons name="time-outline" size={24} color="#222" />, label: '浏览记录' },
  { divider: true },
  
  { icon: <FontAwesome5 name="seedling" size={24} color="#222" />, label: '社区公约' },
];

const bottomMenu = [
  { icon: <Ionicons name="scan-outline" size={24} color="#888" />, label: '扫一扫' },
  { icon: <Ionicons name="help-circle-outline" size={24} color="#888" />, label: '帮助与客服' },
  { icon: <Ionicons name="log-out-outline" size={24} color="#888" />, label: '登出' },
];



export const SideMenu = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [anim] = useState(new Animated.Value(visible ? 0 : -SIDEBAR_WIDTH));
  const { logout } = useAuth();

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 0 : -SIDEBAR_WIDTH,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  const handlebutton = (idx : any) => {
    if (idx === 2) {
      logout(); // 调用 logout 函数进行登出操作
      router.replace('/authscreen'); // 跳转到登录页面
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      {visible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      )}
      <Animated.View style={[styles.sidebar, { left: anim }]}>
        <ScrollView style={{ flex: 1, marginTop: 60, marginBottom: 80 }}>
          <View style={{ height: 40 }} />
          {menuList.map((item, idx) =>
            item.divider ? (
              <View key={idx} style={styles.divider} />
            ) : (
              <TouchableOpacity key={idx} style={styles.menuItem}>
                {item.icon}
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
        <View style={styles.bottomMenu}>
          {bottomMenu.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.bottomMenuItem} onPress={() => handlebutton(idx)}>
              {item.icon}
              <Text style={styles.bottomMenuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
};


const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#f7f9f9',
    zIndex: 80,
    paddingTop: 0,
    paddingHorizontal: 0,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
  },
  menuText: {
    fontSize: 17,
    color: '#222',
    marginLeft: 16,
  },
  divider: {
    height: 16,
    backgroundColor: 'transparent',
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f7f9f9',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 30,
  },
  bottomMenuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  bottomMenuText: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
});