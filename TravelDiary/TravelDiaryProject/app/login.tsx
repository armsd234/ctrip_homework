import React, { useState, useEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { login, LoginData, isAuthenticated } from '../services/auth';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        router.replace('(tabs)' as any);
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await login(formData);
      router.replace('(tabs)' as any);
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>登录</Text>
      <TextInput
        style={styles.input}
        placeholder="用户名"
        value={formData.username}
        onChangeText={(text) => handleChange('username', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="密码"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      <Button title="登录" onPress={handleSubmit} />
      <Text style={styles.registerText} onPress={() => router.push('register' as any)}>
        没有账号？去注册
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  registerText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#2196F3',
  },
});

export default Login;