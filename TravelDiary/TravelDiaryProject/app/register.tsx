import React, { useState } from 'react';
import { Button, TextInput, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { register, RegisterData } from '../services/auth'; // 假设你有一个 register 函数用于注册

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: ''
  });
  const router = useRouter();

  const handleChange = (name: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await register(formData);
      router.push('/login'); // 注册成功后跳转到登录页
    } catch (error) {
      console.error('注册失败:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>注册</Text>
      <TextInput
        style={styles.input}
        placeholder="用户名"
        value={formData.username}
        onChangeText={(text) => handleChange('username', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="邮箱"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="密码"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      <Button title="注册" onPress={handleSubmit} />
      <Text style={styles.loginText} onPress={() => router.push('/login')}>
        已有账号？去登录
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
  loginText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#2196F3',
  },
});

export default Register;