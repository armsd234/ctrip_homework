import { StyleSheet,Dimensions } from 'react-native';

const PROFILE_SECTION_BG = '#4A4E69'; 
const MAIN_BG = '#FFFFFF'; 
const ACCENT_COLOR = '#F25F5C'; 
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: PROFILE_SECTION_BG, 
    },
    // Profile Header styles - fixed at top
    profileHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10, 
      backgroundColor: PROFILE_SECTION_BG, 
      width: '100%', 
      zIndex: 50, 
      
    },
    headerIcon: {
      padding: 5,
    },
    headerRightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    setBackgroundButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 15,
      marginRight: 10,
    },
    setBackgroundText: {
      color: 'white',
      fontSize: 12,
    },
  
    // ScrollView styles - covers the area between the fixed header and bottom nav
    scrollView: {
      flex: 1, // <-- Make ScrollView take up all available vertical space
    },
     scrollViewContentContainer: {
       flexGrow: 1, // <-- This is key: makes the content container inside ScrollView grow to fill space
       // justifyContent: 'space-between', // Optional: Decide how children inside contentContainerStyle are spaced
     },
  
    // Wrapper for the top part of the content that scrolls (dark background)
    scrollableTopContentWrapper: {
      backgroundColor: PROFILE_SECTION_BG, // Same background as header
      paddingBottom: 20, // This padding creates space between the dark content and the white section below
      // Note: The paddingTop for this wrapper is applied via ScrollView's contentContainerStyle (headerHeight)
    },

    selfbackgroundImage: {
      width: '100%', // Full width of the screen
      opacity: 0.5, // Adjust opacity as needed
    },
  
    // UserInfoSection - Inside scrollableTopContentWrapper
    userInfoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginTop: 10, // Keep internal spacing
    },
    avatarContainer: {
      position: 'relative',
    },
    // Styling for the white circle outline based on the latest screenshot
    avatarOutline: {
       width: 80,
       height: 80,
       borderRadius: 40,
       borderWidth: 2,
       borderColor: 'white',
       backgroundColor: 'transparent', // Ensure the center is transparent if no image
       justifyContent: 'center', // Center potential inner image or content
       alignItems: 'center',
       overflow: 'hidden', // Hide anything outside the circle
    },
    avatarInnerPlaceholder: { // Placeholder View if no image is used, or style for actual Image
        width: 76, // Slightly smaller than outline
        height: 76,
        borderRadius: 38, // Make it circular
        backgroundColor: 'transparent', // Placeholder color or remove if using Image
    },
     avatar: { // If you prefer using the Image component directly with border
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'transparent',
     },
  
    addAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#FFC107', // Yellowish color
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'white' // White border
    },
    userDetails: {
      marginLeft: 15,
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
    userIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    userId: {
      fontSize: 12,
      color: '#A9A9A9', // Light grey
    },
  
    // BioAndStats - Inside scrollableTopContentWrapper
    bioStatsContainer: {
      paddingHorizontal: 15,
      marginTop: 15,
    },
    bioText: {
      fontSize: 14,
      color: 'white',
      marginBottom: 10,
    },
    genderIconContainer: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      
      
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    betweenContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: 15,
    },
    statItem: {
      alignItems: 'flex-start',
      marginRight: 30,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    statLabel: {
      fontSize: 12,
      color: '#A9A9A9',
      marginTop: 2,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    editProfileButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 40,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
    },
    editProfileText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '500',
    },
    settingsButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    // FeatureBlocks - Inside scrollableTopContentWrapper
    featureBlocksContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      marginTop: 20,
    },
    featureBlock: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: 12,
      borderRadius: 8,
      width: (width - 30 - 20) / 3,
      alignItems: 'flex-start',
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: 'white',
    },
    featureSubtitle: {
      fontSize: 10,
      color: '#C0C0C0',
      marginTop: 4,
    },
  
    // ContentSection - White background section, inside ScrollView
    contentSection: {
      position: 'sticky',
      top: 4, 
      backgroundColor: MAIN_BG, // White background
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      marginTop: -10, // Overlap with the dark section above
      paddingTop: 10, // Compensate for the negative margin from marginTop
      flex: 1, 
      zIndex:100,
    },
  
    // ContentTabs - Inside ContentSection
    contentTabsContainer: {
      zIndex: 100,
      position: 'sticky',
      top: 0, // Needed for absolute positioning of search icon
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
      backgroundColor: 'white', // White background for the tabs
    },
  
    contentContainer: {
      // zIndex: 1,
      // position:'relative', // Needed for absolute positioning of icon
      // flex: 1, // <-- Allows this container to take up available vertical space in ContentSection
      // justifyContent: 'center', // <-- Centers content vertically within itself
      // alignItems: 'center', // <-- Centers content horizontally within itself
      // paddingVertical: 50, // Add some padding around the content
      flex: 1,
      width: Dimensions.get('window').width,
    },
    
    emptycontentContainer: {
      // zIndex: 1,
      // position:'relative', // Needed for absolute positioning of icon
      // flex: 1, // <-- Allows this container to take up available vertical space in ContentSection
      justifyContent: 'center', // <-- Centers content vertically within itself
      alignItems: 'center', // <-- Centers content horizontally within itself
      paddingVertical: 50, // Add some padding around the content
      flex: 1,
      width: Dimensions.get('window').width,
    },
    tabItem: {
      paddingHorizontal: 10,
      paddingBottom: 10,
      marginRight: 20,
    },
    activeTabItem: {
      borderBottomWidth: 2,
      borderBottomColor: ACCENT_COLOR,
    },
    tabText: {
      fontSize: 16,
      color: '#555',
    },
    activeTabText: {
      color: ACCENT_COLOR,
      fontWeight: 'bold',
    },
    searchIconTab: {
      padding: 5,
    },
  
    // SubTabs - Inside ContentSection
    subTabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 10,
      alignItems: 'center',
    },
    subTabItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
      paddingVertical: 5,
    },
    subTabText: {
      fontSize: 13,
      color: '#777',
    },
  
    // Content - Inside ContentSection
    
    contentText: {
      fontSize: 15,
      color: '#777',
      marginTop: 15,
      marginBottom: 25,
    },
    publishButton: {
      backgroundColor: '#F0F0F0',
      paddingHorizontal: 30,
      paddingVertical: 10,
      borderRadius: 20,
    },
    publishButtonText: {
      fontSize: 14,
      color: '#333',
      fontWeight: '500',
    },
  
    // Main Bottom Nav - Fixed at the bottom
    bottomNavContainer: {
      flexDirection: 'row',
      height: 60, // Fixed height
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '100%',
      zIndex: 1, // Ensure it's above the scrolling content
      // SafeAreaView handles bottom padding - but measuring gives more precise control
    },
    bottomNavItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      paddingVertical: 5,
    },
    activeBottomNavItem: {
      // Styles for active item
    },
    bottomNavText: {
      fontSize: 10,
      color: '#555',
      marginTop: 2,
    },
    activeBottomNavText: {
      color: ACCENT_COLOR,
    },
    bottomNavAddButton: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      backgroundColor: ACCENT_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
      marginBottom: 10, // Adjusted to position correctly relative to nav bar height
    },
    travelItem: {
      flexDirection: 'row',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    travelImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    travelInfo: {
      flex: 1,
      marginLeft: 10,
      justifyContent: 'space-between',
    },
    travelTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    travelStats: {
      flexDirection: 'row',
      marginTop: 5,
    },
    travelStat: {
      marginRight: 15,
      color: '#666',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    // 搜索框样式
    searchWrapper: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f8f8',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#eaeaea',
      height: 44,
      paddingRight: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    searchIconWrapper: {
      paddingHorizontal: 14,
      height: '100%',
      justifyContent: 'center',
    },
    searchTextInput: {
      flex: 1,
      height: '100%',
      fontSize: 15,
      color: '#333',
      paddingHorizontal: 8,
      paddingVertical: 0,
      outlineWidth: 0,
      outlineColor: 'transparent',
      boxShadow: 'none',
    },
    searchActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchClearBtn: {
      padding: 6,
      borderRadius: 12,
      backgroundColor: '#f0f0f0',
    },
    searchButton: {
      backgroundColor: ACCENT_COLOR,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      shadowColor: ACCENT_COLOR,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    searchButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    // contentContainer: {
    //   flex: 1,
    //   width: Dimensions.get('window').width,
    // },
    searchContainer: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: '#fafafa',
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e8e8e8',
      height: 40,
    },
    searchIconContainer: {
      paddingHorizontal: 12,
      height: '100%',
      justifyContent: 'center',
    },
    
    clearButton: {
      position: 'absolute',
      right: 12,
      padding: 4,
    },
  });
export default styles;
  