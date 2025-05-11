import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  StyleProp,
  ViewStyle,} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/authscreen.styles';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';

// --- Types ---
type AuthView = 'login' | 'register' | 'verify';

const textColor = '#333';

const AuthScreen: React.FC = () => {
  // --- State Management ---
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const { login, register, verifyCode, sendVerificationCode, checkToken, isAuthenticated, user } = useAuth();
  const params = useLocalSearchParams();
  const fromPage = params.from as string | undefined;

  // Timer effect for resend button
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTimerActive && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, resendTimer]);

  // useEffect(() => {
  //   checkToken();
  //   if(isAuthenticated){
  //     if (fromPage && fromPage.startsWith('/(tabs)')) {
  //       router.replace(fromPage as any);
  //     } else {
  //       router.replace('/(tabs)');
  //     }
  //   }
  // },[isAuthenticated])

  // --- Validation Functions ---
  const validateEmail = (email: string): boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateString = (value: string): boolean => {
    const regex = /^[a-zA-Z0-9\*\-\_@%\+~]+$/;
    return regex.test(value);
  }

  // --- Auth Logic Functions ---
  const handleLogin = async (): Promise<void> => {
    setError('');
    if (!validateEmail(email) && !validateString(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    if (!validateString(password)) {
      setError('密码错误');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      Alert.alert('登录成功', '欢迎回来！');
      
      // 根据来源页面进行跳转
      if (fromPage && fromPage.startsWith('/(tabs)')) {
        router.replace(fromPage as any);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (): Promise<void> => {
    setError('');
    if (!validateEmail(email)&&!validateString(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!validatePassword(password)) {
      setError('密码至少需要6位');
      return;
    }
    if(!validateString(password)){
      setError('密码只能由字母、数字、*、-、_、@、%、+、~组成');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    setIsLoading(true);
    try {
      const response = await register(email);
      if (response.success) {
        sendVerificationCode(email);
        setCurrentView('verify');
      }else{
        setError(response.data.message || '邮箱已存在');
      }

    }catch (error: any) {
      setError(error.response?.data?.message || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
    
   
  };

  const handleVerifyCode = async (): Promise<void> => {
    setError('');
    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setError('请输入6位数字验证码');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyCode(email, verificationCode, password);
      if (response.success) {
        Alert.alert('注册成功', '邮箱验证通过，你的账号已注册');
        setCurrentView('login');
        resetpass();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '验证失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (isTimerActive) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await sendVerificationCode(email);
      if (response.success) {
        Alert.alert('验证码已重新发送', '请查收你的邮箱');
        setResendTimer(60);
        setIsTimerActive(true);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '发送验证码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = (): void => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setError('');
    setIsLoading(false);
    setResendTimer(60);
    setIsTimerActive(false);
  };

  const resetpass = (): void => {
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setError('');
    setIsLoading(false);
    setResendTimer(60);
    setIsTimerActive(false);
  };

  // --- Render Functions for Different Views ---

  const renderLoginForm = () => (
    <>
      <Text style={styles.title}>登录某书，开启旅程</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color={textColor} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="邮箱"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color={textColor} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="密码"
          placeholderTextColor="#888"
          secureTextEntry={true}
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <View style={[{flexDirection:'row',justifyContent:'flex-start', width: '100%'}]}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}  
      </View>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled] as StyleProp<ViewStyle>}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? '登录中...' : '登录'}</Text>
      </TouchableOpacity>

      <View style={styles.switchViewContainer}>
        <Text style={styles.switchViewText}>没有账号？</Text>
        <TouchableOpacity onPress={() => { setCurrentView('register'); resetForm(); }}>
          <Text style={styles.switchViewLink}>立即注册</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <Text style={styles.title}>创建新账号</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color={textColor} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="邮箱"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color={textColor} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="密码 (至少6位)"
          placeholderTextColor="#888"
          secureTextEntry={true}
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.inputContainer}>
         <MaterialIcons name="lock" size={20} color={textColor} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="确认密码"
          placeholderTextColor="#888"
          secureTextEntry={true}
          autoCapitalize="none"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      <View style={[{flexDirection:'row',justifyContent:'flex-start', width: '100%'}]}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}  
            
      </View>
      
      <TouchableOpacity
         style={[styles.button, isLoading && styles.buttonDisabled] as StyleProp<ViewStyle>}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? '发送验证码...' : '获取验证码'}</Text>
      </TouchableOpacity>

      <View style={styles.switchViewContainer}>
        <Text style={styles.switchViewText}>已有账号？</Text>
        <TouchableOpacity onPress={() => { setCurrentView('login'); resetForm(); }}>
          <Text style={styles.switchViewLink}>立即登录</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderVerifyCodeForm = () => (
    <>
      <Text style={styles.title}>验证你的邮箱</Text>
      <Text style={styles.subtitle}>验证码已发送至 {email}</Text>
      
      <View style={styles.inputContainer}>
        <MaterialIcons name="verified-user" size={20} color={textColor} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="请输入6位验证码"
          placeholderTextColor="#888"
          keyboardType="number-pad"
          maxLength={6}
          value={verificationCode}
          onChangeText={setVerificationCode}
        />
      </View>
      <View style={[{flexDirection:'row',justifyContent:'flex-start', width: '100%'}]}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}  
            
      </View>
      <TouchableOpacity
        style={[
          styles.resendButton,
          isTimerActive && styles.resendButtonDisabled,
        ] as StyleProp<ViewStyle>}
        onPress={handleResendCode}
        disabled={isTimerActive || isLoading}
      >
        
          <Text style={styles.resendButtonText}>
            {isTimerActive ? `重新发送 (${resendTimer}s)` : '重新发送验证码'}
          </Text>
        
        
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled] as StyleProp<ViewStyle>}
        onPress={handleVerifyCode}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? '验证中...' : '验证邮箱'}</Text>
      </TouchableOpacity>

      <View style={styles.switchViewContainer}>
        <Text style={styles.switchViewText}>信息有误？</Text>
        <TouchableOpacity onPress={() => { setCurrentView('register'); resetForm(); }}>
          <Text style={styles.switchViewLink}>返回注册</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          
          {currentView === 'login' && renderLoginForm()}
          {currentView === 'register' && renderRegisterForm()}
          {currentView === 'verify' && renderVerifyCodeForm()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;