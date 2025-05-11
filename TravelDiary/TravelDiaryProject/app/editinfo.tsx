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
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/editinfo.styles';
import ImageUpload from '../components/ImageUpload';
import { api } from '../services/api';
import Clipboard from '@react-native-clipboard/clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    const [isEditingName, setIsEditingName] = useState(false);
    const [error, setError] = useState<string>('');
    const [imageName, setimageName] = useState(user?.user.avatar || 'default_avatar.jpg');
    const [currentField, setCurrentField] = useState<keyof ProfileData | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedGender, setSelectedGender] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
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
        router.replace('/profile'); 
    };

    const handleSavePress = async () => {
        try {
            const response = await api.put('/api/users/me', {
                nickname: profileData.name,
                signature: profileData.signature,
                gender: profileData.gender === '女' ? 'female' : 'male',
                birthday: profileData.birthday,
                location: profileData.location,
                avatar: imageName,
            });

            if (response.data) {
                await checkToken(); // 刷新用户信息
                router.replace('/profile');
            }
        } catch (error: any) {
            console.error('保存失败:', error);
            alert(error.response?.data?.message || '保存失败，请重试');
        }
    };

    const handleEditField = (fieldName: keyof ProfileData) => {
        setCurrentField(fieldName);
        setModalVisible(true);
        
        // 设置初始值
        switch (fieldName) {
            case 'gender':
                setSelectedGender(profileData.gender);
                break;
            case 'birthday':
                setSelectedDate(profileData.birthday ? new Date(profileData.birthday) : new Date());
                break;
            case 'location':
                setSelectedLocation(profileData.location);
                break;
        }
    };

    const handleModalConfirm = () => {
        if (currentField) {
            switch (currentField) {
                case 'gender':
                    setProfileData(prev => ({ ...prev, gender: selectedGender }));
                    break;
                case 'birthday':
                    setProfileData(prev => ({ ...prev, birthday: formatDate(selectedDate) }));
                    break;
                case 'location':
                    setProfileData(prev => ({ ...prev, location: selectedLocation }));
                    break;
            }
        }
        setModalVisible(false);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSelectedDate(selectedDate);
        }
    };

    const renderModalContent = () => {
        switch (currentField) {
            case 'gender':
                return (
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={[styles.modalOption, selectedGender === '男' && styles.selectedOption]}
                            onPress={() => setSelectedGender('男')}
                        >
                            <Text style={[styles.modalOptionText, selectedGender === '男' && styles.selectedText]}>男</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, selectedGender === '女' && styles.selectedOption]}
                            onPress={() => setSelectedGender('女')}
                        >
                            <Text style={[styles.modalOptionText, selectedGender === '女' && styles.selectedText]}>女</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'birthday':
                return (
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.modalOptionText}>
                                {formatDate(selectedDate)}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>
                );
            case 'location':
                return (
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.locationInput}
                            value={selectedLocation}
                            onChangeText={setSelectedLocation}
                            placeholder="请输入地区"
                            placeholderTextColor="#999"
                        />
                    </View>
                );
            default:
                return <View style={styles.modalContent} />;
        }
    };

    const checkNameDuplicate = async (name: string) => {
        if(name === ''){
            setError('昵称不能为空');
            return;
        }
        if(name !== user?.user.nickname){
            try {
                const response = await api.get(`/api/users/check-nickname?nickname=${name}`);
                if (response.data.exists) {
                    setError('昵称已存在');
                }else{
                    setError('');
                }
            } catch (error) {
                console.error('检查昵称重复时出错:', error);
            }
        }
    };
    
    const renderListItem = (label: string, value: string, placeholder: string, fieldName: keyof ProfileData) => {
        return (
            fieldName === 'id' ? (
              <View style={styles.listItem}>
                <Text style={styles.listItemLabel}>ID号</Text>
                <View style={styles.listItemRight}>
                  <View style={styles.listItemTextContainer}>
                    <Text style={styles.listItemValue}>{value}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { if (user?.user._id) Clipboard.setString(user?.user._id); }}>
                    <FontAwesome5 name="clone" size={12} color="#A9A9A9" style={{ marginLeft: 5 }} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
                fieldName !== 'signature' && fieldName !== 'name' ? (
                    <TouchableOpacity style={styles.listItem} onPress={() => handleEditField(fieldName)}>
                        <Text style={styles.listItemLabel}>{label}</Text>
                        <View style={styles.listItemRight}>
                            <View style={styles.listItemTextContainer}>
                                {value ? (<Text style={styles.listItemValue}>{value}</Text>) : (
                                    <Text style={styles.listItemPlaceholder}>{placeholder}</Text>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#A9A9A9" />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.listItem} >
                        <Text style={styles.listItemLabel}>{label}</Text>
                        <View style={styles.listItemRight}>
                            <View style={styles.listItemTextContainer}>
                                <TextInput style={[
                                    styles.listItemValue,
                                    fieldName === 'signature' && styles.signatureInput
                                ]}
                                    value={fieldName === 'name'? profileData.name : profileData.signature}
                                    onChangeText={(text) => {
                                            console.log(`Updating ${fieldName} to:`, text);
                                            if (fieldName === 'name' ) {
                                              if(text === ''){
                                                setError('昵称不能为空');
                                                setProfileData(prev => ({...prev, [fieldName]: user?.user.nickname || ''}));
                                              }
                                              if(text.length > 10){
                                                setError('昵称不能超过10个字符');
                                                setProfileData(prev => ({...prev, [fieldName]: user?.user.nickname || ''}));
                                              }
                                              checkNameDuplicate(text);
                                              if(text !== profileData.name){
                                                setIsEditingName(true);
                                                setProfileData(prev => ({...prev, [fieldName]: text}));
                                              }
                                            }else{
                                                setProfileData(prev => ({...prev, [fieldName]: text}));
                                            }
                                            
                                        }
                                    }
                                    multiline={fieldName === 'signature'}
                                    maxLength={fieldName === 'signature' ? 500 : undefined}
                                    numberOfLines={fieldName === 'signature' ? 5 : 1}
                                    textAlignVertical={fieldName === 'signature' ? 'top' : 'center'}
                                    onBlur={() => {
                                        if(fieldName === 'name'){
                                            checkNameDuplicate(profileData.name);
                                            if(isEditingName && profileData.name !== user?.user.nickname){
                                                setIsEditingName(false);
                                            }
                                            console.log('profileData.name', profileData.name);
                                            if(profileData.name ===''){
                                                setProfileData(prev => ({...prev, [fieldName]: user?.user.nickname || ''}));
                                                setError('');
                                            }
                                        }
                                        
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                )
            )
        );
    };
    

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.headerIconLeft}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>编辑资料</Text>
                <View style={styles.headerButtonRight} />
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
                            setimageName(filename);
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
                <View style={[{marginHorizontal: 22, borderRadius: 8}]}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : <View />}
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

            <Modal
                visible={modalVisible}
                transparent={true}
                
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCancelText}>取消</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {currentField === 'gender' ? '选择性别' :
                                 currentField === 'birthday' ? '选择生日' :
                                 currentField === 'location' ? '选择地区' : ''}
                            </Text>
                            <TouchableOpacity onPress={handleModalConfirm}>
                                <Text style={styles.modalConfirmText}>确定</Text>
                            </TouchableOpacity>
                        </View>
                        {renderModalContent()}
                    </View>
                </View>
            </Modal>
        </View>
    );
};
export default EditProfileScreen;