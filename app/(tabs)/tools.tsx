import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE } from '../../src/api/client';

/**
 * Unified Tools Hub = same modules as Telegram Mini App
 * Heavy flows can open the live Mini App WebView URL until native screens are finished.
 */
const TOOLS: {
  id: string;
  title: string;
  sub: string;
  emoji: string;
  /** path on Render Mini App or in-app route */
  webPath?: string;
  route?: string;
}[] = [
  { id: 'duty', title: 'የቀረጥ ስሌት', sub: 'Customs Duty & Taxes', emoji: '📋', webPath: '/explorer?tool=duty' },
  { id: 'loan', title: 'የባንክ ብድር', sub: 'Mortgage & Auto Loan', emoji: '🏦', webPath: '/explorer?tool=loan' },
  { id: 'compare', title: 'የመኪና ንፅፅር', sub: 'Vehicle Comparison', emoji: '⚖️', webPath: '/explorer?tool=compare' },
  { id: 'contract', title: 'የሽያጭ ውል', sub: 'Legal Sales Contract', emoji: '📄', webPath: '/explorer?tool=contract' },
  { id: 'poa', title: 'ውክልና ማረጋገጫ', sub: 'Power of Attorney', emoji: '🛡️', webPath: '/explorer?tool=poa' },
  { id: 'diag', title: 'የጋራዥ ምርመራ', sub: 'Garage Diagnostic Sheet', emoji: '⚙️', webPath: '/explorer?tool=diag' },
  { id: 'chassis', title: 'ሻሲ ማረጋገጫ', sub: 'Chassis / VIN Specs', emoji: '🔩', webPath: '/explorer?tool=chassis' },
  { id: 'cadastre', title: 'የዲጂታል ካርታ', sub: 'Cadastral Map Verification', emoji: '🗺️', webPath: '/explorer?tool=cadastre' },
];

export default function ToolsHubScreen() {
  const router = useRouter();
  const [budget, setBudget] = useState('2000000');
  const [income, setIncome] = useState('25000');

  const openTool = async (webPath?: string) => {
    const base = API_BASE.replace(/\/$/, '');
    const url = `${base}${webPath || '/explorer'}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('ማስታወሻ', 'መሣሪያው በ Telegram Mini App / browser ይከፈታል:\n' + url);
    } catch {
      Alert.alert('ስህተት', 'መክፈት አልተቻለም');
    }
  };

  const openAdvisor = () => {
    const base = API_BASE.replace(/\/$/, '');
    Linking.openURL(`${base}/explorer?open=advisor&budget=${budget}&income=${income}`);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Advisor card — same as Mini App */}
      <View style={styles.advisorCard}>
        <Text style={styles.advisorBadge}>ADIKA ADVISOR</Text>
        <Text style={styles.advisorTitle}>💡 Purchase & Budget Advisor</Text>
        <Text style={styles.advisorSub}>ዲጂታል የፋይናንስ አማካሪ · ባጀትና ወርሃዊ ገቢ</Text>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>ጠቅላላ ባጀት (ETB)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
              placeholder="2000000"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>ወርሃዊ ገቢ (ETB)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={income}
              onChangeText={setIncome}
              placeholder="25000"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.chips}>
          {['70000', '500000', '1500000', '3000000', '6000000'].map((v) => (
            <Pressable key={v} style={styles.chip} onPress={() => setBudget(v)}>
              <Text style={styles.chipText}>
                {Number(v) >= 1e6 ? `${Number(v) / 1e6}M` : `${Number(v) / 1000}k`}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.advisorBtn} onPress={openAdvisor}>
          <Text style={styles.advisorBtnText}>የእንስትመንት አማራጮች አሳይ →</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Financial, Legal & Diagnostic Tools</Text>
      <Text style={styles.sectionHint}>
        ከ Telegram Mini App ጋር ተመሳሳይ መሣሪያዎች · ተመሳሳይ Backend
      </Text>

      <View style={styles.grid}>
        {TOOLS.map((t) => (
          <Pressable
            key={t.id}
            style={({ pressed }) => [styles.toolCard, pressed && { opacity: 0.9 }]}
            onPress={() => openTool(t.webPath)}
          >
            <Text style={styles.toolEmoji}>{t.emoji}</Text>
            <Text style={styles.toolTitle}>{t.title}</Text>
            <Text style={styles.toolSub}>{t.sub}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.webAppBtn} onPress={() => openTool('/explorer')}>
        <Text style={styles.webAppBtnText}>🌐 ሙሉ Mini App በ Browser / Telegram ክፈት</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ecfeff' },
  content: { padding: 14, paddingBottom: 40 },
  advisorCard: {
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#99f6e4',
    marginBottom: 18,
  },
  advisorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ccfbf1',
    color: '#0f766e',
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  advisorTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  advisorSub: { fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1 },
  label: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: '#0e7490' },
  advisorBtn: {
    marginTop: 14,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  advisorBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  section: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  sectionHint: { fontSize: 11, color: '#64748b', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toolCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: '#334155',
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
  },
  toolEmoji: { fontSize: 22, marginBottom: 8 },
  toolTitle: { fontSize: 13, fontWeight: '800', color: '#f8fafc' },
  toolSub: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  webAppBtn: {
    marginTop: 20,
    backgroundColor: '#16acbd',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  webAppBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
