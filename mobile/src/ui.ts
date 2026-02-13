import { StyleSheet } from 'react-native';

export const ui = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0b1220'
  },
  card: {
    backgroundColor: '#111a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12
  },
  h1: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6
  },
  h2: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },
  p: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20
  },
  subtle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    lineHeight: 18
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  buttonSecondary: {
    backgroundColor: '#223255'
  },
  buttonDanger: {
    backgroundColor: '#ef4444'
  },
  buttonText: {
    color: 'white',
    fontWeight: '700'
  },
  input: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 12,
    color: 'white'
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  rowItem: { flex: 1 }
});

