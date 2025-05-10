import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView, // Only one ScrollView needed now
  StatusBar,
  Platform,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/editinfo.styles';
import ImageUpload from '../components/ImageUpload';
import { api } from '../services/api';


interface ProfileData {
    name: string;
    id: string;
    signature: string;
    gender: string;
    birthday: string;
    location: string;
    profileImage: string | number; 
}

const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
    } try {
         const dateObj = typeof date === 'string' ? new Date(date) : date;
         if (isNaN(dateObj.getTime())) return ''; // Handle invalid date strings
         return dateObj.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
        console.error("Error formatting date:", error);
        return ''; 
    }
};

const EditProfileScreen: React.FC = () => {
    const { user, checkToken } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>({
        name: user?.user.nickname || '',
        id: user?.user._id || '', 
        signature: user?.user.signature || '',
        gender: user?.user.gender === "female"? '女' :  '男' , 
        birthday: formatDate(user?.user.birthday),
        location: user?.user.location || '',
        profileImage: user?.user.avatar ?
                      `http://localhost:5000/api/images/image?filename=${user.user.avatar}` :
                       require('../assets/images/favicon.png'),
    })
    useEffect(() => {
        checkToken();
    },[])

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user?.user.nickname || '',
                id: user?.user._id || '', 
                signature: user?.user.signature || '',
                gender: user?.user.gender === "female"? '女' :  '男' , 
                birthday: formatDate(user?.user.birthday),
                location: user?.user.location || '',
                profileImage: user?.user.avatar ?
                              `http://localhost:5000/api/images/image?filename=${user.user.avatar}` :
                               require('../assets/images/favicon.png'),
            })
        }
    },[user])

    console.log('EditProfileScreen profileData',profileData);
    
    const handleBackPress = () => {
        router.back(); 
    };

    const handleSavePress = async () => {
        try {
            const response = await api.put('/api/users/me', {
                nickname: profileData.name,
                signature: profileData.signature,
                gender: profileData.gender === '女' ? 'female' : 'male',
                birthday: profileData.birthday,
                location: profileData.location,
                avatar: typeof profileData.profileImage === 'string' ? profileData.profileImage : undefined
            });

            if (response.data) {
                await checkToken(); // 刷新用户信息
                alert('个人信息更新成功');
                router.back();
            }
        } catch (error: any) {
            console.error('保存失败:', error);
            alert(error.response?.data?.message || '保存失败，请重试');
        }
    };

    const handleProfileImagePress = () => {
        console.log('Profile Image Pressed');
    };

    const handleEditField = (fieldName: keyof ProfileData) => {
        console.log(`Edit field: ${fieldName}`);
        alert(`Editing field: ${fieldName}. Implementation needed.`);
    };
    
    const renderListItem = (
        label: string,
        value: string, 
        placeholder: string,
        fieldName: keyof ProfileData,
    ) => {
        return (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleEditField(fieldName)}
            >
                <Text style={styles.listItemLabel}>{label}</Text>
    
                
                <View style={styles.listItemRight}>
                   
                    <View style={styles.listItemTextContainer}>
                        {value ? (
                            // 文本内容，默认左对齐，允许 signature 换行
                            <Text style={styles.listItemValue} numberOfLines={fieldName === 'signature' ? undefined : 1}>
                               {value}
                            </Text>
                        ) : (
                            // 占位符文本，默认左对齐
                            <Text style={styles.listItemPlaceholder}>
                               {placeholder}
                            </Text>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.listItemArrow} />
                </View>
            </TouchableOpacity>
        );
    };
    
    const getProfileImageSource = (image: string | number | undefined) => {
        if (typeof image === 'string') {
            return { uri: image };
        } else if (typeof image === 'number') {
            return image; 
        } else {
             return require('../assets/images/favicon.png'); 
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.headerIconLeft}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>编辑资料</Text>
                 <View style={styles.headerButtonRight} /> {/* Placeholder to balance layout */}
            </View>
            
            <ScrollView style={styles.mainScrollView}>
                
                <View style={styles.profileImageContainer}>
                    <ImageUpload
                        value={profileData.profileImage}
                        onChange={(filename) => {
                            setProfileData(prev => ({
                                ...prev,
                                profileImage: `http://localhost:5000/api/images/image?filename=${filename}`
                            }));
                        }}
                        style={styles.profileImageWrapper}
                        imageStyle={styles.profileImage}
                    />
                </View>

                
                <View style={styles.infoListSection}>
                    {renderListItem('ID号', profileData.id, '', 'id')}
                    <View style={styles.separator} />
                    {renderListItem('昵称', profileData.name, '', 'name')}
                </View>

                
                <View style={styles.infoListSection}>
                    {renderListItem('个性签名', profileData.signature, '介绍一下自己', 'signature')}
                </View>

                 
                 <View style={styles.infoListSection}>
                    {renderListItem('性别', profileData.gender, '', 'gender')}
                    <View style={styles.separator} />
                    {renderListItem('生日', profileData.birthday, '选择生日', 'birthday')}
                    <View style={styles.separator} />
                    {renderListItem('地区', profileData.location, '选择所在的地区', 'location')}
                 </View>
               
                 <View style={{ height: 20 }} />

            </ScrollView>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
                <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
        </View>
    );
};
export default EditProfileScreen;