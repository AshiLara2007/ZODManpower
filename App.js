import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Linking,
  Alert,
  StatusBar,
  RefreshControl,
  StyleSheet,
} from 'react-native';

const API_URL = 'https://zodmanpower.info/api/talents';

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [showReturnedOnly, setShowReturnedOnly] = useState(false);

  const categories = ['All', 'House Maids', 'Cooks', 'Drivers', 'Nurses', 'Teachers', 'Returned', 'Recruitment'];
  const countries = ['All', 'INDONESIA', 'SRI LANKA', 'PHILIPPINES', 'BANGLADESH', 'INDIA', 'ETHIOPIA', 'KENYA', 'UGANDA'];

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchQuery, selectedCategory, selectedCountry, showReturnedOnly]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const parsed = parseCandidates(data);
      setCandidates(parsed);
    } catch (error) {
      Alert.alert('Error', 'Failed to load candidates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  const parseCandidates = (data) => {
    return data.map(item => ({
      id: item.id,
      name: item.name || 'N/A',
      age: item.age || 'N/A',
      gender: item.gender || 'N/A',
      job: item.job || 'N/A',
      country: item.country || 'N/A',
      experience: item.experience || 'N/A',
      salary: item.salary || 'N/A',
      workerType: item.workerType || 'Recruitment Workers',
      imageUrl: item.pic || '',
      cvUrl: item.cv || '',
      maritalStatus: item.maritalStatus || 'N/A',
      religion: item.religion || 'N/A',
    }));
  };

  const getCategory = (job) => {
    const lower = job.toLowerCase();
    if (lower.includes('maid') || lower.includes('domestic')) return 'House Maids';
    if (lower.includes('cook')) return 'Cooks';
    if (lower.includes('driver')) return 'Drivers';
    if (lower.includes('nurse')) return 'Nurses';
    if (lower.includes('teacher')) return 'Teachers';
    return 'Recruitment';
  };

  const filterCandidates = () => {
    let filtered = [...candidates];
    if (showReturnedOnly) {
      filtered = filtered.filter(c => c.workerType === 'Returned Housemaids');
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => getCategory(c.job) === selectedCategory);
    }
    if (selectedCountry !== 'All') {
      filtered = filtered.filter(c => c.country === selectedCountry);
    }
    if (searchQuery) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredCandidates(filtered);
  };

  const sendWhatsApp = (candidate) => {
    const message = `╔══════════════════════════════════════════════════════════╗
║           🤝 ZOD MANPOWER RECRUITMENT - DOHA, QATAR 🤝          ║
╚══════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────┐
│                    📋 CANDIDATE DETAILS                  │
└─────────────────────────────────────────────────────────┘

🔹 Name: ${candidate.name}
🔹 Age: ${candidate.age} years
🔹 Gender: ${candidate.gender}
🔹 Marital Status: ${candidate.maritalStatus}
🔹 Religion: ${candidate.religion}

┌─────────────────────────────────────────────────────────┐
│                    💼 JOB INFORMATION                    │
└─────────────────────────────────────────────────────────┘

🔹 Position: ${candidate.job}
🔹 Country: ${candidate.country}
🔹 Experience: ${candidate.experience}
🔹 Salary: ${candidate.salary} QAR
🔹 Worker Type: ${candidate.workerType}

┌─────────────────────────────────────────────────────────┐
│                    📎 DOCUMENTS                         │
└─────────────────────────────────────────────────────────┘

🔹 CV Link: ${candidate.cvUrl || 'Not Available'}

┌─────────────────────────────────────────────────────────┐
│                    🌐 WEBSITE                           │
└─────────────────────────────────────────────────────────┘

🔹 https://zodmanpower.info

──────────────────────────────────────────────────────────

📞 Contact us:
   • WhatsApp: +974 5535 5206
   • Email: info@zodmanpower.info

──────────────────────────────────────────────────────────

✅ Reply "HIRE ${candidate.name.toUpperCase()}" to proceed`;

    Linking.openURL(`https://wa.me/97455355206?text=${encodeURIComponent(message)}`);
  };

  const CandidateCard = ({ candidate }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        Alert.alert(
          candidate.name,
          `Age: ${candidate.age}\nGender: ${candidate.gender}\nCountry: ${candidate.country}\nExperience: ${candidate.experience}\nSalary: ${candidate.salary} QAR`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Hire', onPress: () => sendWhatsApp(candidate) }
          ]
        );
      }}
    >
      <Image 
        source={{ uri: candidate.imageUrl || 'https://via.placeholder.com/70' }} 
        style={styles.avatar}
      />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{candidate.name}</Text>
        <Text style={styles.jobTitle}>{candidate.job}</Text>
        <View style={styles.row}>
          <Text style={styles.country}>📍 {candidate.country}</Text>
          <Text style={styles.salary}>💰 {candidate.salary} QAR</Text>
        </View>
        <View style={[styles.badge, candidate.workerType === 'Returned Housemaids' ? styles.returnedBadge : styles.recruitmentBadge]}>
          <Text style={styles.badgeText}>
            {candidate.workerType === 'Returned Housemaids' ? 'Returned' : 'Recruitment'}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.hireButton} onPress={() => sendWhatsApp(candidate)}>
        <Text style={styles.hireButtonText}>Hire</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002f66" />
        <Text style={styles.loadingText}>Loading candidates...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#002f66" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ZOD MANPOWER</Text>
        <Text style={styles.headerSubtitle}>Recruitment Agency</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#002f66']} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search by name or country..." 
            value={searchQuery} 
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>📂 Job Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, selectedCategory === cat && styles.filterChipSelected]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Country Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>🌍 Country</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {countries.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.filterChip, selectedCountry === c && styles.filterChipSelected]}
                onPress={() => setSelectedCountry(c)}
              >
                <Text style={[styles.filterChipText, selectedCountry === c && styles.filterChipTextSelected]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Returned Only Switch */}
        <View style={styles.filterCard}>
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.switchLabel}>🔄 Returned Only</Text>
              <Text style={styles.switchDesc}>Show only returned housemaids</Text>
            </View>
            <Switch 
              value={showReturnedOnly} 
              onValueChange={setShowReturnedOnly} 
              trackColor={{ false: '#e0e0e0', true: '#002f66' }} 
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Results Count */}
        <Text style={styles.resultsCount}>📊 {filteredCandidates.length} candidates found</Text>

        {/* Candidates List */}
        {filteredCandidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#002f66',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#d0d0d0',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  clearIcon: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  filterCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002f66',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#002f66',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  filterChipTextSelected: {
    color: 'white',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  switchDesc: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  resultsCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  jobTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  country: {
    fontSize: 11,
    color: '#888',
    marginRight: 12,
  },
  salary: {
    fontSize: 11,
    color: '#10b981',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  returnedBadge: {
    backgroundColor: '#9C27B0',
  },
  recruitmentBadge: {
    backgroundColor: '#002f66',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  hireButton: {
    backgroundColor: '#25d366',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    marginTop: 8,
  },
  hireButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
});