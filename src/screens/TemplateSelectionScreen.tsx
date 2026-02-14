import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { templates } from '../data/templates';
import { useNavigation } from '@react-navigation/native';

export default function TemplateSelectionScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    const lowerQuery = searchQuery.toLowerCase();
    return templates.filter(template =>
      template.name.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const renderTemplateItem = ({ item }: { item: typeof templates[0] }) => (
    <TouchableOpacity
      style={styles.templateItem}
      onPress={() => navigation.navigate('PatientDetails', { templateId: item.id })}
    >
      <Text style={styles.templateName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Template</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search templates"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>All Templates</Text>
        
        <View style={styles.listContainer}>
          <FlatList
            data={filteredTemplates}
            renderItem={renderTemplateItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.alphabetIndex}>
            {alphabet.map(letter => (
              <Text key={letter} style={styles.alphabetLetter}>
                {letter}
              </Text>
            ))}
            <Text style={styles.alphabetLetter}>#</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#fff',
    fontSize: 17,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 70,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 20,
    marginBottom: 0,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  listContent: {
    paddingBottom: 20,
  },
  templateItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  templateName: {
    fontSize: 17,
    color: '#fff',
  },
  alphabetIndex: {
    paddingRight: 8,
    paddingLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alphabetLetter: {
    fontSize: 10,
    color: '#007aff',
    paddingVertical: 1,
  },
});
