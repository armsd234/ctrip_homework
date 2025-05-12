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
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/editinfo.styles';
import ImageUpload from '../components/ImageUpload';
import { api } from '../services/api';
// import Clipboard from '@react-native-clipboard/clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import countriesDataRaw from '../data/countries+states+cities.json';
const countriesData: Country[] = countriesDataRaw as Country[];

// 类型定义
interface City {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
}
interface State {
  id: number;
  name: string;
  state_code: string;
  latitude: string;
  longitude: string;
  type: string;
  cities: City[];
}
interface Country {
  id: number;
  name: string;
  iso2: string;
  states: State[];
}

interface ProfileData {
    name: string;
    id: string;
    signature: string;
    gender: string;
    birthday: string;
    location: string;
    profileImage: string | number; 
}

const getCurrentLocationDetail = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('需要位置权限');
    return null;
  }
  const loc = await Location.getCurrentPositionAsync({});
  const geo = await Location.reverseGeocodeAsync(loc.coords);
  if (geo && geo.length > 0) {
    // 结构化返回
    return {
      country: geo[0].country || '',
      state: geo[0].region || '',
      city: geo[0].city || ''
    };
  }
  return null;
};

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
                    <AreaSelector
                        onSelect={(location: string) => {
                            setSelectedLocation(location);
                            setProfileData(prev => ({ ...prev, location }));
                            setModalVisible(false);
                        }}
                        onCancel={() => setModalVisible(false)}
                    />
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
                  {/* <TouchableOpacity onPress={() => { if (user?.user._id) Clipboard.setString(user?.user._id); }}>
                    <FontAwesome5 name="clone" size={12} color="#A9A9A9" style={{ marginLeft: 5 }} />
                  </TouchableOpacity> */}
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
                        {currentField !== 'location' && (
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalCancelText}>取消</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>
                                    {currentField === 'gender' ? '选择性别' :
                                     currentField === 'birthday' ? '选择生日' : ''}
                                </Text>
                                <TouchableOpacity onPress={handleModalConfirm}>
                                    <Text style={styles.modalConfirmText}>确定</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {renderModalContent()}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

interface AreaSelectorProps {
  onSelect: (location: string) => void;
  onCancel: () => void;
}

const AreaSelector: React.FC<AreaSelectorProps> = ({ onSelect, onCancel }) => {
  const [step, setStep] = useState<'country' | 'state' | 'city'>('country');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{country: string, state: string, city: string} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoadingLocation(true);
      const loc = await getCurrentLocationDetail();
      setCurrentLocation(loc);
      setLoadingLocation(false);
    };
    fetchLocation();
  }, []);

  // 国家选择
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setStep('state');
  };

  // 省/州选择
  const handleStateSelect = (state: State) => {
    setSelectedState(state);
    setStep('city');
  };

  // 城市选择
  const handleCitySelect = (city: City) => {
    const location = `${selectedCountry?.name} ${selectedState?.name} ${city.name}`;
    onSelect(location);
  };

  // 返回上一级
  const handleBack = () => {
    if (step === 'city') {
      setStep('state');
      setSelectedState(null);
    } else if (step === 'state') {
      setStep('country');
      setSelectedCountry(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* 顶部栏 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <TouchableOpacity onPress={onCancel}><Text>取消</Text></TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>选择你的地区</Text>
        {step !== 'country' && <TouchableOpacity onPress={handleBack}><Text>返回</Text></TouchableOpacity>}
      </View>

      {/* 定位到的位置 */}
      <Text style={{ marginLeft: 16, color: '#888' }}>定位到的位置</Text>
      <TouchableOpacity
        style={{
          margin: 16,
          padding: 12,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center'
        }}
        disabled={loadingLocation || !currentLocation}
        onPress={() => {
          if (currentLocation) {
            // 直接用定位结果
            onSelect(`${currentLocation.country} ${currentLocation.state} ${currentLocation.city}`);
          }
        }}
      >
        <Ionicons name="location" size={20} color="#007AFF" />
        <Text style={{ marginLeft: 8 }}>
          {loadingLocation
            ? '正在定位...'
            : currentLocation
              ? `${currentLocation.country} ${currentLocation.state} ${currentLocation.city}`
              : '定位失败'}
        </Text>
      </TouchableOpacity>

      {/* 全部地区 */}
      <Text style={{ marginLeft: 16, color: '#888' }}>全部</Text>
      <ScrollView>
        {step === 'country' && countriesData.map((country: Country) => (
          <TouchableOpacity key={country.id} onPress={() => handleCountrySelect(country)} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text>{country.name}</Text>
          </TouchableOpacity>
        ))}
        {step === 'state' && selectedCountry?.states.map((state: State) => (
          <TouchableOpacity key={state.id} onPress={() => handleStateSelect(state)} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text>{state.name}</Text>
          </TouchableOpacity>
        ))}
        {step === 'city' && selectedState?.cities.map((city: City) => (
          <TouchableOpacity key={city.id} onPress={() => handleCitySelect(city)} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text>{city.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;