import { StyleSheet } from 'react-native';

const primaryColor = '#4A4E69'; // Deep Gray/Blue
const accentColor = '#FF6B6B'; // Coral/Red
const textColor = '#333';
const linkColor = '#2E86C1';
const errorColor = '#E74C3C';
const inputBorderColor = '#ccc';
const buttonDisabledColor = '#cccccc';

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    container: {
      width: '100%',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: 20,
      textAlign: 'center',
    },
     subtitle: {
      fontSize: 16,
      color: textColor,
      marginBottom: 50,
      textAlign: 'center',
    },
    errorText: {
      color: errorColor,
      marginBottom: 15,
      textAlign: 'left',
      fontSize: 14,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      borderBottomWidth: 1,
      borderBottomColor: inputBorderColor,
      marginBottom: 20,
      paddingBottom: 8,
    },
    icon: {
      marginRight: 15,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: textColor,
      paddingVertical: 0,
    },
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginBottom: 20,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: linkColor,
    },
    button: {
      width: '100%',
      backgroundColor: '#2c91ef', // 蓝色背景
      padding: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    buttonDisabled: {
      backgroundColor: buttonDisabledColor,
    },
    buttonText: {
      
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    resendButton: {
       alignSelf: 'flex-start',
       marginBottom: 20,
       padding: 10,
    },
    resendButtonDisabled: {
       opacity: 0.5,
    },
    resendButtonText: {
      textAlign: 'left',
      fontSize: 14,
      color: linkColor,
    },
    switchViewContainer: {
      flexDirection: 'row',
      marginTop: 10,
    },
    switchViewText: {
      fontSize: 14,
      color: textColor,
    },
    switchViewLink: {
      fontSize: 14,
      color: linkColor,
      marginLeft: 5,
      fontWeight: 'bold',
    },
  });
  
export default styles;
  