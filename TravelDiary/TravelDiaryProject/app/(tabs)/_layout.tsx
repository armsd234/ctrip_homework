import React, { Suspense, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, Tabs, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  createImage: undefined;
  createVideo: undefined;
};

// 加载中组件
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text>加载中...</Text>
    </View>
  );
}

// 自定义发布按钮组件
function PublishButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.createButton}
    onPress={(e) => {
      e.preventDefault(); // 阻止默认行为
      onPress();
    }}>
      <FontAwesome style={styles.icon} name="plus" color="white" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  // const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const router = useRouter();
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: '游记列表',
              tabBarIcon: ({ color }) => (
                <FontAwesome style={styles.icon} name="compass" color={color} />
              )
            }}
          />
          <Tabs.Screen
            name="message"
            options={{
              title: '热门',
              tabBarIcon: ({ color }) => (
                <FontAwesome style={styles.icon} name="camera" color={color} />
              )
            }}
          />
          
          <Tabs.Screen
            name="create"
            options={{
              title: '发布',
              tabBarIcon: () => (
                <PublishButton onPress={() => setModalVisible(true)} />
              ),
              tabBarLabel: () => null, // 隐藏标签
            }}
          />
          <Tabs.Screen
            name="mydiary"
            options={{
              title: '我的游记',
              tabBarIcon: ({ color }) => (
                <FontAwesome style={styles.icon} name="book" color={color} />
              )
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: '我',
              tabBarIcon: ({ color }) => (
                <FontAwesome style={styles.icon} name="user" color={color} />
              )
            }}
          />
        </Tabs>
      </Suspense>

      {/* 发布选择弹窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>发布内容</Text>
            <View style={styles.contentContainer}>

              <View style={styles.cardLeft}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.push('/createImage');
                  }}
                >
                  <FontAwesome name="picture-o" size={24} color="#1e95d4" />
                  {/* <Text style={styles.optionText}>上传图片</Text> */}
                  <Text style={styles.title}>上传图片</Text>
                </TouchableOpacity>
                
                {/* <Text style={styles.subtitle}>记录旅行足迹</Text> */}
              </View>
              <View style={styles.cardRight}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.push('/createVideo');
                    // navigation.navigate('createVideo');
                  }}
                >
                  <FontAwesome name="video-camera" size={24} color="#ee3862" />
                  {/* <Text style={styles.optionText}>上传视频</Text> */}
                  <Text style={styles.title}>上传视频</Text>
                </TouchableOpacity>
                
                {/* <Text style={styles.subtitle}>分享旅行感受</Text> */}
              </View>

            </View>
            <Pressable style={styles.buttonContainer} onPress={() => {
              setModalVisible(false);
            }}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </Pressable>
            {/* <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                // router.back();
              }}
            >
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  createButton: {
    backgroundColor: '#2c91ef',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabBar: {
    backgroundColor: 'white',
    height: 80,
    borderTopWidth: 0,
    elevation: 0,
  },
  icon: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#f0f0f0',
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 10,
  },
  cardLeft: {
    backgroundColor: '#d1eaf2',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  cardRight: {
    backgroundColor: '#eddfed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});