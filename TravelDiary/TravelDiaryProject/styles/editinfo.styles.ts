import { StyleSheet,Platform } from 'react-native';
const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#f8f8f8', 
        paddingTop: Platform.OS === 'android' ? 55.5 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56, 
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
    },
    headerIconLeft: {
        padding: 8, 
        marginLeft: -8, 
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerButtonRight: {
         width: 24 + 16, 
         padding: 8,
         marginRight: -8,
         alignItems: 'flex-end', 
    },
    headerButtonText: {
        fontSize: 16,
        color: '#666', 
    },
    mainScrollView: {
        flex: 1, 
    },
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 24,
        
    },
    profileImageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50, 
        backgroundColor: '#eee', 
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', 
        borderWidth: 1,
        borderColor: '#ddd', 
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoListSection: {
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16, 
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row', 
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
       
    },
    listItemLabel: {
        fontSize: 16,
        color: '#aaa', 
        width: 90, 
        marginRight: 16, 
        flexShrink: 0, 
    },
    listItemRight: {
        flexDirection: 'row', 
        alignItems: 'center',
        flex: 1, 
    },
    listItemTextContainer: { 
         flex: 1, 
    },
    listItemValue: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    listItemPlaceholder: {
        fontSize: 16,
        color: '#aaa', 
    },
    listItemArrow: {
        marginLeft: 8, 
        flexShrink: 0, 
    },
    separator: {
        height: 1,
        backgroundColor: '#eee', 
        marginHorizontal: 16, 
    },
    errorText: {
        color: '#E74C3C',
        marginBottom: 15,
        textAlign: 'left',
        fontSize: 14,
      },
    saveButton: {
        backgroundColor: '#2c91ef', // 蓝色背景
        width: '80%', // 宽度
        alignSelf: 'center', // 居中
        marginHorizontal: 16,
        marginBottom: 24, 
        marginTop: 12, 
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    saveButtonText: {
        fontSize: 18,
        color: '#fff', 
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#666',
    },
    modalConfirmText: {
        fontSize: 16,
        color: '#2c91ef',
        fontWeight: 'bold',
    },
    modalContent: {
        paddingBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 12,
        marginBottom: 8,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    modalText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 8,
    },
    modalOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    selectedOption: {
        backgroundColor: '#f0f8ff',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedText: {
        color: '#2c91ef',
        fontWeight: 'bold',
    },
    locationInput: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    signatureInput: {
        minHeight: 24,
        maxHeight: 96, // 4行文字的高度
        paddingTop: 8,
        paddingBottom: 8,
    },
});
export default styles;