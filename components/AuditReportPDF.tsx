
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { InspectionRecord, SignatureData } from '../types';

// Register fonts if needed or use defaults
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#334155',
    },
    header: {
        marginBottom: 30,
        borderBottom: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        textTransform: 'uppercase',
    },
    status: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '4 8',
        borderRadius: 4,
        fontSize: 8,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoItem: {
        width: '33%',
        marginBottom: 10,
    },
    label: {
        fontSize: 7,
        color: '#94a3b8',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    photo: {
        width: '100%',
        height: 250,
        objectFit: 'cover',
        borderRadius: 8,
        marginTop: 10,
    },
    remediationContainer: {
        marginTop: 15,
    },
    remediationStep: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    stepNumber: {
        width: 15,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    footer: {
        marginTop: 40,
        borderTop: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureContainer: {
        width: 150,
        alignItems: 'center',
    },
    signatureLine: {
        width: '100%',
        borderBottom: 1,
        borderBottomColor: '#334155',
        marginBottom: 5,
    },
    signatureImage: {
        width: 100,
        height: 50,
        marginBottom: 5,
    }
});

interface AuditReportPDFProps {
    record: InspectionRecord;
    signature?: SignatureData;
}

export const AuditReportPDF: React.FC<AuditReportPDFProps> = ({ record, signature }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Audit Compliance Certificate</Text>
                    <Text style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>
                        Verification ID: {record.id.toUpperCase()} • {record.inspectionDate}
                    </Text>
                </View>
                <Text style={styles.status}>{record.status}</Text>
            </View>

            {/* Main Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Facility & Auditor Metadata</Text>
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Auditor Name</Text>
                        <Text style={styles.value}>{record.auditorName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Property Asset</Text>
                        <Text style={styles.value}>{record.propertyName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Inspection Section</Text>
                        <Text style={styles.value}>{record.location}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Risk Stratification</Text>
                        <Text style={[styles.value, { color: record.riskLevel === 'High' ? '#ef4444' : '#2563eb' }]}>
                            {record.riskLevel.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Violation Category</Text>
                        <Text style={styles.value}>{record.category}</Text>
                    </View>
                </View>
            </View>

            {/* Observation Narrative */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Observation Narrative</Text>
                <Text style={{ fontSize: 11, fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{record.faultDescription}"
                </Text>
                {record.photoUrl && (
                    <Image src={record.photoUrl} style={styles.photo} />
                )}
            </View>

            {/* Remediation */}
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Intelligence Remediation Protocol</Text>
                    <View style={styles.remediationContainer}>
                        {record.remediationSteps.map((step, i) => (
                            <View key={i} style={styles.remediationStep}>
                                <Text style={styles.stepNumber}>{i + 1}.</Text>
                                <Text style={{ flex: 1 }}>{step}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Forensic & Signatures */}
                <View style={styles.footer}>
                    <View style={styles.signatureContainer}>
                        {signature && <Image src={signature.signatureBase64} style={styles.signatureImage} />}
                        <View style={styles.signatureLine} />
                        <Text style={styles.label}>Auditor Digital Signature</Text>
                        <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 2 }}>{signature?.timestamp || record.timestamp}</Text>
                    </View>
                    <View style={{ width: 200, alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 7, color: '#2563eb', fontWeight: 'bold' }}>Enterprise Compliance Vault Verified</Text>
                        <Text style={{ fontSize: 6, color: '#94a3b8', marginTop: 4 }}>
                            SHA-256 integrity hash: {signature?.pdfHash || 'PENDING_VALIDATION'}
                        </Text>
                    </View>
                </View>
            </Page>
        </Page>
    </Document>
);
